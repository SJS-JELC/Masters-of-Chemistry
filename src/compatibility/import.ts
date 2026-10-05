import type { Namespace } from '../contracts/identity.ts';
import type {
  ChemistryRepository,
  ImportReceipt,
  LegacyImportArchive,
} from '../contracts/repository.ts';
import type { LegacyImportPlan } from '../contracts/integration.ts';
import { planLegacyImport } from '../persistence/legacy/plan.ts';
import { fingerprint } from '../persistence/legacy.ts';
import { canonical } from '../persistence/validation.ts';
export const IMPORT_REPORT_KEY = 'masters-of-chemistry-alpha-v2-import-report';

/** Inventory-confirmed keys only; scheduler state is archived with an explicit limitation. */
export function readableLegacyKeys(_course: Namespace['course']): readonly string[] {
  return [];
}
export interface ImportExecution {
  readonly plan: LegacyImportPlan;
  readonly receipts: readonly ImportReceipt[];
  readonly errors: readonly string[];
}
/** Called only after the user's explicit Import action. Writes only the new repository. */
export async function executeLegacyImport(
  repository: ChemistryRepository,
  namespace: Namespace,
  snapshots: Readonly<Record<string, string>>,
): Promise<ImportExecution> {
  const plan = await planLegacyImport(namespace, snapshots),
    receipts: ImportReceipt[] = [],
    errors: string[] = [];
  const sources: { key: string; fingerprint: string; archived: boolean }[] = [];
  for (const [key, rawText] of Object.entries(snapshots)) {
    // Independent source decisions are stable when a later import includes other stores.
    const sourcePlan = await planLegacyImport(namespace, { [key]: rawText });
    const archive: LegacyImportArchive = {
      namespace,
      source: { key, fingerprint: fingerprint(rawText) },
      rawText,
      notes: sourcePlan.notes,
      skipped: sourcePlan.rejected.map((r) => ({ sourceId: r.sourceId, reason: r.reason })),
    };
    const saved = await repository.saveImportArchive(archive);
    sources.push({ ...archive.source, archived: saved.ok });
    if (!saved.ok) {
      errors.push(`${key}: source archive could not be saved: ${saved.error.message}`);
      continue;
    }
    const batch = plan.batches.find((b) => b.source.key === key);
    if (!batch) continue;
    const imported = await repository.importBatch(batch);
    if (imported.ok) receipts.push(imported.value);
    else errors.push(`${key}: ${imported.error.message}`);
  }
  const skipped = plan.rejected.map((r) => ({
    sourceKey: r.sourceKey,
    sourceId: r.sourceId,
    reason: r.reason,
  }));
  const rawText = canonical({
    version: 1,
    namespace,
    sources: sources.sort((a, b) => a.key.localeCompare(b.key)),
    skipped,
    notes: plan.notes,
    receipts: receipts.slice().sort((a, b) => a.source.key.localeCompare(b.source.key)),
    errors,
  });
  const report = await repository.saveImportArchive({
    namespace,
    source: { key: IMPORT_REPORT_KEY, fingerprint: fingerprint(rawText) },
    rawText,
    notes: [
      `Outcome report: ${receipts.reduce((n, r) => n + r.inserted, 0)} inserted, ${receipts.reduce((n, r) => n + r.duplicates, 0)} already present; ${plan.rejected.length} exclusions.`,
      ...errors,
    ],
    skipped: skipped.map((r) => ({ sourceId: r.sourceId, reason: `${r.sourceKey}: ${r.reason}` })),
  });
  if (!report.ok)
    errors.push(
      `Outcome report could not be saved: ${report.error.message} Retry or export the exact sources and report.`,
    );
  return { plan, receipts, errors };
}
