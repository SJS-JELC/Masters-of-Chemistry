# A16 S5-FIX-C3-K-ERRATUM

Worker implementation and verification PASS; independent acceptance remains with A22/A21/A23 and A01/root.

## Scope and changes

Seven authored files changed: C3 `source-bank.ts`, `content.ts`, `policy.ts`, `legacy.ts`, `C3L6View.tsx`; additionally A01 explicitly granted narrow ownership of `src/contracts/olympiad.ts` and the Olympiad-only section of `src/persistence/validation.ts`. No repository schema, table, migration, host, import planner, curriculum, editor, extracted bank/JS/JSON, SVG geometry, provenance, timing, mastery or revision file changed.

Raw source remains 23 alternatives. The live challenge and chemistry-only import projection have 22. K accepts O=C(O)C(O)O; O=CC(O)(O)O is retained as rejected source evidence and is shown only under the teacher source erratum. Both G alternatives and E/F pair semantics remain. `moleculeMatches` enforces corrected K semantics even when supplied a raw-source challenge.

Current check counts are recomputed during revalidation so a former wrong-K pass displays zero, rather than a misleading retained score of one. A prior passed wrong-K native check captures its exact original progress in the separate historical snapshot before that revalidation. Capture never creates history for a new wrong answer. Existing history is retained. Original valid C checks remain saved while B is invalid, so correcting and checking K restores the valid dependency chain without erasing old history.

Historical raw type: `Omit<C3L6Progress, 'historicalOutcome'> & { readonly historicalOutcome?: never }`. Runtime validation applies the complete original structural/fingerprint/dependency checks to a bounded nonnested raw snapshot and requires the same profile/course/activity and exact policy/reason identifiers. Native load applies the chemical policy; the next actual host command saves current validation plus the preserved snapshot to the same row. Restart preserves that snapshot while resetting current work.

The unchanged real import planner calls the owned legacy hook, rejects inconsistent old completion and retains exact raw input. All three legacy versions carrying the wrong source K are accepted as complete by the original source interpreter in the test, then rejected by current revalidation. Missing/raw/rejected-field tests remain intact. Pure import planning was exercised inside the actual browser; final import-archive persistence acceptance is independently assigned to A21.

## Chemistry and manual render review

H + H₂O balances C₂H₂O₃ + H₂O → C₂H₄O₄. That balance also fits the erroneous graph and does not choose connectivity. Manual inspection of the actual teacher editor/reference diagrams confirms the accepted structure has intact C(=O)OH adjacent to CH(OH)₂. The separate rejected source diagram has CH=O adjacent to C(OH)₃. Desktop and 390px mobile screenshots were inspected; the distinct diagrams, labels, OH placement, double bond and source-erratum qualification are readable. No stereocentre distinction is required because the hydrated carbon has two identical hydroxyl groups; no charge/isotope change occurs. The task remains the existing Olympiad extension. The prior independently reviewed hydrazone name qualification remains unchanged.

Independent chemical evidence: `validation/s5/chemistry/chem-03.json`; A22 owns all-23 transformation/manual review. The unavailable original paper remains explicit. This fix does not claim source-isomorphism or formula checks establish aqueous chemistry, and does not regenerate molecular assets with another RDKit version.

## Retained evidence and commands

- `before/`, `before-fingerprints.json`, `after-fingerprints.json`: activity baseline/current. All 48 immutable extracted/source/asset/CSS files match exactly. `authored-diff-fingerprints.json` and seven `.diff` files cover all authored/shared changes. Shared before copies are reproduced from retained S4 preformat sources using the accepted formatter and checked against exact accepted S4 after hashes.
- `original-s3-test.txt`, `original-s3-browser.txt`: byte-exact copies; original S3 files were never edited. `prepare-tests.mjs` and `prepare-browser.mjs` retain the narrow full-port transformations. The full test port preserves all seven groups; authorized source23/current22 and K erratum expectations are explicit. Raw all23 formula/graph/isomorphism/source equality assertions remain, plus original source wrong-K acceptance is proved.
- `c3-reference.test.ts`, `tests-results.txt`: 10 groups PASS, including current22 nominal masses and H hydration atom balance, same-formula connectivity distinction, all legacy versions, dependencies, E/F duplication protection, undo, completion dedup and malformed/wrong-valence boundaries.
- `history.typecheck.ts`, `history-typecheck.txt`: TypeScript positive snapshot and expected negative nested/wrong-policy assignments PASS under the app's bundler resolution.
- `native-correct.json`, `native-historical-wrong-k.json`, `native-revalidated.json`, `legacy-v3-historical-wrong-k.json`: synthetic reproducible fixtures with exact source graphs and original-source-compatible check snapshots. These are not personal/student historical data. Actual stored browser rows use isolated synthetic run databases.
- `browser.mjs`, `browser-results.json`, `browser-log.txt`, screenshots: actual dev host on owned port 5209, full retained UI/editor/browser coverage plus teacher accepted22/erratum, historical current-vs-old display, exact native snapshot load/save/correction/restart/reload, current wrong-K zero, raw rejected import plan, one Olympiad row and zero attempts/evidence/sessions. Mobile touch/undo and desktop keyboard/pointer spatial controls pass. No page errors.
- `typecheck.txt`, `format-results.txt`, `protected-originals.txt`: project typecheck, Prettier 3.6.2 on exactly seven changed files, 1,317 protected originals PASS. No installs, managed chemistry regeneration or publication.

Re-run from project root:

```text
node --test validation/s5/fixes/c3-k-erratum/c3-reference.test.ts
node node_modules/typescript/bin/tsc --noEmit --strict --allowImportingTsExtensions --target ES2023 --module ESNext --moduleResolution bundler --types node --skipLibCheck validation/s5/fixes/c3-k-erratum/history.typecheck.ts
npm.cmd run typecheck
node validation/s5/fixes/c3-k-erratum/fingerprints.mjs after
npm.cmd run check:originals
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5209 --strictPort
node validation/s5/fixes/c3-k-erratum/browser.mjs
```

Close the owned server after browser checks. The S5 runner should retain/exclude only the exact historical S3 C3 full fixture in favour of this independent full port, not weaken or overwrite old fixtures.

## Retained failures and limits

The first isolated Edge navigation timed out with a blank page; its result/screenshot are retained. Explicit headless `--no-proxy-server` restored normal local navigation; all final source browser checks passed. A new test initially expected no implicit details group; the browser correctly exposed one accessible group and the corrected positive assertion passed. A fixture adapter initially called nonexistent original `checkB`; it was corrected to original `bUnitCount`. The first standalone negative-type command used NodeNext against existing extensionless contract imports; the retained diagnostics show that resolver mismatch, and the app-consistent bundler command passed. These are tooling/test-author failures, not suppressed runtime chemistry failures.

Requested model/effort: gpt-6.1-sol/high. Effective runtime model, effort and usage are not exposed and remain unknown. No children were spawned.
