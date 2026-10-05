import fs from 'node:fs';
let s=fs.readFileSync('../../scripts/test_ph_titration_curves.js','utf8');
s=s.replace("'use strict';\nconst test=require('node:test'),assert=require('node:assert/strict');\nconst C=require('../apps/Masters-of-A-Level-Chemistry/src/activities/ph-titration-curves/core');\nconst D=require('../apps/Masters-of-A-Level-Chemistry/src/activities/ph-titration-curves/data');", "import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport * as C from '../../../src/chemistry/titration-curve/core.js';\nimport {bank} from '../../../src/activities/alevel/ph-titration-curves/bank.ts';\nconst D={questions:bank};");
fs.writeFileSync('validation/s3/titration/source-chemistry.test.mjs',s);
