import fs from 'node:fs';
const data=fs.readFileSync('src/activities/alevel/ph-titration-curves/bank.json','utf8');
fs.writeFileSync('src/activities/alevel/ph-titration-curves/bank.ts',"import type {TitrationRecord} from '../../../chemistry/titration-curve/types.ts';\nexport const bank:readonly TitrationRecord[]= "+JSON.stringify(JSON.parse(data).questions,null,2)+';\n');
