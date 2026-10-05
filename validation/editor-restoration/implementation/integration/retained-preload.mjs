/** Retained assertions run unchanged; only their generated-report destination moves. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {syncBuiltinESMExports} from 'node:module';
const project=path.resolve(import.meta.dirname,'../../../..');
const output=path.join(import.meta.dirname,'retained-ports');
const originalWrite=fs.writeFileSync,originalMkdir=fs.mkdirSync;
const writes=[];
function redirect(file){
  if(typeof file==='number')return file;
  const absolute=path.resolve(file instanceof URL?fileURLToPath(file):String(file));
  const relative=path.relative(project,absolute).replaceAll('\\','/');
  if(!/^validation\/(?:s[0-5]|landing-restoration)(?:\/|$)/.test(relative))return file;
  const target=path.resolve(output,relative);
  if(!target.startsWith(output+path.sep))throw Error('Invalid retained-report destination');
  writes.push({original:relative,redirected:path.relative(project,target).replaceAll('\\','/')});
  return target;
}
fs.writeFileSync=function(file,...args){const target=redirect(file);if(target!==file)originalMkdir(path.dirname(target),{recursive:true});return originalWrite(target,...args);};
fs.mkdirSync=function(file,...args){return originalMkdir(redirect(file),...args);};
for(const name of ['unlinkSync','rmSync','renameSync']) {
  const original=fs[name];fs[name]=function(file,...args){if(redirect(file)!==file)throw Error('Retained evidence removal/rename forbidden: '+file);return original(file,...args);};
}
syncBuiltinESMExports();
process.on('exit',()=>{if(writes.length){originalMkdir(output,{recursive:true});originalWrite(path.join(output,`write-bindings-${process.pid}.json`),JSON.stringify({method:'Filesystem destination binding only; retained assertions/imports unchanged',writes},null,2)+'\n');}});
