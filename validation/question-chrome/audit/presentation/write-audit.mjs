import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve('apps/Masters-of-Chemistry');
const out = path.join(root, 'validation/question-chrome/audit/presentation');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sourcePaths = [
  'apps/Masters-of-IGCSE-Chemistry/src/assets/shared-theme.css',
  'apps/Masters-of-A-Level-Chemistry/src/activities/molecule-builder/index.html',
  'apps/Masters-of-A-Level-Chemistry/src/activities/molecule-builder/styles.css',
  'apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/index.html',
  'apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/activity.css',
  'apps/Masters-of-Chemistry/src/shell/CourseShell.tsx',
  'apps/Masters-of-Chemistry/src/styles/platform.css',
  'apps/Masters-of-Chemistry/src/ui/QuestionPlayer.tsx',
  'apps/Masters-of-Chemistry/src/ui/DotCrossPlayer.tsx',
  'apps/Masters-of-Chemistry/src/ui/dot-cross-player.css',
  'apps/Masters-of-Chemistry/src/foundation/ActivityHost.tsx',
  'apps/Masters-of-Chemistry/src/foundation/OlympiadHost.tsx',
  'apps/Masters-of-Chemistry/src/contracts/identity.ts',
  'apps/Masters-of-Chemistry/src/contracts/question.ts',
  'apps/Masters-of-Chemistry/src/catalogue/definitions.ts',
  'apps/Masters-of-Chemistry/src/activities/olympiad/c3l6/C3L6View.tsx',
  'apps/Masters-of-Chemistry/src/activities/olympiad/c3l6/c3l6.css',
  'apps/Masters-of-Chemistry/src/activities/olympiad/c3l6/content.ts',
  'apps/Masters-of-Chemistry/src/activities/olympiad/c3l6/source-bank.ts',
];
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => entry.isDirectory() ? walk(path.join(dir,entry.name)) : [path.join(dir,entry.name)]);
const immutablePaths = [
  ...walk(path.join(root,'src/editors')),
  ...walk(path.join(root,'src/chemistry')),
  ...walk(path.join(root,'src/landing')),
  path.join(root,'src/activities/olympiad/c3l6/policy.ts'),
  path.join(root,'src/activities/olympiad/c3l6/qualification.ts'),
  path.join(root,'src/activities/olympiad/c3l6/qualification.json'),
  path.join(root,'src/activities/olympiad/c3l6/bank.json'),
];
const inventory = {
  runId:'QUESTION-CHROME-20261003',jobId:'H0-PRESENTATION',agentId:'H02',createdAt:new Date().toISOString(),
  sources:sourcePaths.map(file=>({path:file,sha256:hash(file),bytes:fs.statSync(file).size})),
  unchangedRuntimeBoundaries:immutablePaths.map(file=>({path:path.relative(process.cwd(),file).replaceAll('\\','/'),sha256:hash(file)})),
};
fs.writeFileSync(path.join(out,'source-inventory.json'),JSON.stringify(inventory,null,2)+'\n');
const snippets = [
  {path:sourcePaths[0],start:123,end:130},
  {path:sourcePaths[1],start:17,end:20},
  {path:sourcePaths[2],start:1,end:2},
  {path:sourcePaths[2],start:25,end:35},
  {path:sourcePaths[3],start:2,end:7},
  {path:sourcePaths[4],start:142,end:145},
].map(item=>({ ...item,sha256:hash(item.path),text:fs.readFileSync(item.path,'utf8').split(/\r?\n/).slice(item.start-1,item.end).join('\n')}));
fs.writeFileSync(path.join(out,'original-source-snippets.json'),JSON.stringify(snippets,null,2)+'\n');
const proposal = {
  runId:inventory.runId,jobId:inventory.jobId,agentId:inventory.agentId,stage:'H0',status:'AUDIT_ONLY',
  runtime:{requestedModel:'gpt-6.1-sol',requestedEffort:'high',effectiveModel:null,effectiveEffort:null,usage:null},
  sourceFidelity:{
    badge:{source:sourcePaths[0],line:125,selector:'.header-question-code.header-question-code',declarations:'display:inline-flex;align-items:center;min-height:28px;padding:4px 10px;border:1px solid rgba(255,94,203,.46);border-radius:999px;background:rgba(255,94,203,.1);color:#ff5ecb;font:700 11px/1.3 Comfortaa,sans-serif;letter-spacing:.08em;white-space:nowrap',implementation:'Copy declarations verbatim into the new scoped header CSS. Responsive containment may wrap its parent row; the badge itself remains the original pill.'},
    masthead:{sources:sourcePaths.slice(1,5),paper:'#080a1d',ink:'#f7f7ff',muted:'#a9afce',line:'rgba(172,182,255,.19)',cyan:'#55f6ff',brandMark:'52 by 56px, eagle 31 by 40px, 15px radius, green translucent outline/background',header:'Flex row, 14px gap, 24px vertical padding, thin line border; C3 overrides to 20px and right arrow to 40 by 40px, font-size 23px.',instruction:'Transfer only masthead values into question scope. Do not import legacy styles globally or copy tool/editor rules.'},
  },
  ownership:{
    H02:['src/shell/CourseShell.tsx','src/shell/QuestionChrome.tsx (new)','src/ui/QuestionLevelPill.tsx (new)','src/styles/platform.css','src/ui/QuestionPlayer.tsx','src/ui/DotCrossPlayer.tsx','src/foundation/OlympiadHost.tsx (chrome JSX only)','src/activities/olympiad/c3l6/C3L6View.tsx (header only)','src/activities/olympiad/c3l6/c3l6.css (header only)','validation/question-chrome/presentation/**'],
    foreman:['src/foundation/ActivityHost.tsx (whole file)','src/foundation/question-heading.ts (new metadata resolver and tests)','Lifecycle/test harness/build/gates and aggregates'],
    excluded:['src/editors/**','src/chemistry/**','src/landing/**','provider/bank/marking files','C3L6 policy/qualification/content/source assets','legacy sibling runtime and browser stores','root contracts and accepted evidence'],
  },
  interface:{
    CourseShell:'Optional questionHeader: Readonly<{subtopic:string;questionId?:string}>. Its presence opts into question chrome, removes course-view nav and activity sidebar from DOM, and supplies metadata to a QuestionChrome React context. Existing onSelectView(home) is the only eagle/back callback; host owns safe checkpoint/navigation.',
    context:'QuestionChrome exports useQuestionChrome() returning current metadata or undefined, scoped to the shell. QuestionPlayer/DotCrossPlayer consume context solely to suppress equal repeated activity titles. No host-owned player props change required.',
    pill:'QuestionLevelPill props course: Course, level?: Level, olympiad?: boolean. Noninteractive element; curriculum labels derive from the actual rendered QuestionRef. Olympiad ignores level, uses cyan OLYMPIAD QUESTION.',
    identity:'Student metadata must use attempt.target.gemId plus registry gem label; teacher metadata must resolve actual previewQuestion.ref through explicit provider identity/group mappings, not selected teacher activity/dropdown or DOM text. Display questionId directly from shownQuestion.ref.',
    olympiad:'OlympiadHost derives subtopic from the existing registered challenge title C3L6 organic reactions and uses exact existing display identity C3L6 2012 Q2; there is no curriculum QuestionRef or artificial level. Keep completion and drawings in existing separate repository.',
  },
  presentationChanges:[
    'Question masthead left: eagle button, MASTERS OF CHEMISTRY, course - actual subtopic in a single subtitle. Right: original pink question badge once, left arrow button. No mode/course badge or Home word label on question screens.',
    'Question chrome navigation is omitted structurally for student, teacher and Olympiad question screens. Setup/statistics/import/development surfaces continue the legacy CourseShell path unless host passes questionHeader.',
    'Shared pill sits first in question pane, before a meaningful question title or context/instructions. IGCSE labels use U+2013 en dash and specified yellow/green/purple outline colours. A Level labels use LEVEL 1/2/3 QUESTION; Olympiad cyan.',
    'Remove generic Question eyebrow and duplicate QuestionPlayer code/level block. Suppress question.title only if it repeats the metadata subtopic (case/whitespace/punctuation normalisation); retain specific template, material, molecule or instruction headings.',
    'DotCrossPlayer removes review-id and dot-level spans and its Pause button; its scoped title/pill remain above context. Keep workspaceAside, editor ResponseControl, actions, help, answer dialog, palette and geometry untouched.',
    'C3L6 top generic kicker and repeated activity h1 are removed; retain its scientific introduction sentence and read-only notice. All intro functional-group headings, Part a/b/c titles, selected Structure heading, stage buttons, history/errata, checks, restart confirmation and chemistry remain intact.',
    'QuestionPlayer and DotCrossPlayer remove Pause and display-only time/timing wording from explanatory read-only/correction/frozen-answer messages. Keep the first-response semantics and educational messages. Host separately removes clock state/interval, pauses/resume notices, practice strip, status/summary and visible development timing.',
    'Show save failures as an alert with Retry. Ordinary successful save announcements can be omitted in the cohesive question presentation. Preserve independent errors/loading, teacher read-only and substantive C3 command feedback; avoid saved result count or routine revision status.',
    'OlympiadHost keeps callbacks, queues, guard, repositories and policy transitions unchanged. Replace only CourseShell props and routine wrapper chrome. Keep explicit teacher preview control, preserve meaningful command feedback and errors, remove routine challenge-save success notice. Save failure remains visible with Retry.',
  ],
  accessibilityResponsive:{
    headings:'Maintain a real accessible heading for the masthead subtopic; articles whose duplicate h2 is suppressed get aria-label=question.title instead of pointing to a missing element. Do not hide scientific headings with broad h1/h2 CSS selectors.',
    buttons:'Eagle and arrow are native buttons with Back to course map accessible labels and 44px touch hit areas; call the same guarded route. Brand eagle image may be decorative inside named button.',
    width:'min-width:0 on flex title/row; overflow-wrap:anywhere on long subtitle; wrap right controls as a row on narrow displays. Scope paper/navy/tokens to .course-question-screen so landing/styles/editor geometry remain unchanged. No new global editor-surface widths/heights.',
    validation:'Desktop/mobile screenshots plus document overflow, actual long title, header badge count and accessibility text checks. No Pause/Resume/time accessible UI, including hidden development details.',
  },
  validationPlan:{
    source:'Compare exact computed badge declarations and retained original snippets. Hash check immutable editor/chemistry/landing files and root/protected baseline before and after.',
    presentation:'All six curriculum pill values and C3; one visible existing question ID; absence of nav/sidebar/practice strip/duplicate ID/pause/resume/clock/status summary; meaningful titles/instructions/read-only feedback remain.',
    behavioural:'Foreman verifies student/revision/teacher metadata transitions, restore/current/history-paused exact identity/seed/answers/drawing, guarded eagle/back failure+Retry, first assessment freeze, idle/background/suspension timing and statistics transfer using existing host binding.',
    matrix:['numeric acid/calorimetry','multipart explanation/rubric','dot-and-cross','electron configuration or titration editor','teacher selection','C3 intro and stages a/b/c'],
    checks:'Appropriate typecheck/build/regression/prefix/budget and protected checks owned by foreman; worker supplies bounded presentation tests/screenshots after H0 acceptance. H0 executes no builds or runtime mutations.',
  },
  findings:[
    'QuestionHeader source fidelity is established by exact read-only rules/snippets, not a guessed pink approximation.',
    'Current focused flag only covers unpaused student attempts; new questionHeader must opt all actual question modes into the same chrome.',
    'C3 identity is existing displayed C3L6 2012 Q2; no new artificial question ID should be created.',
    'Shared question.title is content-specific in many providers, so broad heading hiding would remove meaningful pedagogy; equality suppression is bounded to repeated current subtopic.',
    'Existing source package has Unicode labels; read/write UTF-8 explicitly to avoid the mojibake shown by default Windows Get-Content.',
  ],
  unresolved:[],gate:'Root must accept H0 before any runtime/dependency/build edit. This audit does not claim H1 browser verification.',
};
fs.writeFileSync(path.join(out,'proposal.json'),JSON.stringify(proposal,null,2)+'\n');
const completion={stableId:'H0-PRESENTATION',jobId:'H0-PRESENTATION',agentId:'H02',status:'PASS',outputPath:'apps/Masters-of-Chemistry/validation/question-chrome/audit/presentation/proposal.json',confidence:0.96,reason:null,validation:{sourceInventory:'source-inventory.json',sourceSnippets:'original-source-snippets.json',immutableFiles:inventory.unchangedRuntimeBoundaries.length,sources:inventory.sources.length,noRuntimeWrites:true},usage:null};
fs.writeFileSync(path.join(out,'completion.json'),JSON.stringify(completion,null,2)+'\n');
const mismatches=[...inventory.sources,...inventory.unchangedRuntimeBoundaries].filter(item=>hash(item.path)!==item.sha256).map(item=>item.path);
const verification={time:new Date().toISOString(),jsonFiles:['source-inventory.json','original-source-snippets.json','proposal.json','completion.json'].every(file=>Boolean(JSON.parse(fs.readFileSync(path.join(out,file),'utf8')))),hashedSources:inventory.sources.length,immutableFiles:inventory.unchangedRuntimeBoundaries.length,mismatches,pinkRuleExact:fs.readFileSync(sourcePaths[0],'utf8').includes(proposal.sourceFidelity.badge.declarations),result:mismatches.length===0?'PASS':'FAIL'};
fs.writeFileSync(path.join(out,'audit-verification.json'),JSON.stringify(verification,null,2)+'\n');
if(mismatches.length||!verification.pinkRuleExact)throw new Error('Audit verification failed.');
console.log(JSON.stringify(completion));
