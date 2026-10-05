import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../../../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,''),write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
const slots=JSON.parse(read('development/authoring/family-slots.json')),base=read('development/authoring/family.ts');
for(const [name,slot]of Object.entries(slots))if(name!=='authoring-proof'){
 const folder=`development/authoring/families/${name}`;
 const old=read(folder+'/family.ts'),prefix=old.match(/(?:const prefix\s*=\s*'|templateId:\s*')([^']+?)(?:-GENERATED)?'/)?.[1]??'DEV-PH-v1';
 const marking=old.match(/id:\s*'([^']+-marking)'/)?.[1];
 write(folder+'/family.ts',base.replaceAll('../../src/','../../../../src/').replace('proofSlot = 48',`proofSlot = ${slot}`).replaceAll('DEV-PH-v1',marking?.replace(/-marking$/,'')??prefix));
}
let test=read('development/authoring/templates/family.test.mjs');
test=test.replace("const evidence=path.resolve(import.meta.dirname,'../../../../validation/s4/authoring-release/refinement',path.basename(import.meta.dirname));", "const evidence=path.resolve(import.meta.dirname,'../../../../validation/component-fidelity/f1-correction/identity/authoring',path.basename(import.meta.dirname));");
test=test.replace(/assert.equal\(q.ref.questionId,`DEV-PH-v1-\$\{level===2\?'GENERATED':'APPLICATION'\}-\$\{s.toString\(36\).toUpperCase\(\)\}`\);/,"assert.match(q.ref.questionId,/^AB-[A-Z0-9]{6}$/);assert.equal(q.ref.level,level);assert.equal(q.ref.seed,s);");
write('development/authoring/templates/family.test.mjs',test);
let browser=read('development/authoring/templates/browser.mjs');
browser=browser.replace("import {dilutionValues}","import {dilutionValues,proofRef}").replaceAll('validation/s4/authoring-release/refinement','validation/component-fidelity/f1-correction/identity/authoring').replaceAll('127.0.0.1:5195','127.0.0.1:5181').replace("'DEV-PH-v1-FIXED'","proofRef(1,0).questionId").replace("assert(s.question.ref.questionId.startsWith('DEV-PH-v1-GENERATED-'))","assert.equal(s.question.ref.level,2);assert.match(s.question.ref.questionId,/^AB-[A-Z0-9]{6}$/)").replace("assert(s.question.ref.questionId.startsWith('DEV-PH-v1-APPLICATION-'))","assert.match(s.question.ref.questionId,/^AB-[A-Z0-9]{6}$/)").replace("+'&mode=teacher&review=DEV-PH-v1-GENERATED-O'","+'&mode=teacher&review='+proofRef(2,24).questionId");
browser=browser.replace("report={jobId:'S4-AUTHORING-RUNNABLE-REFINEMENT'", "report={jobId:'F1-CODEC-DEV'");
write('development/authoring/templates/browser.mjs',browser);
for(const [name,slot]of Object.entries(slots))if(name!=='authoring-proof'){
 const folder=`development/authoring/families/${name}`;
 write(folder+'/family.test.mjs',test);write(folder+'/browser.mjs',browser.replaceAll('__SCAFFOLD_SLUG__',name));
 const plan=JSON.parse(read(folder+'/authoring-plan.json'));plan.questionIdPrefix='AB';plan.permanentDevelopmentSlot=slot;plan.seedDomain=[0,11337407];plan.preview=plan.preview.replace('5195','5181');plan.evidence=`validation/component-fidelity/f1-correction/identity/authoring/${name}`;write(folder+'/authoring-plan.json',JSON.stringify(plan,null,2)+'\n');
 let doc=read(folder+'/README.md').replaceAll('5195','5181').replaceAll('validation/s4/authoring-release/refinement','validation/component-fidelity/f1-correction/identity/authoring').replace('New DEV IDs,','Canonical AB six-character IDs in an isolated DEV namespace,');write(folder+'/README.md',doc);
}
let scaffold=read('development/authoring/scaffold.mjs');
scaffold=scaffold.replace("const prefix=`DEV-${slug.slice(4).toUpperCase()}-v1`,relative=", "const slotPath=path.join(import.meta.dirname,'family-slots.json'),slots=JSON.parse(fs.readFileSync(slotPath,'utf8'));\nconst slot=Array.from({length:16},(_,i)=>i+48).find(i=>!Object.values(slots).includes(i));if(slot===undefined)throw Error('DEV authoring slots exhausted; review a new codec context rather than renumbering.');\nconst prefix='AB',relative=");
scaffold=scaffold.replace('validation/s4/authoring-release/refinement','validation/component-fidelity/f1-correction/identity/authoring').replaceAll('5195','5181');
scaffold=scaffold.replace(".replaceAll('DEV-PH-v1',prefix)",".replace('proofSlot = 48',`proofSlot = ${slot}`)");
scaffold=scaffold.replace("questionIdPrefix:prefix,specification:","questionIdPrefix:prefix,permanentDevelopmentSlot:slot,seedDomain:[0,11337407],specification:");
scaffold=scaffold.replace("const generatedFingerprints=", "slots[slug]=slot;fs.writeFileSync(slotPath,JSON.stringify(slots,null,2)+'\\n');\nconst generatedFingerprints=");
scaffold=scaffold.replace('schemaVersion:1,slug,prefix,generatedAt:','schemaVersion:1,slug,prefix,permanentDevelopmentSlot:slot,seedDomain:[0,11337407],generatedAt:');
scaffold=scaffold.replace("'development/authoring/data.ts',", "'src/development/identity.ts','development/authoring/family-slots.json','development/authoring/data.ts',");
write('development/authoring/scaffold.mjs',scaffold);
write('development/authoring/serve.mjs',read('development/authoring/serve.mjs').replace(/const cacheRoot=.*?;/,"const cacheRoot='development/authoring/.vite-cache';").replaceAll('5195','5181'));
write('src/persistence/alpha-namespace.ts',read('src/persistence/alpha-namespace.ts').replace('registryOverride: boolean)',"registryOverride: boolean, developmentScope = '')").replace("'dev-authoring-' + run","'dev-authoring-' + encodeURIComponent(developmentScope) + '-' + run"));
write('src/foundation/ActivityHost.tsx',read('src/foundation/ActivityHost.tsx').replace('import.meta.env.DEV, !!registryOverride)','import.meta.env.DEV, !!registryOverride, location.pathname)'));
for(const file of ['canonical-identity.test.mjs','current-persistence.test.mjs','browser.mjs'])write('validation/component-fidelity/f1-correction/identity/'+file,read('validation/component-fidelity/f1/identity/'+file).replaceAll('acid-source-fixtures.json','acid-pre-correction-fixtures.json').replaceAll('f1-identity','f1-correction-identity'));
write('scripts/test-component-identity.mjs',read('scripts/test-component-identity.mjs').replace('f1/identity','f1-correction/identity').replace("'current-persistence.test.mjs'","'current-persistence.test.mjs','development-identity.test.mjs'"));
