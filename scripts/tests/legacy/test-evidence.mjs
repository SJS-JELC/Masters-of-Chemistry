import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const project=fileURLToPath(new URL('../../../',import.meta.url));
// Generated reports remain inside the project, outside retained test fixtures.
// Each process owns its directory so concurrent runs cannot overwrite each other.
export function suiteEvidenceFile(suiteUrl,name){
  const suite=createHash('sha256').update(suiteUrl).digest('hex').slice(0,16);
  const relative=path.relative(project,fileURLToPath(suiteUrl)).replaceAll('\\','/');
  const owner=relative.replace(/^scripts\/tests\/legacy\//,'').replace(/\.[^.]+$/,'');
  const directory=path.join(project,'.artifacts','tests',owner,String(process.pid),suite);
  fs.mkdirSync(directory,{recursive:true});
  const target=path.resolve(directory,name);
  if(!target.startsWith(directory+path.sep))throw Error('Test output must remain inside its suite directory');
  return target;
}
