import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const here=import.meta.dirname,project=path.resolve(here,'../../../..');
const source='src/editors/dot-and-cross/DotCrossEditor.tsx';
const bytes=fs.readFileSync(path.join(project,source));
if(fs.existsSync(path.join(here,'before.tsx.txt')))throw Error('Initial fix baseline already exists.');
fs.writeFileSync(path.join(here,'before.tsx.txt'),bytes);
fs.writeFileSync(path.join(here,'before.json'),JSON.stringify({checkedAt:new Date().toISOString(),jobId:'S5-FIX-DOT-CHARGE-TYPING',agentId:'A15',source,sha256:createHash('sha256').update(bytes).digest('hex'),diagnosis:'validation/s5/render-release/dot-typing-diagnosis.json',ownership:[source,'validation/s5/fixes/dot-charge-typing/']},null,2));
