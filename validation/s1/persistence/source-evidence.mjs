import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
const project=new URL('../../../',import.meta.url),workspace=new URL('../../',project);
const sources=[
 ['apps/Masters-of-A-Level-Chemistry/src/assets/alevel-mastery.js','keys masters-alevel-results-v1 and masters-alevel-results-acid-v2; clean/cleanTiming/canonicalLeaf/evidenceFor preserves progression and alias'],
 ['apps/Masters-of-IGCSE-Chemistry/src/landing/progress.js','masters-igcse-results-v2, cleanTiming, grade validity, immutable append'],
 ['apps/Masters-of-IGCSE-Chemistry/src/assets/igcse-mastery-config.js','known leaf IDs and supported grades'],
 ['apps/Masters-of-IGCSE-Chemistry/src/assets/numeric-practice.js','result records retain family/assisted'],
 ['apps/Masters-of-IGCSE-Chemistry/src/activities/structure-and-bonding/app.js','result question ID and selfAssessed'],
 ['apps/Masters-of-IGCSE-Chemistry/src/activities/energetics-practical/app.js','result question ID'],
 ['apps/Masters-of-IGCSE-Chemistry/src/activities/energy-enthalpy/app.js','result strand'],
 ['apps/Masters-of-IGCSE-Chemistry/src/activities/dot-and-cross/app.js','result question ID and assisted false'],
 ['apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/assessment.js','drawing fingerprints, structural vs chemical completion revalidation; importer deferred S3/S4'],
 ['apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/content.js','classification source IDs (1) through (10), B units, C slots'],
];
const evidence=[];
for(const [path,reason]of sources){const bytes=await readFile(new URL(path,workspace));evidence.push({path,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,reason});}
await writeFile(new URL('./source-evidence.json',import.meta.url),JSON.stringify({checkedAt:new Date().toISOString(),readOnly:true,sources:evidence},null,2));
