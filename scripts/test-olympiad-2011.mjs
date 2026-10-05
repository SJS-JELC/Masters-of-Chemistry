import {suiteEvidenceFile} from './tests/legacy/test-evidence.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const project=path.resolve(import.meta.dirname,'..');
// Current scope tests and all substantive latest chemistry/reference suites.
// Historical fixed twelve-activity fixtures remain untouched and are replaced
// for this stage by the thirteen-registration and full revision-target gates.
const files=[
  'scripts/tests/olympiad-2011.test.ts',
  'scripts/test_revision_registration.mjs','scripts/test_active_question_time.mjs',
  'scripts/tests/legacy/s1/attempt/attempt.test.mjs',
  'scripts/tests/c3-regression.test.ts',
  'scripts/tests/legacy/s4/statistics/model.test.mjs',
];
const result=spawnSync(process.execPath,['--test',...files],{cwd:project,encoding:'utf8'});
const evidence=suiteEvidenceFile(import.meta.url,'unit-tests.txt');
fs.writeFileSync(evidence,(result.stdout||'')+'\n'+(result.stderr||''));
console.log(result.stdout||'');console.error(result.stderr||'');
if(result.status!==0)process.exitCode=result.status??1;
