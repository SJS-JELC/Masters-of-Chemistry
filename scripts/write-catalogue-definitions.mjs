import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(fs.readFileSync(path.join(project,'resources/source-generation/inventory/coverage-manifest.json'),'utf8'));
const titles={
 'alevel/acid-base-calculations':'Acid–base calculations','alevel/electrons-bonding':'Electrons and bonding','alevel/electron-configurations':'Electron configurations','alevel/dot-and-cross':'Dot-and-cross diagrams','alevel/ph-titration-curves':'pH titration curves','alevel/c3l6-organic-reactions':'A Class of their Own',
 'igcse/calorimetry':'Calorimetry','igcse/bond-enthalpy':'Bond enthalpy','igcse/structure-and-bonding':'Structure and bonding','igcse/dot-and-cross':'Dot-and-cross diagrams','igcse/energy-enthalpy':'Energy and enthalpy','igcse/energetics-practical':'Energetics practical'
};
const definitions=manifest.activities.map(a=>({id:a.id,course:a.course,strand:a.strand,title:titles[a.id],source:a.sourceHashes.map(s=>({path:s.path,sha256:s.sha256,symbolOrSection:'activity-owned source provenance; executable entries are retained separately in the coverage manifest'})),
 gems:Object.entries(a.masteryRegistrations).map(([key,setting])=>{
  const id=setting.leafId || key;
  const levels=setting.availableGrades || a.supportedLevels;
  const legacySourceKeys=a.course==='igcse'?['masters-igcse-results-v2']:['masters-alevel-results-v1','masters-alevel-results-acid-v2'];
  return {id,topicId:id.slice(0,id.lastIndexOf('-')),label:setting.label || (key==='dot-and-cross-ionic'?'Ionic bonding':key==='dot-and-cross-covalent'?'Covalent bonding':titles[a.id]),supportedLevels:levels,
   mastery:{gemId:id,supportedLevels:levels.map(level=>({level,halfLife:setting.halfLives[level],label:setting.levelLabels?.[level] || (a.course==='igcse'?({1:'Grade 5–6',2:'Grade 7–8',3:'Grade 9'})[level]:`Level ${level}`)})),threshold:a.masteryThreshold,comparison:'strictly-greater',historicalAliases:id==='l6-t2-1-3'?['l6-t2-1-4']:[],legacySourceKeys,...(setting.progressionVersion?{activeProgressionVersion:setting.progressionVersion}:{})}};
 })}));
// Future approved authoring metadata is separate from the frozen migration inventory.
// Regeneration changes metadata only; it does not enable a provider or alter algorithms.
const authored=JSON.parse(fs.readFileSync(path.join(project,'src/catalogue/authored-metadata.json'),'utf8'));
if(!Array.isArray(authored.activities)||!Array.isArray(authored.gems)||Object.keys(authored).some(key=>!['activities','gems'].includes(key)))throw Error('Invalid authored metadata document');
for(const activity of authored.activities){
 if(!activity||definitions.some(item=>item.id===activity.id)||activity.strand!=='curriculum'||!['alevel','igcse'].includes(activity.course)||typeof activity.id!=='string'||!activity.id.startsWith(activity.course+'/')||/rocket|c3l6/i.test(activity.id)||!Array.isArray(activity.gems))throw Error('Invalid or duplicate authored activity');
 definitions.push(activity);
}
for(const addition of authored.gems){
 const activity=definitions.find(item=>item.id===addition.activityId);
 if(!activity||activity.strand!=='curriculum'||!addition.gem||Object.keys(addition).some(key=>!['activityId','gem'].includes(key)))throw Error('Invalid authored gem metadata');
 activity.gems.push(addition.gem);
}
const gems=definitions.flatMap(activity=>activity.gems),ids=gems.map(gem=>gem.id);
if(ids.some(id=>typeof id!=='string'||/rocket|c3l6/i.test(id))||new Set(ids).size!==ids.length)throw Error('Invalid or duplicate canonical gem ID');
for(const gem of gems){if(!Array.isArray(gem.supportedLevels)||!gem.supportedLevels.length||new Set(gem.supportedLevels).size!==gem.supportedLevels.length||gem.supportedLevels.some(level=>![1,2,3].includes(level))||gem.mastery?.gemId!==gem.id||JSON.stringify(gem.mastery.supportedLevels.map(setting=>setting.level).sort())!==JSON.stringify([...gem.supportedLevels].sort()))throw Error('Inconsistent canonical supported levels');}
const content=`// Regenerate from accepted source inventory: node scripts/write-catalogue-definitions.mjs\n// Metadata is not an enabled provider; createRegistry registers only explicitly supplied adapters.\nimport type {ActivityDefinition} from './registry.ts';\nimport { olympiad2011Definition } from './olympiad-2011-definition.ts';\nexport const activityDefinitions = ${JSON.stringify(definitions,null,2).slice(0,-1)},\n  olympiad2011Definition\n] as const satisfies readonly ActivityDefinition[];\n`;
const target=path.join(project,'src/catalogue/definitions.ts');
if(process.argv.includes('--check')) {
 if(fs.readFileSync(target,'utf8')!==content) throw Error('Catalogue differs from accepted source manifest');
 console.log(JSON.stringify({status:'PASS',activities:definitions.length+1,gems:definitions.reduce((n,a)=>n+a.gems.length,0)}));
} else {fs.writeFileSync(target,content);console.log(JSON.stringify({status:'GENERATED',activities:definitions.length+1}));}
