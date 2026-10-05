# S5-FIX-ELECTRONS-WORDING

Run: MASTERS-REACT-20261002. Assigned author: A12, direct parent A01. Requested model/effort: GPT-6.1 Sol High; effective model, effort and usage unknown. No children. This bounded author fix responds to independent A22 finding CHEM-02; A22 retains independent review and A01 owns builds/manifests and stage acceptance.

## Change and source rationale

Only `src/activities/alevel/electrons-bonding/provider.ts` changed at runtime. It uses three explicit pupil-facing prompt clarifications, leaving extracted original `data.js` and its provenance untouched. All other question content, marking, hints, worked feedback, routes and IDs remain unchanged.

| ID | Original prompt | Qualified pupil prompt | Exact original feedback supporting the assessed concept |
| --- | --- | --- | --- |
| EB07 | How many p orbitals exist in each electron shell? | How many orbitals are there in one p subshell? | “A p subshell contains three orbitals and holds up to six electrons. A p subshell exists from the second shell onwards; the first shell has only an s subshell.” |
| EB08 | How many d orbitals exist in each electron shell? | How many orbitals are there in one d subshell? | “A d subshell contains five orbitals and holds up to ten electrons. A d subshell exists from the third shell onwards.” |
| EB09 | What type of structure do all ionic compounds have? | What type of structure do solid ionic compounds have? | “The source answer applies to solid ionic compounds. The ordered lattice is disrupted on melting or dissolving.” |

The quoted feedback is retained in `src/activities/alevel/electrons-bonding/data.js` and the read-only original `apps/Masters-of-A-Level-Chemistry/src/activities/electrons-bonding/data.js`, source rows 7–9. Their raw prompts and answers remain preserved. The source provenance points to `development/alevel/data/flashcards/l6-electrons-bonding-key-learning.csv`, SHA-256 `05cce072f084afb7bee07f9519a9f8ce73476490051be6e7abe824994ad1bd7d`.

The original “each electron shell” wording incorrectly includes the first shell for p orbitals and the first two shells for d orbitals. The revised prompts ask the existing intended subshell-capacity questions, with unchanged answers three/five. The solid qualifier makes the lattice question match its existing feedback and giant-ionic-lattice answer. These are clarifications of the same assessed concepts, not replacement questions; IDs EB07/EB08/EB09 and every seed therefore remain valid. This source-author disposition was explicitly authorised by A01 in the assignment. Existing OCR references 2.2.1(b) and 2.2.2(b–c) remain unchanged; no new curriculum claim is introduced.

## Reproducible checks

Run from `apps/Masters-of-Chemistry`:

```powershell
node validation/s5/fixes/electrons-wording/verify.mjs
```

The one-time `prepare` mode was run before editing. It refuses to overwrite `before.json` and captured the original provider text, all 14 complete question models, 142 marking cases, 256 seeded selections and protected-file hashes. `provider-before.ts` and `provider-after.ts` are retained evidence copies, not runtime modules. `provider.diff` contains the exact bounded diff. Only the owned runtime provider was formatted using pinned Prettier 3.6.2; no project-wide formatting command ran.

Final verification passes:

- All 14 pupil prompts checked: exactly EB07/EB08/EB09 qualify; the other 11 remain exact source prompts.
- All complete question models otherwise equal their captured before state, including response controls, accepted alternatives, marks, hints, scaffolds, worked answers, feedback, source provenance and layout.
- The entire extracted 14-record bank equals the read-only original source object. Six protected data/core/marking/adapter/original-source fingerprints remain unchanged.
- All 142 original accepted alternatives, misconceptions, blanks, unrelated answers and negations preserve assessment readiness, raw marks and mastery scores. The new provider results match both the captured baseline and original source marking.
- All 256 seeded selections remain unchanged, with exact restored models at seeds 0, 1, 7919 and 4294967295 for every question. Stable fixed IDs, historical link normalization and full-bank coverage remain unchanged.
- Global TypeScript typecheck and the provider-only Prettier 3.6.2 check pass; logs are retained.

`verification.json` contains exact before/after SHA-256 values, all 14 prompt/source-feedback records, protected fingerprints and command outcomes. `completion.json` is the compact author completion manifest.

## Acceptance boundary

No policy/core/data/editor/diagram/shared files, original application files, S3 evidence, control package or publication settings were changed. No browser profile or old storage was touched. A22 independently reviews the final wording and built output; A01 builds and updates manifests. This author PASS does not claim independent chemistry or S5 acceptance.

The historical S3 fixture asserts every rendered prompt equals its raw source prompt. Its EB07–EB09 expectation predates this explicitly approved S5 erratum. It is preserved unchanged; this new all-14 regression records the three exact authorised exceptions rather than rewriting old evidence.
