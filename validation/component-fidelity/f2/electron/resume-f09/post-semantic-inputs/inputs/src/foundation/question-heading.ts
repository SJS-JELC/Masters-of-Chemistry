import type { ActivityRegistry, CurriculumTarget, Question } from '../contracts/index.ts';

export function targetSubtopic(registry: ActivityRegistry, target: CurriculumTarget): string {
  const registration = registry.get(target.activityId);
  if (!registration || registration.strand !== 'curriculum') throw Error('Unsupported question target');
  const gem = registration.gems.find(item => item.id === target.gemId);
  if (!gem) throw Error('Unsupported question gem');
  return gem.label;
}

/** Teacher identity comes from the shown provider question, never the pupil's saved target. */
export async function teacherSubtopic(registry: ActivityRegistry, question: Question): Promise<string> {
  const registration = registry.get(question.ref.activityId);
  if (!registration || registration.strand !== 'curriculum') return question.title;
  if (registration.gems.length === 1) return registration.gems[0]!.label;
  if (question.ref.activityId === 'alevel/acid-base-calculations') {
    const [{ acidTemplateFor }, { acidEngine }] = await Promise.all([
      import('../activities/alevel/acid-base-calculations/provider.ts'),
      import('../activities/alevel/acid-base-calculations/engine.js'),
    ]);
    const template = acidTemplateFor(question.ref);
    const scopes = acidEngine.scopes.filter(scope => scope.levels[question.ref.level].includes(template));
    if (scopes.length === 1) {
      const gem = registration.gems.find(item => item.id === scopes[0]!.id);
      if (gem) return gem.label;
    }
  } else if (question.ref.activityId === 'igcse/dot-and-cross') {
    const { getRecord, categoryByGem } = await import('../activities/igcse/dot-and-cross/provider.ts');
    const category = getRecord(question.ref.questionId).category;
    const gem = registration.gems.find(item => categoryByGem[item.id as keyof typeof categoryByGem] === category);
    if (gem) return gem.label;
  }
  return question.title;
}
