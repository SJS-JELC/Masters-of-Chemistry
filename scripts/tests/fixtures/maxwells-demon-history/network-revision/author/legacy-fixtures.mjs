import {
  maxwellPolicy as original,
  blankMaxwellProgress as originalBlank,
} from '../../ui-revision/author/before/src/activities/olympiad/maxwells-demon/policy.ts';
import {
  level2Tasks as originalTasks,
  classifications as originalA,
  level3Tasks as originalC,
} from '../../ui-revision/author/before/src/activities/olympiad/maxwells-demon/content.ts';
import {
  maxwellPolicy as ui,
  blankMaxwellProgress as uiBlank,
} from './before/src/activities/olympiad/maxwells-demon/policy.ts';
import { level2Tasks as uiTasks } from './before/src/activities/olympiad/maxwells-demon/content.ts';
const challenge = { activityId: 'alevel/maxwells-demon' };
export function legacyFixture(format = 'ui', wrong = false, checked = true) {
  const policy = format === 'original' ? original : ui,
    tasks = format === 'original' ? originalTasks : uiTasks;
  let p = (format === 'original' ? originalBlank : uiBlank)('local');
  const send = (c) => {
    p = policy.transition(challenge, p, c).progress;
  };
  for (const t of originalA)
    send({ kind: 'maxwell-answer', id: t.id, value: [...t.answers].sort().join('|') });
  send({ kind: 'maxwell-check' });
  send({ kind: 'maxwell-level', level: 2 });
  for (const t of tasks) send({ kind: 'maxwell-answer', id: t.id, value: String(t.answer) });
  if (wrong) send({ kind: 'maxwell-answer', id: 'l2-CD', value: '128' });
  if (checked) send({ kind: 'maxwell-check' });
  send({ kind: 'maxwell-reveal' });
  send({ kind: 'maxwell-level', level: 3 });
  for (const t of originalC)
    send({ kind: 'maxwell-answer', id: t.id, value: t.model ?? String(t.answer) });
  send({ kind: 'maxwell-check' });
  send({ kind: 'maxwell-reveal' });
  send({ kind: 'maxwell-level', level: 2 });
  send({ kind: 'maxwell-introduction' });
  return p;
}
