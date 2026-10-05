import { validatePreviousQuestionIds } from '../content/canonical-identity.ts';
import { fixtureSlots, developmentCode, decodeDevelopmentCode, developmentSeed, validateDevelopmentRef } from './identity.ts';
import type {
  CurriculumActivityId,
  CurriculumQuestionRef,
  CurriculumTarget,
  Level,
  MarkingPolicy,
  Question,
  QuestionProvider,
  Responses,
  RawMarks,
  QuestionPart,
  MoleculeState,
  LearningReviewPolicy,
} from '../contracts/index.ts';

export const fixtureKinds = [
  'numeric',
  'automatic-text',
  'self-rubric',
  'self-drawing',
  'choice',
  'choice-dropdown',
  'choice-multiple',
  'correction',
  'diagram',
  'editor',
] as const;
export type FixtureKind = (typeof fixtureKinds)[number];
export function fixtureKind(value: string | null): FixtureKind {
  return fixtureKinds.find((kind) => kind === value) || 'numeric';
}
export function fixtureRef(
  target: CurriculumTarget,
  kind: FixtureKind,
  seed: number,
): CurriculumQuestionRef {
  return {
    activityId: target.activityId,
    questionId: developmentCode(target.activityId, fixtureSlots[kind], target.level, developmentSeed(seed)),
    seed: developmentSeed(seed),
    level: target.level,
  };
}
const base = {
  id: 'answer',
  prompt: [{ kind: 'text' as const, text: 'Complete this development control fixture.' }],
  marks: 1,
  required: true,
  dependsOn: [],
};
export const wrongMolecule: MoleculeState = {
  kind: 'molecule',
  graph: {
    atoms: [
      { id: 1, element: 'C', x: 0, y: 0 },
      ...[2, 3, 4, 5, 6].map((id) => ({ id, element: 'H' as const, x: id, y: 1 })),
    ],
    bonds: [2, 3, 4, 5, 6].map((b) => ({ a: 1, b, order: 1 as const })),
  },
  history: [],
};
export function fixtureQuestion(ref: CurriculumQuestionRef): Question {
  const decoded = decodeDevelopmentCode(ref.activityId, ref.questionId);
  const kind = fixtureKinds.find(value => fixtureSlots[value] === decoded.slot);
  if (!kind) throw Error('Unknown development question identity');
  validateDevelopmentRef(ref, fixtureSlots[kind]);
  let part: QuestionPart;
  switch (kind) {
    case 'numeric':
      part = {
        ...base,
        kind: 'numeric',
        unit: 'kJ',
        acceptance: { kind: 'absolute', expected: 42, tolerance: 0.001 },
      };
      break;
    case 'automatic-text':
      part = {
        ...base,
        kind: 'text',
        presentation: 'multiline',
        normalization: 'exact',
        accepted: ['This is a long automatic response.'],
        prompt: [
          {
            kind: 'text',
            text: 'Type “This is a long automatic response.” to exercise automatic marking in a textarea.',
          },
        ],
      };
      break;
    case 'self-rubric':
      part = {
        ...base,
        marks: 2,
        kind: 'explanation',
        sections: [
          { id: 'reason', label: 'Your explanation' },
          { id: 'comparison', label: 'Your comparison' },
        ],
        assessment: 'self-rubric',
        rubric: [
          { id: 'point-1', text: 'Identify precise evidence for your explanation.', marks: 1 },
          { id: 'point-2', text: 'Identify precise evidence for your comparison.', marks: 1 },
        ],
      };
      break;
    case 'self-drawing':
      part = {
        ...base,
        kind: 'numeric',
        unit: 'kJ',
        acceptance: { kind: 'absolute', expected: 42, tolerance: 0.001 },
        prompt: [
          {
            kind: 'text',
            text: 'Draw the fixture equation on paper before calculating, then enter 42. After submitting, compare your drawing with the model.',
          },
        ],
      };
      break;
    case 'choice':
    case 'choice-dropdown':
    case 'choice-multiple':
      part = {
        ...base,
        kind: 'choice',
        presentation:
          kind === 'choice-dropdown'
            ? 'dropdown'
            : kind === 'choice-multiple'
              ? 'multiple'
              : 'single',
        options: [
          { id: 'A', content: [{ kind: 'text', text: 'Fixture option A' }] },
          { id: 'B', content: [{ kind: 'text', text: 'Fixture option B' }] },
        ],
        acceptedOptionSets: [kind === 'choice-multiple' ? ['A', 'B'] : ['A']],
      };
      break;
    case 'correction':
      part = {
        ...base,
        kind: 'correction',
        sourceText: 'This fixture has an error.',
        markingPolicyId: 'development',
      };
      break;
    case 'diagram':
      part = {
        ...base,
        kind: 'diagram-selection',
        diagram: [{ kind: 'text', text: 'Development diagram object selection' }],
        objectIds: ['object-A', 'object-B'],
        acceptedObjectSets: [['object-A']],
      };
      break;
    case 'editor':
      part = {
        ...base,
        kind: 'molecule',
        initial: { kind: 'molecule', graph: { atoms: [], bonds: [] }, history: [] },
        markingPolicyId: 'development',
      };
      break;
  }
  return {
    ref,
    title: `${kind === 'automatic-text' ? 'Automatically marked long answer' : kind === 'self-rubric' ? 'Evidence-linked explanation' : kind === 'editor' ? 'Chemical wrongness and state integrity' : kind} foundation fixture`,
    context: [
      {
        kind: 'text',
        text: 'Development only: this tests shared platform behaviour. It is not a migrated chemistry activity or question bank.',
      },
    ],
    layout: kind === 'editor' ? 'workspace' : 'compact',
    submission: 'all-required-parts',
    parts:
      kind === 'self-drawing'
        ? [
            part,
            {
              ...base,
              id: 'drawing',
              kind: 'drawing-self-check',
              model: [{ kind: 'formula', text: 'H–H + Cl–Cl → 2 H–Cl' }],
              criteria: ['Compare every atom and bond with the displayed model.'],
              prompt: [
                {
                  kind: 'text',
                  text: 'Draw your equation before calculating; check it against the model after the numeric answer is frozen.',
                },
              ],
            },
          ]
        : [part],
    scaffolds: [
      {
        id: 'built-in',
        level: ref.level,
        purpose: 'Exercises built-in support without marking the attempt assisted.',
        content: [{ kind: 'text', text: 'Use the displayed response control.' }],
      },
    ],
    hints: [
      {
        id: 'fixture-hint',
        content: [{ kind: 'text', text: 'This is an explicitly requested fixture hint.' }],
      },
    ],
    workedAnswer: [
      {
        kind: 'text',
        text:
          kind === 'numeric' || kind === 'self-drawing'
            ? '42 kJ'
            : kind === 'automatic-text'
              ? 'This is a long automatic response.'
              : 'Development fixture feedback.',
      },
    ],
    sources: [],
  };
}
export function createFixtureProvider(
  activityId: CurriculumActivityId,
  kind: FixtureKind,
  levels: readonly Level[],
): QuestionProvider {
  return {
    coverage: [{ kind: 'generated', families: [{ templateId: `development-${kind}`, levels }] }],
    select(selection) {
      validatePreviousQuestionIds(activityId, selection.previousQuestionIds ?? []);
      if (selection.activityId !== activityId || !levels.includes(selection.level))
        throw Error('Development provider target mismatch');
      const seed = developmentSeed(selection.seed);
      return {activityId, level: selection.level, seed,
        questionId: developmentCode(activityId, fixtureSlots[kind], selection.level, seed)};
    },
    restore(ref) {
      if (ref.activityId !== activityId || !levels.includes(ref.level))
        throw Error('Development provider identity mismatch');
      return fixtureQuestion({ ...ref, activityId });
    },
    resolveLink(code) {
      try {
        const decoded = decodeDevelopmentCode(activityId, code.trim().toUpperCase());
        if (decoded.slot !== fixtureSlots[kind] || !levels.includes(decoded.level)) return null;
        return {activityId, questionId: code.trim().toUpperCase(), level: decoded.level, seed: decoded.seed};
      } catch {return null;}
    },
  };
}
function correct(part: QuestionPart, responses: Responses): boolean {
  const response = responses[part.id];
  if (!response) return false;
  switch (part.kind) {
    case 'numeric':
      return response.kind === 'numeric' && Number(response.raw) === 42;
    case 'text':
      return response.kind === 'text' && part.accepted.includes(response.value);
    case 'choice':
      return (
        response.kind === 'choice' &&
        part.acceptedOptionSets.some(
          (set) =>
            set.length === response.selected.length &&
            set.every((id) => response.selected.includes(id)),
        )
      );
    case 'diagram-selection':
      return (
        response.kind === 'diagram-selection' &&
        response.selectedObjectIds.length === 1 &&
        response.selectedObjectIds[0] === 'object-A'
      );
    case 'correction':
      return (
        response.kind === 'correction' &&
        response.selections.length > 0 &&
        response.replacement.trim() === 'correct'
      );
    case 'molecule':
      return (
        response.kind === 'molecule' &&
        response.graph.atoms.length > 0 &&
        response.graph.bonds.every((bond) =>
          [bond.a, bond.b].every(
            (id) =>
              response.graph.bonds
                .filter((b) => b.a === id || b.b === id)
                .reduce((n, b) => n + b.order, 0) <= 4,
          ),
        )
      );
    default:
      return false;
  }
}
export const fixtureMarking: MarkingPolicy = {
  id: 'development-fixture',
  mark(question, responses) {
    const unknown = question.parts.find((part) => {
      const response = responses[part.id];
      return (
        part.kind === 'text' &&
        response?.kind === 'text' &&
        response.value === 'unrecognized fixture'
      );
    });
    if (unknown)
      return {
        accepted: false,
        issues: [
          {
            partId: unknown.id,
            message:
              'Development wording is unrecognized. Compare the supplied model/rubric before resubmitting.',
            textClassification: 'unrecognized',
            rubricSupport: [
              {
                kind: 'text',
                text: 'The development model is: This is a long automatic response.',
              },
            ],
          },
        ],
      };
    const points = question.parts
      .filter((part) => part.kind !== 'explanation' && part.kind !== 'drawing-self-check')
      .map((part) => ({
        partId: part.id,
        pointId: 'automatic',
        earned: correct(part, responses) ? part.marks : 0,
        available: part.marks,
        message: correct(part, responses)
          ? 'Development response matches the fixture.'
          : 'Development response is assessable and incorrect.',
        ...(part.kind === 'text'
          ? {
              textClassification: correct(part, responses)
                ? ('accepted' as const)
                : ('rejected' as const),
              learningReview: {
                kind: 'valid-alternative' as const,
                eligible: !correct(part, responses),
                modelAnswer: 'This is a long automatic response.',
                rubric: [
                  {
                    kind: 'text' as const,
                    text: 'Development criterion: express the same meaning as the displayed model.',
                  },
                ],
              },
            }
          : {}),
      }));
    const marks: RawMarks = {
      earned: points.reduce((n, p) => n + p.earned, 0),
      available: points.reduce((n, p) => n + p.available, 0),
      points,
    };
    return { accepted: true, marks };
  },
  masteryScore(marks) {
    return marks.available > 0 && marks.earned === marks.available ? 1 : marks.earned > 0 ? 0.5 : 0;
  },
};
export const fixtureLearningReview: LearningReviewPolicy = {
  review(_question, _firstResponse, assessment, _currentResponses, decisions) {
    if (assessment.kind !== 'marked')
      throw Error('Only automatic development text supports learning review.');
    const points = assessment.marks.points.map((point) => ({
      ...point,
      earned:
        point.learningReview?.eligible &&
        decisions.some(
          (decision) =>
            decision.partId === point.partId &&
            decision.pointId === point.pointId &&
            decision.judgement === 'equivalent',
        )
          ? point.available
          : point.earned,
    }));
    return {
      kind: 'post-assessment-learning',
      decisions,
      reviewedMarks: {
        points,
        earned: points.reduce((sum, point) => sum + point.earned, 0),
        available: assessment.marks.available,
      },
    };
  },
};
export function defaultLevel(levels: readonly Level[]): Level {
  const level = levels[0];
  if (!level) throw Error('No fixture level');
  return level;
}
