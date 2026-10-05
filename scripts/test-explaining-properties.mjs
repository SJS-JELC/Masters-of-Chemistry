import {spawnSync} from 'node:child_process';
import path from 'node:path';
const project=path.resolve(import.meta.dirname,'..');
// Current regression ports supplement frozen S0-S5 migration fixtures, which retain
// source-ID/history expectations superseded by separately accepted identity work.
const files=[
 'scripts/tests/explaining-properties.test.ts',
 'scripts/tests/current-catalogue-boundary.test.ts',
 'scripts/tests/olympiad-2011.test.ts',
 ...['action-state','central-attempt','canonical-identity','current-persistence','numeric-working'].map(name=>`validation/ui-consistency/u2/independent/${name}.test.mjs`),
 'scripts/test_revision_registration.mjs','scripts/test_active_question_time.mjs',
];
const result=spawnSync(process.execPath,['--test',...files],{cwd:project,stdio:'inherit'});
if(result.error)throw result.error;if(result.status!==0)process.exitCode=result.status??1;
