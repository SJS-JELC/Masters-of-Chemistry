import type { Course } from '../contracts/identity.ts';
import type { ActivityRegistry } from '../contracts/registry.ts';

export type GemMasteryStage = 'recall' | 'grades' | 'complete';
export interface GemMasteryFlow {
  readonly token: string;
  readonly course: Course;
  readonly gemId: string;
  readonly stage: GemMasteryStage;
}
export function initialGemMasteryStage(facts: number, graded: boolean): GemMasteryStage | null {
  return facts > 0 ? 'recall' : graded ? 'grades' : null;
}
export function afterGemRecall(graded: boolean): GemMasteryStage {
  return graded ? 'grades' : 'complete';
}
export const gemRecallSessionId = (flow: GemMasteryFlow) =>
  `mastery-recall:${flow.token}:${flow.gemId}`;
export const gemGradeSessionId = (flow: GemMasteryFlow) =>
  `mastery-grades:${flow.token}:${flow.gemId}`;
export function readGemMasteryFlow(
  url: URL,
  course: Course,
  registry: ActivityRegistry,
): GemMasteryFlow | undefined {
  if (
    ['teacher', 'review'].includes(url.searchParams.get('mode') ?? '') ||
    ['review', 'question', 'code'].some((key) => url.searchParams.has(key)) ||
    url.searchParams.get('view') === 'teacher'
  )
    return;
  const token = url.searchParams.get('masteryRun'),
    gemId = url.searchParams.get('masteryGem'),
    stage = url.searchParams.get('masteryStage');
  if (
    !token ||
    !/^[a-zA-Z0-9_-]{1,80}$/.test(token) ||
    !gemId ||
    !['recall', 'grades', 'complete'].includes(stage ?? '')
  )
    return;
  const registeredGem = registry
    .curriculumFor(course)
    .flatMap((item) => item.gems)
    .find((gem) => gem.id === gemId);
  // Registered gems may use semantic IDs; numeric IDs also cover recall-only gems.
  if (
    !registeredGem &&
    !(course === 'alevel' ? /^(l6|u6)-t\d+-\d+-\d+$/ : /^(fourth|lower|upper)-\d+-\d+$/).test(gemId)
  )
    return;
  if (
    stage === 'grades' &&
    !registeredGem?.supportedLevels.length
  )
    return;
  return { token, course, gemId, stage: stage as GemMasteryStage };
}
export function writeGemMasteryFlow(url: URL, flow: GemMasteryFlow) {
  url.searchParams.set('masteryRun', flow.token);
  url.searchParams.set('masteryGem', flow.gemId);
  url.searchParams.set('masteryStage', flow.stage);
  url.searchParams.set('view', flow.stage === 'recall' ? 'recall' : 'practice');
}
