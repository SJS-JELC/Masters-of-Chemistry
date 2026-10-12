import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const app = path.resolve(import.meta.dirname, '..');
const { chromium } = createRequire(path.resolve(app, '../../package.json'))('playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5203/?course=igcse&run=s2-persistence-' + Date.now());
  const observed = await page.evaluate(async () => {
    const { createChemistryRepository } = await import('/src/persistence/repository.ts');
    const { recallFacts } = await import('/src/recall/facts.ts');
    const { recallFields, createRecallMarkingPolicy, createRecallLearningReviewPolicy } =
      await import('/src/recall/marking.ts');
    const { createRecallProvider, recallRef } = await import('/src/recall/provider.ts');
    const { CURRENT_RECALL_DEFINITION_ID } = await import('/src/contracts/recall.ts');
    const fixtures = (await import('/src/recall/marking-fixtures.json')).default;
    const db = 'masters-of-chemistry-alpha-v2-recall-s2-current-' + Date.now();
    let r = createChemistryRepository(db);
    const at = Date.now(),
      ns = (course) => ({ course, profileId: 'current-s2' });
    const result = [];
    let first, reviewed;
    const make = (fact, responses, id) => {
      const ref = recallRef(fact.course, fact.id),
        q = createRecallProvider([fact], fact.course).restore(ref);
      const marked = createRecallMarkingPolicy([fact]).mark(q, responses);
      if (!marked.accepted) throw Error('Incomplete model ' + fact.id);
      return {
        mode: 'student',
        definitionId: CURRENT_RECALL_DEFINITION_ID,
        namespace: ns(fact.course),
        attemptId: id,
        ref,
        target: {
          kind: 'recall',
          course: fact.course,
          activityId: ref.activityId,
          factId: fact.id,
          level: 1,
        },
        phase: 'assessed',
        currentResponses: responses,
        assistance: [],
        firstResponse: {
          responses,
          submittedAt: at,
          timing: { activeMs: 1800, idleLimitMs: 60000 },
          assistance: [],
        },
        firstAssessment: {
          kind: 'marked',
          assessedAt: at,
          marks: marked.marks,
          score: marked.marks.earned === marked.marks.available ? 1 : 0,
          selfAssessed: false,
        },
      };
    };
    for (const f of recallFacts) {
      const responses =
        f.course === 'igcse'
          ? fixtures.marking.find((x) => x.factId === f.id && x.category === 'model').responses
          : Object.fromEntries(
              recallFields(f).map((x) => [x.id, { kind: 'text', value: x.answer }]),
            );
      const a = make(f, responses, 'model-' + f.id);
      const saved = await r.saveRecall({ attempt: a });
      if (!saved.ok) throw Error(f.id + ': ' + saved.error.message);
      if (a.firstAssessment.score !== 1) throw Error('Wrong model ' + f.id);
      result.push(f.id);
    }
    const fact = recallFacts.find((f) => f.id === 'igcse-recall-065');
    first = make(
      fact,
      { answer: { kind: 'text', value: 'Solid melts into a spherical bead' } },
      'wording-review',
    );
    const before = await r.saveRecall({ attempt: first });
    if (!before.ok) throw Error(before.error.message);
    const progressBeforeReview = await r.recallProgress(ns('igcse'));
    const q = createRecallProvider([fact], 'igcse').restore(first.ref);
    reviewed = {
      ...first,
      learningReview: createRecallLearningReviewPolicy([fact]).review(
        q,
        first.firstResponse,
        first.firstAssessment,
        first.currentResponses,
        [{ partId: 'answer', pointId: 'answer', judgement: 'equivalent', reviewer: 'student' }],
      ),
    };
    const after = await r.saveRecall({ attempt: reviewed });
    if (!after.ok) throw Error(after.error.message);
    const h1 = await r.recallHistory(ns('igcse'));
    const p1 = await r.recallProgress(ns('igcse'));
    const invalid = structuredClone(reviewed);
    invalid.learningReview.reviewedMarks.points[0].earned = 0;
    invalid.learningReview.reviewedMarks.earned = 0;
    const rejected = await r.saveRecall({ attempt: invalid });
    const tamper = structuredClone(reviewed);
    tamper.firstAssessment.score = 1;
    const firstRejected = await r.saveRecall({ attempt: tamper });
    const editedReview = {
      ...reviewed,
      currentResponses: { answer: { kind: 'text', value: 'learning edit' } },
    };
    const editSaved = await r.saveRecall({ attempt: editedReview });
    if (!editSaved.ok) throw Error(editSaved.error.message);
    r.close();
    r = createChemistryRepository(db);
    const loaded = await r.loadRecallAttempt(ns('igcse'), 'wording-review');
    const h2 = await r.recallHistory(ns('igcse'));
    r.close();
    const e =
      h2.value.find((x) => x.id === first.attemptId) ||
      h2.value.find((x) => x.factId === fact.id && x.firstAssessment.score === 0);
    return {
      database: db,
      currentModels: result.length,
      igcseModels: result.filter((x) => x.startsWith('igcse-')).length,
      reviewSaved: after.ok,
      reviewCurrentEditSaved: editSaved.ok,
      reviewReload:
        JSON.stringify(loaded.value?.learningReview) === JSON.stringify(reviewed.learningReview),
      firstScore: loaded.value.firstAssessment.score,
      reviewedEarned: loaded.value.learningReview.reviewedMarks.earned,
      originalEvidenceWrong: e?.outcome === 'wrong',
      historyUnchanged: JSON.stringify(h1.value) === JSON.stringify(h2.value),
      evidenceDeduped: h2.value.filter((x) => x.factId === fact.id).length === 2,
      forgedReviewRejected: !rejected.ok,
      firstTamperRejected: !firstRejected.ok,
      correctionProgressUnchanged:
        JSON.stringify(progressBeforeReview.value) === JSON.stringify(p1.value),
    };
  });
  assert.equal(observed.currentModels, 127);
  assert.equal(observed.igcseModels, 121);
  for (const key of [
    'reviewSaved',
    'reviewCurrentEditSaved',
    'reviewReload',
    'originalEvidenceWrong',
    'historyUnchanged',
    'evidenceDeduped',
    'forgedReviewRejected',
    'firstTamperRejected',
    'correctionProgressUnchanged',
  ])
    assert.equal(observed[key], true, key);
  assert.equal(observed.firstScore, 0);
  assert.equal(observed.reviewedEarned, 1);
  const evidence = {
    status: 'PASS',
    checkedAt: new Date().toISOString(),
    method:
      'Actual headless Edge IndexedDB current127 model transactions, wording review, tamper rejection and connection reopen; no timing/visibility claim',
    observed,
  };
  fs.mkdirSync(path.join(app, '.artifacts/recall-main/s2/integration'), { recursive: true });
  fs.writeFileSync(
    path.join(app, '.artifacts/recall-main/s2/integration/indexeddb-browser.json'),
    JSON.stringify(evidence, null, 2) + '\n',
  );
  console.log(JSON.stringify(evidence));
} finally {
  await browser.close();
}
