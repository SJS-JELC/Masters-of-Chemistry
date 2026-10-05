import type {
  C3BSlot,
  C3CSlot,
  C3L6Challenge,
  C3L6Policy,
  C3L6Progress,
  ChallengeCheck,
  ChallengeCommand,
  C3BUnitId,
  C3DrawingSlot,
} from '../../../contracts/olympiad.ts';
import type { ProfileId } from '../../../contracts/identity.ts';
import type { MoleculeState } from '../../../contracts/editors.ts';
import { assertMoleculeState, core, moleculeEngine } from '../../../chemistry/molecule/engine.ts';
export function c3Fingerprint(value: unknown) {
  let h = 2166136261;
  for (const ch of JSON.stringify(value)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
export const blankC3Progress = (profileId: ProfileId): C3L6Progress => ({
  kind: 'olympiad-completion',
  course: 'alevel',
  profileId,
  activityId: 'alevel/c3l6-organic-reactions',
  stage: 'intro',
  classifications: {},
  drawingsB: {},
  drawingsC: {},
  selected: { b: 'A', c: 'R' },
  aCheck: null,
  unitChecks: {},
  slotChecks: {},
  completed: { a: false, b: false, c: false },
});
export const bFingerprint = (challenge: C3L6Challenge, p: C3L6Progress, id: C3BUnitId) =>
  c3Fingerprint(
    Object.fromEntries(
      challenge.dependencies.bUnits
        .find((u) => u.id === id)!
        .slots.map((s) => [s, p.drawingsB[s]?.graph ?? null]),
    ),
  );
export const cFingerprint = (p: C3L6Progress, id: C3CSlot) =>
  c3Fingerprint(p.drawingsC[id]?.graph ?? null);
export function moleculeMatches(
  drawing: MoleculeState | undefined,
  slot: C3DrawingSlot<C3BSlot | C3CSlot>,
): boolean {
  if (!drawing) return false;
  try {
    assertMoleculeState(drawing);
    return slot.alternatives.some((a) => core.check(drawing.graph, a.graph).kind === 'correct');
  } catch {
    return false;
  }
}
export function bUnitCount(challenge: C3L6Challenge, p: C3L6Progress, id: C3BUnitId) {
  const slots = challenge.hydrolysis.find((u) => u.unitId === id)!.slots;
  const normal = slots.filter((s) => moleculeMatches(p.drawingsB[s.id], s)).length;
  // Only the source-declared pair is interchangeable, and it must still supply both products.
  const swapped = slots.filter((s) => {
    const pair = challenge.dependencies.interchangeable.find((pair) => pair.includes(s.id));
    const other = pair ? pair.find((x) => x !== s.id) : null;
    return moleculeMatches(p.drawingsB[s.id], other ? slots.find((s) => s.id === other)! : s);
  }).length;
  return Math.max(normal, swapped);
}
const check = (correct: number, total: number, drawingFingerprint: string): ChallengeCheck => ({
  correct,
  total,
  passed: correct === total,
  drawingFingerprint,
});
const current = (
  old: ChallengeCheck | undefined | null,
  correct: number,
  total: number,
  fingerprint: string,
): ChallengeCheck | null => {
  if (
    !old ||
    !Number.isInteger(old.correct) ||
    old.correct < 0 ||
    old.correct > total ||
    old.total !== total ||
    typeof old.passed !== 'boolean' ||
    !/^([0-9a-f]{1,8})$/i.test(old.drawingFingerprint)
  )
    return null;
  return {
    ...old,
    passed:
      old.passed &&
      old.correct === total &&
      correct === total &&
      old.drawingFingerprint === fingerprint,
  };
};
function validateCompletion(challenge: C3L6Challenge, p: C3L6Progress): C3L6Progress {
  Object.values(p.drawingsB).forEach(assertMoleculeState);
  Object.values(p.drawingsC).forEach(assertMoleculeState);
  const aCorrect = challenge.classifications.filter(
    (a) => p.classifications[a.id] === a.answer,
  ).length;
  const aCheck = current(
    p.aCheck,
    aCorrect,
    challenge.classifications.length,
    c3Fingerprint(p.classifications),
  );
  const unitChecks: Partial<Record<C3BUnitId, ChallengeCheck>> = {};
  for (const unit of challenge.dependencies.bUnits) {
    const v = current(
      p.unitChecks[unit.id],
      bUnitCount(challenge, p, unit.id),
      unit.slots.length,
      bFingerprint(challenge, p, unit.id),
    );
    if (v) unitChecks[unit.id] = v;
  }
  const slotChecks: Partial<Record<C3CSlot, ChallengeCheck>> = {};
  for (const slot of challenge.network.slots) {
    const v = current(
      p.slotChecks[slot.id],
      Number(moleculeMatches(p.drawingsC[slot.id], slot)),
      1,
      cFingerprint(p, slot.id),
    );
    if (v) slotChecks[slot.id] = v;
  }
  const a = aCheck?.passed === true,
    b = a && challenge.dependencies.bUnits.every((u) => unitChecks[u.id]?.passed === true),
    c = b && challenge.network.slots.every((s) => slotChecks[s.id]?.passed === true);
  const stage = p.stage === 'c' && !b ? 'a' : p.stage === 'b' && !a ? 'a' : p.stage;
  return { ...p, stage, aCheck, unitChecks, slotChecks, completed: { a, b, c } };
}
export const stageUnlocked = (p: C3L6Progress, stage: C3L6Progress['stage']) =>
  stage === 'intro' ||
  stage === 'a' ||
  (stage === 'b' && p.completed.a) ||
  (stage === 'c' && p.completed.b);
function transition(challenge: C3L6Challenge, original: C3L6Progress, command: ChallengeCommand) {
  let p: C3L6Progress;
  try {
    p = validateCompletion(challenge, original);
  } catch (e) {
    return { accepted: false, progress: original, message: 'Invalid saved drawing: ' + String(e) };
  }
  const reject = (message: string) => ({ accepted: false, progress: original, message });
  const accept = (progress: C3L6Progress, message: string) => ({
    accepted: true,
    progress: validateCompletion(challenge, progress),
    message,
  });
  switch (command.kind) {
    case 'restart':
      return {
        accepted: true,
        progress: blankC3Progress(original.profileId),
        message: 'Challenge restarted. Drawings and completion have been cleared.',
      };
    case 'navigate':
      return stageUnlocked(p, command.stage)
        ? accept({ ...p, stage: command.stage }, '')
        : reject('Complete the preceding part before continuing.');
    case 'select-slot': {
      if (!stageUnlocked(p, command.stage)) return reject('This stage is locked.');
      const ids =
        command.stage === 'b'
          ? challenge.hydrolysis.flatMap((u) => u.slots)
          : challenge.network.slots;
      return ids.some((s) => s.id === command.slotId)
        ? accept({ ...p, selected: { ...p.selected, [command.stage]: command.slotId } }, '')
        : reject('Unknown structure label.');
    }
    case 'classify':
      if (p.completed.a) return reject('Part (a) is complete.');
      if (
        !challenge.classifications.some((a) => a.id === command.id) ||
        !['oxidation', 'reduction', 'hydrolysis'].includes(command.value)
      )
        return reject('Unknown classification.');
      return accept(
        { ...p, classifications: { ...p.classifications, [command.id]: command.value } },
        '',
      );
    case 'check-a': {
      if (p.completed.a) return reject('Part (a) is already complete.');
      if (!challenge.classifications.every((a) => p.classifications[a.id]))
        return reject('Classify all ten reactions before checking.');
      const n = challenge.classifications.filter(
        (a) => p.classifications[a.id] === a.answer,
      ).length;
      return accept(
        {
          ...p,
          aCheck: check(n, challenge.classifications.length, c3Fingerprint(p.classifications)),
        },
        `${n} of ${challenge.classifications.length} correct.`,
      );
    }
    case 'draw-b':
    case 'draw-c': {
      const stage = command.kind === 'draw-b' ? 'b' : 'c';
      if (!stageUnlocked(p, stage)) return reject('This stage is locked.');
      const known =
        stage === 'b'
          ? challenge.hydrolysis.some((u) => u.slots.some((s) => s.id === command.slotId))
          : challenge.network.slots.some((s) => s.id === command.slotId);
      if (!known) return reject('Unknown structure label.');
      const passed =
        stage === 'b'
          ? p.unitChecks[
              challenge.dependencies.bUnits.find((u) =>
                u.slots.includes(command.slotId as C3BSlot),
              )!.id
            ]?.passed
          : p.slotChecks[command.slotId as C3CSlot]?.passed;
      if (passed) return reject('This structure is complete.');
      try {
        assertMoleculeState(command.drawing);
      } catch (e) {
        return reject('Invalid drawing: ' + String(e));
      }
      return command.kind === 'draw-b'
        ? accept(
            {
              ...p,
              drawingsB: { ...p.drawingsB, [command.slotId]: structuredClone(command.drawing) },
            },
            '',
          )
        : accept(
            {
              ...p,
              drawingsC: { ...p.drawingsC, [command.slotId]: structuredClone(command.drawing) },
            },
            '',
          );
    }
    case 'check-b-unit': {
      const unit = challenge.dependencies.bUnits.find((u) => u.id === command.unitId);
      if (!unit || !p.completed.a) return reject('This reaction is locked or unknown.');
      if (p.unitChecks[unit.id]?.passed) return reject('This reaction is already complete.');
      if (
        unit.slots.some(
          (s) =>
            !p.drawingsB[s] || moleculeEngine.checkSubmission(p.drawingsB[s]!).status !== 'ready',
        )
      )
        return reject('Draw each product in this reaction before checking.');
      const n = bUnitCount(challenge, p, unit.id);
      return accept(
        {
          ...p,
          unitChecks: {
            ...p.unitChecks,
            [unit.id]: check(n, unit.slots.length, bFingerprint(challenge, p, unit.id)),
          },
        },
        n === unit.slots.length
          ? 'Reaction correct.'
          : `${n} of ${unit.slots.length} products correct. Check this reaction again.`,
      );
    }
    case 'check-c-slot': {
      const slot = challenge.network.slots.find((s) => s.id === command.slotId);
      if (!slot || !p.completed.b) return reject('Part (c) is locked or unknown.');
      if (p.slotChecks[slot.id]?.passed) return reject('This structure is already complete.');
      const drawing = p.drawingsC[slot.id];
      if (!drawing || moleculeEngine.checkSubmission(drawing).status !== 'ready')
        return reject('Draw this structure before checking.');
      const n = Number(moleculeMatches(drawing, slot));
      return accept(
        { ...p, slotChecks: { ...p.slotChecks, [slot.id]: check(n, 1, cFingerprint(p, slot.id)) } },
        n ? 'Structure correct.' : 'Check the atoms and bonds against the reaction network.',
      );
    }
  }
}
export const c3Policy: C3L6Policy = { transition, validateCompletion };
