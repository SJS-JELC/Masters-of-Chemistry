import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareCurriculum, prepareTeacher } from '../../src/foundation/prepare-curriculum.ts';
import { productionRegistry } from '../../src/foundation/registry.ts';
import { createLoadingCoordinator } from '../../src/loading/coordinator.ts';
import { validateWrite } from '../../src/persistence/validation.ts';
import { sourcePresentation } from '../../src/ui/source-presentation.ts';
import { proofRegistry } from '../../development/authoring/registry.ts';

function repository() {
  const writes = [];
  return {
    writes,
    curriculumHistory: async () => ({ ok: true, value: [] }),
    loadSession: async () => ({ ok: true, value: null }),
    loadAttempt: async () => ({ ok: true, value: null }),
    saveCurriculum: async (value) => {
      validateWrite(value);
      writes.push(structuredClone(value));
      return { ok: true, value: { attemptId: value.attempt.attemptId, evidence: 'none' } };
    },
  };
}
test('every supported curriculum target prepares reproducible content and one zero-time identity before publication', async () => {
  let checked = 0;
  for (const course of ['alevel', 'igcse'])
    for (const registration of productionRegistry.curriculumFor(course)) {
      const provider = await registration.provider();
      for (const gem of registration.gems)
        for (const level of gem.supportedLevels) {
          const repo = repository(),
            coordinator = createLoadingCoordinator();
          let prepared;
          const target = { course, activityId: registration.id, gemId: gem.id, level };
          assert.equal(
            await coordinator.run(
              'question',
              (ticket) =>
                prepareCurriculum({
                  course,
                  view: 'practice',
                  databaseName: 'all-unit-' + ++checked,
                  repository: repo,
                  registry: productionRegistry,
                  ticket,
                  launchRequest: {
                    id: 'target-' + checked,
                    kind: 'practice',
                    target,
                    selection: 'fixed-level',
                    fresh: true,
                  },
                  prepareTools: async (question) => {
                    assert.deepEqual(question, provider.restore(question.ref));
                    assert.equal(repo.writes.length, 0);
                    return {};
                  },
                }),
              (value) => {
                prepared = value;
              },
            ),
            true,
          );
          assert.deepEqual(prepared.attempt.target, target);
          assert.equal(prepared.attempt.attemptId, prepared.session.currentAttemptId);
          assert.deepEqual(prepared.attempt.ref, prepared.question.ref);
          assert.deepEqual(provider.restore(prepared.attempt.ref), prepared.question);
          assert.equal(prepared.attempt.timing.activeMs, 0);
          assert.equal(prepared.attempt.timing.finished, false);
          assert.equal(repo.writes.length, 1);
          assert.equal(repo.writes[0].evidence, undefined);
        }
    }
  assert.equal(checked, 60);
});

test('all curriculum teacher catalogues prepare checked question/header together without pupil writes', async () => {
  let checked = 0;
  for (const course of ['alevel', 'igcse'])
    for (const registration of productionRegistry.curriculumFor(course)) {
      const repo = repository(),
        coordinator = createLoadingCoordinator();
      let prepared;
      assert.equal(
        await coordinator.run(
          'screen',
          (ticket) =>
            prepareCurriculum({
              course,
              view: 'teacher',
              databaseName: 'teacher-unit-' + ++checked,
              repository: repo,
              initialActivityId: registration.id,
              ticket,
              prepareTools: async () => ({}),
            }),
          (value) => {
            prepared = value;
          },
        ),
        true,
      );
      assert.equal(prepared.attempt, null);
      assert.equal(prepared.session, null);
      assert.equal(repo.writes.length, 0);
      assert.equal(prepared.teacher.activityId, registration.id);
      assert(prepared.teacher.rows.length > 0);
      assert(prepared.teacher.subtopic);
      assert.deepEqual(
        (await registration.provider()).restore(prepared.teacher.question.ref),
        prepared.teacher.question,
      );
      assert(prepared.teacher.rows.some((row) => row.key === prepared.teacher.selectedKey));
    }
  assert.equal(checked, 15);
});

test('teacher source category selects the matching checked diagram and header', async () => {
  const coordinator = createLoadingCoordinator();
  for (const category of ['ionic', 'covalent']) {
    let shown;
    await coordinator.run(
      'question',
      (ticket) =>
        prepareTeacher({
          course: 'igcse',
          registry: productionRegistry,
          ticket,
          activityId: 'igcse/dot-and-cross',
          initialGroup: category,
          prepareTools: async () => ({}),
        }),
      (value) => {
        shown = value;
      },
    );
    const row = shown.rows.find((item) => item.key === shown.selectedKey);
    assert.equal(row.group, category);
    assert.equal(shown.question.ref.questionId, row.ref.questionId);
    assert.equal(shown.initialGroup, category);
  }
});

test('rapid teacher requests retain the committed preview and ignore the obsolete tool result', async () => {
  const coordinator = createLoadingCoordinator();
  const committed = [];
  let release, entered;
  const firstEntered = new Promise((resolve) => {
    entered = resolve;
  });
  const slowTools = new Promise((resolve) => {
    release = resolve;
  });
  const first = coordinator.run(
    'question',
    (ticket) =>
      prepareTeacher({
        course: 'alevel',
        registry: productionRegistry,
        ticket,
        activityId: 'alevel/electron-configurations',
        prepareTools: async () => {
          entered();
          return slowTools;
        },
      }),
    (value) => committed.push(value),
  );
  await firstEntered;
  assert.equal(committed.length, 0);
  assert.equal(
    await coordinator.run(
      'question',
      (ticket) =>
        prepareTeacher({
          course: 'alevel',
          registry: productionRegistry,
          ticket,
          activityId: 'alevel/ph-titration-curves',
          prepareTools: async () => ({}),
        }),
      (value) => committed.push(value),
    ),
    true,
  );
  release({});
  assert.equal(await first, false);
  assert.equal(committed.length, 1);
  assert.equal(committed[0].activityId, 'alevel/ph-titration-curves');
});

test('a rejected source-presentation cache entry can be recovered for the same question object', async () => {
  const registration = productionRegistry.get('alevel/electron-configurations');
  const provider = await registration.provider();
  const ref = provider.select({
    activityId: registration.id,
    gemId: registration.gems[0].id,
    level: 1,
    seed: 1,
    previousQuestionIds: [],
  });
  const question = structuredClone(provider.restore(ref)),
    correct = question.ref.questionId;
  question.ref.questionId = 'invalid-electron-reference';
  await assert.rejects(sourcePresentation(question));
  question.ref.questionId = correct;
  const recovered = await sourcePresentation(question);
  assert.equal(recovered.family, 'electron');
  assert(recovered.modelResponses);
});

test('DEV public-host registry overrides use their own questions/catalogue and standard ready tools', async () => {
  const registration = proofRegistry.curriculumFor('alevel')[0],
    gem = registration.gems[0];
  for (const view of ['practice', 'teacher']) {
    const repo = repository(),
      coordinator = createLoadingCoordinator();
    let prepared;
    assert.equal(
      await coordinator.run(
        'screen',
        (ticket) =>
          prepareCurriculum({
            course: 'alevel',
            view,
            databaseName: 'unit-dev-proof-' + view,
            registry: proofRegistry,
            repository: repo,
            ticket,
            ...(view === 'practice'
              ? {
                  launchRequest: {
                    id: 'dev-' + view,
                    kind: 'practice',
                    target: {
                      course: 'alevel',
                      activityId: registration.id,
                      gemId: gem.id,
                      level: 1,
                    },
                    selection: 'fixed-level',
                    fresh: true,
                  },
                }
              : {}),
          }),
        (value) => {
          prepared = value;
        },
      ),
      true,
    );
    const shown = view === 'teacher' ? prepared.teacher : prepared;
    assert.equal(shown.tools.standard, true);
    assert.equal(shown.tools.SourcePlayer, undefined);
    assert.deepEqual((await registration.provider()).restore(shown.question.ref), shown.question);
    if (view === 'teacher') {
      assert.equal(repo.writes.length, 0);
      assert.equal(shown.subtopic, gem.label);
    } else {
      assert.equal(repo.writes.length, 1);
      assert.equal(prepared.attempt.timing.activeMs, 0);
    }
  }
});
