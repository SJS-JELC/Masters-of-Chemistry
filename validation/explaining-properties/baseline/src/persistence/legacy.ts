import type { ImportBatch, RepositoryResult } from '../contracts/repository.ts';
import type {
  Namespace,
  ALevelActivityId,
  IGCSEActivityId,
  Level,
  MasteryScore,
} from '../contracts/identity.ts';
import type { CurriculumEvidence } from '../contracts/session.ts';
import {
  InvalidData,
  record,
  requireData,
  id,
  finite,
  level,
  score,
  validateNamespace,
  validateEvidence,
  safeJson,
} from './validation.ts';
export const LEGACY_RESULT_KEYS = [
  'masters-alevel-results-v1',
  'masters-alevel-results-acid-v2',
  'masters-igcse-results-v2',
] as const;
const alevelLeaves: Record<string, ALevelActivityId> = {
  'l6-t2-1-1': 'alevel/electrons-bonding',
  'l6-t2-1-2': 'alevel/electron-configurations',
  'l6-t2-1-3': 'alevel/dot-and-cross',
  'l6-t2-1-4': 'alevel/dot-and-cross',
  'u6-t1-1-2': 'alevel/acid-base-calculations',
  'u6-t1-1-3': 'alevel/acid-base-calculations',
  'u6-t1-1-4': 'alevel/acid-base-calculations',
  'u6-t1-1-5': 'alevel/acid-base-calculations',
  'u6-t1-1-7': 'alevel/acid-base-calculations',
  'u6-t1-1-8': 'alevel/acid-base-calculations',
  'u6-t1-1-9': 'alevel/ph-titration-curves',
};
const igcseLeaves: Record<
  string,
  {
    activityId: IGCSEActivityId;
    grades: readonly number[];
  }
> = {
  'fourth-3-1': { activityId: 'igcse/dot-and-cross', grades: [1, 2] },
  'fourth-3-2': { activityId: 'igcse/dot-and-cross', grades: [1, 2, 3] },
  'lower-10-2': { activityId: 'igcse/energetics-practical', grades: [2, 3] },
  'lower-10-3': { activityId: 'igcse/calorimetry', grades: [1, 2, 3] },
  'lower-10-4': { activityId: 'igcse/bond-enthalpy', grades: [1, 2, 3] },
  'lower-6-5': { activityId: 'igcse/structure-and-bonding', grades: [2, 3] },
  'lower-10-1': { activityId: 'igcse/energy-enthalpy', grades: [1, 2] },
};
/** Content fingerprint for receipt identity, not question version infrastructure. */
export function fingerprint(text: string): string {
  let a = 2166136261,
    b = 0x9e3779b9;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    a = Math.imul(a ^ code, 16777619);
    b = Math.imul(b ^ code, 0x85ebca6b);
  }
  return `${text.length}-${(a >>> 0).toString(16)}-${(b >>> 0).toString(16)}`;
}
/** Pure parser: input text only. Never touches localStorage or a legacy database. */
export function parseLegacyImport(
  input: Readonly<{
    namespace: Namespace;
    sourceKey: string;
    rawText: string;
  }>,
): RepositoryResult<ImportBatch> {
  try {
    validateNamespace(input.namespace);
    requireData(
      typeof input.rawText === 'string' && input.rawText.length <= 10000000,
      'Legacy payload exceeds bounds',
    );
    if (input.sourceKey === 'sjs:c3l6:2012-q2:draft:v1')
      throw new InvalidData(
        'C3L6 legacy import requires challenge answer/graph revalidation by the S3/S4 adapter; retain the original input unchanged.',
      );
    requireData(
      LEGACY_RESULT_KEYS.some((k) => k === input.sourceKey),
      'Unsupported legacy key or excluded activity; only inventory-confirmed curriculum result stores are supported.',
    );
    const course = input.sourceKey === 'masters-igcse-results-v2' ? 'igcse' : 'alevel';
    requireData(input.namespace.course === course, 'Legacy source belongs to a different course');
    let raw: unknown;
    try {
      raw = JSON.parse(input.rawText);
    } catch {
      throw new InvalidData('Legacy input is not valid JSON');
    }
    safeJson(raw);
    requireData(Array.isArray(raw), 'Legacy result store must be an array');
    const curriculum: CurriculumEvidence[] = [];
    for (const value of raw) {
      const r = record(value, 'legacy record');
      requireData(
        id(r.id) && id(r.leafId) && score(r.score) && finite(r.completedAt) && r.completedAt > 0,
        'Invalid original attempt identity, score or date',
      );
      const timing = r.timing === undefined ? undefined : record(r.timing, 'legacy timing');
      if (timing !== undefined)
        requireData(
          timing.version === 1 &&
            Object.keys(timing).every((k) => ['version', 'activeMs', 'idleLimitMs'].includes(k)),
          'Unsupported legacy timing shape',
        );
      const base = {
        kind: 'curriculum' as const,
        id: r.id,
        profileId: input.namespace.profileId,
        gemId: r.leafId === 'l6-t2-1-4' ? 'l6-t2-1-3' : r.leafId,
        score: r.score as MasteryScore,
        completedAt: r.completedAt,
        provenance: 'legacy-import' as const,
        sourceKey: input.sourceKey,
        ...(timing === undefined
          ? {}
          : {
              timing: {
                activeMs: timing.activeMs as number,
                idleLimitMs: timing.idleLimitMs as 60000 | 180000 | 300000 | 600000,
              },
            }),
      };
      let evidence: CurriculumEvidence;
      if (course === 'alevel') {
        requireData(
          Object.keys(r).every((k) =>
            [
              'id',
              'leafId',
              'sourceLeafId',
              'level',
              'score',
              'completedAt',
              'progressionVersion',
              'timing',
            ].includes(k),
          ),
          'Unsupported A Level result fields',
        );
        requireData(
          level(r.level) && alevelLeaves[r.leafId] !== undefined,
          'Unknown or excluded A Level leaf/level',
        );
        if (r.sourceLeafId !== undefined)
          requireData(
            r.sourceLeafId === 'l6-t2-1-4' &&
              (r.leafId === 'l6-t2-1-3' || r.leafId === 'l6-t2-1-4'),
            'Unsupported original diagram alias',
          );
        if (r.progressionVersion !== undefined)
          requireData(
            r.progressionVersion === 1 || r.progressionVersion === 2,
            'Unsupported progression version',
          );
        if (input.sourceKey === 'masters-alevel-results-acid-v2')
          requireData(
            ['u6-t1-1-2', 'u6-t1-1-3', 'u6-t1-1-5', 'u6-t1-1-7', 'u6-t1-1-8'].includes(r.leafId) &&
              r.progressionVersion === 2,
            'Revised acid store requires active acid V2 evidence',
          );
        evidence = {
          ...base,
          course: 'alevel',
          activityId: alevelLeaves[r.leafId]!,
          level: r.level as Level,
          ...(r.leafId === 'l6-t2-1-4' || r.sourceLeafId !== undefined
            ? { sourceLeafId: 'l6-t2-1-4' }
            : {}),
          ...(r.progressionVersion === undefined
            ? {}
            : { progressionVersion: r.progressionVersion as 1 | 2 }),
        };
      } else {
        // IGCSE stores preserve optional self-assessment/strand flags written by the inspected pages.
        requireData(
          Object.keys(r).every((k) =>
            [
              'id',
              'leafId',
              'grade',
              'score',
              'completedAt',
              'timing',
              'selfAssessed',
              'strand',
              'question',
              'family',
              'assisted',
            ].includes(k),
          ),
          'Unsupported IGCSE result fields',
        );
        const leaf = igcseLeaves[r.leafId];
        requireData(
          leaf !== undefined && level(r.grade) && leaf.grades.includes(Number(r.grade)),
          'Unknown/excluded IGCSE leaf or unsupported grade',
        );
        if ('selfAssessed' in r)
          requireData(typeof r.selfAssessed === 'boolean', 'Invalid self-assessment flag');
        for (const k of ['strand', 'question', 'family'])
          if (k in r) requireData(id(r[k]), 'Invalid original source metadata');
        if ('assisted' in r) requireData(typeof r.assisted === 'boolean', 'Invalid assisted flag');
        evidence = {
          ...base,
          course: 'igcse',
          activityId: leaf.activityId,
          grade: r.grade as Level,
          ...(r.selfAssessed === undefined ? {} : { selfAssessed: r.selfAssessed as boolean }),
          ...(r.assisted === undefined ? {} : { assisted: r.assisted as boolean }),
          ...(r.question === undefined ? {} : { sourceQuestionId: r.question as string }),
          ...(r.family === undefined ? {} : { sourceFamily: r.family as string }),
          ...(r.strand === undefined ? {} : { sourceStrand: r.strand as string }),
        };
      }
      validateEvidence(evidence);
      curriculum.push(evidence);
    }
    return {
      ok: true,
      value: {
        namespace: input.namespace,
        source: { key: input.sourceKey, fingerprint: fingerprint(input.rawText) },
        curriculum,
        olympiad: [],
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'invalid-data',
        message: error instanceof Error ? error.message : 'Invalid legacy data',
        retryable: false,
      },
    };
  }
}
