import { chromium } from '../../../../../node_modules/playwright/index.mjs';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const output = fileURLToPath(new URL('./', import.meta.url));
const project = resolve(output, '../../..');
await mkdir(output, {recursive:true});
const run = `a06-native-${Date.now()}`;
const evidence = {run, testedAt:new Date().toISOString(), checks:[], diagnostics:[], errors:[], navigations:[], sourceFingerprints:{}};
for (const file of ['src/ui/TextRangePicker.tsx','src/ui/QuestionPlayer.tsx','src/development/FoundationApp.tsx','src/domain/timing/browser-binding.ts','src/contracts/attempt.ts','src/contracts/question.ts']) {
  evidence.sourceFingerprints[file] = createHash('sha256').update(await readFile(resolve(project,file))).digest('hex');
}
let context;
try {
  context = await chromium.launchPersistentContext(resolve(project,'.browser/A06'), {channel:'msedge',headless:true,viewport:{width:1440,height:1100},args:['--no-first-run','--no-default-browser-check']});
  evidence.browser = context.browser().version(); evidence.playwright='1.62.1';
  const page = await context.newPage();
  page.on('pageerror',error=>evidence.errors.push(String(error)));
  page.on('framenavigated',frame=>{if(frame===page.mainFrame())evidence.navigations.push({at:new Date().toISOString(),url:frame.url()});});
  await page.goto(`http://127.0.0.1:5181/igcse.html?run=${run}&fixture=self-rubric`);
  await page.getByRole('button',{name:'Start fixture',exact:true}).click();
  await page.getByLabel('Your explanation', {exact:true}).fill('A precise explanation.');
  await page.getByLabel('Your comparison', {exact:true}).fill('A second explanation.');
  await page.getByRole('button',{name:'Submit and freeze response',exact:true}).click();
  await page.getByTestId('attempt-phase').filter({hasText:'rubric-review'}).waitFor();
  const snapshot = async()=>{await page.evaluate(()=>window.__mastersFoundation.flush());return page.evaluate(()=>window.__mastersFoundation.snapshot());};
  const frozen = await snapshot(); evidence.frozen=frozen;
  await page.getByRole('button',{name:'My answer meets this point',exact:true}).click();
  const locked = page.getByLabel('Select evidence from your submitted answer');
  await locked.evaluate(element=>{
    window.__a06Events=[];
    for(const kind of ['keydown','keyup','select','selectionchange','focus','blur']) element.addEventListener(kind,event=>window.__a06Events.push({kind,key:event.key,ctrl:event.ctrlKey,shift:event.shiftKey,defaultPrevented:event.defaultPrevented,start:element.selectionStart,end:element.selectionEnd,focused:document.activeElement===element,time:performance.now()}));
  });
  async function diagnose(label) {
    const native=await locked.evaluate(element=>({start:element.selectionStart,end:element.selectionEnd,value:element.value,focused:document.activeElement===element,readonly:element.readOnly,disabled:element.disabled,userSelect:getComputedStyle(element).userSelect,events:window.__a06Events.splice(0)}));
    evidence.diagnostics.push({label,native,start:await page.getByLabel('Start',{exact:true}).inputValue(),end:await page.getByLabel('End (exclusive)',{exact:true}).inputValue(),enabled:await page.getByRole('button',{name:'Use selected text',exact:true}).isEnabled()});
    return evidence.diagnostics.at(-1);
  }
  await locked.focus(); await diagnose('focus');
  await page.keyboard.press('Control+Home'); await diagnose('Control+Home');
  await page.keyboard.press('Shift+End'); await diagnose('Shift+End immediate');
  await page.waitForTimeout(100); await diagnose('Shift+End settled');
  await page.screenshot({path:resolve(output,'original-sequence.png'),fullPage:true});
  await page.keyboard.press('Control+Home');
  await page.keyboard.press('Shift+ArrowRight'); await diagnose('Shift+ArrowRight');
  await page.keyboard.press('Control+a'); await diagnose('Control+a');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.down('Shift'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.keyboard.up('Shift');
  await diagnose('explicit Shift-down two ArrowRight');
  await locked.click(); await diagnose('pointer click focus');
  await page.keyboard.press('Control+Home'); await page.keyboard.press('Shift+End');
  const clickSelection=await diagnose('pointer focused Control+Home Shift+End');
  await page.screenshot({path:resolve(output,'pointer-focused-sequence.png'),fullPage:true});
  await page.keyboard.press('Control+a');
  const allSelected=await diagnose('Control+a confirmation');
  if(allSelected.native.start===0 && allSelected.native.end===45 && allSelected.enabled) {
    await page.getByRole('button',{name:'Use selected text',exact:true}).click();
    const nativeRecorded=await snapshot();
    assert.equal(nativeRecorded.attempt.reviews[0].judgements[0].evidence.text,'A precise explanation.\n\nA second explanation.');
    evidence.nativeRecorded=nativeRecorded;
    evidence.checks.push('Native keyboard Ctrl+A range 0..45 records exact frozen evidence');
  } else {
    evidence.checks.push('Native keyboard selection failure retained; do not claim native PASS');
    await page.getByLabel('Start',{exact:true}).fill('0'); await page.getByLabel('End (exclusive)',{exact:true}).fill('22');
    await page.getByRole('button',{name:'Use selected text',exact:true}).click();
  }
  const recorded = await snapshot();
  assert.equal(recorded.attempt.reviews[0].judgements[0].evidence.text,allSelected.enabled ? 'A precise explanation.\n\nA second explanation.' : 'A precise explanation.');
  assert.deepEqual(recorded.attempt.firstResponse,frozen.attempt.firstResponse);
  assert.equal(recorded.history.length,0);
  evidence.checks.push('First response and timing frozen; rubric range alone creates no history');
  await page.getByRole('button',{name:'My answer meets this point',exact:true}).click();
  await page.getByLabel('Start',{exact:true}).fill('2'); await page.getByLabel('End (exclusive)',{exact:true}).fill('9');
  await page.getByRole('button',{name:'Use selected text',exact:true}).click();
  const offsetRecorded=await snapshot();
  assert.equal(offsetRecorded.attempt.reviews[0].judgements[1].evidence.text,'precise');
  assert.deepEqual(offsetRecorded.attempt.firstResponse,frozen.attempt.firstResponse);
  evidence.offsetRecorded=offsetRecorded;
  evidence.checks.push('Non-drag offsets 2..9 record exact text precise on next ordered point');
  await page.getByRole('button',{name:'Finish self-review',exact:true}).click();
  await page.getByTestId('attempt-phase').filter({hasText:'assessed'}).waitFor();
  await page.getByTestId('evidence-count').filter({hasText:'1 independent'}).waitFor();
  const assessed=await snapshot();
  assert.deepEqual(assessed.attempt.firstResponse,frozen.attempt.firstResponse);
  assert.equal(assessed.history.length,1);
  evidence.assessed=assessed;
  await page.reload();
  await page.getByTestId('attempt-phase').filter({hasText:'assessed'}).waitFor();
  const restored=await snapshot();
  assert.deepEqual(restored.attempt.firstResponse,frozen.attempt.firstResponse);
  assert.equal(restored.history.length,1); assert.equal(restored.attempt.attemptId,frozen.attempt.attemptId);
  evidence.restored=restored;
  evidence.checks.push('Finishing/reloading retains one independent evidence record and exact first response/timing/attempt');
  await page.screenshot({path:resolve(output,'review-complete.png'),fullPage:true});
  // A plain browser control distinguishes readonly Chrome behaviour from React re-rendering.
  const baseline=await context.newPage();
  await baseline.setContent('<label for="baseline">Readonly baseline</label><textarea id="baseline" readonly>A precise explanation.\n\nA second explanation.</textarea><label for="editable">Editable baseline</label><textarea id="editable">A precise explanation.\n\nA second explanation.</textarea>');
  evidence.baseline=[];
  for(const label of ['Readonly baseline','Editable baseline']) {
    const base=baseline.getByLabel(label);
    await base.focus(); await baseline.keyboard.press('Control+Home'); await baseline.keyboard.press('Shift+End');
    evidence.baseline.push({label,key:'Control+Home then Shift+End',...await base.evaluate(element=>({start:element.selectionStart,end:element.selectionEnd,focused:document.activeElement===element,value:element.value}))});
    await baseline.keyboard.press('Control+a');
    evidence.baseline.push({label,key:'Control+a',...await base.evaluate(element=>({start:element.selectionStart,end:element.selectionEnd,focused:document.activeElement===element,value:element.value}))});
  }
  assert.deepEqual(evidence.errors,[]);
  evidence.execution='PASS';
} catch(error) { evidence.execution='FAIL'; evidence.error=String(error);evidence.stack=error.stack;throw error; }
finally { await writeFile(resolve(output,'native-review.json'),JSON.stringify(evidence,null,2)); if(context)await context.close(); }
