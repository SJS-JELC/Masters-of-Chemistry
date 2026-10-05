import type {
  C3L6Progress,
  ChallengeCheck,
  C3BSlot,
  C3CSlot,
  C3BUnitId,
} from '../../../contracts/olympiad.ts';
import type { ProfileId } from '../../../contracts/identity.ts';
import type { MoleculeState } from '../../../contracts/editors.ts';
import { assertMoleculeState } from '../../../chemistry/molecule/engine.ts';
import { sourceBank, chemicalChallenge, bUnits, c3KErratum } from './source-bank.ts';
import {
  blankC3Progress,
  c3Fingerprint,
  c3Policy,
  bUnitCount,
  bFingerprint,
  cFingerprint,
  moleculeMatches,
} from './policy.ts';
type RecordData = Record<string, unknown>;
const object = (v: unknown): RecordData =>
  v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as RecordData) : {};
const semantic = {
  version: 'c3l6-answer-bank-1',
  stages: Object.fromEntries(
    ['a', 'b', 'c'].map((k) => [
      k,
      (sourceBank.stages[k as 'a' | 'b' | 'c'].answers as unknown as RecordData[]).map((a) => ({
        id: a.id,
        answer: a.answer ?? null,
        alternatives:
          (a.alternatives as { smiles: string; formula: string }[] | undefined)
            ?.map((x) => [x.smiles, x.formula])
            .sort((x, y) => JSON.stringify(x).localeCompare(JSON.stringify(y))) ?? [],
      })),
    ]),
  ),
};
export const c3AnswerSignature = c3Fingerprint(semantic);
export interface C3LegacyResult {
  readonly accepted: boolean;
  readonly progress: C3L6Progress | null;
  readonly issues: readonly string[];
  readonly raw: unknown;
  readonly absentFields: readonly string[];
}
/** Never trust a saved correct/completed flag; substantively recheck answers and all graphs. */
export function revalidateC3Legacy(raw: unknown, profileId: ProfileId): C3LegacyResult {
  const r = object(raw),
    issues: string[] = [],
    absentFields: string[] = [];
  const missing = (o: RecordData, key: string, prefix = '') => {
    if (!Object.hasOwn(o, key)) absentFields.push(prefix + key);
  };
  for (const k of [
    'version',
    'signature',
    'stage',
    'selected',
    'responses',
    'complete',
    'submitted',
    'unitChecks',
    'slotChecks',
  ])
    missing(r, k);
  const validVersion =
    (r.version === 1 && r.signature === '2e364447') ||
    ((r.version === 2 || r.version === 3) && r.signature === c3AnswerSignature);
  if (!validVersion)
    return {
      accepted: false,
      progress: null,
      issues: ['Unknown historical answer-bank signature or version.'],
      raw,
      absentFields,
    };
  let p = blankC3Progress(profileId);
  const responses = object(r.responses),
    drawingsB: Partial<Record<C3BSlot, MoleculeState>> = {},
    drawingsC: Partial<Record<C3CSlot, MoleculeState>> = {},
    classifications: Record<string, 'oxidation' | 'reduction' | 'hydrolysis'> = {};
  for (const field of [
    'responses',
    'complete',
    'selected',
    'submitted',
    'unitChecks',
    'slotChecks',
  ])
    if (
      r[field] !== undefined &&
      (r[field] === null || typeof r[field] !== 'object' || Array.isArray(r[field]))
    )
      issues.push(`Invalid historical ${field} record.`);
  for (const stage of ['a', 'b', 'c'] as const) {
    missing(responses, stage, 'responses.');
    const values = object(responses[stage]);
    for (const item of sourceBank.stages[stage].answers) {
      missing(values, item.id, `responses.${stage}.`);
      const value = values[item.id];
      if (value === undefined) continue;
      if (stage === 'a') {
        if (['oxidation', 'reduction', 'hydrolysis'].includes(String(value)))
          classifications[item.id] = value as 'oxidation' | 'reduction' | 'hydrolysis';
        else issues.push(`Invalid classification responses.a.${item.id}`);
      } else {
        const d = object(value);
        missing(d, 'history', `responses.${stage}.${item.id}.`);
        try {
          const drawing = {
            kind: 'molecule',
            graph: d.graph,
            history: d.history === undefined ? [] : d.history,
          } as MoleculeState;
          assertMoleculeState(drawing);
          if (stage === 'b') drawingsB[item.id as C3BSlot] = structuredClone(drawing);
          else drawingsC[item.id as C3CSlot] = structuredClone(drawing);
        } catch (e) {
          issues.push(`Rejected responses.${stage}.${item.id}: ${String(e)}`);
        }
      }
    }
  }
  p = { ...p, classifications, drawingsB, drawingsC };
  const submitted = object(r.submitted),
    complete = object(r.complete),
    selected = object(r.selected);
  for (const key of ['a', 'b', 'c']) {
    missing(submitted, key, 'submitted.');
    missing(complete, key, 'complete.');
  }
  for (const key of ['a', 'b', 'c'])
    if (complete[key] !== undefined && typeof complete[key] !== 'boolean')
      issues.push(`Invalid historical complete.${key} flag.`);
  for (const key of ['b', 'c']) missing(selected, key, 'selected.');
  function legacyCheck(
    value: unknown,
    total: number,
    fingerprint: string,
    correct: number,
  ): ChallengeCheck | null {
    const c = object(value);
    return Number.isInteger(c.correct) &&
      c.correct === correct &&
      c.total === total &&
      typeof c.snapshot === 'string' &&
      c.snapshot === fingerprint
      ? { correct, total, passed: correct === total, drawingFingerprint: fingerprint }
      : null;
  }
  const aCorrect = chemicalChallenge.classifications.filter(
    (a) => classifications[a.id] === a.answer,
  ).length;
  const aCheck = legacyCheck(submitted.a, 10, c3Fingerprint(classifications), aCorrect);
  p = {
    ...p,
    aCheck:
      complete.a === true ? (aCheck ? aCheck : null) : aCheck ? { ...aCheck, passed: false } : null,
  };
  if (complete.a === true && !p.aCheck?.passed)
    issues.push(
      'Historical part (a) completion does not match the saved correct answers and snapshot.',
    );
  const unitChecks: Partial<Record<C3BUnitId, ChallengeCheck>> = {},
    slotChecks: Partial<Record<C3CSlot, ChallengeCheck>> = {};
  if (r.version === 3) {
    const units = object(r.unitChecks),
      slots = object(r.slotChecks);
    for (const unit of bUnits) {
      if (units[unit.id] === undefined) continue;
      const old = object(units[unit.id]),
        n = bUnitCount(chemicalChallenge, p, unit.id),
        fingerprint = bFingerprint(chemicalChallenge, p, unit.id);
      const check = legacyCheck(old, unit.slots.length, fingerprint, n);
      if (check) unitChecks[unit.id] = { ...check, passed: old.passed === true && check.passed };
      else issues.push(`Rejected stale or chemically inconsistent unitChecks.${unit.id}`);
    }
    for (const slot of chemicalChallenge.network.slots) {
      if (slots[slot.id] === undefined) continue;
      const old = object(slots[slot.id]),
        correct = moleculeMatches(p.drawingsC[slot.id], slot),
        snapshot = cFingerprint(p, slot.id);
      if (typeof old.correct === 'boolean' && old.correct === correct && old.snapshot === snapshot)
        slotChecks[slot.id] = {
          correct: Number(correct),
          total: 1,
          passed: correct,
          drawingFingerprint: snapshot,
        };
      else issues.push(`Rejected stale or chemically inconsistent slotChecks.${slot.id}`);
    }
  } else {
    const allB = Object.fromEntries(
        sourceBank.stages.b.answers.map((a) => [a.id, p.drawingsB[a.id]?.graph ?? null]),
      ),
      allC = Object.fromEntries(
        sourceBank.stages.c.answers.map((a) => [a.id, p.drawingsC[a.id]?.graph ?? null]),
      );
    if (
      complete.b === true &&
      legacyCheck(
        submitted.b,
        12,
        c3Fingerprint(allB),
        bUnits.reduce((n, u) => n + bUnitCount(chemicalChallenge, p, u.id), 0),
      )?.passed
    )
      for (const u of bUnits)
        unitChecks[u.id] = {
          correct: u.slots.length,
          total: u.slots.length,
          passed: true,
          drawingFingerprint: bFingerprint(chemicalChallenge, p, u.id),
        };
    if (
      complete.c === true &&
      legacyCheck(
        submitted.c,
        9,
        c3Fingerprint(allC),
        chemicalChallenge.network.slots.filter((s) => moleculeMatches(p.drawingsC[s.id], s)).length,
      )?.passed
    )
      for (const s of chemicalChallenge.network.slots)
        slotChecks[s.id] = {
          correct: 1,
          total: 1,
          passed: true,
          drawingFingerprint: cFingerprint(p, s.id),
        };
  }
  p = {
    ...p,
    unitChecks,
    slotChecks,
    selected: {
      b: sourceBank.stages.b.answers.some((a) => a.id === selected.b)
        ? (selected.b as C3BSlot)
        : 'A',
      c: sourceBank.stages.c.answers.some((a) => a.id === selected.c)
        ? (selected.c as C3CSlot)
        : 'R',
    },
    stage: stages.includes(String(r.stage)) ? (r.stage as C3L6Progress['stage']) : 'intro',
  };
  p = c3Policy.validateCompletion(chemicalChallenge, p);
  if (complete.b === true && !p.completed.b)
    issues.push('Historical part (b) completion lacks valid current chemical checks.');
  if (complete.c === true && !p.completed.c)
    issues.push('Historical part (c) completion lacks valid current chemical checks.');
  if (
    drawingsB.K &&
    (complete.b === true || object(object(r.unitChecks)['b-iv-3']).passed === true) &&
    !moleculeMatches(
      drawingsB.K,
      chemicalChallenge.hydrolysis.find((u) => u.unitId === 'b-iv-3')!.slots[0]!,
    )
  )
    issues.push(c3KErratum.note);
  return {
    accepted: issues.length === 0,
    progress: issues.length ? null : p,
    issues,
    raw,
    absentFields,
  };
}
const stages = ['intro', 'a', 'b', 'c'];
