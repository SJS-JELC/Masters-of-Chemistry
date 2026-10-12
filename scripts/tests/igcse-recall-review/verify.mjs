import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const app = path.resolve(import.meta.dirname, '../../..');
const output = path.join(app, '.artifacts/recall-main/s3/harness');
await fs.mkdir(output, { recursive: true });
const { chromium } = createRequire(path.resolve(app, '../../package.json'))('playwright');
const base = process.env.RECALL_REVIEW_URL ?? 'http://127.0.0.1:5203/scripts/tests/igcse-recall-review/index.html';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const checks = [], trials = [];
try {
 const context = await browser.newContext({ viewport: { width: 1365, height: 1100 } });
 const page = await context.newPage();
 const errors = []; page.on('pageerror', e => errors.push(e.message));
 await page.goto(base);
 await page.getByRole('heading', { name: 'Factual recall review', exact: true }).waitFor();
 const { bank, models, fixtures, canonicalBank } = await page.evaluate(async () => {
   const { factsFor } = await import('/src/recall/facts.ts');
   const { recallFields } = await import('/src/recall/marking.ts');
   const fixtures = await (await fetch('/src/recall/marking-fixtures.json')).json();
   const bank = factsFor('igcse').map(f => ({ id: f.id, fields: recallFields(f), collection: f.exceptionCollection }));
   return { bank, canonicalBank: JSON.stringify(factsFor('igcse')), models: fixtures.marking.filter(f => f.category === 'model'), fixtures: fixtures.marking };
 });
 assert.equal(bank.length, 121); assert.equal(new Set(bank.map(f => f.id)).size, 121);
 assert.equal(await page.getByLabel('Question', { exact: true }).locator('option').count(), 121);
 assert.equal(bank.some(f => ['igcse-recall-025','igcse-recall-061','igcse-recall-087','igcse-recall-088'].includes(f.id)), false);
 const player = page.locator('.recall-test-player');
 const record = id => page.evaluate(id => {
   const key = Object.keys(localStorage).find(x => x.startsWith('igcse-recall-review-v2:'));
   return JSON.parse(localStorage.getItem(key) ?? '{}')[id];
 }, id);
 async function navigate(id, reset = true) {
   await page.getByLabel('Question', { exact: true }).selectOption(id);
   if (reset) await page.getByRole('button', { name: 'Reset answer', exact: true }).click();
   assert.equal(await page.getByTestId('question-id').textContent(), id);
   assert.equal(await player.locator('[data-recall-question-id]').getAttribute('data-recall-question-id'), id);
 }
 async function enter(id, responses) {
   const fact = bank.find(f => f.id === id);
   for (const field of fact.fields) {
     const control = player.getByLabel(field.label, { exact: true });
     if (field.entry?.kind === 'choice') await control.selectOption(responses[field.id].value);
     else await control.fill(responses[field.id].value);
     assert.equal(await control.inputValue(), responses[field.id].value, id + ':' + field.id + ' raw');
   }
   if (fact.collection) {
     const entries = JSON.parse(responses[fact.collection.id].value);
     assert.equal(await player.locator('.recall-exception-row').count(), 0, 'exception count initially hidden');
     for (let i = 0; i < entries.length; i++) {
       await player.getByRole('button', { name: 'Add exception', exact: true }).click();
       await player.getByLabel('Exception ' + (i + 1), { exact: true }).fill(entries[i].value);
     }
   }
 }
 async function trial(fixture) {
   await navigate(fixture.factId);
   await enter(fixture.factId, fixture.responses);
   await player.getByRole('button', { name: 'Check', exact: true }).click();
   await page.waitForFunction(id => {
     const key = Object.keys(localStorage).find(x => x.startsWith('igcse-recall-review-v2:'));
     return JSON.parse(localStorage.getItem(key) ?? '{}')[id]?.activeAttempt?.phase === 'assessed';
   }, fixture.factId);
   const r = await record(fixture.factId), result = r.trials.at(-1);
   assert.equal(result.automaticResult.correct, fixture.correct, fixture.id);
   assert.equal(result.firstAssessment.kind, 'marked');
   assert.equal(result.firstResponse.timing.activeMs, 0);
   assert.equal(result.reviewOnly, true);
   assert.equal(await player.getByRole('region', { name: 'Model answer', exact: true }).count(), 1);
   for (const [fieldId, correct] of Object.entries(fixture.expectedFields ?? {}))
     assert.equal(result.automaticResult.fields.find(f => f.fieldId === fieldId)?.correct, correct, fixture.id + ':' + fieldId);
   if (fixture.correct) assert.equal(await player.locator('[aria-invalid=true]').count(), 0);
   else assert.ok(await player.locator('.recall-incorrect, .recall-collection-status').count() > 0, fixture.id + ' field feedback');
   trials.push({ id: fixture.id, correct: result.automaticResult.correct, fields: result.automaticResult.fields });
   return result;
 }
 for (const fact of bank) await trial(models.find(f => f.factId === fact.id));
 checks.push('All 121 current IGCSE model fixtures entered through native production fields, raw option IDs and dynamic exception controls; immediate model and independent field feedback verified.');
 const negatives = [
 'igcse-recall-004:bare-number','igcse-recall-004:negative-sign','igcse-recall-018:wrong-choice-two-metals',
 'igcse-recall-039:wrong-choice-basic','igcse-recall-028:wrong-formula-or-charge','igcse-recall-033:wrong-formula-or-charge',
 'igcse-recall-064:duplicate-fizzing','igcse-recall-064:invents-flame','igcse-recall-062:crossed-results','igcse-recall-062:duplicate-pair',
 'igcse-recall-100:reverse-order','igcse-recall-082:invented-exception','igcse-recall-084:empty-exceptions',
 'igcse-recall-084:duplicate-exception','igcse-recall-084:extra-exception','igcse-recall-084:wrong-compound',
 'igcse-recall-084:duplicate-ion-compound','igcse-recall-114:wrong-dichromate-count'];
 for (const id of negatives) {
   const fixture = fixtures.find(f => f.id === id); assert.ok(fixture, id);
   await trial(fixture);
   assert.equal(await player.getByRole('button', { name: 'Mark as correct', exact: true }).count(), 0, id + ' no inappropriate review');
 }
 checks.push('18 representative sign, formula, choice, ordering, distinct-answer, paired-result and exception negatives remain wrong; no inappropriate self-correction offered.');
 await navigate('igcse-recall-065');
 await player.getByLabel('Answer', { exact: true }).fill('Solid melts into a spherical bead');
 await player.getByRole('button', { name: 'Check', exact: true }).click();
 await player.getByText('Review equivalent wording for Answer', { exact: true }).click();
 const original = (await record('igcse-recall-065')).trials.at(-1);
 assert.equal(original.automaticResult.correct, false);
 await player.getByRole('button', { name: 'Mark as correct', exact: true }).click();
 assert.ok(await player.locator('.recall-correct').count() > 0);
 await page.getByLabel('Review status', { exact: true }).selectOption('issue');
 await page.getByPlaceholder('Describe the wording, layout or marking issue…').fill('S3 verification: equivalent wording reviewed; keep automatic wrong.');
 await page.reload();
 await page.getByRole('heading', { name: 'Factual recall review', exact: true }).waitFor();
 assert.equal(await page.getByTestId('question-id').textContent(), 'igcse-recall-065');
 assert.equal(await player.getByLabel('Answer', { exact: true }).inputValue(), 'Solid melts into a spherical bead');
 assert.ok(await player.locator('.recall-correct').count() > 0);
 const reviewed = (await record('igcse-recall-065')).trials.at(-1);
 assert.deepEqual(reviewed.firstResponse, original.firstResponse);
 assert.deepEqual(reviewed.firstAssessment, original.firstAssessment);
 assert.deepEqual(reviewed.automaticResult, original.automaticResult);
 assert.equal(reviewed.learningReview.decisions[0].judgement, 'equivalent');
 assert.equal(reviewed.learningReview.reviewedMarks.earned, reviewed.learningReview.reviewedMarks.available);
 await page.screenshot({ path: path.join(output, 'desktop-reviewed-green.png'), fullPage: true });
 await page.setViewportSize({ width: 390, height: 844 });
 await page.screenshot({ path: path.join(output, 'mobile-reviewed-green.png'), fullPage: true });
 await page.setViewportSize({ width: 1365, height: 1100 });
 await player.getByLabel('Answer', { exact: true }).fill('Forms a ball');
 assert.equal(await player.locator('.recall-correct').count(), 0, 'current edit loses frozen feedback');
 assert.equal(await player.getByRole('button', { name: 'Mark as correct', exact: true }).count(), 0);
 assert.equal(await player.getByRole('button', { name: 'Check', exact: true }).isDisabled(), true, 'production model visibility disables a second check');
 const corrected = (await record('igcse-recall-065')).trials.at(-1);
 assert.deepEqual(corrected.firstResponse, original.firstResponse);
 assert.deepEqual(corrected.firstAssessment, original.firstAssessment);
 assert.equal(corrected.corrections.length, 0, 'current edits are learning-only without a new correction check');
 assert.equal(corrected.currentResponses.answer.value, 'Forms a ball');
 await page.screenshot({ path: path.join(output, 'desktop-review.png'), fullPage: true });
 await page.setViewportSize({ width: 390, height: 844 });
 await page.screenshot({ path: path.join(output, 'mobile-review.png'), fullPage: true });
 assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
 checks.push('Eligible learning review restores green on reload while first automatic wrong/raw/marks stay immutable; current edits remain separate and post-model Check stays disabled by production policy.');
 const downloadPromise = page.waitForEvent('download');
 await page.getByRole('button', { name: 'Export review JSON', exact: true }).click();
 const download = await downloadPromise;
 const payload = JSON.parse(await fs.readFile(await download.path(), 'utf8'));
 assert.equal(payload.schemaVersion, 2); assert.equal(payload.total, 121); assert.equal(payload.reviews.length, 121);
 assert.deepEqual(payload.reviews.map(r => r.questionId), bank.map(f => f.id));
 assert.match(payload.bankFingerprint, /^[a-f0-9]{64}$/);
 assert.equal(payload.bankFingerprint, createHash('sha256').update(canonicalBank).digest('hex'));
 assert.equal(payload.independentEvidence, false); assert.equal(payload.timing, 'synthetic-zero-review-only');
 const q65 = payload.reviews.find(r => r.questionId === 'igcse-recall-065');
 assert.equal(q65.status, 'issue'); assert.match(q65.note, /keep automatic wrong/);
 assert.equal(q65.trials.at(-1).automaticResult.correct, false);
 assert.equal(q65.trials.at(-1).learningReview.decisions[0].judgement, 'equivalent');
 assert.equal(q65.currentResponses.answer.value, 'Forms a ball');
 assert.ok(payload.reviews.some(r => r.status === 'unreviewed'));
 assert.deepEqual(await page.evaluate(() => indexedDB.databases()), []);
 assert.deepEqual(await page.evaluate(() => Object.keys(localStorage).filter(k => !k.startsWith('igcse-recall-review-v2:'))), []);
 await fs.writeFile(path.join(output, 'export.json'), JSON.stringify(payload, null, 2));
 checks.push('Export includes all 121 IDs, unreviewed status, issue note, fingerprint/provenance, original automatic wrong, separate learning decisions/current edits; no pupil IndexedDB or other localStorage keys.');
 await page.getByPlaceholder('Search question or ID').fill('igcse-recall-062');
 assert.equal(await page.getByLabel('Question', { exact: true }).locator('option').count(), 2);
 await page.getByLabel('Question', { exact: true }).selectOption('igcse-recall-062');
 await page.getByPlaceholder('Search question or ID').fill('');
 await page.getByRole('button', { name: 'Reset answer', exact: true }).click();
 for (const input of await player.locator('input').all()) assert.equal(await input.inputValue(), '');
 await page.goto(base + '?id=igcse-recall-033');
 await player.getByLabel('Answer', { exact: true }).waitFor();
 assert.equal(await page.getByTestId('question-id').textContent(), 'igcse-recall-033');
 await page.getByRole('button', { name: 'Reset answer', exact: true }).click();
 await player.getByLabel('Answer', { exact: true }).fill('SO54-');
 await player.getByRole('button', { name: 'Check', exact: true }).click();
 assert.equal((await record('igcse-recall-033')).trials.at(-1).automaticResult.correct, false);
 assert.equal(await player.getByLabel('Answer', { exact: true }).inputValue(), 'SO54-');
 await page.screenshot({ path: path.join(output, 'mobile-notation.png'), fullPage: true });
 await page.setViewportSize({ width: 1365, height: 1100 });
 await navigate('igcse-recall-084');
 await enter('igcse-recall-084', fixtures.find(f => f.id === 'igcse-recall-084:duplicate-exception').responses);
 await player.getByRole('button', { name: 'Check', exact: true }).click();
 await page.screenshot({ path: path.join(output, 'desktop-exceptions.png'), fullPage: true });
 await page.getByLabel('Review status', { exact: true }).selectOption('reviewed');
 await page.reload();
 await page.getByRole('heading', { name: 'Factual recall review', exact: true }).waitFor();
 assert.equal(await page.getByLabel('Review status', { exact: true }).inputValue(), 'reviewed');
 const beforeTeacher = await record('igcse-recall-084');
 await page.getByLabel('Read-only teacher preview', { exact: true }).check();
 assert.equal(await player.getByRole('button', { name: 'Check', exact: true }).count(), 0);
 assert.equal(await player.locator('input,select').count(), 0);
 assert.equal(await player.getByRole('region', { name: 'Model answer', exact: true }).count(), 1);
 assert.deepEqual(await record('igcse-recall-084'), beforeTeacher);
 await page.getByLabel('Read-only teacher preview', { exact: true }).uncheck();
 await navigate('igcse-recall-012');
 const keyboardAnswer = player.getByLabel('Answer', { exact: true });
 await keyboardAnswer.fill('(aq)');
 await keyboardAnswer.press('Enter');
 assert.equal((await record('igcse-recall-012')).trials.at(-1).automaticResult.correct, true);
 await keyboardAnswer.press('Enter');
 assert.equal(await page.getByTestId('question-id').textContent(), bank[bank.findIndex(f => f.id === 'igcse-recall-012') + 1].id);
 await page.getByLabel('Read-only teacher preview', { exact: true }).check();
 assert.equal(await player.getByRole('button', { name: 'Check', exact: true }).count(), 0);
 await page.getByLabel('Read-only teacher preview', { exact: true }).uncheck();
 assert.deepEqual(await page.evaluate(() => indexedDB.databases()), []);
 assert.deepEqual(errors, []);
 checks.push('Search, direct links, reset, Reviewed status/reload, keyboard Enter submit/Next, stable production IDs, unrepaired chemical notation, desktop/mobile layout and final teacher preview regression pass without browser errors.');
 // Fresh browser export proves IDs with no entered trials are included too.
 const fresh = await browser.newContext();
 const cleanPage = await fresh.newPage(); await cleanPage.goto(base);
 await cleanPage.getByRole('heading', { name: 'Factual recall review', exact: true }).waitFor();
 const cleanDownload = cleanPage.waitForEvent('download');
 await cleanPage.getByRole('button', { name: 'Export review JSON', exact: true }).click();
 const cleanPayload = JSON.parse(await fs.readFile(await (await cleanDownload).path(), 'utf8'));
 assert.equal(cleanPayload.reviews.length, 121);
 assert.ok(cleanPayload.reviews.every(r => r.status === 'unreviewed' && r.trials.length === 0));
 assert.deepEqual(await cleanPage.evaluate(() => indexedDB.databases()), []);
 await fresh.close();
 checks.push('Fresh isolated browser export includes every current ID even with no reviewed/assessed trials.');
 const report = { at: new Date().toISOString(), status: 'PASS', base, browser: 'headless installed Edge / pinned workspace Playwright', checks, trials, errors,
   limitations: ['No native foreground/hidden-tab/idle/suspension timing claim: review clock is intentionally synthetic zero.', 'Main-app persistence/timing and independent final reviews belong to later integration gates.'] };
 await fs.writeFile(path.join(output, 'verification.json'), JSON.stringify(report, null, 2));
 console.log(JSON.stringify({ status: 'PASS', checks, trialCount: trials.length }, null, 2));
} catch (error) {
 await fs.writeFile(path.join(output, 'failed-verification.json'), JSON.stringify({ at: new Date().toISOString(), checks, completedTrialCount: trials.length, error: String(error), stack: error.stack }, null, 2));
 throw error;
} finally { await browser.close(); }
