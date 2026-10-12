import * as originalPolicy from '../../ui-revision/author/before/src/activities/olympiad/maxwells-demon/policy.ts';
import * as originalContent from '../../ui-revision/author/before/src/activities/olympiad/maxwells-demon/content.ts';
import * as uiPolicy from '../../network-revision/author/before/src/activities/olympiad/maxwells-demon/policy.ts';
import * as uiContent from '../../network-revision/author/before/src/activities/olympiad/maxwells-demon/content.ts';
import * as networkPolicy from '../../concise-revision/author/before/src/activities/olympiad/maxwells-demon/policy.ts';
import * as networkContent from '../../concise-revision/author/before/src/activities/olympiad/maxwells-demon/content.ts';
import * as concisePolicy from './before/src/activities/olympiad/maxwells-demon/policy.ts';
import * as conciseContent from './before/src/activities/olympiad/maxwells-demon/content.ts';
export { legacyFixture, networkFixture } from '../../concise-revision/author/legacy-fixtures.mjs';
const versions = {
  original: [originalPolicy, originalContent],
  ui: [uiPolicy, uiContent],
  network: [networkPolicy, networkContent],
  concise: [concisePolicy, conciseContent],
};
export function cFixture(format = 'concise', mode = 'full', checked = true) {
  const [policy, content] = versions[format];
  let p = policy.blankMaxwellProgress('local');
  const send = (c) => {
    const result = policy.maxwellPolicy.transition({ activityId: 'alevel/maxwells-demon' }, p, c);
    if (result.accepted) p = result.progress;
  };
  for (const level of [1, 2, 3]) {
    send({ kind: 'maxwell-level', level });
    const tasks =
      level === 1
        ? content.classifications
        : level === 2
          ? content.level2Tasks
          : content.level3Tasks;
    for (const t of tasks) {
      if (
        level === 3 &&
        (mode === 'blank' ||
          (mode === 'absent' && t.id !== 'l3-a') ||
          (mode === 'partial' && !['l3-a', 'l3-j'].includes(t.id)))
      )
        continue;
      send({
        kind: 'maxwell-answer',
        id: t.id,
        value: level === 1 ? [...t.answers].sort().join('|') : (t.model ?? String(t.answer)),
      });
    }
    if (level === 3 && mode === 'wrong') {
      send({ kind: 'maxwell-answer', id: 'l3-j', value: '493.65' });
      send({ kind: 'maxwell-answer', id: 'l3-z', value: '-11/18' });
    }
    if (level === 3 && mode === 'invalid') {
      send({ kind: 'maxwell-answer', id: 'l3-j', value: '2+2' });
      send({ kind: 'maxwell-answer', id: 'l3-z', value: 'alphabet' });
    }
    if (level !== 3 || checked) send({ kind: 'maxwell-check' });
    send({ kind: 'maxwell-reveal' });
  }
  return p;
}
