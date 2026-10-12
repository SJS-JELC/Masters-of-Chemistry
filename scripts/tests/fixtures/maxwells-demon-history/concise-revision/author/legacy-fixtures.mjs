import { legacyFixture } from '../../network-revision/author/legacy-fixtures.mjs';
import {
  maxwellPolicy,
  blankMaxwellProgress,
} from './before/src/activities/olympiad/maxwells-demon/policy.ts';
import {
  classifications,
  level2Tasks,
  level3Tasks,
} from './before/src/activities/olympiad/maxwells-demon/content.ts';
export { legacyFixture };
export function networkFixture(wrong = false, checked = true) {
  let p = blankMaxwellProgress('local');
  const send = (c) => {
    p = maxwellPolicy.transition({ activityId: 'alevel/maxwells-demon' }, p, c).progress;
  };
  for (const l of [1, 2, 3]) {
    send({ kind: 'maxwell-level', level: l });
    for (const t of l === 1 ? classifications : l === 2 ? level2Tasks : level3Tasks)
      send({
        kind: 'maxwell-answer',
        id: t.id,
        value: l === 1 ? [...t.answers].sort().join('|') : (t.model ?? String(t.answer)),
      });
    if (wrong && l === 1) send({ kind: 'maxwell-answer', id: 'l1-carbon', value: 'formation' });
    if (wrong && l === 2) send({ kind: 'maxwell-answer', id: 'l2-map-CD', value: '128' });
    if (checked) send({ kind: 'maxwell-check' });
    send({ kind: 'maxwell-reveal' });
  }
  send({ kind: 'maxwell-level', level: 2 });
  send({ kind: 'maxwell-introduction' });
  return p;
}
