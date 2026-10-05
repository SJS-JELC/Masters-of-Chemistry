import fs from 'node:fs';import path from 'node:path';const root=path.resolve(import.meta.dirname,'../../../..');
function edit(file,fn){const p=path.join(root,file);fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));}
const slots=JSON.parse(fs.readFileSync(path.join(root,'development/authoring/family-slots.json'),'utf8').replace(/^\\uFEFF/,''));
for(const [name,slot] of Object.entries(slots)){
const folder=name==='authoring-proof'?'development/authoring':`development/authoring/families/${name}`,relative=name==='authoring-proof'?'../../src/':'../../../../src/';
edit(folder+'/family.ts',s=>{
 s=`import {developmentCode,decodeDevelopmentCode,developmentSeed,developmentSeedCount,validateDevelopmentRef} from '${relative}development/identity.ts';\n`+s;
 s=s.replace(/const prefix = '[^']+';/,`export const proofSlot = ${slot};`);
 s=s.replace('s <= 0xffffffff','s < developmentSeedCount').replace("throw Error('Unsigned32 seed required')","throw Error('Bounded development seed required')");
 s=s.replace(/    questionId:\n      level === 1[\s\S]*?    seed: level === 1 \? 0 : seed,/,`    questionId: developmentCode(activityId, proofSlot, level, level === 1 ? 0 : seed),
    seed: level === 1 ? 0 : seed,`);
 s=s.replace('  const s = ref.seed;', '  validateDevelopmentRef(ref, proofSlot);\n  const s = ref.seed;');
 s=s.replace('questionIds: [`${prefix}-FIXED`]','questionIds: [proofRef(1, 0).questionId]').replace('return proofRef(s.level, s.seed);','return proofRef(s.level, developmentSeed(s.seed));');
 s=s.replace(/    if \(code === `\$\{prefix\}-FIXED`\)[\s\S]*?\n  \},\n\};/,`    try {
      const decoded = decodeDevelopmentCode(activityId, code.trim().toUpperCase());
      if (decoded.slot !== proofSlot) return null;
      const ref = proofRef(decoded.level, decoded.seed);
      return ref.questionId === code.trim().toUpperCase() ? ref : null;
    } catch {return null;}
  },
};`);
 return s;
});
}
edit('src/persistence/alpha-namespace.ts',s=>s+`\n/** DEV registry overrides cannot share production attempts, sessions or evidence. */
export function activityDatabaseName(course: string, run: string, development: boolean, registryOverride: boolean): string {
  return alphaDatabaseName(course, development && registryOverride ? 'dev-authoring-' + run : run);
}
`);
edit('src/foundation/ActivityHost.tsx',s=>s.replace("import { alphaDatabaseName }", "import { activityDatabaseName }").replace('alphaDatabaseName(course, run)','activityDatabaseName(course, run, import.meta.env.DEV, !!registryOverride)'));
edit('src/development/FoundationApp.tsx',s=>s.replace("alphaDatabaseName(course, 's1-' + run)","alphaDatabaseName(course, 'dev-controls-' + run)"));
