import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const workspace=resolve(import.meta.dirname,'../../../../..');
const original=resolve(workspace,'scripts/test_acid_progression_chemistry.js');
const content=readFileSync(original,'utf8');
const retained=content.slice(content.indexOf('let checks = 0;'));
writeFileSync(resolve(import.meta.dirname,'chemistry-reference.mjs'),`// Independent pupil-visible-data reconstruction from scripts/test_acid_progression_chemistry.js.\n// Original SHA256: ${createHash('sha256').update(content).digest('hex')}\n// Only loader changed; all independent assertions below retained unchanged.\nimport assert from 'node:assert/strict';\nimport {acidEngine as model} from '../../../src/activities/alevel/acid-base-calculations/engine.js';\nimport {acidData as data} from '../../../src/activities/alevel/acid-base-calculations/data.js';\n${retained}`);
