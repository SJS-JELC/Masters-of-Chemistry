import { isPrimaryRecallGem } from './selection.ts';
import { questionLookupInput } from '../content/question-display-identity.ts';
﻿import type { Course, QuestionRef, RecallQuestionRef } from '../contracts/identity.ts';
import type { QuestionProvider, Question, QuestionPart } from '../contracts/question.ts';
import type { RecallFact } from '../contracts/recall.ts';
import { recallFields } from './marking.ts';
export function recallRef(course: Course, factId: string): RecallQuestionRef {
  return {
    activityId: (course + '/recall') as RecallQuestionRef['activityId'],
    questionId: factId,
    seed: 0,
    level: 1,
  };
}
export function createRecallProvider(
  facts: readonly RecallFact[],
  course: Course,
): QuestionProvider {
  const bank = facts.filter((f) => f.course === course),
    byId = new Map(bank.map((f) => [f.id, f]));
  return {
    coverage: [{ kind: 'fixed', questionIds: bank.map((f) => f.id) }],
    select(selection) {
      if (selection.activityId !== course + '/recall' || selection.level !== 1)
        throw Error('Invalid recall selection.');
      const eligible = bank.filter((f) => !selection.gemId || isPrimaryRecallGem(f, [selection.gemId]));
      const fresh = eligible.filter((f) => !selection.previousQuestionIds.includes(f.id));
      const choices = fresh.length ? fresh : eligible;
      if (!choices.length) throw Error('No approved facts for this selection.');
      return recallRef(course, choices[selection.seed % choices.length]!.id);
    },
    restore(ref: QuestionRef): Question {
      const fact = byId.get(ref.questionId);
      if (!fact || ref.activityId !== course + '/recall' || ref.seed !== 0 || ref.level !== 1)
        throw Error('Unknown recall reference.');
      return {
        ref,
        title: 'Key Factual Recall',
        context: [
          { kind: 'text', text: fact.prompt },
          ...(fact.context ?? []).map((text) => ({ kind: 'text' as const, text })),
        ],
        layout: fact.fields ? 'multipart' : 'compact',
        submission: 'all-required-parts',
        parts: [
          ...recallFields(fact).map(
            (f): QuestionPart => ({
              id: f.id,
              kind: 'text',
              prompt: [{ kind: 'text', text: f.label }],
              marks: 1,
              required: true,
              dependsOn: [],
              accepted: [f.answer, ...f.accepted],
              normalization: 'exact',
              presentation: 'single-line',
            }),
          ),
          ...(fact.exceptionCollection
            ? [
                {
                  id: fact.exceptionCollection.id,
                  kind: 'text' as const,
                  prompt: [{ kind: 'text' as const, text: fact.exceptionCollection.label }],
                  marks: 1,
                  required: true,
                  dependsOn: [],
                  accepted: [],
                  normalization: 'exact' as const,
                  presentation: 'single-line' as const,
                },
              ]
            : []),
        ],
        ...(fact.sentenceTokens
          ? {
              sentenceTokens: fact.sentenceTokens.map((token) =>
                typeof token === 'string' ? token : { partId: token.fieldId },
              ),
            }
          : {}),
        scaffolds: [],
        hints: [],
        workedAnswer: [{ kind: 'text', text: fact.answer }],
        sources: fact.sources,
      };
    },
    resolveLink(code) {
      const id = questionLookupInput(course, course + '/recall', code);
      return byId.has(id) ? recallRef(course, id) : null;
    },
  };
}
