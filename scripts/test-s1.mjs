import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=['attempt','session','persistence'].flatMap(owner=>fs.readdirSync(path.join(project,'scripts/tests/legacy/s1',owner))
 .filter(name=>/\.test\.(?:mjs|js|ts)$/.test(name)).map(name=>path.join(project,'scripts/tests/legacy/s1',owner,name)));
if(files.length!==3)throw new Error('Expected each shared-domain owner to retain one meaningful test suite.');
// Source-equivalence inputs retain workspace-relative provenance paths.
const result=spawnSync(process.execPath,['--test',...files],{cwd:path.resolve(project,'../..'),stdio:'inherit'});
if(result.error)throw result.error;
process.exitCode=result.status??1;
