import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const out = path.resolve('validation/s5/fixes/energy-typing');
const require = createRequire(path.resolve('../../package.json'));
assert.equal(require('playwright/package.json').version, '1.62.1');
const { chromium } = require('playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1365, height: 1000 } });
await context.addInitScript(() => {
  const original = crypto.getRandomValues.bind(crypto);
  crypto.getRandomValues = (a) => {
    original(a);
    if (a instanceof Uint32Array && a.length === 1) a[0] = 26;
    return a;
  };
  window.__typingEvents = [];
  document.addEventListener(
    'input',
    (event) => {
      if (event.target.matches('.energy-profile-editor input'))
        window.__typingEvents.push({
          label: event.target.getAttribute('aria-label'),
          value: event.target.value,
          inputType: event.inputType,
          data: event.data,
          trusted: event.isTrusted,
        });
    },
    true,
  );
});
const page = await context.newPage(),
  errors = [],
  results = [],
  inputEvents = [];
page.on('pageerror', (e) => errors.push(e.message));
const snap = () => page.evaluate(() => window.__mastersActivity.snapshot());
const flush = () => page.evaluate(() => window.__mastersActivity.flush());
const pvalue = async () => {
  const s = await snap();
  return (
    s.attempt.currentResponses.profile?.p ??
    s.question.parts.find((p) => p.kind === 'energy-profile').initial.p
  );
};
async function replace(input, text) {
  await input.focus();
  await input.press('Control+A');
  await input.press('Backspace');
  await input.pressSequentially(text, { delay: 45 });
}
async function run(id, fn) {
  try {
    const evidence = await fn();
    inputEvents.push(
      ...(await page.evaluate(() => {
        const e = window.__typingEvents;
        window.__typingEvents = [];
        return e;
      })),
    );
    results.push({ id, status: 'PASS', evidence });
  } catch (e) {
    results.push({ id, status: 'FAIL', error: String(e.stack || e) });
    await page.screenshot({ path: path.join(out, id + '-failure.png'), fullPage: true });
    throw e;
  }
}
let report = { status: 'FAIL', results };
try {
  await page.goto('http://127.0.0.1:5210/igcse.html?run=a13-s5-' + Date.now());
  await page.waitForFunction(() => window.__mastersActivity);
  await page.getByLabel('Target', { exact: true }).selectOption('lower-10-1:2');
  await page.getByRole('button', { name: 'Start practice', exact: true }).click();
  await page.locator('.energy-profile-editor').waitFor();
  assert.equal((await snap()).question.ref.questionId, 'D01');
  const right = page.getByLabel('Right level screen y', { exact: true });
  await run('trusted-delete-sequential-longer-blur-enter', async () => {
    assert.equal(await right.inputValue(), '220');
    await right.focus();
    await right.press('Control+A');
    await right.press('Backspace');
    assert.equal(await right.inputValue(), '');
    assert.equal(await pvalue(), 220);
    const states = [
      { stage: 'deleted', value: await right.inputValue(), semantic: await pvalue() },
    ];
    for (const digit of '200') {
      await right.pressSequentially(digit, { delay: 45 });
      states.push({
        stage: 'after ' + digit,
        value: await right.inputValue(),
        semantic: await pvalue(),
      });
      assert.equal(await pvalue(), 220);
    }
    assert.equal(await right.inputValue(), '200');
    await right.press('Enter');
    await flush();
    assert.equal(await pvalue(), 200);
    assert.equal(await right.inputValue(), '200');
    await replace(right, '300');
    assert.equal(await right.inputValue(), '300');
    assert.equal(await pvalue(), 200);
    await page.getByRole('heading', { name: /Reaction Profile Diagrams/ }).click();
    await flush();
    assert.equal(await pvalue(), 300);
    await replace(right, '155.5');
    assert.equal(await right.inputValue(), '155.5');
    assert.equal(await pvalue(), 300);
    await right.press('Enter');
    await flush();
    assert.equal(await pvalue(), 155.5);
    const s = await snap();
    assert.equal(s.history.length, 0);
    assert.equal(s.attempt.phase, 'answering');
    return { question: 'D01', states, enter: 200, blur: 300, decimal: 155.5, noEvidence: true };
  });
  await run('invalid-empty-range-nonfinite-recovery-escape', async () => {
    for (const raw of ['', '400', 'Infinity', 'wrong', '2e']) {
      await replace(right, raw);
      assert.equal(await pvalue(), 155.5);
      await right.press('Enter');
      await flush();
      assert.equal(await right.inputValue(), '155.5');
      assert.equal(await pvalue(), 155.5);
      assert.equal(await right.getAttribute('aria-invalid'), 'true');
      assert(await page.getByText(/previous profile value \(155.5\) was kept/).count());
    }
    await replace(right, '200');
    await right.press('Enter');
    await flush();
    assert.equal(await pvalue(), 200);
    assert.equal(await right.getAttribute('aria-invalid'), 'false');
    await replace(right, '2e');
    await right.press('Escape');
    assert.equal(await right.inputValue(), '200');
    assert.equal(await pvalue(), 200);
    return {
      invalidInputs: ['', '400', 'Infinity', 'wrong', '2e'],
      semanticPreserved: 155.5,
      recovered: 200,
      escape: true,
    };
  });
  await run('external-state-undo-reset-pointer-key', async () => {
    await replace(right, '300');
    await right.press('Enter');
    await flush();
    await page.getByRole('button', { name: 'Undo profile edit', exact: true }).click();
    await flush();
    assert.equal(await pvalue(), 200);
    assert.equal(await right.inputValue(), '200');
    await right.focus();
    await right.press('Control+A');
    await right.press('Backspace');
    await right.pressSequentially('1', { delay: 45 });
    const s = await snap();
    await page.evaluate(
      (m) => window.__mastersActivity.respond('profile', { ...m, p: 280 }),
      s.attempt.currentResponses.profile,
    );
    await flush();
    assert.equal(await right.inputValue(), '280');
    await page.getByRole('button', { name: 'Reset profile', exact: true }).click();
    await flush();
    assert.equal(await right.inputValue(), '220');
    assert.equal(await pvalue(), 220);
    const handle = page.getByRole('button', {
      name: 'Right energy level, use up and down keys',
      exact: true,
    });
    await handle.focus();
    await page.keyboard.press('ArrowUp');
    await flush();
    assert.equal(await pvalue(), 200);
    assert.equal(await right.inputValue(), '200');
    await handle.scrollIntoViewIfNeeded();
    const box = await handle.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 30, { steps: 5 });
    await page.mouse.up();
    await flush();
    assert((await pvalue()) > 200);
    assert.equal(Number(await right.inputValue()), await pvalue());
    assert.equal((await snap()).history.length, 0);
    return {
      undo: true,
      externalResponse: true,
      reset: 220,
      keyboard: 200,
      pointer: true,
      zeroEvidence: true,
    };
  });
  await run('all-numeric-controls-endpoint-and-x-local-drafts', async () => {
    await page.getByRole('button', { name: 'Add enthalpy change arrow', exact: true }).click();
    await flush();
    const controls = page.locator('.energy-profile-editor fieldset fieldset');
    const endpoint = controls.getByLabel('Endpoint screen y', { exact: true }).first(),
      x = controls.getByLabel('Arrow x position', { exact: true });
    await replace(endpoint, '305');
    assert.equal(await endpoint.inputValue(), '305');
    let s = await snap();
    assert.equal(s.attempt.currentResponses.profile.arrows.delta.tail.y, 255);
    await endpoint.press('Enter');
    await flush();
    assert.equal((await snap()).attempt.currentResponses.profile.arrows.delta.tail.y, 305);
    await replace(x, '500');
    assert.equal(await x.inputValue(), '500');
    assert.equal((await snap()).attempt.currentResponses.profile.arrows.delta.x, 560);
    await x.press('Tab');
    await flush();
    assert.equal((await snap()).attempt.currentResponses.profile.arrows.delta.x, 500);
    await replace(x, '600');
    await x.press('Enter');
    await flush();
    assert.equal(await x.inputValue(), '500');
    assert.equal((await snap()).attempt.currentResponses.profile.arrows.delta.x, 500);
    await page.screenshot({ path: path.join(out, 'trusted-typing-fixed.png'), fullPage: true });
    return { endpointTail: 305, arrowX: 500, xOutOfRangeKept: true };
  });
  await run('first-assessment-correction-readonly-next-immutability', async () => {
    const s = await snap();
    const q = (await import('../../../../src/activities/igcse/energy-enthalpy/provider.ts')).record(
      s.question.ref.questionId,
    );
    await page.getByLabel('Left formula label', { exact: true }).selectOption(q.editor.formula[0]);
    await page.getByLabel('Right formula label', { exact: true }).selectOption(q.editor.formula[1]);
    await replace(right, '300');
    await right.press('Enter');
    const controls = page.locator('.energy-profile-editor fieldset fieldset');
    await controls.getByLabel('Tail', { exact: true }).selectOption('r');
    await controls.getByLabel('Arrowhead', { exact: true }).selectOption('p');
    await flush();
    await page.getByRole('button', { name: 'Check answer', exact: true }).click();
    await flush();
    await page.waitForFunction(() => window.__mastersActivity.snapshot().history.length === 1);
    const first = await snap();
    assert.equal(first.attempt.firstAssessment.score, 1);
    await replace(right, '200');
    assert.deepEqual((await snap()).attempt.firstAssessment, first.attempt.firstAssessment);
    await right.press('Enter');
    await flush();
    await page.getByRole('button', { name: 'Check correction', exact: true }).click();
    await flush();
    assert.deepEqual((await snap()).history, first.history);
    assert.deepEqual((await snap()).attempt.firstResponse, first.attempt.firstResponse);
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await flush();
    inputEvents.push(
      ...(await page.evaluate(() => {
        const e = window.__typingEvents;
        window.__typingEvents = [];
        return e;
      })),
    );
    await page.reload();
    await page.waitForFunction(() => window.__mastersActivity?.snapshot().attempt);
    await page.getByRole('button', { name: 'Resume saved attempt', exact: true }).click();
    await page.locator('.energy-profile-editor').waitFor();
    assert.equal(
      await page.getByLabel('Right level screen y', { exact: true }).inputValue(),
      '200',
    );
    assert.deepEqual((await snap()).attempt.firstResponse, first.attempt.firstResponse);
    const teacher = await context.newPage();
    const teacherURL = new URL(page.url());
    teacherURL.searchParams.set('view', 'teacher');
    teacherURL.searchParams.set('activity', s.question.ref.activityId);
    teacherURL.searchParams.set('review', 'D01');
    teacherURL.searchParams.set('level', '2');
    teacherURL.searchParams.set('seed', '26');
    await teacher.goto(teacherURL.href);
    await teacher.getByText('Teacher preview � read only', { exact: true }).waitFor();
    assert.equal(await teacher.locator('.energy-profile-editor input').count(), 0);
    await teacher.screenshot({ path: path.join(out, 'teacher-readonly.png'), fullPage: true });
    assert.deepEqual(
      await teacher.evaluate(() => window.__mastersActivity.snapshot().history),
      first.history,
    );
    await teacher.close();
    await page.getByRole('button', { name: 'Next question', exact: true }).click();
    await page.waitForFunction(
      (id) => window.__mastersActivity.snapshot().attempt?.attemptId !== id,
      first.attempt.attemptId,
    );
    await page.locator('.energy-profile-editor').waitFor();
    const next = await snap();
    assert.equal(next.attempt.phase, 'answering');
    assert.equal(next.history.length, 1);
    assert.equal(
      await page.getByLabel('Right level screen y', { exact: true }).inputValue(),
      String(next.question.parts.find((p) => p.kind === 'energy-profile').initial.p),
    );
    for (const [label, value] of [
      ['Left level screen y', '210'],
      ['Peak level screen y', '85'],
    ]) {
      const input = page.getByLabel(label, { exact: true });
      await replace(input, value);
      assert.equal(await input.inputValue(), value);
      await input.press('Enter');
      await flush();
      assert.equal(await input.inputValue(), value);
    }
    assert.equal((await snap()).history.length, 1);
    return {
      allProfileLevelInputs: true,
      firstScore: 1,
      firstEvidence: 1,
      correctionAndRestoreFixed: true,
      teacherReadonly: true,
      nextQuestion: next.question.ref.questionId,
      newAttempt: true,
    };
  });
  report = {
    status: 'PASS',
    browser: browser.version(),
    playwright: require('playwright/package.json').version,
    headless: true,
    host: 'Actual DEV production host, own port5210 isolated run DB, source-seeded D01',
    CPUThrottle: 1,
    network: 'unthrottled',
    results,
    pageErrors: errors,
    inputEvents: [...inputEvents, ...(await page.evaluate(() => window.__typingEvents))],
  };
  assert.equal(errors.length, 0);
} catch (e) {
  report = {
    status: 'FAIL',
    error: String(e.stack || e),
    results,
    pageErrors: errors,
    inputEvents: [
      ...inputEvents,
      ...(await page.evaluate(() => window.__typingEvents).catch(() => [])),
    ],
  };
} finally {
  fs.writeFileSync(path.join(out, 'browser-results.json'), JSON.stringify(report, null, 2));
  await browser.close();
  console.log(JSON.stringify({ status: report.status, results: report.results }, null, 2));
  if (report.status !== 'PASS') process.exitCode = 1;
}
