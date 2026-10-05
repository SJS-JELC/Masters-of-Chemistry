import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const here=import.meta.dirname,project=path.resolve(here,'../../../..');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const owned=[
 'src/shell/CourseShell.tsx','src/shell/QuestionChrome.tsx','src/ui/QuestionLevelPill.tsx',
 'src/styles/platform.css','src/ui/QuestionPlayer.tsx','src/ui/DotCrossPlayer.tsx',
 'src/foundation/OlympiadHost.tsx','src/activities/olympiad/c3l6/C3L6View.tsx',
 'src/activities/olympiad/c3l6/c3l6.css',
];
const verification=JSON.parse(fs.readFileSync(path.join(here,'verification.json'),'utf8'));
if(verification.status!=='PASS')throw Error('Current verification has not passed.');
const audit=JSON.parse(fs.readFileSync(path.join(project,'validation/question-chrome/audit/presentation/source-inventory.json'),'utf8'));
const protectedSources=audit.sources.filter(row=>row.path.startsWith('apps/Masters-of-IGCSE-Chemistry')||row.path.startsWith('apps/Masters-of-A-Level-Chemistry'));
const immutable=[...audit.unchangedRuntimeBoundaries,...protectedSources];
const mismatches=immutable.filter(row=>hash(path.resolve(project,'../..',row.path))!==row.sha256).map(row=>row.path);
if(mismatches.length)throw Error('Immutable source mismatch: '+mismatches.join(', '));
const priorScript=fs.readFileSync(path.join(here,'verify.mjs'),'utf8')
 .replace("await run('titration-editor','alevel','alevel/ph-titration-curves',2);","await run('titration-editor','alevel','alevel/ph-titration-curves',1);")
 .replace("await run('practical-title','igcse','igcse/energetics-practical',2);","await run('practical-title','igcse','igcse/energetics-practical',1);")
 .replace("  if(id==='electron-editor')await page.locator('.ec-reference').waitFor();\n",'')
 .replace("  if(id==='titration-editor')await page.locator('.titration-workspace').waitFor();\n",'')
 .replace("  await page.waitForFunction(()=>[...document.images].every(image=>image.complete&&image.naturalWidth>0));\n",'');
fs.writeFileSync(path.join(here,'unsupported-fixture-script-reconstruction.mjs'),priorScript);
const handover={
 runId:'QUESTION-CHROME-20261003',jobId:'H1-PRESENTATION',agentId:'H02',status:'PASS',completedAt:new Date().toISOString(),
 requestedModel:'gpt-6.1-sol',requestedEffort:'high',effectiveModel:null,effectiveEffort:null,usage:null,
 changedFiles:owned.map(file=>({path:file,sha256:hash(path.join(project,file)),previousSha256:audit.sources.find(row=>row.path==='apps/Masters-of-Chemistry/'+file)?.sha256??null})),
 changes:[
  'Optional CourseShell questionHeader scopes a shared QuestionChrome React context; actual question mode has one navy molecule/C3 masthead, original pink badge, eagle and left arrow using existing onSelectView(home). Course navigation/sidebar omitted from question DOM; generic setup retains Home.',
  'QuestionLevelPill uses exact three A Level and three IGCSE labels, specified outlines and cyan Olympiad. Pill appears above a meaningful specific question title/instructions.',
  'Scoped equal-title suppression compares current metadata subtopic to displayed title only; accessible articles use aria-label if their repeated heading is absent. Source-backed trailing review-code or exact ref suffixes are removed from rendered titles without changing data.',
  'QuestionPlayer/DotCrossPlayer drop duplicate IDs/levels, generic Question eyebrow, Pause and routine successful-save notices; explanatory timing mentions removed. Teacher read-only, frozen-answer semantics, feedback/rubrics/check/next/hints/reveal and save failures with Retry remain.',
  'OlympiadHost JSX has registry-derived C3L6 organic reactions title and existing C3L6 2012 Q2 badge, explicit teacher control, substantive feedback and failed-save Retry. Its loading/save/command/guard lifecycle is unchanged. C3 top generic title/kicker removed, instructional introduction, all source headings/stage controls/history/errata/editor untouched.',
 ],
 interfaces:{questionHeader:'Readonly<{subtopic:string;questionId?:string}>; supplied by foreman ActivityHost exact target/teacher resolver.',navigation:'Eagle/back use onSelectView(home); existing host callback remains responsible for checkpoint/failed-save guard.',presentationHelpers:['useQuestionChrome','repeatsQuestionSubtopic','questionDisplayTitle'],pill:'Course+Level or explicit olympiad; no curriculum level introduced to C3.'},
 validation:{
  command:'node apps/Masters-of-Chemistry/validation/question-chrome/implementation/presentation/verify.mjs',
  evidence:'verification.json',typecheck:'PASS',browserChecks:verification.checks.length,pageErrors:verification.pageErrors.length,failures:verification.failures.length,
  titleFixtures:verification.identityTitleFixtures,headingFixtures:verification.subtopicSuppressionFixtures,
  computedPink:'Exact #ff5ecb colour, rgba(255,94,203,.46) outline and .1 background, 700 11px Comfortaa, .08em tracking, 4px 10px padding, 999px radius.',
  checks:'All six curriculum labels, Olympiad intro/part a, source-ref header identity, no DOM course nav/sidebar/duplicate metadata, no missing aria-labelledby targets, no visible Pause/Resume/clock/routine save/revision summary, two guarded map buttons, no page overflow at 390px/1440px.',
  immutable:{runtimeBoundaryFiles:audit.unchangedRuntimeBoundaries.length,originalHeaderReferenceFiles:protectedSources.length,combinedFiles:immutable.length,mismatches,scopeExplanation:'verification.json immutableFiles covers only the 71 runtime boundary files; this handover also independently rehashes five read-only original header/style reference sources, giving 76 combined.'},
  screenshots:verification.checks.map(row=>row.screen),
  visualReview:{status:'PASS',reviewer:'H02',method:'Actual captured PNGs opened with view_image',representativeScreens:['alevel-level-1','alevel-level-2','igcse-grade-2','igcse-grade-3','dot-mobile','electron-editor','titration-editor','energy-editor','practical-title','rubric-multipart','teacher','c3-mobile','c3-mobile-part-a'],observations:['Single right pink badge and left eagle/brand subtitle visible on desktop and narrow screens.','Long rubric/scientific titles wrap without losing instructions.','Dot palette/surface and titration/orbital controls retain accepted geometry/styles; no editor file changed.','C3 scientific introduction, source reaction diagrams and stage controls remain visible; no artificial mastery/level label.']},
 },
 boundedFixtureCorrection:{rawEvidence:'verification-unsupported-fixtures.json',screens:['screens/titration-editor-failure.png','screens/practical-title-failure.png'],cause:'Two new harness routes requested unsupported Level 1; production correctly stayed in setup with Home. Providers/registrations only support 2/3.',correction:'Use registered Level 2; no runtime fix required.',scriptEvidence:'unsupported-fixture-script-reconstruction.mjs',scriptProvenance:'Prior failing harness reconstructed by reversing the exact two fixture-level corrections and three added rendering-readiness waits; raw failure JSON/screenshots retained unchanged.'},
 limitations:['Worker headless source-browser presentation proof does not substitute for foreman lifecycle/timing/failure/production build gates or root rendered acceptance.','No physical mobile/native screen reader claim.','No build/dependency/publication command executed by worker.','A workspace Git diff was unavailable; source fingerprints and explicitly owned file inventory are retained.'],
 remainingWorkerWork:[],foremanRequired:'Aggregate final host lifecycle/source integrity/build/regression and root acceptance gates.',
};
fs.writeFileSync(path.join(here,'handover.json'),JSON.stringify(handover,null,2)+'\n');
const completion={stableId:'H1-PRESENTATION',agentId:'H02',status:'PASS',outputPath:'apps/Masters-of-Chemistry/validation/question-chrome/implementation/presentation/handover.json',confidence:0.97,reason:null,validation:{evidence:'apps/Masters-of-Chemistry/validation/question-chrome/implementation/presentation/verification.json',typecheck:'PASS',browserChecks:16,immutableRuntimeFiles:audit.unchangedRuntimeBoundaries.length,originalHeaderReferenceFiles:protectedSources.length,combinedFiles:immutable.length,mismatches:0},usage:null};
fs.writeFileSync(path.join(here,'completion.json'),JSON.stringify(completion,null,2)+'\n');
console.log(JSON.stringify(completion));
