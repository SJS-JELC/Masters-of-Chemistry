import { useMemo, useState } from 'react';
import type { CourseDataViewProps } from '../contracts/integration.ts';
import type { ImportBatch } from '../contracts/repository.ts';
import { createChemistryRepository } from '../persistence/index.ts';
import { CURRENT_IMPORT_KEY, planLegacyImport } from '../persistence/legacy/plan.ts';
import { executeLegacyImport } from './import.ts';
import { canonical } from '../persistence/validation.ts';
import { fingerprint } from '../persistence/legacy.ts';
import './legacy-import.css';

/** User-driven current export/import. No automatic or explicit old-store reads. */
export function LegacyImportView({ namespace, databaseName }: CourseDataViewProps) {
  const repository = useMemo(() => createChemistryRepository(databaseName), [databaseName]);
  const [input, setInput] = useState(''),
    [status, setStatus] = useState(''),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false);
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
    setBusy(true);
    try {
      const history = await repository.curriculumHistory(namespace);
      if (!history.ok) throw Error(history.error.message);
      const olympiad =
        namespace.course === 'alevel' ? await repository.loadOlympiad(namespace.profileId) : null;
      const isomers = namespace.course === 'alevel' ? await repository.loadOlympiad(namespace.profileId,'alevel/olympiad-2011-q4') : null;
      if (olympiad && !olympiad.ok) throw Error(olympiad.error.message);
      if (isomers && !isomers.ok) throw Error(isomers.error.message);
      const curriculum = history.value,
        progress = [...(olympiad?.ok && olympiad.value ? [olympiad.value] : []), ...(isomers?.ok && isomers.value ? [isomers.value] : [])];
      const batch: ImportBatch = {
        namespace,
        source: {
          key: CURRENT_IMPORT_KEY,
          fingerprint: fingerprint(canonical({ curriculum, olympiad: progress })),
        },
        curriculum,
        olympiad: progress,
      };
      download(batch);
      setStatus('Current progress exported.');
    } catch (error) {
      setStatus(String(error));
    } finally {
      setBusy(false);
    }
  }
  async function preview() {
    setBusy(true);
    setReady(false);
    try {
      const plan = await planLegacyImport(namespace, { [CURRENT_IMPORT_KEY]: input });
      if (plan.rejected.length) {
        setStatus(plan.rejected.map((r) => r.reason).join(' '));
        return;
      }
      const count = plan.batches.reduce((n, b) => n + b.curriculum.length + b.olympiad.length, 0);
      setReady(true);
      setStatus(`${count} current records ready to import.`);
    } catch (error) {
      setStatus(String(error));
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    try {
      const result = await executeLegacyImport(repository, namespace, {
        [CURRENT_IMPORT_KEY]: input,
      });
      setStatus(
        result.errors.length
          ? result.errors.join(' ')
          : `${result.receipts.reduce((n, r) => n + r.inserted, 0)} imported; ${result.receipts.reduce((n, r) => n + r.duplicates, 0)} already present.`,
      );
      setReady(false);
    } catch (error) {
      setStatus(String(error));
    } finally {
      setBusy(false);
    }
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
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setReady(false);
            if (file.size > 10000000) {
              setStatus('File exceeds 10 MB.');
              return;
            }
            setInput(await file.text());
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
