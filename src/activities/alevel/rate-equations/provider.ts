import type { QuestionProvider, QuestionRef } from '../../../contracts/index.ts';
import { validatePreviousQuestionIds } from '../../../content/canonical-identity.ts';
import { questionLookupInput } from '../../../content/question-display-identity.ts';
import { makeOrders } from './orders.ts';
import { makeGraphs, makeArrhenius } from './graphs.ts';
import { makeMechanisms } from './mechanisms.ts';
import { decodeRateQuestionCode, rateActivityId, rateGemIds, rateQuestionSources, rateSeedCheck, rateSource } from './identity.ts';
import type { RateExample, RateFactory, RateGem } from './types.ts';

const factories: Readonly<Record<RateGem, RateFactory>> = {
  orders: makeOrders, graphs: makeGraphs, mechanisms: makeMechanisms, arrhenius: makeArrhenius,
};
/** Rebuild content and analytical graph metadata from the authoritative ref only. */
export function restoreRateExample(ref: QuestionRef): RateExample {
  const source = rateSource(ref.questionId);
  rateSeedCheck(ref.seed);
  if (ref.activityId !== rateActivityId || !source || ref.level !== source.level)
    throw Error('Unsupported rate activity, question membership or level.');
  if (source.gem === 'mechanisms' && ref.seed !== 0)
    throw Error('Fixed rate mechanisms use canonical seed 0.');
  const example = factories[source.gem](source.level, ref.seed);
  return { ...example, question: { ...example.question, ref } };
}
export const rateProvider: QuestionProvider = {
  coverage: [
    { kind: 'generated', families: ['orders', 'graphs', 'arrhenius'].flatMap(gem =>
      rateQuestionSources.filter(source => source.gem === gem).map(source => ({ templateId: source.questionId, levels: [source.level] }))) },
    { kind: 'fixed', questionIds: rateQuestionSources.filter(source => source.gem === 'mechanisms').map(source => source.questionId) },
  ],
  restore: ref => restoreRateExample(ref).question,
  select(selection) {
    validatePreviousQuestionIds(rateActivityId, selection.previousQuestionIds);
    rateSeedCheck(selection.seed);
    const gem = (Object.keys(rateGemIds) as RateGem[]).find(gem => rateGemIds[gem] === selection.gemId);
    if (selection.activityId !== rateActivityId || !gem || ![1, 2, 3].includes(selection.level))
      throw Error('Unsupported rate route or semantic gem.');
    const source = rateQuestionSources.find(source => source.gem === gem && source.level === selection.level)!;
    return { activityId: rateActivityId, questionId: source.questionId, seed: gem === 'mechanisms' ? 0 : selection.seed, level: source.level };
  },
  resolveLink(code) {
    const encoded = decodeRateQuestionCode(code);
    if (encoded) return encoded;
    const source = rateSource(questionLookupInput('alevel', rateActivityId, code));
    return source ? { activityId: rateActivityId, questionId: source.questionId, seed: 0, level: source.level } : null;
  },
};
