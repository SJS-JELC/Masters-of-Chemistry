# Completed review: application and style findings

## Current status: resolved by authorised consistency pass

The user subsequently authorised fixing every listed inconsistency, preferring
sentence-case answers and case-blind assessment, and displaying sulphate while
accepting either spelling. The findings below are retained as history, not
outstanding issues. `scripts/standardise_igcse_recall.js` now runs after applying
the preserved completed teacher review, so regeneration keeps these fixes.

- Prompts use one test-question voice, consistent punctuation, number words,
  sentence case, sulphate spelling, and iron(III)/copper(II) spacing.
- Answer fragments use sentence case. Text normalisation is case insensitive,
  trims/collapses whitespace and treats sulphate/sulfate and sulphur/sulfur as
  equivalent. Both spellings are present in accepted answer data. Formula
  notation retains element-symbol case; subscripts are not capitalisation.
- Parallel reagent descriptions use the simplified teacher style without
  restoring dilute/aqueous/(aq). Anhydrous and concentrated are retained.
- Q091 follows largest-to-smallest: bitumen through refinery gases.
- Q114 has reagent 1 (potassium dichromate), reagent 2 (sulphuric acid/H2SO4),
  and conditions (heat), with each assessed as a distinct field.
- Q082–Q087 use four solubility choices and conditional exception fields.
  Chlorides require silver and lead; sulphates require barium, lead and calcium;
  carbonates and hydroxides retain the teacher's group 1/ammonium exception
  wording. Exception fields accept answers in any order without duplicate credit.
- Q025 has separate labelled ionic-substance and metal answer fields.
- Q116 has three authored distractors contrasting oxygen/bacteria oxidation
  with reduction, carbon dioxide, and anaerobic yeast conversion.
- Q046 has test/result fields, with the result displayed as 100 °C.

There are 116 active questions; the ore question remains retired. Teacher
decisions, notes, input files and previous snapshots are retained. All active
response contracts now have `status: specified`. Source/contract tests and the
Edge review/export test pass. This is the current authoring bank and review
output; the pupil app still uses its previous runtime until integrated.

## Historical findings before the consistency pass

Source: `igcse-recall-classification-review-2026-09-14T16-03-58-528Z.json`.
All 117 decisions applied: 35 approved, 81 approved with modifications, one
rejected. There are 116 active questions. Q088 (ORE) is excluded from active
content and retained in `removedQuestions` for recovery and audit.

Every final prompt, answer, note, response type and matching mode is preserved
exactly, including spacing and the teacher's simplified reagent descriptions.
No style suggestion below has been applied. In particular, chloride and iodide
tests have not had `aqueous`, `dilute` or `(aq)` restored.

## Style differences (advisory only)

| Pattern | Examples | Possible house style |
| --- | --- | --- |
| Test prompt voice | Q043: “How do I test ... and what result would I get?”; Q058/Q106: “How do you test ... and what is the positive result?” | Choose one prompt form throughout. |
| Capitalisation | Q043 “Carbon Dioxide”; Q058 “oxygen gas”; Q049 “Orange-red flame”; Q051 “red flame”; Q115 “Orange to Green” versus Q041 “green to black” | Sentence case in prompts; lower case for short answer fragments. Preserve element-symbol case. |
| Definitions | Q015 “Define the term: SOLUTION”; Q017 “Define the term COVALENT BOND”; Q023 adds a full stop; Q016 says “Define a ...” | “Define the term TERM.”, if desired. |
| Numbers | Q024/Q038/Q089/Q090 use 2 or 3; Q062/Q064 use two or three | Choose numerals or words consistently for short counts. |
| Final punctuation | Q091/Q105 have none; Q113 starts “What temperature ...” but ends with a full stop | Question marks for questions; full stops for commands. |
| Separator spacing | Q084 begins with a space; Q091/Q104/Q106 have spaces before semicolons | One space after `;`, one on either side of `|`. |
| Sulfur spelling | Q033/Q047 use “sulphate”; Q085 uses “sulfates” | Pick one display spelling; keep both accepted spellings if intentional. |
| Oxidation states | Q044/Q061: “Iron (III)”, “Copper (II)”; Q062: “copper(II)” | One capitalisation/spacing convention. |
| Relative-charge prompts | Q004/Q005 say “relative charge”; Q006 says “charge” | Match the prompt form across the three particles. |
| Temperature typography | Q046 uses “100oC”; Q098/Q113 use “°C” | Choose the same displayed notation; normalisation of typed answers is a separate choice. |

Q050 still contains “dilute”/“aqueous” and `(aq)`, while Q054/Q057 use simplified
reagent descriptions. This is reported as a difference between parallel items,
not a reason to restore qualifiers to the teacher's corrections. Similarly,
different exact/contains choices are retained as marking decisions, not treated
automatically as style errors.

## Answer-contract conflicts requiring a choice

These are separate from style. The literal answers and notes remain intact;
the affected structured responses are flagged `requires-resolution`.

- **Q091:** the prompt says largest to smallest, but the ordered answer starts
  with refinery gases and ends with bitumen. Decide which direction to retain.
- **Q114:** the note requests Reagent 1, Reagent 2 and Conditions. The answer
  has only two semicolon groups and lists `Heat` as an alternative to the acid.
  A three-field mapping needs resolving.
- **Q082–Q085/Q087:** notes describe a four-choice solubility selection with
  conditional exception fields, while selected types differ. Q083 has the
  interface instructions in its answer box. Q084/Q085 place distinct exceptions
  between pipes, normally used for synonyms. These need an explicit shared
  response contract. Q086 has no such new instruction and remains as reviewed.
- **Q025:** the note requests splitting ionic and metallic answers; the selected
  type is still single-field. Decide whether this is two fields or two questions.
- **Q116:** the new MCQ has a correct answer but no supplied distractors.
- **Q046:** Test/Result use labels and a newline instead of the usual semicolon
  separator. The two-field mapping is flagged rather than silently inferred.

## Validation and current source

`data/igcse-recall-working.json` is the latest authoring bank. The earlier bank is
retained as `reviews/completed-review-baseline.json`; its hash matches the source
recorded in the completed export. `scripts/apply_igcse_recall_review.js` now
dispatches to the completed-review importer so the old editorial substitutions
cannot overwrite the latest teacher corrections on regeneration.

Passed: exact comparisons of all 117 prompts/answers/types/modes/notes/decisions;
baseline hash and snapshots; numeric argon alternatives updated to the requested
0.9 only; incomplete-combustion answer count updated to three; rejected-item
exclusion; unresolved-contract flags; generated HTML source check; Edge review
controls, retained completion counts, JSON download and mobile-width checks.
The pupil app remains on its existing runtime bank.

```powershell
node scripts/apply_igcse_recall_review.js --check
node scripts/test_applied_igcse_recall_review.js
node scripts/build_igcse_recall_classification_review.js --check
node scripts/test_igcse_recall_classification_review.js
```
