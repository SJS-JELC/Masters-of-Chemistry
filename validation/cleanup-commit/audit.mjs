import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const project = path.resolve(import.meta.dirname, '../..');
const git = 'C:/Users/JELC/AppData/Local/GitHubDesktop/app-3.6.6/resources/app/git/cmd/git.exe';
const gitFiles = (...args) => execFileSync(git, ['-c', 'core.quotepath=false', 'ls-files', '-z', ...args], { cwd: project }).toString().split('\0').filter(Boolean);
const tracked = gitFiles();
const untracked = gitFiles('--others', '--exclude-standard');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const counts = {};
for (const file of untracked) { const key = file.split('/').slice(0, 3).join('/'); counts[key] = (counts[key] ?? 0) + 1; }
const duplicates = untracked.filter(file => /-Wisteria(?=\.[^/]+$)/i.test(file)).map(file => {
  const canonical = file.replace(/-Wisteria(?=\.[^/]+$)/i, '');
  const sourceSha256 = hash(path.join(project, file));
  const canonicalSha256 = fs.existsSync(path.join(project, canonical)) ? hash(path.join(project, canonical)) : null;
  return { file, canonical, sourceSha256, canonicalSha256, identical: sourceSha256 === canonicalSha256, bytes: fs.statSync(path.join(project, file)).size };
});
const temporaryNames = fs.readdirSync(project).filter(name => name === '.browser' || /^\..*-(?:tmp|temp)$/.test(name) || /^\.u0[35]tmp$/.test(name) || /^btmp-/.test(name) || /^\.npm-cache-/.test(name));
const candidates = [...temporaryNames, 'validation/s4/review-browser-startup/cache-fixed', 'validation/explaining-properties/independent-review'].filter(file => fs.existsSync(path.join(project, file))).flatMap(file => file.endsWith('independent-review') ? fs.readdirSync(path.join(project,file)).filter(name => /^ebp-review-/.test(name)).map(name => `${file}/${name}`) : [file]);
function findNested(relative) {
  for (const entry of fs.readdirSync(path.join(project, relative), {withFileTypes:true})) {
    if (!entry.isDirectory() || entry.isSymbolicLink()) continue;
    const child = `${relative}/${entry.name}`;
    if (['.browser-temp','browser-temp','.bt','vite-cache'].includes(entry.name) || /^playwright_.*_profile-/.test(entry.name)) candidates.push(child);
    else if (!['before','baseline','root-baseline','node_modules','cleanup-commit'].includes(entry.name) && !/^ebp-review-/.test(entry.name)) findNested(child);
  }
}
findNested('validation');
const uniqueCandidates = [...new Set(candidates)].filter(file => !candidates.some(parent => parent !== file && file.startsWith(parent+'/')));
const temporary = uniqueCandidates.map(relative => {
  let bytes = 0, files = 0; const links = [], extensions = {}, sample = [];
  const visit = (file) => {
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink()) { links.push(path.relative(project, file)); return; }
    if (stat.isDirectory()) { for(const name of fs.readdirSync(file)) visit(path.join(file,name)); return; }
    files++; bytes += stat.size; const extension=path.extname(file) || '(none)'; extensions[extension]=(extensions[extension]??0)+1;
    if(sample.length<5)sample.push(path.relative(project,file));
  };
  visit(path.join(project,relative));
  return {relative,bytes,files,links,tracked:tracked.filter(file => file === relative || file.startsWith(relative+'/')),extensions,sample};
});
const sourceFiles = [...new Set([...tracked, ...untracked].filter(file => /^(src|public|scripts|development)\//.test(file)))].filter(file=>fs.existsSync(path.join(project,file)));
const sourceFingerprint = crypto.createHash('sha256');
for(const file of sourceFiles.sort())sourceFingerprint.update(`${file}\0${hash(path.join(project,file))}\n`);
const result = { auditedAt:new Date().toISOString(),untrackedCount:untracked.length,groups:Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([group,count])=>({group,count})),duplicates,temporary,sourcePreservation:{fileCount:sourceFiles.length,sha256:sourceFingerprint.digest('hex')} };
fs.writeFileSync(path.join(import.meta.dirname,'audit.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({untrackedCount:result.untrackedCount,duplicates,temporary:temporary.map(({relative,bytes,files,links,tracked,sample})=>({relative,bytes,files,links,tracked,sample})),sourcePreservation:result.sourcePreservation},null,2));
