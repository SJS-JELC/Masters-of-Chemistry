import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspace = path.resolve(project, '../..');
const contract = JSON.parse(fs.readFileSync(path.join(project, 'project-contract.json'), 'utf8'));
const baselinePath = path.join(project, 'validation', 'original-app-baseline.json');
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function snapshot() {
  const files = {};
  for (const relativeRoot of contract.protectedRoots) {
    const root = path.resolve(workspace, relativeRoot);
    if (!root.startsWith(workspace + path.sep) || root === project) throw Error('Invalid protected root');
    function walk(directory) {
      for (const entry of fs.readdirSync(directory, {withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
        const full = path.join(directory, entry.name);
        const key = path.relative(workspace, full).split(path.sep).join('/');
        if (entry.isSymbolicLink()) files[key] = {type:'symlink',target:fs.readlinkSync(full)};
        else if (entry.isDirectory()) walk(full);
        else if (entry.isFile()) {
          let data;
          try { data=fs.readFileSync(full); } catch(error) {
            const stat=fs.statSync(full);
            // Windows cloud placeholders can be listed while their provider is offline.
            // Keep explicit metadata-only evidence; never claim a byte hash for unreadable files.
            files[key]={bytes:stat.size,mtimeMs:stat.mtimeMs,contentHashUnavailable:true,readError:error.code};
            continue;
          }
          files[key]={bytes:data.length,sha256:digest(data)};
        }
      }
    }
    walk(root);
  }
  return files;
}

const mode=process.argv[2] || 'check';
if (!['capture','check'].includes(mode)) throw Error('Usage: node scripts/protect-originals.mjs [capture|check]');
const files=snapshot();
if (mode==='capture') {
  if (fs.existsSync(baselinePath)) throw Error('Baseline already exists; refusing replacement');
  fs.mkdirSync(path.dirname(baselinePath), {recursive:true});
  fs.writeFileSync(baselinePath, JSON.stringify({schemaVersion:1,capturedAt:new Date().toISOString(),roots:contract.protectedRoots,files},null,2)+'\n');
  console.log(JSON.stringify({status:'CAPTURED',fileCount:Object.keys(files).length,baseline:baselinePath,metadataOnlyCount:Object.keys(files).filter(key=>files[key].contentHashUnavailable).length}));
} else {
  const baseline=JSON.parse(fs.readFileSync(baselinePath,'utf8'));
  const changed=[...new Set([...Object.keys(baseline.files),...Object.keys(files)])].filter(key=>JSON.stringify(baseline.files[key])!==JSON.stringify(files[key]));
  const result={status:changed.length?'FAIL':'PASS',checkedAt:new Date().toISOString(),fileCount:Object.keys(files).length,changed,metadataOnly:Object.keys(files).filter(key=>files[key].contentHashUnavailable)};
  fs.writeFileSync(path.join(project,'validation','original-app-check.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({...result,metadataOnly:undefined,metadataOnlyCount:result.metadataOnly.length}));
  if(changed.length) process.exitCode=1;
}
