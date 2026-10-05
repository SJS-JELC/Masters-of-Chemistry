import {pathToFileURL} from 'node:url';import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'../../../..');
const owned=[
'src/content/canonical-identity.ts','src/content/canonical-fixed-ids.json',
...['alevel/acid-base-calculations','alevel/electrons-bonding','alevel/electron-configurations','alevel/ph-titration-curves','alevel/dot-and-cross','igcse/dot-and-cross','igcse/energy-enthalpy','igcse/energetics-practical','igcse/structure-and-bonding','igcse/calorimetry','igcse/bond-enthalpy'].map(f=>'src/activities/'+f+'/provider.ts'),
'src/activities/alevel/acid-base-calculations/identity.ts','src/activities/alevel/acid-base-calculations/engine.js','src/activities/alevel/acid-base-calculations/engine.d.ts','src/activities/alevel/acid-base-calculations/index.ts',
'src/activities/alevel/dot-and-cross/marking.ts','src/activities/igcse/dot-and-cross/marking.ts',
'src/foundation/ProductionFoundation.tsx','src/foundation/ActivityHost.tsx','src/foundation/OlympiadHost.tsx','src/development/FoundationApp.tsx',
'src/persistence/alpha-namespace.ts','src/persistence/repository.ts','src/persistence/validation.ts','src/persistence/index.ts','src/persistence/legacy/plan.ts',
'src/compatibility/import.ts','src/compatibility/links.ts','src/compatibility/LegacyImportView.tsx','src/compatibility/routes.ts',
'src/shell/navigation-view.ts','src/landing/progress.ts','src/ui/teacher-catalogue.ts','scripts/runtime-aliases.mjs'];
const prettier=await import(pathToFileURL(path.join(root,'node_modules/prettier/index.mjs')).href);
for(const f of owned){const file=path.join(root,f);const config=await prettier.resolveConfig(file);fs.writeFileSync(file,await prettier.format(fs.readFileSync(file,'utf8'),{...config,filepath:file}));}
const baseline=JSON.parse(fs.readFileSync(path.join(root,'validation/component-fidelity/f1/baseline.json'),'utf8'));
const before=new Map(baseline.inputs.map(i=>[i.path,i]));
const manifest=owned.map(f=>({path:f,beforeSha256:before.get(f)?.sha256??null,afterSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex'),sourceDiffAvailable:false,change:before.has(f)?'modified':'new'}));
fs.writeFileSync(path.join(import.meta.dirname,'changed-paths.json'),JSON.stringify(manifest,null,2));
// Pure source banks/chemistry remain byte-exact: compare every unaffected activity data/core/bank source against frozen baseline.
const unchanged=baseline.inputs.filter(i=>/^src\/(?:activities|chemistry)\//.test(i.path)&&!owned.includes(i.path));
for(const f of unchanged)if(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f.path))).digest('hex')!==f.sha256)throw Error('Unexpected source change: '+f.path);
fs.writeFileSync(path.join(import.meta.dirname,'source-preservation.json'),JSON.stringify({checkedAt:new Date().toISOString(),count:unchanged.length,status:'PASS',paths:unchanged.map(i=>i.path)},null,2));
