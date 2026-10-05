import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../../../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),write=(p,s)=>fs.writeFileSync(path.join(root,p),s),slots=JSON.parse(read('development/authoring/family-slots.json'));
for(const [name,slot]of Object.entries(slots)){
 const file=name==='authoring-proof'?'development/authoring/family.ts':`development/authoring/families/${name}/family.ts`,relative=name==='authoring-proof'?'../../src/':'../../../../src/';
 write(file,`import {validatePreviousQuestionIds} from '${relative}content/canonical-identity.ts';\n`+read(file).replace('  select(s: QuestionSelection) {','  select(s: QuestionSelection) {\n    validatePreviousQuestionIds(activityId, s.previousQuestionIds ?? []);'));
}
write('src/development/fixtures.ts',"import { validatePreviousQuestionIds } from '../content/canonical-identity.ts';\n"+read('src/development/fixtures.ts').replace('    select(selection) {','    select(selection) {\n      validatePreviousQuestionIds(activityId, selection.previousQuestionIds ?? []);'));
let browser=read('development/authoring/templates/browser.mjs');
browser=browser.replace("async function click(name){await page.getByRole('button',{name,exact:true}).click();", "async function click(name){if(name==='Back to course map')await page.getByRole('button',{name,exact:true}).first().click();else await page.getByRole('button',{name,exact:true}).click();");
browser=browser.replaceAll("click('Pause')","click('Back to course map')").replace("await page.getByRole('button',{name:'Resume saved attempt',exact:true}).click();await flush();","await waitAttempt();await page.getByRole('button',{name:'Check answer',exact:true}).waitFor();await flush();").replaceAll("await click('Resume saved attempt');","await waitAttempt();await page.getByRole('button',{name:'Check answer',exact:true}).waitFor();await flush();");
browser=browser.replace("const paused=await snap();assert(paused.attempt.timing.activeMs>0);","const paused=await snap();assert(paused.session.paused===true);assert(paused.attempt.timing.activeMs>0);");
write('development/authoring/templates/browser.mjs',browser);
for(const name of Object.keys(slots))if(name!=='authoring-proof')write(`development/authoring/families/${name}/browser.mjs`,browser.replaceAll('__SCAFFOLD_SLUG__',name));
write('validation/component-fidelity/f1-correction/identity/authoring-root-browser.mjs',browser.replace("from './family.ts'","from '../../../../development/authoring/family.ts'").replaceAll('families/__SCAFFOLD_SLUG__/preview.html','index.html').replaceAll('__SCAFFOLD_SLUG__','authoring-proof'));
write('development/authoring/scaffold.mjs',read('development/authoring/scaffold.mjs').replace("if(!slug||!/^dev-", "if(!slug||slug.length>48||!/^dev-"));
write('docs/authoring/README.md',read('docs/authoring/README.md').replace('scoped by encoded route and run','scoped by permanent family route token and run'));
