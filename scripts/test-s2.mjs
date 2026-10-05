import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=[];
function find(directory){for(const item of fs.readdirSync(directory,{withFileTypes:true})){const file=path.join(directory,item.name);if(item.isDirectory())find(file);else if(/\.test\.(mjs|js|ts)$/.test(item.name))files.push(file);}}
find(path.join(project,'validation/s2'));
if(!files.length)throw Error('S2 must retain real activity and shared-boundary tests.');
const result=spawnSync(process.execPath,['--test',...files.sort()],{cwd:path.resolve(project,'../..'),stdio:'inherit'});
if(result.error)throw result.error;
process.exitCode=result.status??1;
