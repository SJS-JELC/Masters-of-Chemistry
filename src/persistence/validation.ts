import { isCanonicalQuestionId } from '../content/canonical-identity.ts';
import { curriculumActivityIds, leafBoundary } from './catalogue-boundary.ts';
import type { CurriculumWrite, ImportBatch } from '../contracts/repository.ts';
import type { Namespace } from '../contracts/identity.ts';
import type { IsomerProgress } from '../contracts/olympiad.ts';
import { isomerBoxes, isomerChallenge } from '../activities/olympiad/isomers2011/content.ts';
import { isomerPolicy } from '../activities/olympiad/isomers2011/policy.ts';
export class InvalidData extends Error {}
export class EvidenceConflict extends Error {}
export type JsonObject = Record<string, unknown>;
export const object = (value: unknown): value is JsonObject =>
  !!value && typeof value === 'object' && !Array.isArray(value);
export function requireData(condition: unknown, message: string): asserts condition {
  if (!condition) throw new InvalidData(message);
}
export function record(value: unknown, label: string): JsonObject {
  requireData(object(value), `${label} must be an object`);
  return value;
}
export const text = (v: unknown): v is string => typeof v === 'string' && v.length <= 100000;
export const id = (v: unknown): v is string => text(v) && v.length > 0 && v.length <= 500;
export const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
export const level = (v: unknown) => v === 1 || v === 2 || v === 3;
export const score = (v: unknown) => v === 0 || v === 0.5 || v === 1;
export const same = (a: unknown, b: unknown) => canonical(a) === canonical(b);
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (object(value))
    return `{${Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`)
      .join(',')}}`;
  return JSON.stringify(value) ?? 'undefined';
}
export function safeJson(value: unknown): void {
  let nodes = 0;
  const seen = new Set<object>();
  function walk(v: unknown, depth: number): void {
    requireData(++nodes <= 100000 && depth <= 24, 'Data exceeds serialization bounds');
    if (v === null || typeof v === 'boolean' || text(v) || finite(v)) return;
    requireData(
      typeof v === 'object' && v !== null && !seen.has(v),
      'Data must be finite, acyclic JSON',
    );
    requireData(
      Array.isArray(v) ||
        Object.getPrototypeOf(v) === Object.prototype ||
        Object.getPrototypeOf(v) === null,
      'Data must use plain JSON objects',
    );
    seen.add(v);
    const values = Array.isArray(v) ? v : Object.values(v);
    requireData(values.length <= 10000, 'Container exceeds bounds');
    for (const child of values) walk(child, depth + 1);
    seen.delete(v);
  }
  walk(value, 0);
}
function keys(v: JsonObject, allowed: string[]): void {
  requireData(
    Object.keys(v).every((k) => allowed.includes(k)),
    'Unexpected persisted field',
  );
}
function array(v: unknown, label: string, maximum = 10000): unknown[] {
  requireData(Array.isArray(v) && v.length <= maximum, `${label} must be a bounded array`);
  return v;
}
function identifiers(v: unknown, label: string): string[] {
  const a = array(v, label);
  requireData(a.every(id) && new Set(a).size === a.length, `${label} requires unique IDs`);
  return a as string[];
}
export function validateNamespace(v: unknown): asserts v is Namespace {
  const n = record(v, 'namespace');
  keys(n, ['course', 'profileId']);
  requireData(
    (n.course === 'alevel' || n.course === 'igcse') && id(n.profileId),
    'Invalid namespace',
  );
}
function activity(v: unknown, course: unknown): void {
  requireData(
    typeof v === 'string' &&
      curriculumActivityIds.includes(v) &&
      v.startsWith(`${String(course)}/`),
    'Excluded or mismatched curriculum activity',
  );
}
function target(v: unknown, course: unknown): JsonObject {
  const t = record(v, 'target');
  keys(t, ['course', 'activityId', 'gemId', 'level']);
  requireData(t.course === course && id(t.gemId) && level(t.level), 'Invalid curriculum target');
  activity(t.activityId, course);
  const leaf = leafBoundary[String(t.gemId)];
  requireData(
    leaf !== undefined &&
      !leaf.historicalOnly &&
      leaf.activityId === t.activityId &&
      leaf.levels.includes(Number(t.level)),
    'Unsupported gem/activity/level',
  );
  return t;
}
function ref(v: unknown, course: unknown): JsonObject {
  const r = record(v, 'ref');
  keys(r, ['activityId', 'questionId', 'seed', 'level']);
  activity(r.activityId, course);
  requireData(
    isCanonicalQuestionId(String(r.activityId), r.questionId) &&
      Number.isSafeInteger(r.seed) &&
      Number(r.seed) >= 0 &&
      Number(r.seed) <= 0xffffffff &&
      level(r.level),
    'Invalid question reference',
  );
  return r;
}
export function validateTiming(v: unknown, checkpoint = false): void {
  const t = record(v, 'timing');
  keys(
    t,
    checkpoint ? ['activeMs', 'idleLimitMs', 'attemptId', 'finished'] : ['activeMs', 'idleLimitMs'],
  );
  requireData(
    Number.isSafeInteger(t.activeMs) &&
      Number(t.activeMs) >= 0 &&
      [60000, 180000, 300000, 600000].includes(Number(t.idleLimitMs)),
    'Invalid active timing',
  );
  if (checkpoint)
    requireData(id(t.attemptId) && typeof t.finished === 'boolean', 'Invalid clock checkpoint');
}
function point(v: JsonObject): void {
  requireData(
    finite(v.x) && finite(v.y) && Math.abs(v.x) <= 1000000 && Math.abs(v.y) <= 1000000,
    'Invalid drawing coordinates',
  );
}
/** Serialization/references only. Excess valence and wrong bonds remain assessable. */
export function validateMoleculeGraph(value: unknown): void {
  const g = record(value, 'molecule graph');
  keys(g, ['atoms', 'bonds', 'arrows']);
  const atoms = array(g.atoms, 'atoms', 500),
    bonds = array(g.bonds, 'bonds', 1000);
  const atomIds = new Set<number>();
  for (const value of atoms) {
    const a = record(value, 'atom');
    keys(a, [
      'id',
      'element',
      'x',
      'y',
      'charge',
      'h',
      'pairs',
      'dipole',
      'chargeAngle',
      'dipoleAngle',
    ]);
    point(a);
    requireData(
      Number.isSafeInteger(a.id) && Number(a.id) >= 0 && !atomIds.has(Number(a.id)),
      'Duplicate or invalid atom ID',
    );
    atomIds.add(Number(a.id));
    requireData(
      ['C', 'O', 'N', 'Cl', 'F', 'H'].includes(String(a.element)),
      'Unknown molecule element',
    );
    if ('charge' in a)
      requireData([-1, 0, 1].includes(a.charge as number), 'Invalid charge serialization');
    if ('h' in a)
      requireData(
        Number.isInteger(a.h) && Number(a.h) >= 0 && Number(a.h) <= 4,
        'Invalid attached hydrogen serialization',
      );
    if ('pairs' in a)
      requireData(array(a.pairs, 'pairs', 20).every(finite), 'Invalid lone pair angles');
    if ('dipole' in a) requireData(a.dipole === -1 || a.dipole === 1, 'Invalid dipole');
    for (const k of ['chargeAngle', 'dipoleAngle'])
      if (k in a) requireData(finite(a[k]), 'Invalid annotation angle');
  }
  const bondIds = new Set<string>();
  for (const value of bonds) {
    const b = record(value, 'bond');
    keys(b, ['a', 'b', 'order']);
    requireData(
      Number.isSafeInteger(b.a) &&
        Number.isSafeInteger(b.b) &&
        atomIds.has(Number(b.a)) &&
        atomIds.has(Number(b.b)) &&
        b.a !== b.b &&
        [1, 2, 3].includes(b.order as number),
      'Malformed bond reference/order',
    );
    const k = [Number(b.a), Number(b.b)].sort((a, b) => a - b).join(':');
    requireData(!bondIds.has(k), 'Duplicate bond');
    bondIds.add(k);
  }
  function anchor(value: unknown): void {
    const a = record(value, 'arrow anchor');
    if (a.kind === 'bond') {
      keys(a, ['kind', 'a', 'b']);
      requireData(
        Number.isSafeInteger(a.a) &&
          Number.isSafeInteger(a.b) &&
          bondIds.has([Number(a.a), Number(a.b)].sort((a, b) => a - b).join(':')),
        'Dangling arrow bond',
      );
    } else {
      keys(a, ['kind', 'id', 'index']);
      requireData(
        ['atom', 'charge', 'pair'].includes(String(a.kind)) &&
          Number.isSafeInteger(a.id) &&
          atomIds.has(Number(a.id)),
        'Dangling arrow atom',
      );
      if ('index' in a) {
        const atom = record(
          atoms.find((v) => record(v, 'atom').id === a.id),
          'arrow atom',
        );
        requireData(
          a.kind === 'pair' &&
            Number.isInteger(a.index) &&
            Number(a.index) >= 0 &&
            Number(a.index) < array(atom.pairs, 'pair references').length,
          'Dangling lone pair arrow',
        );
      }
    }
  }
  if ('arrows' in g) {
    const ids = new Set<unknown>();
    for (const value of array(g.arrows, 'arrows', 500)) {
      const a = record(value, 'arrow');
      keys(a, ['id', 'from', 'to', 'bend']);
      requireData(Number.isSafeInteger(a.id) && !ids.has(a.id) && finite(a.bend), 'Invalid arrow');
      ids.add(a.id);
      anchor(a.from);
      anchor(a.to);
    }
  }
}
function range(value: unknown, locked?: string): void {
  const r = record(value, 'text range');
  keys(r, ['start', 'end', 'text']);
  requireData(
    Number.isSafeInteger(r.start) &&
      Number.isSafeInteger(r.end) &&
      Number(r.start) >= 0 &&
      Number(r.end) > Number(r.start) &&
      Number(r.end) <= 100000 &&
      text(r.text) &&
      r.text.length === Number(r.end) - Number(r.start),
    'Invalid text range',
  );
  if (locked !== undefined)
    requireData(
      Number(r.end) <= locked.length && locked.slice(Number(r.start), Number(r.end)) === r.text,
      'Evidence differs from locked text',
    );
}
export function validateResponse(value: unknown): void {
  const r = record(value, 'response');
  switch (r.kind) {
    case 'text':
      keys(r, ['kind', 'value']);
      requireData(text(r.value), 'Invalid text');
      break;
    case 'numeric':
      keys(r, ['kind', 'raw', 'unit', 'working']);
      requireData(text(r.raw) && text(r.unit), 'Invalid numeric serialization');
      if (r.working !== undefined) {
        const working = record(r.working, 'numeric working');
        requireData(
          (Object.getPrototypeOf(working) === Object.prototype ||
            Object.getPrototypeOf(working) === null) &&
            Object.keys(working).length <= 64 &&
            Object.entries(working).every(
              ([key, value]) =>
                /^[A-Za-z0-9][A-Za-z0-9:_-]{0,99}$/.test(key) &&
                !['__proto__', 'prototype', 'constructor'].includes(key) &&
                typeof value === 'string' &&
                value.length <= 4096,
            ),
          'Invalid numeric working serialization',
        );
      }
      break;
    case 'choice':
      keys(r, ['kind', 'selected']);
      identifiers(r.selected, 'choices');
      break;
    case 'drawing-self-check':
      keys(r, ['kind', 'matches']);
      requireData(
        r.matches === null || typeof r.matches === 'boolean',
        'Invalid drawing self-check',
      );
      break;
    case 'diagram-selection':
      keys(r, ['kind', 'selectedObjectIds']);
      identifiers(r.selectedObjectIds, 'objects');
      break;
    case 'explanation':
      keys(r, ['kind', 'sections']);
      {
        const ids = new Set<unknown>();
        for (const value of array(r.sections, 'sections', 100)) {
          const s = record(value, 'section');
          keys(s, ['id', 'text']);
          requireData(id(s.id) && text(s.text) && !ids.has(s.id), 'Invalid explanation section');
          ids.add(s.id);
        }
      }
      break;
    case 'correction':
      keys(r, ['kind', 'selections', 'replacement']);
      requireData(text(r.replacement), 'Invalid correction');
      for (const s of array(r.selections, 'selections', 100)) range(s);
      break;
    case 'molecule':
      keys(r, ['kind', 'graph', 'history']);
      validateMoleculeGraph(r.graph);
      for (const h of array(r.history, 'history', 100)) validateMoleculeGraph(h);
      break;
    case 'dot-and-cross': {
      keys(r, ['kind', 'atoms', 'electrons', 'groups', 'history', 'future', 'circles']);
      if (r.circles !== undefined)
        requireData(typeof r.circles === 'boolean', 'Invalid circles preference');
      for (const name of ['history', 'future'])
        if (r[name] !== undefined)
          for (const snapshot of array(r[name], name, 100)) {
            const entry = record(snapshot, 'dotcross snapshot');
            keys(entry, ['kind', 'atoms', 'electrons', 'groups']);
            requireData(entry.kind === 'dot-and-cross', 'Invalid dotcross snapshot kind');
            validateResponse(entry);
          }
      const ids = new Set<unknown>();
      for (const value of array(r.atoms, 'atoms', 500)) {
        const a = record(value, 'atom');
        keys(a, ['id', 'element', 'x', 'y']);
        point(a);
        requireData(
          id(a.id) &&
            !ids.has(a.id) &&
            [
              'H',
              'B',
              'C',
              'Si',
              'N',
              'O',
              'P',
              'S',
              'F',
              'Cl',
              'Br',
              'I',
              'Li',
              'K',
              'Na',
              'Mg',
              'Ca',
              'Al',
            ].includes(String(a.element)),
          'Invalid dotcross atom',
        );
        ids.add(a.id);
      }
      const electronIds = new Set<unknown>();
      for (const value of array(r.electrons, 'electrons', 2000)) {
        const e = record(value, 'electron');
        keys(e, ['id', 'symbol', 'anchor']);
        requireData(
          id(e.id) &&
            !electronIds.has(e.id) &&
            ['dot', 'cross', 'triangle'].includes(String(e.symbol)),
          'Invalid electron',
        );
        electronIds.add(e.id);
        const a = record(e.anchor, 'anchor');
        if (a.kind === 'atom') {
          keys(a, ['kind', 'atomId', 'slot']);
          requireData(
            ids.has(a.atomId) &&
              Number.isInteger(a.slot) &&
              Number(a.slot) >= 0 &&
              Number(a.slot) <= 7,
            'Invalid atom anchor',
          );
        } else {
          keys(a, ['kind', 'a', 'b', 'slot']);
          requireData(
            a.kind === 'bond' &&
              ids.has(a.a) &&
              ids.has(a.b) &&
              a.a !== a.b &&
              Number.isInteger(a.slot) &&
              Number(a.slot) >= 0 &&
              Number(a.slot) <= 5,
            'Invalid bond anchor',
          );
        }
      }
      const groups = new Set<unknown>();
      for (const value of array(r.groups, 'groups', 500)) {
        const g = record(value, 'group');
        keys(g, ['id', 'atomIds', 'charge', 'bracket']);
        requireData(
          id(g.id) &&
            !groups.has(g.id) &&
            Number.isSafeInteger(g.charge) &&
            typeof g.bracket === 'boolean',
          'Invalid group',
        );
        groups.add(g.id);
        requireData(
          identifiers(g.atomIds, 'group atoms').every((a) => ids.has(a)),
          'Dangling group atom',
        );
      }
      break;
    }
    case 'electron-configuration':
      keys(r, ['kind', 'counts', 'core', 'boxes', 'identity', 'selectedSpeciesIds']);
      requireData(
        array(r.counts, 'counts', 8).length === 8 &&
          array(r.counts, 'counts').every(text) &&
          text(r.core) &&
          text(r.identity) &&
          array(r.boxes, 'boxes', 8).length === 8,
        'Invalid orbitals',
      );
      for (const b of array(r.boxes, 'boxes'))
        requireData(
          array(b, 'orbital boxes', 7).every((v) => v === 0 || v === 1 || v === 2 || v === 3),
          'Invalid orbital spin',
        );
      identifiers(r.selectedSpeciesIds, 'species');
      break;
    case 'energy-profile':
      keys(r, [
        'kind',
        'r',
        'p',
        'peak',
        'left',
        'right',
        'vertical',
        'horizontal',
        'pathLabel',
        'arrows',
      ]);
      for (const k of ['r', 'p', 'peak']) requireData(finite(r[k]), 'Invalid energy coordinate');
      for (const k of ['left', 'right', 'vertical', 'horizontal', 'pathLabel'])
        requireData(text(r[k]), 'Invalid energy label');
      {
        const arrows = record(r.arrows, 'energy arrows');
        keys(arrows, ['ea', 'delta']);
        for (const v of Object.values(arrows)) {
          const a = record(v, 'energy arrow');
          keys(a, ['x', 'tail', 'head']);
          requireData(finite(a.x), 'Invalid arrow x');
          for (const end of [a.tail, a.head]) {
            const e = record(end, 'arrow end');
            requireData(
              Object.keys(e).length === 1 &&
                ('anchor' in e ? ['r', 'p', 'peak'].includes(String(e.anchor)) : finite(e.y)),
              'Invalid energy arrow end',
            );
          }
        }
      }
      break;
    case 'titration-curve':
      keys(r, [
        'kind',
        'before',
        'after',
        'initialPH',
        'equivalenceVolume',
        'finalPH',
        'indicator',
      ]);
      for (const k of ['before', 'after', 'indicator'])
        requireData(r[k] === null || text(r[k]), 'Invalid curve label');
      for (const k of ['initialPH', 'equivalenceVolume', 'finalPH'])
        requireData(finite(r[k]), 'Invalid curve coordinate');
      break;
    default:
      throw new InvalidData('Unsupported response kind');
  }
}
function responses(v: unknown): void {
  const r = record(v, 'responses');
  requireData(
    Object.keys(r).length <= 100 && Object.keys(r).every(id),
    'Invalid response part IDs',
  );
  Object.values(r).forEach(validateResponse);
}
function assistance(v: unknown): void {
  for (const value of array(v, 'assistance', 1000)) {
    const a = record(value, 'assistance');
    keys(a, ['kind', 'supportId', 'at']);
    requireData(
      ['hint', 'reveal', 'worked-answer'].includes(String(a.kind)) &&
        id(a.supportId) &&
        finite(a.at) &&
        a.at >= 0,
      'Invalid assistance',
    );
  }
}
function reviews(value: unknown): void {
  const parts = new Set<unknown>();
  for (const v of array(value, 'rubric reviews', 100)) {
    const r = record(v, 'rubric review');
    keys(r, ['partId', 'lockedText', 'judgements', 'activePointId']);
    requireData(
      id(r.partId) &&
        !parts.has(r.partId) &&
        text(r.lockedText) &&
        (r.activePointId === null || id(r.activePointId)),
      'Invalid review',
    );
    parts.add(r.partId);
    const points = new Set<unknown>();
    for (const v of array(r.judgements, 'judgements', 500)) {
      const j = record(v, 'judgement');
      keys(j, j.status === 'met' ? ['pointId', 'status', 'evidence'] : ['pointId', 'status']);
      requireData(
        id(j.pointId) &&
          !points.has(j.pointId) &&
          ['unjudged', 'awaiting-evidence', 'not-met', 'met'].includes(String(j.status)),
        'Invalid rubric judgement',
      );
      points.add(j.pointId);
      if (j.status === 'met') range(j.evidence, r.lockedText);
    }
    requireData(
      r.activePointId === null || points.has(r.activePointId),
      'Missing active rubric point',
    );
  }
}
function marks(value: unknown): void {
  const m = record(value, 'marks');
  keys(m, ['earned', 'available', 'points']);
  requireData(
    finite(m.earned) &&
      finite(m.available) &&
      m.available >= 0 &&
      m.earned >= 0 &&
      m.earned <= m.available,
    'Invalid marks',
  );
  let earned = 0,
    available = 0;
  const ids = new Set<string>();
  for (const v of array(m.points, 'mark points', 1000)) {
    const p = record(v, 'mark point');
    keys(p, [
      'partId',
      'pointId',
      'earned',
      'available',
      'message',
      'textClassification',
      'learningReview',
    ]);
    requireData(
      id(p.partId) &&
        id(p.pointId) &&
        text(p.message) &&
        finite(p.earned) &&
        finite(p.available) &&
        p.available >= 0 &&
        p.earned >= 0 &&
        p.earned <= p.available,
      'Invalid mark point',
    );
    const k = `${String(p.partId)}:${String(p.pointId)}`;
    requireData(!ids.has(k), 'Duplicate mark point');
    ids.add(k);
    earned += p.earned;
    available += p.available;
    if ('textClassification' in p)
      requireData(
        ['accepted', 'rejected', 'empty', 'unrecognized'].includes(String(p.textClassification)),
        'Invalid classification',
      );
    if ('learningReview' in p) {
      const e = record(p.learningReview, 'eligibility');
      requireData(
        e.kind === 'valid-alternative' &&
          typeof e.eligible === 'boolean' &&
          text(e.modelAnswer) &&
          Array.isArray(e.rubric),
        'Invalid learning eligibility',
      );
    }
  }
  requireData(
    Math.abs(earned - m.earned) < 1e-9 && Math.abs(available - m.available) < 1e-9,
    'Mark totals disagree',
  );
}
function frozen(value: unknown): JsonObject {
  const f = record(value, 'first response');
  keys(f, ['responses', 'submittedAt', 'timing', 'assistance']);
  responses(f.responses);
  assistance(f.assistance);
  validateTiming(f.timing);
  requireData(finite(f.submittedAt) && f.submittedAt >= 0, 'Invalid submitted date');
  return f;
}
function drawingChecks(value: unknown, finished = false): void {
  const ids = new Set<unknown>();
  for (const v of array(value, 'drawing checks', 100)) {
    const c = record(v, 'drawing check');
    keys(c, ['partId', 'judgement']);
    requireData(
      id(c.partId) &&
        !ids.has(c.partId) &&
        (finished ? ['pass', 'fail'] : ['pending', 'pass', 'fail']).includes(String(c.judgement)),
      'Invalid drawing judgement',
    );
    ids.add(c.partId);
  }
  requireData(ids.size > 0, 'Missing drawing check');
}
function assessment(value: unknown): JsonObject {
  const a = record(value, 'assessment');
  requireData(finite(a.assessedAt) && a.assessedAt >= 0, 'Invalid assessment date');
  if (a.kind === 'revealed') {
    keys(a, ['kind', 'assessedAt', 'independent']);
    requireData(a.independent === false, 'Reveal cannot be independent');
  } else {
    keys(
      a,
      a.kind === 'self-rubric'
        ? ['kind', 'assessedAt', 'marks', 'score', 'selfAssessed', 'reviews']
        : a.kind === 'self-drawing'
          ? ['kind', 'assessedAt', 'marks', 'score', 'selfAssessed', 'checks']
          : ['kind', 'assessedAt', 'marks', 'score', 'selfAssessed'],
    );
    requireData(
      (a.kind === 'marked' && a.selfAssessed === false) ||
        (['self-rubric', 'self-drawing'].includes(String(a.kind)) && a.selfAssessed === true),
      'Invalid assessment kind',
    );
    requireData(score(a.score), 'Invalid mastery score');
    marks(a.marks);
    if (a.kind === 'self-rubric') {
      reviews(a.reviews);
      for (const v of array(a.reviews, 'reviews'))
        requireData(
          array(record(v, 'review').judgements, 'judgements').every((j) =>
            ['met', 'not-met'].includes(String(record(j, 'judgement').status)),
          ),
          'Unfinished rubric assessment',
        );
    }
    if (a.kind === 'self-drawing') drawingChecks(a.checks, true);
  }
  return a;
}
export function validateAttempt(value: unknown): void {
  safeJson(value);
  const a = record(value, 'attempt');
  keys(a, [
    'mode',
    'namespace',
    'attemptId',
    'ref',
    'target',
    'currentResponses',
    'currentResponseChanged',
    'currentGiveUp',
    'assistance',
    'phase',
    'timing',
    'firstResponse',
    'firstAssessment',
    'reviews',
    'learningReview',
    'automaticMarks',
    'checks',
  ]);
  requireData(a.mode === 'student' && id(a.attemptId), 'Only student attempts persist');
  validateNamespace(a.namespace);
  const t = target(a.target, a.namespace.course),
    r = ref(a.ref, a.namespace.course);
  requireData(t.activityId === r.activityId && t.level === r.level, 'Target and ref disagree');
  responses(a.currentResponses);
  assistance(a.assistance);
  if ('currentResponseChanged' in a)
    requireData(a.currentResponseChanged === true && a.phase === 'assessed', 'Invalid current-response action marker');
  if ('currentGiveUp' in a)
    requireData(
      a.currentGiveUp === true && a.phase !== 'answering' &&
        array(a.assistance, 'assistance').some(v => ['reveal', 'worked-answer'].includes(String(record(v, 'assistance').kind))),
      'Invalid current Give Up action marker',
    );
  if (a.phase === 'answering') {
    requireData(
      !('firstResponse' in a) &&
        !('firstAssessment' in a) &&
        !('reviews' in a) &&
        !('learningReview' in a) &&
        !('automaticMarks' in a) &&
        !('checks' in a),
      'Answering has frozen data',
    );
    validateTiming(a.timing, true);
    const c = record(a.timing, 'checkpoint');
    requireData(
      c.attemptId === a.attemptId && c.finished === false,
      'Mismatched/finished answering clock',
    );
  } else {
    requireData(!('timing' in a), 'Frozen attempt has live clock');
    const f = frozen(a.firstResponse);
    requireData(
      same(
        array(a.assistance, 'assistance').slice(0, array(f.assistance, 'first assistance').length),
        f.assistance,
      ),
      'Frozen assistance differs',
    );
    if (a.phase === 'drawing-review') {
      requireData(
        !('firstAssessment' in a) && !('learningReview' in a) && !('reviews' in a),
        'Drawing review already assessed',
      );
      drawingChecks(a.checks);
      marks(a.automaticMarks);
    } else if (a.phase === 'rubric-review') {
      requireData(!('checks' in a), 'Unexpected drawing checks');
      requireData(
        !('firstAssessment' in a) && !('learningReview' in a),
        'Rubric review already assessed',
      );
      reviews(a.reviews);
      if ('automaticMarks' in a) marks(a.automaticMarks);
    } else {
      requireData(
        a.phase === 'assessed' && !('reviews' in a) && !('automaticMarks' in a) && !('checks' in a),
        'Invalid attempt phase',
      );
      const s = assessment(a.firstAssessment);
      requireData(Number(s.assessedAt) >= Number(f.submittedAt), 'Assessment precedes response');
      if (s.kind === 'revealed')
        requireData(
          array(f.assistance, 'assistance').some((v) =>
            ['reveal', 'worked-answer'].includes(String(record(v, 'assistance').kind)),
          ),
          'Reveal lacks assistance',
        );
      if ('learningReview' in a) {
        const l = record(a.learningReview, 'learning review');
        keys(l, ['kind', 'decisions', 'reviewedMarks']);
        requireData(
          l.kind === 'post-assessment-learning' && s.kind === 'marked',
          'Invalid learning review phase',
        );
        marks(l.reviewedMarks);
        for (const v of array(l.decisions, 'decisions', 1000)) {
          const d = record(v, 'decision');
          keys(d, ['partId', 'pointId', 'judgement', 'reviewer']);
          requireData(
            id(d.partId) &&
              id(d.pointId) &&
              ['equivalent', 'not-equivalent'].includes(String(d.judgement)) &&
              ['student', 'teacher'].includes(String(d.reviewer)),
            'Invalid learning decision',
          );
        }
      }
    }
  }
}
export function validateEvidence(value: unknown): void {
  safeJson(value);
  const e = record(value, 'evidence');
  keys(e, [
    'kind',
    'id',
    'profileId',
    'gemId',
    'score',
    'completedAt',
    'selfAssessed',
    'assisted',
    'course',
    'activityId',
    'level',
    'grade',
    'provenance',
    'independent',
    'timing',
    'ref',
    'firstResponse',
    'firstAssessment',
    'sourceKey',
    'sourceLeafId',
    'progressionVersion',
    'sourceQuestionId',
    'sourceFamily',
    'sourceStrand',
  ]);
  requireData(
    e.kind === 'curriculum' &&
      id(e.id) &&
      id(e.profileId) &&
      id(e.gemId) &&
      score(e.score) &&
      finite(e.completedAt) &&
      e.completedAt > 0,
    'Invalid evidence',
  );
  requireData(
    e.course === 'alevel'
      ? level(e.level) && !('grade' in e)
      : e.course === 'igcse' && level(e.grade) && !('level' in e),
    'Wrong course level/grade',
  );
  if ('activityId' in e) activity(e.activityId, e.course);
  const leaf = leafBoundary[String(e.gemId)];
  requireData(
    leaf !== undefined &&
      leaf.activityId.startsWith(`${String(e.course)}/`) &&
      (!('activityId' in e) || leaf.activityId === e.activityId),
    'Unknown or mismatched evidence gem',
  );
  if (e.provenance === 'new-attempt')
    requireData(
      !leaf.historicalOnly &&
        leaf.levels.includes(Number(e.course === 'alevel' ? e.level : e.grade)),
      'Unsupported independent evidence level',
    );
  for (const k of ['selfAssessed', 'assisted', 'independent'])
    if (k in e) requireData(typeof e[k] === 'boolean', 'Invalid evidence flag');
  if ('timing' in e) validateTiming(e.timing);
  if ('ref' in e) {
    const r = ref(e.ref, e.course);
    requireData(
      r.level === (e.course === 'alevel' ? e.level : e.grade) &&
        (!('activityId' in e) || r.activityId === e.activityId),
      'Evidence ref mismatch',
    );
  }
  if ('firstResponse' in e) frozen(e.firstResponse);
  if ('firstAssessment' in e) {
    const a = assessment(e.firstAssessment);
    if ('selfAssessed' in e)
      requireData(e.selfAssessed === a.selfAssessed, 'Self-assessment provenance differs');
    requireData(
      a.kind !== 'revealed' && a.score === e.score && a.assessedAt === e.completedAt,
      'Evidence assessment mismatch',
    );
  }
  if (e.provenance === 'new-attempt') {
    requireData(
      e.independent === true &&
        e.assisted !== true &&
        'timing' in e &&
        'ref' in e &&
        'firstResponse' in e &&
        'firstAssessment' in e,
      'Missing independent evidence',
    );
    const f = record(e.firstResponse, 'first response');
    requireData(
      array(f.assistance, 'assistance').length === 0 && same(e.timing, f.timing),
      'Assisted or mismatched first evidence',
    );
    requireData(
      !('sourceKey' in e) &&
        !('sourceLeafId' in e) &&
        !('progressionVersion' in e) &&
        !('sourceQuestionId' in e) &&
        !('sourceFamily' in e) &&
        !('sourceStrand' in e),
      'New evidence has legacy metadata',
    );
  } else {
    requireData(e.provenance === 'legacy-import' && id(e.sourceKey), 'Missing import provenance');
    for (const k of ['sourceQuestionId', 'sourceFamily', 'sourceStrand'])
      if (k in e) requireData(id(e[k]), 'Invalid original source metadata');
    if ('sourceLeafId' in e) requireData(id(e.sourceLeafId), 'Invalid original leaf');
    if ('progressionVersion' in e)
      requireData(
        e.progressionVersion === 1 || e.progressionVersion === 2,
        'Invalid historical progression',
      );
  }
}
export function validateSession(value: unknown): void {
  safeJson(value);
  const s = record(value, 'session');
  validateNamespace(s.namespace);
  requireData(id(s.id), 'Invalid session ID');
  if (s.kind === 'practice') {
    keys(s, [
      'kind',
      'namespace',
      'id',
      'target',
      'selection',
      'currentAttemptId',
      'previousQuestionIds',
      'paused',
    ]);
    requireData(
      s.paused === undefined || typeof s.paused === 'boolean',
      'Invalid practice pause state',
    );
    target(s.target, s.namespace.course);
    requireData(
      ['fixed-level', 'mastery'].includes(String(s.selection)) &&
        (s.currentAttemptId === null || id(s.currentAttemptId)),
      'Invalid practice session',
    );
    array(s.previousQuestionIds, 'previous questions').forEach((v) =>
      requireData(
        isCanonicalQuestionId(String(record(s.target, 'practice target').activityId), v),
        'Invalid canonical previous question ID',
      ),
    );
  } else {
    keys(s, [
      'kind',
      'namespace',
      'id',
      'createdAt',
      'status',
      'selectedGemIds',
      'levels',
      'round',
      'lastGemId',
      'current',
      'previous',
      'submittedAttemptIds',
    ]);
    requireData(
      s.kind === 'revision' &&
        finite(s.createdAt) &&
        s.createdAt >= 0 &&
        ['active', 'paused', 'complete'].includes(String(s.status)),
      'Invalid revision',
    );
    const selected = identifiers(s.selectedGemIds, 'selected gems');
    requireData(
      identifiers(s.round, 'round').every((v) => selected.includes(v)) &&
        (s.lastGemId === null || selected.includes(String(s.lastGemId))),
      'Invalid revision rotation',
    );
    const combinations = new Set<string>();
    for (const v of array(s.levels, 'levels', 1000)) {
      const l = record(v, 'level state');
      keys(l, ['target', 'mode', 'required', 'streak', 'confirmedAt', 'initialScore']);
      const t = target(l.target, s.namespace.course);
      requireData(
        selected.includes(String(t.gemId)) &&
          ['check', 'practice'].includes(String(l.mode)) &&
          (l.required === 1 || l.required === 2) &&
          Number.isSafeInteger(l.streak) &&
          Number(l.streak) >= 0 &&
          (l.confirmedAt === null || finite(l.confirmedAt)) &&
          (l.initialScore === null ||
            (finite(l.initialScore) && l.initialScore >= 0 && l.initialScore <= 1)),
        'Invalid level state',
      );
      const k = `${String(t.gemId)}:${String(t.level)}`;
      requireData(!combinations.has(k), 'Duplicate revision level');
      combinations.add(k);
    }
    if (s.current !== null) {
      const c = record(s.current, 'current');
      keys(c, ['attemptId', 'target', 'ref', 'completed']);
      requireData(id(c.attemptId) && typeof c.completed === 'boolean', 'Invalid current');
      const t = target(c.target, s.namespace.course);
      requireData(combinations.has(`${String(t.gemId)}:${String(t.level)}`), 'Unselected current');
      if (c.ref !== null) {
        const r = ref(c.ref, s.namespace.course);
        requireData(r.activityId === t.activityId && r.level === t.level, 'Current ref mismatch');
      }
    }
    for (const v of array(s.previous, 'previous')) {
      const p = record(v, 'previous');
      keys(p, ['target', 'ref']);
      const t = target(p.target, s.namespace.course),
        r = ref(p.ref, s.namespace.course);
      requireData(t.activityId === r.activityId && t.level === r.level, 'Previous mismatch');
    }
    identifiers(s.submittedAttemptIds, 'submitted attempts');
  }
}
export function validateWrite(value: CurriculumWrite): void {
  validateAttempt(value.attempt);
  if (value.evidence !== undefined) {
    validateEvidence(value.evidence);
    const a = value.attempt,
      e = value.evidence;
    requireData(
      a.phase === 'assessed' &&
        e.provenance === 'new-attempt' &&
        e.course === a.namespace.course &&
        e.profileId === a.namespace.profileId &&
        e.id === a.attemptId &&
        e.gemId === a.target.gemId &&
        e.activityId === a.ref.activityId &&
        same(e.ref, a.ref) &&
        same(e.firstResponse, a.firstResponse) &&
        same(e.firstAssessment, a.firstAssessment),
      'Attempt/evidence mismatch',
    );
  }
  if (value.session !== undefined) {
    validateSession(value.session);
    const a = value.attempt,
      s = value.session;
    requireData(same(s.namespace, a.namespace), 'Cross-namespace session');
    if (s.kind === 'practice')
      requireData(
        s.currentAttemptId === a.attemptId && same(s.target, a.target),
        'Session does not reference attempt',
      );
    else
      requireData(
        s.current !== null &&
          s.current.attemptId === a.attemptId &&
          same(s.current.target, a.target) &&
          same(s.current.ref, a.ref),
        'Session does not reference attempt',
      );
  }
}
export function validateOlympiad(value: unknown): void {
  safeJson(value);
  const p = record(value, 'Olympiad');
  if (p.activityId === 'alevel/olympiad-2011-q4') {
    keys(p, ['kind','course','profileId','activityId','drawings','selected','check','completed']);
    requireData(p.kind === 'olympiad-completion' && p.course === 'alevel' && id(p.profileId) && isomerBoxes.includes(p.selected as never) && typeof p.completed === 'boolean', 'Invalid seven-box challenge');
    const drawings = record(p.drawings, 'drawings');
    requireData(Object.keys(drawings).every(k => isomerBoxes.includes(k as never)), 'Unknown compound box');
    Object.values(drawings).forEach(validateResponse);
    if (p.check !== null) {
      const check = record(p.check, 'aggregate check');
      keys(check, ['fullyCorrect','wrongPlace','drawingFingerprint']);
      requireData(Number.isInteger(check.fullyCorrect) && Number.isInteger(check.wrongPlace) && Number(check.fullyCorrect) >= 0 && Number(check.wrongPlace) >= 0 && Number(check.fullyCorrect) + Number(check.wrongPlace) <= 7 && id(check.drawingFingerprint), 'Invalid aggregate counts');
    }
    const checked = isomerPolicy.validateCompletion(isomerChallenge, p as unknown as IsomerProgress);
    requireData(same(p.check, checked.check) && p.completed === checked.completed, 'Stale or forged aggregate completion');
    return;
  }
  keys(p, [
    'kind',
    'course',
    'profileId',
    'activityId',
    'stage',
    'classifications',
    'drawingsB',
    'drawingsC',
    'selected',
    'aCheck',
    'unitChecks',
    'slotChecks',
    'completed',
    'historicalOutcome',
  ]);
  requireData(
    p.kind === 'olympiad-completion' &&
      p.course === 'alevel' &&
      id(p.profileId) &&
      p.activityId === 'alevel/c3l6-organic-reactions' &&
      ['intro', 'a', 'b', 'c'].includes(String(p.stage)),
    'Invalid Olympiad',
  );
  const classes = record(p.classifications, 'classifications');
  requireData(
    Object.keys(classes).every((k) => /^\((?:[1-9]|10)\)$/.test(k)) &&
      Object.values(classes).every((v) =>
        ['oxidation', 'reduction', 'hydrolysis'].includes(String(v)),
      ),
    'Invalid classification',
  );
  const b = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
    c = ['R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  for (const [name, slots] of [
    ['drawingsB', b],
    ['drawingsC', c],
  ] as const) {
    const drawings = record(p[name], 'drawings');
    requireData(
      Object.keys(drawings).every((k) => slots.includes(k)),
      'Unknown slot',
    );
    for (const v of Object.values(drawings)) {
      requireData(record(v, 'drawing').kind === 'molecule', 'Invalid drawing');
      validateResponse(v);
    }
  }
  const selected = record(p.selected, 'selected');
  keys(selected, ['b', 'c']);
  requireData(
    b.includes(String(selected.b)) && c.includes(String(selected.c)),
    'Invalid selected slots',
  );
  function check(v: unknown) {
    const x = record(v, 'challenge check');
    keys(x, ['correct', 'total', 'passed', 'drawingFingerprint']);
    requireData(
      Number.isSafeInteger(x.correct) &&
        Number.isSafeInteger(x.total) &&
        Number(x.correct) >= 0 &&
        Number(x.correct) <= Number(x.total) &&
        Number(x.total) > 0 &&
        typeof x.passed === 'boolean' &&
        id(x.drawingFingerprint) &&
        (!x.passed || x.correct === x.total),
      'Invalid challenge check',
    );
  }
  if (p.aCheck !== null) check(p.aCheck);
  for (const [name, slots] of [
    ['unitChecks', ['b-i', 'b-ii', 'b-iii', 'b-iv-1', 'b-iv-2', 'b-iv-3', 'b-iv-4']],
    ['slotChecks', c],
  ] as const) {
    const checks = record(p[name], 'checks');
    requireData(
      Object.keys(checks).every((k) => (slots as readonly string[]).includes(k)),
      'Unknown check',
    );
    Object.values(checks).forEach(check);
  }
  const complete = record(p.completed, 'completed');
  keys(complete, ['a', 'b', 'c']);
  requireData(
    ['a', 'b', 'c'].every((k) => typeof complete[k] === 'boolean') &&
      (!complete.b || complete.a) &&
      (!complete.c || complete.b),
    'Invalid challenge dependency',
  );
  validateChallengeChecks(p);
  if (p.historicalOutcome !== undefined) {
    const historical = record(p.historicalOutcome, 'historical outcome');
    keys(historical, ['policyVersion', 'reason', 'raw']);
    requireData(
      historical.policyVersion === 'c3l6-source-bank-23' &&
        historical.reason === 'K-orthoacid-erratum',
      'Unknown historical outcome policy or reason',
    );
    const raw = record(historical.raw, 'historical raw progress');
    requireData(
      !Object.hasOwn(raw, 'historicalOutcome') &&
        raw.profileId === p.profileId &&
        raw.course === p.course &&
        raw.activityId === p.activityId,
      'Nested or cross-namespace historical outcome',
    );
    validateOlympiad(raw);
  }
}
export function validateImport(batch: ImportBatch): void {
  safeJson(batch);
  validateNamespace(batch.namespace);
  requireData(id(batch.source.key) && id(batch.source.fingerprint), 'Invalid import source');
  for (const e of array(batch.curriculum, 'curriculum')) {
    validateEvidence(e);
    const v = record(e, 'evidence');
    requireData(
      v.provenance === 'new-attempt' &&
        v.course === batch.namespace.course &&
        v.profileId === batch.namespace.profileId &&
        isCanonicalQuestionId(String(v.activityId), record(v.ref, 'import ref').questionId),
      'Import namespace/source mismatch',
    );
  }
  for (const p of array(batch.olympiad, 'olympiad')) {
    validateOlympiad(p);
    requireData(
      batch.namespace.course === 'alevel' &&
        record(p, 'progress').profileId === batch.namespace.profileId,
      'Import challenge namespace mismatch',
    );
  }
}
/** Mirrors the source drawing fingerprint convention; no chemistry assessment. */
export function challengeFingerprint(value: unknown): string {
  let h = 2166136261;
  for (const ch of JSON.stringify(value)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
const units: Readonly<Record<string, readonly string[]>> = {
  'b-i': ['A', 'B'],
  'b-ii': ['C'],
  'b-iii': ['D', 'E', 'F'],
  'b-iv-1': ['G'],
  'b-iv-2': ['H', 'J'],
  'b-iv-3': ['K'],
  'b-iv-4': ['L', 'M'],
};
function validateChallengeChecks(p: JsonObject): void {
  const complete = record(p.completed, 'completed'),
    b = record(p.drawingsB, 'drawings'),
    c = record(p.drawingsC, 'drawings');
  const unitChecks = record(p.unitChecks, 'unit checks'),
    slotChecks = record(p.slotChecks, 'slot checks');
  function current(value: unknown, expected: string, total: number): boolean {
    const check = record(value, 'check');
    requireData(check.total === total, 'Challenge check total mismatch');
    if (check.passed)
      requireData(check.drawingFingerprint === expected, 'Passed challenge check is stale');
    return check.passed === true && check.drawingFingerprint === expected;
  }
  const aPassed =
    p.aCheck !== null && current(p.aCheck, challengeFingerprint(p.classifications), 10);
  if (complete.a)
    requireData(
      aPassed && Object.keys(record(p.classifications, 'classifications')).length === 10,
      'Completion lacks current classification check',
    );
  for (const [key, value] of Object.entries(unitChecks)) {
    const slots = units[key]!;
    current(
      value,
      challengeFingerprint(
        Object.fromEntries(
          slots.map((id) => [id, b[id] === undefined ? null : record(b[id], 'drawing').graph]),
        ),
      ),
      slots.length,
    );
  }
  for (const [key, value] of Object.entries(slotChecks))
    current(
      value,
      challengeFingerprint(c[key] === undefined ? null : record(c[key], 'drawing').graph),
      1,
    );
  if (complete.b)
    requireData(
      Object.keys(units).every(
        (key) =>
          unitChecks[key] !== undefined &&
          record(unitChecks[key], 'check').passed === true &&
          units[key]!.every((id) => record(b[id], 'drawing').graph !== undefined),
      ),
      'Completion lacks current B checks',
    );
  if (complete.c)
    requireData(
      ['R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].every(
        (key) =>
          slotChecks[key] !== undefined &&
          record(slotChecks[key], 'check').passed === true &&
          c[key] !== undefined,
      ),
      'Completion lacks current C checks',
    );
  requireData(
    (p.stage !== 'b' || complete.a === true) && (p.stage !== 'c' || complete.b === true),
    'Challenge stage is locked',
  );
}
