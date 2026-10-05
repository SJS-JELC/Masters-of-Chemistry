import '../check-output.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
const base=new URL('../../../',import.meta.url), source=new URL('../Masters-of-IGCSE-Chemistry/src/',base);
const hashes=[];
function read(rel){const value=fs.readFileSync(new URL(rel,source),'utf8');hashes.push({path:'apps/Masters-of-IGCSE-Chemistry/src/'+rel,sha256:crypto.createHash('sha256').update(value).digest('hex')});return value;}
function write(rel,text){const url=new URL(rel,base);fs.mkdirSync(new URL('.',url),{recursive:true});fs.writeFileSync(url,text);}
for(const [name,global,dataGlobal,fields] of [
 ['calorimetry','CalorimetryReviewCore','CalorimetryReviewData','C, examples, labels'],
 ['bond-enthalpy','BondEnthalpyReviewCore','BondEnthalpyData','generationMetadata, reactions']]){
 const data=read(`activities/${name}/data.js`), core=read(`activities/${name}/core.js`);
 const c={};vm.createContext(c);vm.runInContext(data,c);
 write(`src/chemistry/thermochemistry/${name}-data.js`,'// Source data extracted unchanged; checked SVGs retain original RDKit provenance.\nexport const data = '+JSON.stringify(c[dataGlobal])+';\n');
 const start=core.indexOf(`const { ${fields} }`), end=core.indexOf(`root.${global} =`);
 let body=core.slice(start,end).replace(`const { ${fields} } = root.${dataGlobal};`,`const { ${fields} } = data;`);
 const assignment=core.slice(end).match(/root\.\w+ = ([\s\S]*?);/)[1];
 write(`src/chemistry/thermochemistry/${name}-core.js`,`// Pure source generator: DOM/global installation removed; source algorithm preserved.\nimport {data} from './${name}-data.js';\n${body}\nexport const core = ${assignment};\n`);
}
for(const rel of ['assets/question-review.js','assets/generated-review.js','assets/numeric-mastery.js','assets/igcse-question-time.js','activities/calorimetry/app.js','activities/bond-enthalpy/app.js'])read(rel);
write('.artifacts/source-generation/thermochemistry/source-fingerprints.json',JSON.stringify(hashes,null,2)+'\n');
