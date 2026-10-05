# OLY2011-20261003: authorised implementation contract

User approved this plan and said Implement the plan on 3 October 2026. Root owns
this contract. It adds one activity to the current React app (thirteen total),
superseding older no-new-activities exclusions only for this addition. Preserve
all current canonical curriculum IDs, alpha namespace, component-fidelity edits,
prior evidence and immutable original siblings. No publication.

## Behaviour

- New activity `alevel/olympiad-2011-q4`, source UK Olympiad 2011 Round 1 Q4.
  It sits alongside existing C3L6 in an Olympiad selector, outside mastery,
  gems, revision, curriculum timing and statistics. No levels or percentages.
- Show paraphrased complete source clues and collapsible general NMR guide.
  All seven compounds C4H10O; 5-7 lower boiling than 1-4; 1-4 broad IR at
  3300 cm-1; 2 has optical isomers; 3 has supplied NMR spectrum/integrals;
  4 and 5 each two proton environments; 5 delta1.21 triplet integral3 and
  delta3.47 quartet integral2; 6 four carbon13 signals, 7 three.
- Seven numbered boxes, responsive layout, independent molecular drawing/undo
  state. Reuse current C3L6 MoleculeEditor/MoleculePreview and selected-box
  interaction. All boxes available immediately. Drawings only, no name fields,
  skeletal bonus, transfer question, pupil hints or answer reveal. Separate
  teacher preview follows existing convention and writes no pupil progress.
- Approved SVG source (read-only):
  `../../development/shared/nmr/olympiad-2011-q4/olympiad-2011-q4-compound-3.svg`.
  SHA256 `07d75b648f1117fadaa701ecb875e68331f2dc4a8a451cea1f9591a257ea1d7d`.
  Runtime copy must be visually identical, displayed on white with accessible
  enlargement. Replace metadata/title/description that reveals compound name
  or assignments with neutral student text; no identity leak through alt/zoom.
  Preserve provenance in project development evidence, not visible footnotes.

## Answers and aggregate feedback

Fixed box order (neutral, connected, single-bond C4H10O structures):
1 butan-1-ol `CCCCO`; 2 butan-2-ol `CCC(C)O`; 3 2-methylpropan-1-ol `CC(C)CO`;
4 2-methylpropan-2-ol `CC(C)(C)O`; 5 ethoxyethane `CCOCC`;
6 1-methoxypropane `CCCOC`; 7 2-methoxypropane `COC(C)C`.
Accept existing supported structural/skeletal/explicit-H equivalent drawings;
box2 does not require stereochemistry. Use graph chemistry, not atom positions.

- Check enabled when any drawing is nonempty; blanks allowed.
- React-independent marking counts fully correct placements first and reserves
  those target identities. Match remaining drawings to remaining answer identities
  one-to-one. Each isomer can count once; duplicate surplus, blank and incorrect
  drawings contribute neither count. Counts together never exceed7.
- Only check feedback: `X fully correct; Y correct but in the wrong place.`
- Unless X=7, ALL seven boxes (including blank/right ones) use the current C3L6
  yellow border #ffde59 and question mark styling. No per-box diagnoses, correct
  positions, destination hints or accessible per-box correctness disclosures.
- Any edit clears aggregate feedback and every assessment border until recheck.
- X=7: all green ticks, completion saved, drawings view-only; restart clears only
  this challenge. Teacher preview may show solutions but does not save evidence.

## Integration and persistence

Extend the typed registry/host from one hardcoded challenge to two registrations,
keeping C3L6 staged policy unchanged. Use a separate seven-box policy/progress
type and activity-specific loading; use `activity` query parameter and support
selection, direct links, reload and Back/Forward. Existing explicit C3L6 links
continue to work; plain Olympiad navigation opens the selector.

Extend existing Olympiad repository APIs/validation to a discriminated progress
union with activity ID selection. Keep one-argument loadOlympiad default C3L6
for compatibility; retain existing C3L6 storage/import records and keys. Save
drawings, selected box, aggregate check/fingerprint and completion, not content
snapshots. Recompute/validate restored results, reject stale/forged completion.
Preserve save failure guards and challenge isolation, including asynchronous
loads/navigation; teacher preview must not write pupil state.

## Validation and authority

Source evidence: workspace `resources/Olympiads/audit/organic-pilot-brief.md`
(checked answer graphs and source clues) and immutable questions pp6-7/scheme p4.
Preserved draft `development/alevel/drafts/olympiad-2011-q4-isomers/` is reference
only: its old mastery/hints/persistence/UI must not be enabled or copied wholesale.

Required: all-correct, swaps/derangements, mixtures, duplicates with exact-match
priority, blank/partial, equivalent graphs and wrong valence/charge/disconnection;
feedback uniformity/staleness; saved progress restoration/isolation/failure;
C3L6 regression; no mastery/time/statistics evidence; teacher no writes;
desktop/tablet/mobile real UI editing, keyboard, touch, zoom and accessibility;
typecheck, meaningful relevant suites, both builds, release/protected-app gates.
Update exact inventory guards to thirteen without weakening other checks.
Use pinned root Playwright read-only. Do not rebaseline protected originals.

One direct gpt-6.1-sol/high implementation worker W01, followed by distinct
gpt-6.1-sol/high independent reviewer R01, at most root+one active child.
No foreman or nested delegates. One focused correction cycle; material unresolved
scope/architecture goes to root. Root owns project scope files and final acceptance.
Implementation worker owns necessary runtime/test/docs changes within this
project, excluding root contracts, prior evidence and unrelated work. Review is
read-only for code with own evidence output. Before files/hashes are retained in
`validation/olympiad-2011-q4/root-baseline/` for independent diff review.

Worker progress milestones/questions go to root; root alone writes swarm log.
Detailed evidence is kept in this project's validation/olympiad-2011-q4 folder.
Compact completion JSON: stable job_id/agent_id, PASS/ESCALATE/FAIL, output_path,
confidence, reason, changed files/fingerprints, validation references and limitations.
Root final acceptance includes substantive chemistry, shared-code diff and rendered
review. No claim of acceptance from worker PASS alone; no deployment.
