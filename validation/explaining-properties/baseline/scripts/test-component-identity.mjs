import path from 'node:path';import fs from 'node:fs';import {spawnSync} from 'node:child_process';
const project=path.resolve(import.meta.dirname,'..'),directory=path.join(project,'validation/component-fidelity/f1-correction/identity');
const files=['canonical-identity.test.mjs','current-persistence.test.mjs','development-identity.test.mjs'].map(file=>path.join(directory,file));files.push(path.join(project,'validation/s1/attempt/attempt.test.mjs'));
const result=spawnSync(process.execPath,['--test',...files],{cwd:project,encoding:'utf8'});
fs.writeFileSync(path.join(directory,'tests.log'),result.stdout+result.stderr);process.stdout.write(result.stdout);process.stderr.write(result.stderr);if(result.error)throw result.error;process.exitCode=result.status??1;
