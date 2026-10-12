import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { recallFacts } from '../../src/recall/facts.ts';
import {
  markRecallFactFields,
  createRecallMarkingPolicy,
  createRecallLearningReviewPolicy,
  recallFields,
} from '../../src/recall/marking.ts';
import { createRecallProvider, recallRef } from '../../src/recall/provider.ts';
import { rawModelResponses } from '../../src/recall/marking-fixtures.mjs';
import { recallNotationText } from '../../src/recall/notation.ts';
import { createHistoricalRecallMarkingPolicy } from '../../src/recall/historical-marking.ts';
const fixtures = JSON.parse(
  fs.readFileSync(new URL('../../src/recall/marking-fixtures.json', import.meta.url)),
);
const fact = (n) => recallFacts.find((f) => f.id === 'igcse-recall-' + n);
const q = (f) => createRecallProvider(recallFacts, f.course).restore(recallRef(f.course, f.id));
const changed = (f, changes) => ({
  ...rawModelResponses(f),
  ...Object.fromEntries(
    Object.entries(changes).map(([id, value]) => [id, { kind: 'text', value }]),
  ),
});
test('all707 retained semantic cases,121 current model cases and explicit partial fields', () => {
  assert.equal(fixtures.marking.length, 707);
  assert.equal(fixtures.marking.filter((t) => t.category === 'model').length, 121);
  for (const t of fixtures.marking) {
    const f = recallFacts.find((f) => f.id === t.factId),
      o = markRecallFactFields(f, t.responses);
    assert.equal(o.correct, t.correct, t.id);
    for (const [id, correct] of Object.entries(t.expectedFields ?? {}))
      assert.equal(o.fields.find((f) => f.fieldId === id)?.correct, correct, t.id + ' ' + id);
    if (t.alternativeEligible === false)
      assert(
        o.fields.every((f) => !f.alternativeEligible),
        t.id,
      );
  }
});
test('all13 chemistry display fixtures preserve incorrect raw structures and metadata boundaries', () => {
  for (const t of fixtures.notationEditing) {
    const f = recallFacts.find((f) => f.id === t.factId),
      field = recallFields(f).find((f) => f.id === t.fieldId);
    assert.equal(recallNotationText(t.raw, field.entry), t.display, t.factId + ' ' + t.operation);
  }
  assert.equal(
    recallNotationText('Potassium dichromate(VI)', recallFields(fact('114'))[0].entry),
    'Potassium dichromate(VI)',
  );
});
test('maximum distinct assignment resolves overlapping alternatives and rejects duplicate observations', () => {
  const f = {
    ...fact('064'),
    fields: [
      { id: 'a', label: 'A', answer: 'first', accepted: ['shared'], entry: { kind: 'text' } },
      { id: 'b', label: 'B', answer: 'shared', accepted: [], entry: { kind: 'text' } },
    ],
    answerGroups: [
      { id: 'g1', label: 'A', answer: 'first', accepted: ['shared'] },
      { id: 'g2', label: 'B', answer: 'shared', accepted: [] },
    ],
  };
  const o = markRecallFactFields(f, {
    a: { kind: 'text', value: 'shared' },
    b: { kind: 'text', value: 'first' },
  });
  assert(o.correct);
  assert.deepEqual(
    o.fields.map((f) => f.matchedGroupId),
    ['g2', 'g1'],
  );
});
test('exception codec must be explicit; empty collection earns no hidden missing identities and blank row blocks check', () => {
  const f = fact('084'),
    p = createRecallMarkingPolicy([f]);
  const empty = changed(f, { exceptions: '[]' }),
    o = markRecallFactFields(f, empty);
  assert(!o.correct);
  assert.equal(o.fields.find((x) => x.fieldId === 'rule').correct, true);
  assert.equal(o.fields.find((x) => x.fieldId === 'exceptions').correct, false);
  assert.equal(o.missingGroupIds.length, 2);
  assert.equal(
    p.mark(q(f), changed(f, { exceptions: '[{"id":"exception-1","value":""}]' })).accepted,
    false,
  );
  assert.equal(p.mark(q(f), changed(f, { exceptions: 'not json' })).accepted, false);
  assert(markRecallFactFields(fact('082'), changed(fact('082'), { exceptions: '[]' })).correct);
});
test('selective wording review rejects contradictory relevant-looking statements', () => {
  const examples = [
    ['065', 'answer', 'Solid catches fire'],
    ['065', 'answer', 'Solid burns into a ball'],
    ['065', 'answer', 'Solid melts then turns green'],
    ['043', 'part-2', 'Limewater turns red'],
    ['043', 'part-1', 'Bubble through water'],
    ['019', 'answer', 'Simple molecular and giant ionic'],
    [
      '017',
      'answer',
      'There is electrostatic attraction between two nuclei and a shared pair of electrons in ionic bonds',
    ],
    ['024', 'answer', 'Intermolecular attraction between atoms'],
    ['017', 'answer', 'Attraction between two nuclei and shared electrons'],
    ['064', 'part-2', 'Lilac flame'],
  ];
  for (const [n, id, value] of examples) {
    const f = fact(n),
      o = markRecallFactFields(f, changed(f, { [id]: value }));
    assert(!o.correct, n + ' ' + value);
    assert(
      o.fields.every((r) => !r.alternativeEligible),
      n + ' ' + value,
    );
  }
});
test('reasonable unrecognized prose permits separate review only with original wording and eligible point', () => {
  const f = fact('021'),
    responses = changed(f, {
      answer: 'There is electrostatic attraction between oppositely charged ions',
    }),
    policy = createRecallMarkingPolicy([f]),
    marked = policy.mark(q(f), responses);
  assert(marked.accepted);
  assert.equal(marked.marks.earned, 0);
  assert(marked.marks.points[0].learningReview.eligible);
  const first = {
      responses,
      submittedAt: 123,
      timing: { activeMs: 8000, idleLimitMs: 60000 },
      assistance: [],
    },
    assessment = {
      kind: 'marked',
      assessedAt: 123,
      marks: marked.marks,
      score: 0,
      selfAssessed: false,
    },
    before = structuredClone({ first, assessment }),
    reviewPolicy = createRecallLearningReviewPolicy([f]),
    decision = {
      partId: 'answer',
      pointId: 'answer',
      judgement: 'equivalent',
      reviewer: 'student',
    };
  const review = reviewPolicy.review({ ref: q(f).ref }, first, assessment, responses, [decision]);
  assert.equal(review.reviewedMarks.earned, 1);
  assert.deepEqual({ first, assessment }, before);
  assert.equal(review.score, undefined);
  assert.equal(review.timing, undefined);
  assert.throws(() =>
    reviewPolicy.review(q(f), first, assessment, changed(f, { answer: 'changed wording' }), [
      decision,
    ]),
  );
  assert.throws(() =>
    reviewPolicy.review(q(f), first, assessment, responses, [decision, decision]),
  );
  const numeric = fact('111'),
    nr = changed(numeric, { answer: '299' }),
    nm = createRecallMarkingPolicy([numeric]).mark(q(numeric), nr);
  assert.throws(() =>
    createRecallLearningReviewPolicy([numeric]).review(
      q(numeric),
      { ...first, responses: nr },
      { ...assessment, marks: nm.marks },
      nr,
      [decision],
    ),
  );
});
test('six A Level model outcomes and point allocations remain exactly frozen', () => {
  const facts = recallFacts.filter((f) => f.course === 'alevel'),
    current = createRecallMarkingPolicy(facts),
    old = createHistoricalRecallMarkingPolicy(facts);
  assert.equal(facts.length, 6);
  for (const f of facts)
    for (const responses of [
      rawModelResponses(f),
      changed(f, { [recallFields(f)[0].id]: 'incorrect' }),
    ])
      assert.deepEqual(current.mark(q(f), responses), old.mark(q(f), responses));
});

test('approved complete chemistry patterns retain their qualifiers and numeric decimal fractions', () => {
  const f = fact('017'),
    o = markRecallFactFields(
      f,
      changed(f, {
        answer:
          'The strong electrostatic attraction between two positively charged nuclei and a shared pair of negatively charged electrons',
      }),
    );
  assert(o.correct);
  const numeric = fact('111');
  assert(markRecallFactFields(numeric, changed(numeric, { answer: '600.0/2.0' })).correct);
  assert(!markRecallFactFields(numeric, changed(numeric, { answer: '600.0/0.0' })).correct);
  const melt = fact('065'),
    alternative = markRecallFactFields(
      melt,
      changed(melt, { answer: 'Solid melts into a spherical bead' }),
    );
  assert(!alternative.correct);
  assert(alternative.fields[0].alternativeEligible);
});

test('CHEM-01 wording review excludes semantic denials and unsupported extra scientific claims', () => {
  const melt = fact('065');
  const suffixes = [
    'without melting',
    'although it remains solid',
    'while remaining solid',
    'but it stays solid',
    'despite failing to melt',
    'and melting is absent',
    'and it lacks melting',
    "and it doesn't liquefy",
    'and it remains solid',
    'and it becomes radioactive',
    'and it becomes magnetic',
    'and it is solid',
  ];
  const examples = suffixes.map((suffix) => [melt, 'Solid melts into a spherical bead ' + suffix]);
  for (const n of ['017', '021', '023']) {
    const f = fact(n);
    for (const suffix of [
      'without attraction',
      'although there is no attraction',
      'with attraction absent',
      'and attraction is lacking',
      "but the attraction doesn't exist",
      'and repulsion replaces attraction',
      'and the attraction is gravitational',
      n === '021' ? 'and all ions are negative' : 'and electrons are positive',
    ])
      examples.push([f, f.answer + ' ' + suffix]);
  }
  // Independent A08 tail: all words are documented, but the added assertion is wrong.
  examples.push(
    [
      fact('017'),
      'Electrostatic attraction between two nuclei and a shared pair of electrons and between two nuclei',
    ],
    [fact('023'), fact('023').answer + ' and between positive metal ions'],
    [fact('021'), fact('021').answer + ' and between positive ions and positive ions'],
    [melt, 'Solid melts into a spherical bead and solid melts into a solid'],
    [
      fact('017'),
      'There is electrostatic attraction between two nuclei and a shared pair of electrons and nuclei',
    ],
    [
      fact('023'),
      'There is electrostatic attraction between positive metal ions and delocalised electrons and positive metal ions',
    ],
    [
      fact('021'),
      'There is electrostatic attraction between positive ions and negative ions and positive ions',
    ],
    [melt, 'Solid melts into a spherical bead and forms a solid bead'],
  );
  for (const [f, answer] of examples) {
    const responses = changed(f, { answer }),
      o = markRecallFactFields(f, responses);
    assert(!o.correct, f.id + ' ' + answer);
    assert.equal(o.fields[0].classification, 'rejected', f.id + ' ' + answer);
    assert(!o.fields[0].alternativeEligible, f.id + ' ' + answer);
    const marking = createRecallMarkingPolicy([f]).mark(q(f), responses);
    assert(marking.accepted);
    assert.equal(marking.marks.points[0].learningReview, undefined);
    assert.throws(() =>
      createRecallLearningReviewPolicy([f]).review(
        q(f),
        {
          responses,
          submittedAt: 1,
          timing: { activeMs: 1000, idleLimitMs: 60000 },
          assistance: [],
        },
        { kind: 'marked', assessedAt: 1, marks: marking.marks, score: 0, selfAssessed: false },
        responses,
        [{ partId: 'answer', pointId: 'answer', judgement: 'equivalent', reviewer: 'student' }],
      ),
    );
  }
  for (const answer of ['Solid melts into a spherical bead', 'Solid liquefies into a round bead']) {
    const o = markRecallFactFields(melt, changed(melt, { answer }));
    assert(!o.correct);
    assert.equal(o.fields[0].classification, 'unrecognized');
    assert(o.fields[0].alternativeEligible, answer);
  }
  for (const n of ['017', '021', '023']) {
    const f = fact(n),
      o = markRecallFactFields(f, changed(f, { answer: 'There is ' + f.answer.toLowerCase() }));
    assert(!o.correct);
    assert(o.fields[0].alternativeEligible, f.id + ' supported positive paraphrase');
  }
  for (const [n, answer] of [
    ['017', 'There is electrostatic attraction between a shared pair of electrons and two nuclei'],
    ['021', 'There is electrostatic attraction between positive ions and negative ions'],
    [
      '023',
      'There is electrostatic attraction between delocalised electrons and positive metal ions',
    ],
  ]) {
    const f = fact(n),
      o = markRecallFactFields(f, changed(f, { answer }));
    assert(!o.correct);
    assert(o.fields[0].alternativeEligible, f.id + ' reversed single supported relationship');
  }
});
