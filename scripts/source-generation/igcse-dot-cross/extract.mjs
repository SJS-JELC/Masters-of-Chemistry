import '../check-output.mjs';
/** Extract only immutable IGCSE content. Accepted shared engines are reused unchanged. */
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url),workspace=path.resolve(import.meta.dirname,'../../../../..');
const original=path.join(workspace,'apps/Masters-of-IGCSE-Chemistry/src/activities/dot-and-cross');
const project=path.join(workspace,'apps/Masters-of-Chemistry');
const Data=require(path.join(original,'data.js'));
const output=path.join(project,'src/activities/igcse/dot-and-cross/bank.js');
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,`/* Complete original 72-record IGCSE bank; no page runtime or A Level routes. */\nexport const bank=${JSON.stringify(Data.questions,null,2)};\n`);
const hash=value=>createHash('sha256').update(value).digest('hex');
const shared=['src/editors/dot-and-cross/DotCrossEditor.tsx','src/editors/dot-and-cross/editor.css','src/editors/dot-and-cross/index.ts','src/chemistry/dot-and-cross/core.js','src/chemistry/dot-and-cross/core.d.ts','src/chemistry/dot-and-cross/engine.ts','src/chemistry/dot-and-cross/layout.js','src/chemistry/dot-and-cross/layout.d.ts','src/chemistry/dot-and-cross/model.ts','src/chemistry/dot-and-cross/types.ts'];
fs.writeFileSync(path.join(project,'.artifacts/source-generation/igcse-dot-cross/source-fingerprints.json'),JSON.stringify({extractedAt:new Date().toISOString(),sources:['app.js','data.js','core.js','renderer.js','index.html','styles.css'].map(name=>({path:path.relative(workspace,path.join(original,name)).replaceAll('\\','/'),sha256:hash(fs.readFileSync(path.join(original,name)))})),bankSHA256:hash(JSON.stringify(Data.questions)),records:Data.questions.length,sharedBefore:shared.map(name=>({path:name,sha256:hash(fs.readFileSync(path.join(project,name)))}))},null,2));
console.log(`Extracted ${Data.questions.length} exact IGCSE records. Shared editor/engine unchanged.`);
