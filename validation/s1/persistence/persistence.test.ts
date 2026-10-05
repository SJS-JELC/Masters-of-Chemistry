import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLegacyImport } from '../../../src/persistence/legacy.ts';
import { validateAttempt, validateEvidence, validateMoleculeGraph, validateOlympiad, validateResponse, validateWrite } from '../../../src/persistence/validation.ts';
import { assessed, draft, historic, namespace, olympiad } from './fixtures.ts';
test('pure legacy parser preserves IDs, old acid progression and diagram alias without timing', () => {
    const input = { namespace, sourceKey: 'masters-alevel-results-v1', rawText: JSON.stringify(historic) }, parsed = parseLegacyImport(input);
    assert.equal(parsed.ok, true);
    if (!parsed.ok)
        return;
    const diagram = parsed.value.curriculum[0]!;
    assert.equal(diagram.id, 'historical-untimed');
    assert.equal(diagram.gemId, 'l6-t2-1-3');
    assert.equal(diagram.course, 'alevel');
    assert.equal('timing' in diagram, false);
    if (diagram.provenance === 'legacy-import')
        assert.equal(diagram.sourceLeafId, 'l6-t2-1-4');
    const acid = parsed.value.curriculum[1]!;
    if (acid.provenance === 'legacy-import')
        assert.equal(acid.progressionVersion, 1);
    assert.equal(input.rawText, JSON.stringify(historic));
});
test('IGCSE grade, original question/family/strand and assisted flags survive confirmed shapes', () => {
    const parsed = parseLegacyImport({ namespace: { course: 'igcse', profileId: 'synthetic' }, sourceKey: 'masters-igcse-results-v2', rawText: JSON.stringify([{ id: 'fixed', leafId: 'lower-6-5', grade: 2, score: 0.5, completedAt: 300, question: 'SB01', selfAssessed: true }, { id: 'numeric', leafId: 'lower-10-3', grade: 3, score: 1, completedAt: 400, family: 'fuel', assisted: false }, { id: 'energy', leafId: 'lower-10-1', grade: 2, score: 0, completedAt: 500, strand: 'enthalpy' }]) });
    assert.equal(parsed.ok, true);
    if (!parsed.ok)
        return;
    const fixed = parsed.value.curriculum[0]!;
    assert.equal('level' in fixed, false);
    if (fixed.provenance === 'legacy-import') {
        assert.equal(fixed.sourceQuestionId, 'SB01');
        assert.equal(fixed.selfAssessed, true);
    }
    assert.equal(parsed.value.curriculum[1]!.assisted, false);
});
test('revised acid retains source ownership and current version', () => { const parsed = parseLegacyImport({ namespace, sourceKey: 'masters-alevel-results-acid-v2', rawText: JSON.stringify([{ id: 'v2', leafId: 'u6-t1-1-2', level: 1, score: 1, completedAt: 12, progressionVersion: 2, timing: { version: 1, activeMs: 333, idleLimitMs: 60000 } }]) }); assert.equal(parsed.ok, true); if (parsed.ok)
    assert.equal(parsed.value.curriculum[0]!.timing?.activeMs, 333); });
test('unsupported keys/shapes, excluded leaves, cross-course and invalid timing fail explicitly', () => {
    for (const [sourceKey, rawText] of [['rocket-recall', '[]'], ['masters-alevel-results-v1', '{}'], ['masters-alevel-results-v1', 'broken'], ['masters-alevel-results-v1', JSON.stringify([{ id: 'x', leafId: 'rocket-recall', level: 1, score: 1, completedAt: 1 }])], ['masters-alevel-results-v1', JSON.stringify([{ ...historic[0], timing: { version: 1, activeMs: -1, idleLimitMs: 60000 } }])], ['masters-igcse-results-v2', '[]']]) {
        const result = parseLegacyImport({ namespace, sourceKey: sourceKey!, rawText: rawText! });
        assert.equal(result.ok, false);
        if (!result.ok)
            assert.equal(result.error.code, 'invalid-data');
    }
    const c3 = parseLegacyImport({ namespace, sourceKey: 'sjs:c3l6:2012-q2:draft:v1', rawText: '{"complete":{"a":true}}' });
    assert.equal(c3.ok, false);
    if (!c3.ok)
        assert.match(c3.error.message, /S3\/S4/);
});
test('serialization accepts chemically wrong but assessable graphs and rejects corrupt references', () => {
    const graph = { atoms: [{ id: 1, element: 'C', x: 0, y: 0, h: 4 }, { id: 2, element: 'H', x: 1, y: 0 }, { id: 3, element: 'H', x: 2, y: 0 }], bonds: [{ a: 1, b: 2, order: 3 }, { a: 1, b: 3, order: 3 }] };
    assert.doesNotThrow(() => validateMoleculeGraph(graph));
    assert.doesNotThrow(() => validateMoleculeGraph({ atoms: [], bonds: [] }));
    for (const g of [{ ...graph, bonds: [{ a: 1, b: 9, order: 1 }] }, { ...graph, atoms: [graph.atoms[0], graph.atoms[0]] }, { ...graph, bonds: [{ a: '1', b: 2, order: 1 }] }, { ...graph, bonds: [{ a: 1, b: 2, order: 1 }, { a: 2, b: 1, order: 1 }] }])
        assert.throws(() => validateMoleculeGraph(g));
});
test('valid draft/assessment/store data and bounds, identity, snapshot exclusion', () => {
    assert.doesNotThrow(() => validateAttempt(draft()));
    assert.doesNotThrow(() => validateWrite(assessed()));
    assert.doesNotThrow(() => validateOlympiad(olympiad()));
    assert.throws(() => validateAttempt({ ...draft(), question: { title: 'snapshot' } }));
    assert.throws(() => validateAttempt({ ...draft(), mode: 'teacher' }));
    assert.throws(() => validateResponse({ kind: 'correction', selections: [{ start: 0, end: 4, text: 'abc' }], replacement: 'x' }));
    assert.throws(() => validateEvidence({ ...assessed().evidence!, score: 0.5 }));
});
test('rubric evidence must match locked text and marks totals agree', () => {
    const write = assessed();
    const bad = structuredClone(write.attempt) as unknown as Record<string, unknown>;
    bad.firstAssessment = { kind: 'self-rubric', assessedAt: 1100, selfAssessed: true, score: 1, marks: { earned: 1, available: 1, points: [] }, reviews: [] };
    assert.throws(() => validateAttempt(bad));
    const rubric = { ...draft(), phase: 'rubric-review', firstResponse: { responses: { answer: { kind: 'text', value: 'bond' } }, submittedAt: 1, timing: { activeMs: 1, idleLimitMs: 60000 }, assistance: [] }, reviews: [{ partId: 'answer', lockedText: 'bond', activePointId: null, judgements: [{ pointId: 'p', status: 'met', evidence: { start: 0, end: 4, text: 'lost' } }] }] };
    delete (rubric as unknown as Record<string, unknown>).timing;
    assert.throws(() => validateAttempt(rubric));
});
