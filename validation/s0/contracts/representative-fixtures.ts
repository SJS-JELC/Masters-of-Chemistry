import type {
  Assessment, C3L6Dependencies, C3L6Progress, CurriculumEvidence, CurriculumTarget,
  CurriculumWrite, DotCrossState, ElectronConfigurationState, EnergyProfileState,
  EditorPart, FrozenResponse, MoleculeState, OlympiadRegistration, ProviderCoverage, Question, Responses, RubricJudgement,
  StudentAttempt, TitrationCurveState,
} from '../../../src/contracts';

/** Compile fixtures document shapes, not claims of runtime chemistry validation. */
export const acidQuestion = {
  ref: { activityId: 'alevel/acid-base-calculations', questionId: 'AB2-0-1-3F', seed: 123, level: 1 },
  title: 'Calculate pH', context: [{ kind: 'text', text: '[H⁺] = 0.00250 mol dm⁻³' }],
  layout: 'multipart', submission: 'all-required-parts',
  parts: [{ id: 'ph', kind: 'numeric', prompt: [{ kind: 'text', text: 'Calculate pH.' }],
    marks: 1, required: true, dependsOn: [], unit: '',
    acceptance: { kind: 'absolute', expected: 2.602059991327962, tolerance: 0.0051 } }],
  scaffolds: [{ id: 'equation', level: 1, purpose: 'Source level support', content: [{ kind: 'formula', text: 'pH = −log₁₀[H⁺]' }] }],
  hints: [], workedAnswer: [{ kind: 'formula', text: 'pH = −log₁₀(0.00250) = 2.60' }], sources: [],
} as const satisfies Question;

export const responses = { ph: { kind: 'numeric', raw: '2.60', unit: '' } } as const satisfies Responses;
export const frozen = {
  responses, submittedAt: 1000, timing: { activeMs: 250, idleLimitMs: 60000 }, assistance: [],
} as const satisfies FrozenResponse;
export const assessedAttempt = {
  mode: 'student', namespace: { course: 'alevel', profileId: 'synthetic' }, attemptId: 'same-attempt',
  ref: acidQuestion.ref,
  target: { course: 'alevel', activityId: 'alevel/acid-base-calculations', gemId: 'u6-t1-1-2', level: 1 },
  phase: 'assessed', currentResponses: responses, assistance: [], firstResponse: frozen,
  firstAssessment: { kind: 'marked', assessedAt: 1000, selfAssessed: false, score: 1,
    marks: { earned: 1, available: 1, points: [{ partId: 'ph', pointId: 'ph', earned: 1, available: 1, message: 'Correct' }] } },
} as const satisfies StudentAttempt;
export const historicalIGCSE = {
  kind: 'curriculum', id: 'original-attempt', profileId: 'synthetic', course: 'igcse',
  gemId: 'lower-6-5', grade: 2, score: 0.5, completedAt: 900, provenance: 'legacy-import',
} as const satisfies CurriculumEvidence; // no invented timing or first-response details
export const write = { attempt: assessedAttempt } as const satisfies CurriculumWrite;

export const explanationQuestion = {
  ...acidQuestion,
  ref: { activityId: 'igcse/structure-and-bonding', questionId: 'water-sodium-chloride-melting', seed: 0, level: 2 },
  parts: [{ id: 'comparison', kind: 'explanation', marks: 1, required: true, dependsOn: [],
    prompt: [{ kind: 'text', text: 'Explain the difference in melting point.' }],
    sections: [{ id: 'left-bonding', label: 'Type of bonding' }, { id: 'comparison', label: 'Comparison' }],
    assessment: 'self-rubric', rubric: [{ id: 'forces', text: 'Compare the bonds and forces overcome.', marks: 1 }] }],
} as const satisfies Question;
export const rubricJudgement = {
  pointId: 'forces', status: 'met', evidence: { start: 0, end: 12, text: 'strong bonds' },
} as const satisfies RubricJudgement;
export const rubricPendingAttempt = {
  mode: 'student', attemptId: 'rubric-attempt', currentResponses: {}, assistance: [],
  namespace: { course: 'igcse', profileId: 'synthetic' }, ref: explanationQuestion.ref,
  target: { course: 'igcse', activityId: 'igcse/structure-and-bonding', gemId: 'lower-6-5', level: 2 },
  phase: 'rubric-review', firstResponse: {
    responses: { comparison: { kind: 'explanation', sections: [{ id: 'comparison', text: 'strong bonds' }] } },
    submittedAt: 1000, timing: { activeMs: 900, idleLimitMs: 300000 }, assistance: [],
  }, reviews: [{ partId: 'comparison', lockedText: 'strong bonds', judgements: [rubricJudgement], activePointId: null }],
} as const satisfies StudentAttempt;
export const reveal = { kind: 'revealed', assessedAt: 1000, independent: false } as const satisfies Assessment;

export const electron = { kind: 'electron-configuration', counts: ['', '', '', '', '', '', '', ''],
  core: '', boxes: [[], [], [], [], [], [], [], []], identity: '', selectedSpeciesIds: [],
} as const satisfies ElectronConfigurationState;
export const dotCross = { kind: 'dot-and-cross', atoms: [{ id: 'n', element: 'N', x: 0, y: 0 }],
  electrons: [{ id: 'lone', symbol: 'triangle', anchor: { kind: 'atom', atomId: 'n', slot: 7 } }],
  groups: [{ id: 'ion', atomIds: ['n'], charge: 1, bracket: true }],
} as const satisfies DotCrossState;
export const energy = { kind: 'energy-profile', r: 220, p: 300, peak: 85,
  left: 'Reactants', right: 'Products', vertical: 'Energy', horizontal: 'Progress of reaction', pathLabel: '',
  arrows: { delta: { x: 560, tail: { anchor: 'r' }, head: { anchor: 'p' } }, ea: { x: 285, tail: { y: 250 }, head: { anchor: 'peak' } } },
} as const satisfies EnergyProfileState;
export const titration = { kind: 'titration-curve', before: null, after: null,
  initialPH: 4, equivalenceVolume: 25, finalPH: 10, indicator: null,
} as const satisfies TitrationCurveState;
export const molecule = { kind: 'molecule', graph: {
  atoms: [{ id: 1, element: 'O', x: 0, y: 0, charge: -1, h: 1, pairs: [0, 90, 180] }], bonds: [],
}, history: [] } as const satisfies MoleculeState;
export const ordinaryResponses = {
  classification: { kind: 'choice', selected: ['oxidation'] },
  vocabulary: { kind: 'text', value: 'covalent' },
  correction: { kind: 'correction', selections: [{ start: 0, end: 4, text: 'weak' }], replacement: 'strong' },
  selection: { kind: 'diagram-selection', selectedObjectIds: ['bond-between-ions'] },
  electron, dotCross, energy, titration, molecule,
} as const satisfies Responses;
export const providerCoverage = [
  { kind: 'fixed', questionIds: ['water-sodium-chloride-melting'] },
  { kind: 'generated', families: [{ templateId: 'h-to-ph', levels: [1, 2, 3] }] },
] as const satisfies readonly ProviderCoverage[];
export const c3Dependencies = {
  bUnits: [{ id: 'b-i', slots: ['A', 'B'] }, { id: 'b-iii', slots: ['D', 'E', 'F'] }],
  interchangeable: [['E', 'F']],
  unlocks: [{ stage: 'b', requires: 'a-correct' }, { stage: 'c', requires: 'all-b-units-correct' }],
} as const satisfies C3L6Dependencies;
export const challenge = {
  kind: 'olympiad-completion', course: 'alevel', profileId: 'synthetic', activityId: 'alevel/c3l6-organic-reactions',
  stage: 'b', classifications: { '(1)': 'oxidation' }, drawingsB: { E: molecule }, drawingsC: {},
  selected: { b: 'E', c: 'R' }, aCheck: null, unitChecks: {}, slotChecks: {},
  completed: { a: false, b: false, c: false },
} as const satisfies C3L6Progress;

// @ts-expect-error C3L6 cannot enter curriculum revision targets.
export const forbiddenTarget: CurriculumTarget = { course: 'alevel', activityId: 'alevel/c3l6-organic-reactions', gemId: 'invented', level: 1 };
// @ts-expect-error A tick alone cannot earn an explanation mark.
export const uncheckedRubric: RubricJudgement = { pointId: 'forces', status: 'met' };
// @ts-expect-error Teacher previews cannot be written as pupil attempts.
export const teacherWrite: CurriculumWrite = { attempt: { mode: 'teacher', ref: acidQuestion.ref, currentResponses: responses } };
// @ts-expect-error Assessed evidence is readonly even while current retries can change.
assessedAttempt.firstResponse.submittedAt = 2000;
// @ts-expect-error Course-specific historical grade field must stay distinct.
export const wrongCourseEvidence: CurriculumEvidence = { ...historicalIGCSE, course: 'alevel' };
// @ts-expect-error Electron counts have eight source subshells, never arbitrary payloads.
export const shortElectron: ElectronConfigurationState = { ...electron, counts: ['2'] };
// @ts-expect-error Olympiad challenge completion cannot masquerade as curriculum evidence.
export const challengeEvidence: CurriculumEvidence = challenge;
// @ts-expect-error An anchored energy arrow is distinct from a molecular graph.
export const erasedEditor: EnergyProfileState = molecule;
// @ts-expect-error An editor part's discriminant requires its own typed initial data.
export const mismatchedPart: EditorPart = { id: 'e', kind: 'dot-and-cross', prompt: [], marks: 1, required: true, dependsOn: [], initial: energy, markingPolicyId: 'dot-cross' };
// @ts-expect-error New independent evidence cannot omit first response, assessment and timing.
export const inventedNewEvidence: CurriculumEvidence = { ...historicalIGCSE, provenance: 'new-attempt', independent: true };
// @ts-expect-error Olympiad registration has no gem or curriculum mastery surface.
export const forbiddenOlympiad: OlympiadRegistration = { id: 'alevel/c3l6-organic-reactions', course: 'alevel', strand: 'olympiad', title: 'C3L6', release: 'included', source: [], renderer: 'staged-molecule-challenge', dependencies: c3Dependencies, provider: async () => { throw new Error('compile fixture'); }, marking: async () => { throw new Error('compile fixture'); }, revision: false, gems: [] };
