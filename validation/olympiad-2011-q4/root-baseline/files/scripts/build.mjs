import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {writeRuntimeAliases} from './runtime-aliases.mjs';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const course of ['alevel','igcse']) {
  const result=spawnSync(process.execPath,[path.join(project,'node_modules/vite/bin/vite.js'),'build','--mode',course],{cwd:project,stdio:'inherit',env:process.env});
  if(result.status!==0) process.exit(result.status || 1);
  const output=path.join(project,'dist',course);
  if(!output.startsWith(project+path.sep)) throw Error('Build output outside project');
  fs.renameSync(path.join(output,`${course}.html`),path.join(output,'index.html'));
  writeRuntimeAliases(course);
}
