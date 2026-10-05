import Dexie from 'dexie';
import { createChemistryRepository, createRepository } from '../../../src/persistence/repository.ts';
import { parseLegacyImport } from '../../../src/persistence/legacy.ts';
import type { RepositoryResult, ImportBatch } from '../../../src/contracts/repository.ts';
import { assessed, draft, historic, namespace, olympiad } from './fixtures.ts';
function check(condition: unknown, message: string): asserts condition { if (!condition)
    throw new Error(message); }
function success<T>(value: RepositoryResult<T>): T { check(value.ok, value.ok ? '' : `${value.error.code}: ${value.error.message}`); return value.value; }
function error(value: RepositoryResult<unknown>, code: string): void { check(!value.ok && value.error.code === code, `Expected ${code}, received ${JSON.stringify(value)}`); }
/** Dev-only runner. Real Dexie transactions, actual Chromium IndexedDB; no legacy storage access. */
export async function runPersistenceScenarios(): Promise<Readonly<{
    passed: number;
    checks: readonly string[];
    databaseNames: readonly string[];
}>> {
    const checks: string[] = [], databaseNames: string[] = [];
    const suffix = crypto.randomUUID();
    function name(label: string) { const n = `masters-of-chemistry-validation-${label}-${suffix}`; databaseNames.push(n); return n; }
    async function scenario(label: string, run: () => Promise<void>) { await run(); checks.push(label); }
    const repo = createChemistryRepository(name('main'));
    await scenario('save-restore-first-evidence-session-atomically', async () => { const write = assessed(); check(success(await repo.saveCurriculum(write)).evidence === 'inserted', 'Missing insertion'); check(JSON.stringify(success(await repo.loadAttempt(namespace, 'attempt-1'))) === JSON.stringify(write.attempt), 'Draft differs'); check(success(await repo.loadSession(namespace, 'practice-1'))?.id === 'practice-1', 'Session absent'); check(success(await repo.curriculumHistory(namespace)).length === 1, 'Evidence absent'); });
    await scenario('repeat-and-corrected-retry-retain-first-evidence', async () => { check(success(await repo.saveCurriculum(assessed())).evidence === 'already-present', 'Repeat must deduplicate'); const write = assessed(); const corrected = { ...write.attempt, currentResponses: { answer: { kind: 'numeric' as const, raw: '0.20', unit: 'mol dm-3' } } }; success(await repo.saveCurriculum({ ...write, attempt: corrected })); const saved = success(await repo.loadAttempt(namespace, 'attempt-1')); check(saved?.phase === 'assessed' && saved.firstResponse.responses.answer?.kind === 'numeric' && saved.firstResponse.responses.answer.raw === '0.10', 'First response changed'); check(success(await repo.curriculumHistory(namespace)).length === 1, 'Duplicated evidence'); });
    await scenario('immutable-conflicts-and-question-id-collision', async () => { error(await repo.saveCurriculum(assessed('attempt-1', 0)), 'conflict'); const attempt = { ...draft('attempt-1'), ref: { ...draft().ref, questionId: 'different-original-id' } }; error(await repo.saveCurriculum({ attempt }), 'conflict'); check(success(await repo.curriculumHistory(namespace))[0]?.score === 1, 'Conflict overwrote evidence'); });
    // Pending stages are not allowed to switch methods or recompute numeric marks.
    const stageBase = assessed('pending-immutability').attempt;
    check(stageBase.phase === 'assessed' && stageBase.firstAssessment.kind === 'marked', 'Invalid stage fixture');
    const { firstAssessment: numericAssessment, learningReview: previousLearningReview, ...pendingBase } = stageBase;
    check(previousLearningReview === undefined, 'Pending fixture cannot contain post-assessment feedback');
    const pending = { ...pendingBase, phase: 'drawing-review' as const, automaticMarks: numericAssessment.marks, checks: [{ partId: 'drawing', judgement: 'pending' as const }] };
    success(await repo.saveCurriculum({ attempt: pending }));
    const differentNumeric = assessed('different', 0).attempt;
    check(differentNumeric.phase === 'assessed' && differentNumeric.firstAssessment.kind === 'marked', 'Invalid numeric fixture');
    error(await repo.saveCurriculum({ attempt: { ...pending, automaticMarks: differentNumeric.firstAssessment.marks } }), 'conflict');
    error(await repo.saveCurriculum({ attempt: stageBase }), 'conflict');
    await scenario('cross-course-profile-and-session-rejection', async () => { const write = assessed('cross'); error(await repo.saveCurriculum({ ...write, session: { ...write.session!, namespace: { course: 'alevel', profileId: 'other' } } }), 'invalid-data'); error(await repo.saveCurriculum({ attempt: { ...draft('cross-course'), namespace: { course: 'igcse', profileId: namespace.profileId } } }), 'invalid-data'); check(success(await repo.loadAttempt({ ...namespace, profileId: 'other' }, 'attempt-1')) === null, 'Profile leaked'); check(success(await repo.curriculumHistory({ course: 'igcse', profileId: namespace.profileId })).length === 0, 'Course leaked'); });
    await scenario('session-only-pause-save-and-restore', async () => { const session = assessed().session!; success(await repo.saveSession({ ...session, id: 'session-only' })); check(success(await repo.loadSession(namespace, 'session-only'))?.kind === 'practice', 'Session-only save absent'); });
    await scenario('actual-transaction-rollback-after-evidence-before-session', async () => { const db = name('rollback'), broken = createRepository(db, point => { if (point === 'after-evidence')
        throw new DOMException('Injected disk failure', 'UnknownError'); }); const write = assessed('rollback-attempt'); error(await broken.saveCurriculum(write), 'unavailable'); const verifier = createChemistryRepository(db); check(success(await verifier.loadAttempt(namespace, 'rollback-attempt')) === null, 'Attempt escaped transaction rollback'); check(success(await verifier.curriculumHistory(namespace)).length === 0, 'Evidence escaped rollback'); check(success(await verifier.loadSession(namespace, 'practice-1')) === null, 'Session escaped rollback'); check(write.attempt.currentResponses.answer !== undefined, 'Failed write erased memory'); success(await verifier.saveCurriculum(write)); });
    await scenario('quota-and-unavailable-failures-preserve-draft', async () => { for (const [label, kind, code] of [['quota', 'QuotaExceededError', 'quota'], ['unavailable', 'InvalidStateError', 'unavailable']] as const) {
        const db = name(label), broken = createRepository(db, point => { if (point === 'after-attempt')
            throw new DOMException('Injected failure', kind); });
        const memory = draft(label), before = JSON.stringify(memory);
        error(await broken.saveCurriculum({ attempt: memory }), code);
        check(JSON.stringify(memory) === before, 'Draft was mutated');
        check(success(await createChemistryRepository(db).loadAttempt(namespace, label)) === null, 'Failed draft persisted');
    } });
    await scenario('indexeddb-unavailable-at-open-is-explicit', async () => { const dependencies = Dexie.dependencies; const old = dependencies.indexedDB; try {
        dependencies.indexedDB = undefined as unknown as IDBFactory;
        error(await createChemistryRepository(name('denied')).saveCurriculum({ attempt: draft('denied') }), 'unavailable');
    }
    finally {
        dependencies.indexedDB = old;
    } });
    const importRepo = createChemistryRepository(name('imports')), batch = success(parseLegacyImport({ namespace, sourceKey: 'masters-alevel-results-v1', rawText: JSON.stringify(historic) }));
    await scenario('transactional-repeat-import-original-identity-historic-gaps', async () => { const receipt = success(await importRepo.importBatch(batch)); check(receipt.inserted === 2, 'Historic import count'); const repeated = success(await importRepo.importBatch(batch)); check(repeated.inserted === 0 && repeated.duplicates === 2, 'Receipt repeat'); const whitespace = success(parseLegacyImport({ namespace, sourceKey: 'masters-alevel-results-v1', rawText: JSON.stringify(historic, null, 2) })); check(success(await importRepo.importBatch(whitespace)).duplicates === 2, 'Identity dedup depends on source fingerprint'); const history = success(await importRepo.curriculumHistory(namespace)); check(history[0]?.id === 'historical-untimed' && !('timing' in history[0]), 'Historic timing invented'); check(history[0].provenance === 'legacy-import' && history[0].sourceLeafId === 'l6-t2-1-4', 'Alias lost'); });
    await scenario('import-conflict-rolls-back-earlier-rows-and-receipt', async () => { const conflict = success(parseLegacyImport({ namespace, sourceKey: 'masters-alevel-results-v1', rawText: JSON.stringify([{ ...historic[0], id: 'brand-new' }, { ...historic[0], score: 0 }]) })); error(await importRepo.importBatch(conflict), 'conflict'); check(success(await importRepo.curriculumHistory(namespace)).length === 2, 'Partial import survived conflict'); });
    await scenario('import-receipt-failure-rolls-back-and-retry-succeeds', async () => { const db = name('import-rollback'), broken = createRepository(db, point => { if (point === 'before-receipt')
        throw new DOMException('Quota before receipt', 'QuotaExceededError'); }); error(await broken.importBatch(batch), 'quota'); const healthy = createChemistryRepository(db); check(success(await healthy.curriculumHistory(namespace)).length === 0, 'Import escaped receipt failure'); check(success(await healthy.importBatch(batch)).inserted === 2, 'Failed receipt blocked retry'); });
    await scenario('same-fingerprint-for-different-payload-rejects', async () => { const changed: ImportBatch = { ...batch, curriculum: [] }; error(await importRepo.importBatch(changed), 'conflict'); });
    await scenario('olympiad-isolation-and-stale-completion-rejection', async () => { const challengeRepo = createChemistryRepository(name('olympiad')); success(await challengeRepo.saveOlympiad(olympiad())); check(success(await challengeRepo.loadOlympiad(namespace.profileId))?.drawingsB.A?.graph.atoms.length === 1, 'Drawing lost'); check(success(await challengeRepo.curriculumHistory(namespace)).length === 0, 'Olympiad entered curriculum'); check(success(await challengeRepo.loadOlympiad('other')) === null, 'Olympiad profile leaked'); error(await challengeRepo.saveOlympiad({ ...olympiad(), completed: { a: true, b: false, c: false }, aCheck: { correct: 10, total: 10, passed: true, drawingFingerprint: 'stale' } }), 'invalid-data'); });
    await scenario('new-db-name-guard-and-no-legacy-format-expansion', async () => { error(await createChemistryRepository('masters-alevel-results-v1').saveCurriculum({ attempt: draft() }), 'invalid-data'); error(parseLegacyImport({ namespace, sourceKey: 'sjs:c3l6:2012-q2:draft:v1', rawText: '{}' }), 'invalid-data'); });
    return { passed: checks.length, checks, databaseNames };
}
