import type { Namespace } from '../../contracts/identity.ts';
import type { LegacyImportPlan, LegacyRejectedRecord } from '../../contracts/integration.ts';
import type { ImportBatch } from '../../contracts/repository.ts';
import { fingerprint } from '../legacy.ts';
import { validateNamespace, validateImport, same } from '../validation.ts';
import { ALPHA_NAMESPACE } from '../alpha-namespace.ts';
import { resolveCompatibilityLink } from '../../compatibility/links.ts';
export const CURRENT_IMPORT_KEY = `${ALPHA_NAMESPACE}-export`;
/** Historical fixture/source provenance only; never a readable or supported store. */
export const C3_LEGACY_KEY = 'sjs:c3l6:2012-q2:draft:v1';
// Internal interface name; only explicit current exports are supported.
export const LEGACY_IMPORT_KEYS = [CURRENT_IMPORT_KEY] as const;
export async function planLegacyImport(
  namespace: Namespace,
  snapshots: Readonly<Record<string, string>>,
): Promise<LegacyImportPlan> {
  validateNamespace(namespace);
  const batches: ImportBatch[] = [],
    rejected: LegacyRejectedRecord[] = [];
  for (const [sourceKey, rawText] of Object.entries(snapshots)) {
    try {
      if (sourceKey !== CURRENT_IMPORT_KEY)
        throw Error('Only current alpha exports are supported.');
      if (typeof rawText !== 'string' || rawText.length > 10000000)
        throw Error('Export exceeds 10 MB.');
      const batch = JSON.parse(rawText) as ImportBatch;
      validateImport(batch);
      if (!same(batch.namespace, namespace))
        throw Error('Export belongs to a different course or profile.');
      for (const item of batch.curriculum) {
        if (!item.ref) throw Error('Canonical question reference is required.');
        const route = await resolveCompatibilityLink(
          namespace.course,
          `?activity=${encodeURIComponent(item.ref.activityId)}&code=${item.ref.questionId}&level=${item.ref.level}&seed=${item.ref.seed}`,
        );
        if (route.kind !== 'curriculum' || !same(route.ref, item.ref))
          throw Error('Export contains an unavailable or inconsistent canonical question.');
      }
      batches.push({ ...batch, source: { key: sourceKey, fingerprint: fingerprint(rawText) } });
    } catch (error) {
      rejected.push({
        sourceKey,
        sourceId: 'payload',
        raw: rawText,
        reason: error instanceof Error ? error.message : 'Invalid current export.',
      });
    }
  }
  return {
    batches,
    rejected,
    notes: [
      'Current canonical first assessments and timing are retained. Previous alpha and original stores are untouched and unused.',
    ],
  };
}
