import type { ActivityId, QuestionRef } from '../contracts/identity.ts';
/** Recall uses its own persistence/player host and cannot enter graded or challenge routes. */
export function gradedActivityId(id: QuestionRef['activityId']): ActivityId {
  if (id === 'alevel/recall' || id === 'igcse/recall') throw Error('Recall question cannot enter a graded activity route');
  return id;
}
