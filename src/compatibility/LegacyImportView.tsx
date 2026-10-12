import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useLoading } from '../loading/LoadingProvider.tsx';
import { repositoryError } from '../loading/module-errors.ts';
import { createViewRepositoryLifetime } from '../foundation/view-repository-lifetime.ts';
import type { PreparedImport } from './prepare-import.ts';
export { prepareImport, type PreparedImport } from './prepare-import.ts';
import type { CourseDataViewProps } from '../contracts/integration.ts';
import type { ImportBatch } from '../contracts/repository.ts';
import { createChemistryRepository } from '../persistence/index.ts';
import { CURRENT_IMPORT_KEY, planLegacyImport } from '../persistence/legacy/plan.ts';
import { executeLegacyImport } from './import.ts';
import { canonical } from '../persistence/validation.ts';
import { fingerprint } from '../persistence/legacy.ts';
import './legacy-import.css';

/** User-driven current export/import. No automatic or explicit old-store reads. */
export function LegacyImportView({
  namespace,
  databaseName,
  prepared,
  onNavigationGuard,
}: CourseDataViewProps & {
  readonly prepared: PreparedImport;
  readonly onNavigationGuard?: (guard: (() => Promise<boolean>) | null) => void;
}) {
  if (
    prepared.databaseName !== databaseName ||
    prepared.course !== namespace.course ||
    prepared.profileId !== namespace.profileId
  )
    throw Error('Import destination does not match its prepared profile.');
  const loading = useLoading();
  const transaction = useRef<Promise<unknown>>(Promise.resolve());
  const lifetime = useRef(createViewRepositoryLifetime());
  const repository = useMemo(() => createChemistryRepository(databaseName), [databaseName]);
  const [input, setInput] = useState(''),
    [status, setStatus] = useState(''),
    [ready, setReady] = useState(false);
  const busy = loading.pending || !!loading.error;
  useEffect(() => {
    onNavigationGuard?.(async () => {
      await transaction.current;
      return true;
    });
    return () => onNavigationGuard?.(null);
  }, [onNavigationGuard]);
  useEffect(() => lifetime.current.retain(repository, () => transaction.current), [repository]);
  function download(value: unknown) {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `chemistry-${namespace.course}-alpha-v2.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
  async function exportCurrent() {
    await loading.run(
      'tool',
      async (ticket) => {
        const history = await repository.curriculumHistory(namespace);
        if (!history.ok) throw repositoryError(history.error);
        const olympiad =
          namespace.course === 'alevel' ? await repository.loadOlympiad(namespace.profileId) : null;
        const isomers =
          namespace.course === 'alevel'
            ? await repository.loadOlympiad(namespace.profileId, 'alevel/olympiad-2011-q4')
            : null;
        if (olympiad && !olympiad.ok) throw repositoryError(olympiad.error);
        if (isomers && !isomers.ok) throw repositoryError(isomers.error);
        if (!ticket.isCurrent()) throw new DOMException('Export superseded', 'AbortError');
        const curriculum = history.value;
        const progress = [
          ...(olympiad?.ok && olympiad.value ? [olympiad.value] : []),
          ...(isomers?.ok && isomers.value ? [isomers.value] : []),
        ];
        const batch: ImportBatch = {
          namespace,
          source: {
            key: CURRENT_IMPORT_KEY,
            fingerprint: fingerprint(canonical({ curriculum, olympiad: progress })),
          },
          curriculum,
          olympiad: progress,
        };
        return batch;
      },
      (batch) => {
        download(batch);
        flushSync(() => setStatus('Current progress exported.'));
      },
    );
  }
  async function preview() {
    const text = input;
    await loading.run(
      'tool',
      async () => {
        const plan = await planLegacyImport(namespace, { [CURRENT_IMPORT_KEY]: text });
        const count = plan.batches.reduce(
          (n, batch) => n + batch.curriculum.length + batch.olympiad.length,
          0,
        );
        return {
          ready: !plan.rejected.length,
          status: plan.rejected.length
            ? plan.rejected.map((row) => row.reason).join(' ')
            : `${count} current records ready to import.`,
        };
      },
      (result) =>
        flushSync(() => {
          setReady(result.ready);
          setStatus(result.status);
        }),
    );
  }
  async function save() {
    const text = input;
    await loading.run(
      'tool',
      async (ticket) => {
        const operation = ticket.persist(() =>
          executeLegacyImport(repository, namespace, { [CURRENT_IMPORT_KEY]: text }),
        );
        transaction.current = operation.catch(() => undefined);
        const result = await operation;
        if (result.errors.length)
          throw repositoryError({
            message: result.errors.join(' '),
            ...(result.recovery ? { recovery: result.recovery } : {}),
          });
        return `${result.receipts.reduce((n, row) => n + row.inserted, 0)} imported; ${result.receipts.reduce((n, row) => n + row.duplicates, 0)} already present.`;
      },
      (result) =>
        flushSync(() => {
          setStatus(result);
          setReady(false);
        }),
    );
  }
  async function readFile(file: File) {
    await loading.run(
      'tool',
      async () => {
        if (file.size > 10000000) throw Error('File exceeds 10 MB.');
        return file.text();
      },
      (text) =>
        flushSync(() => {
          setInput(text);
          setReady(false);
        }),
    );
  }
  return (
    <section className="legacy-import" aria-labelledby="import-heading">
      <h2 id="import-heading">Import or export progress</h2>
      <p>
        Export current progress or import a current export for this course and profile. Your first
        answers, assessments and recorded time are preserved.
      </p>
      <button disabled={busy} onClick={() => void exportCurrent()}>
        Export current progress
      </button>
      <label>
        Current export JSON
        <textarea
          value={input}
          maxLength={10000000}
          rows={6}
          onChange={(e) => {
            setInput(e.target.value);
            setReady(false);
          }}
        />
      </label>
      <label>
        Upload current export
        <input
          type="file"
          accept=".json,application/json"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void readFile(file);
          }}
        />
      </label>
      <button disabled={busy || !input} onClick={() => void preview()}>
        Preview import
      </button>{' '}
      <button disabled={busy || !ready} onClick={() => void save()}>
        Import reviewed progress
      </button>
      <p role="status">{status}</p>
    </section>
  );
}
