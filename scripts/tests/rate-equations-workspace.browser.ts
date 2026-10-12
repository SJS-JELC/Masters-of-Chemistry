import Dexie from 'dexie';
import type { StudentAttempt } from '../../src/contracts/attempt.ts';
import type { RepositoryResult } from '../../src/contracts/repository.ts';
import type { RateGraphWorkspaceState } from '../../src/contracts/workspace.ts';
import { restoreRateExample } from '../../src/activities/alevel/rate-equations/provider.ts';
import { rateMarking } from '../../src/activities/alevel/rate-equations/marking.ts';
import { rateGraphValueAt } from '../../src/activities/alevel/rate-equations/workspace-state.ts';
import { createAttemptController, assessmentToEvidence } from '../../src/domain/attempt/attempt.ts';
import { createActiveClock } from '../../src/domain/timing/active-clock.ts';
import { createChemistryRepository } from '../../src/persistence/repository.ts';
function check(condition: unknown, message: string): asserts condition { if (!condition) throw Error(message); }
function success<T>(result: RepositoryResult<T>): T {
  check(result.ok, result.ok ? '' : `${result.error.code}: ${result.error.message}`);
  return result.value;
}
/** Called via Vite import from the coordinated native browser run. Isolated fresh
 * IndexedDB names only; closes/deletes its own test databases after all checks. */
export async function runRateWorkspacePersistence() {
  const checks: string[] = [];
  const databaseNames: string[] = [];
  const prefix = `masters-of-chemistry-alpha-v2-rate-workspace-${crypto.randomUUID()}`;
  try {
    for (const gem of ['graphs', 'arrhenius'] as const) {
      const name = `${prefix}-${gem}`;
      databaseNames.push(name);
      let repo = createChemistryRepository(name);
      let now = 0;
      const at = Date.now();
      const sample = () => ({ monotonicMs: now, wallMs: at + now, visible: true, focused: true, suspended: false });
      const ref = { activityId: 'alevel/rate-equations' as const, questionId: `RATE-POC-${gem}-L3`, level: 3 as const, seed: 42 };
      const example = restoreRateExample(ref), graph = example.graph!;
      const attemptId = `native-${gem}`;
      const clock = createActiveClock({ attemptId, idleLimitMs: 300000, now: sample });
      const state: StudentAttempt = { mode: 'student', namespace: { course: 'alevel', profileId: 'rate-workspace-native' },
        attemptId, ref, target: { course: 'alevel', activityId: ref.activityId, gemId: `u6-t1-2-${gem}`, level: 3 },
        phase: 'answering', currentResponses: {}, assistance: [], timing: clock.checkpoint()! };
      let controller = createAttemptController({ question: example.question, state, policy: rateMarking, clock, sample });
      const workspace: RateGraphWorkspaceState = graph.kind === 'concentration' ? {
        kind: 'rate-graph-tools', marker: graph.maxTime / 4, extended: false,
        readings: [{ x: graph.maxTime / 3, y: rateGraphValueAt(graph, graph.maxTime / 3) },
          { x: graph.maxTime / 2, y: rateGraphValueAt(graph, graph.maxTime / 2) }],
      } : { kind: 'rate-graph-tools', marker: 0, extended: true, readings: [null, null] };
      now = 2400;
      check(controller.dispatch({ kind: 'workspace', workspace }).accepted, 'Workspace rejected');
      for (const [partId, response] of Object.entries(example.correctResponses))
        if (response) check(controller.dispatch({ kind: 'respond', partId, response }).accepted, 'Response rejected');
      check(success(await repo.saveCurriculum({ attempt: controller.checkpoint() })).evidence === 'none', 'Unmarked draft created evidence');
      repo.close?.();
      repo = createChemistryRepository(name);
      const saved = success(await repo.loadAttempt(state.namespace, attemptId));
      check(saved?.phase === 'answering', 'Reload lost answering attempt');
      check(JSON.stringify(saved.workspace) === JSON.stringify(workspace), 'Reload lost workspace');
      check(JSON.stringify(saved.currentResponses) === JSON.stringify(example.correctResponses), 'Reload lost responses');
      check(saved.attemptId === attemptId && saved.timing.activeMs === 2400, 'Reload changed identity or clock');
      const restoredClock = createActiveClock({ attemptId, idleLimitMs: 300000, now: sample, saved: saved.timing });
      controller = createAttemptController({ question: restoreRateExample(saved.ref).question, state: saved, policy: rateMarking, clock: restoredClock, sample });
      checks.push(`${gem}: controller-Dexie-close-reopen restores same ID, answers, workspace and time`);
      const invalid = await repo.saveCurriculum({ attempt: { ...saved, workspace: { ...workspace, score: 1 } } as unknown as StudentAttempt });
      check(!invalid.ok && invalid.error.code === 'invalid-data', 'Injected workspace persisted');
      check(JSON.stringify(success(await repo.loadAttempt(state.namespace, attemptId))) === JSON.stringify(saved), 'Invalid write changed valid record');
      checks.push(`${gem}: invalid exact-key workspace rejected with saved state preserved`);
      now += 1000;
      check(controller.dispatch({ kind: 'submit', at: at + now }).accepted, 'Submission rejected');
      const first = controller.state(), evidence = assessmentToEvidence(first);
      check(evidence, 'Independent evidence absent');
      check(success(await repo.saveCurriculum({ attempt: first, evidence })).evidence === 'inserted', 'First evidence was not inserted');
      check(controller.dispatch({ kind: 'workspace', workspace: { ...workspace, marker: graph.kind === 'concentration' ? graph.maxTime / 2 : graph.maxX } }).accepted, 'Post-assessment workspace rejected');
      const later = controller.state(), unchanged = assessmentToEvidence(later);
      check(unchanged && JSON.stringify(unchanged) === JSON.stringify(evidence), 'Workspace changed immutable evidence');
      check(success(await repo.saveCurriculum({ attempt: later, evidence: unchanged })).evidence === 'already-present', 'Workspace duplicated evidence');
      repo.close?.();
      repo = createChemistryRepository(name);
      const assessed = success(await repo.loadAttempt(state.namespace, attemptId));
      check(assessed?.phase === 'assessed' && JSON.stringify(assessed.firstResponse) === JSON.stringify(first.firstResponse), 'Reload changed first response/time');
      check(success(await repo.curriculumHistory(state.namespace)).length === 1, 'Evidence duplicate after reopen');
      checks.push(`${gem}: post-assessment graph edit/reopen preserves one immutable first evidence record`);
      const teacher = await repo.saveCurriculum({ attempt: { mode: 'teacher', ref, currentResponses: {}, workspace } as unknown as StudentAttempt });
      check(!teacher.ok && teacher.error.code === 'invalid-data', 'Teacher graph data persisted');
      checks.push(`${gem}: teacher-shaped attempt cannot persist graph state/evidence`);
      repo.close?.();
    }
    return { status: 'PASS', passed: checks.length, checks, databaseNames };
  } finally {
    for (const name of databaseNames) await Dexie.delete(name);
  }
}
