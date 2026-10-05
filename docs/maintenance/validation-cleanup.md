# Validation directory cleanup

Completed 5 October 2026 under the user's instruction to check dependencies, move what is needed, and delete the rest. The entire app validation directory is gone. Its 15,772 files represented 2.36 GB of logical file content, including 9,944 tracked files. 114 required original files have replacements; 15658 original files were discarded. Tracked originals appear as Git deletions until a commit; nothing was committed, pushed or deployed.

Retained dependencies now live in scripts/source-generation, scripts/tests/legacy, scripts/tests/fixtures/legacy, scripts/browser and resources/source-generation. The [machine-readable audit](validation-cleanup.json) contains the exact old-to-new map and counts. [Generator](generator-migration.json), [test](test-migration.json), [browser-tool](tool-migration.json) and [documentation](documentation-migration.json) manifests retain bounded verification details. Frozen test/input fixtures remain intact. Historical snapshots, browser profiles, screenshots and independent acceptance reports were deliberately deleted rather than archived. Ten historical report/freeze writers were removed; the old timing-review report reader now reports its retirement explicitly.

Generated reports, temporary browser profiles, screenshots, caches and reference candidates belong in ignored .artifacts. Vite excludes this directory from watching. Authoring scaffold output paths follow the same convention. The dependency gate is node scripts/check-retired-validation.mjs; it verifies that validation stays absent and checks retained executable paths/imports. It passed after deletion. Historical path identifiers survive only as documented metadata/aliases/comments; the external workspace titration/specification references remain outside this cleanup scope.

Typecheck, both course builds, catalogue regeneration and both runtime releases passed. Each release contains 172 runtime files; initial JS gzip is 182319 bytes, below the 204800-byte budget. All 12 generator comparisons preserve generated content. Four historical generator groups expose existing accepted-output refinements; regeneration requires deliberate review of those refinements. The current Edge browser smoke passed five checks, including both actual mobile homes, relocated landing harnesses, and the seven-box Olympiad/NMR dialog, with no runtime or HTTP errors. Screenshots were inspected. Native timing suites were retained but not rerun for this path cleanup.

The authored Explaining Properties metadata/landing registration generator was also retained and reproduces both current generated files in read-only `--check` mode.

Eight test runners had failures before this work. Their totals and failure occurrences are unchanged; all 1945 retained assertion calls remain. The focused C3 source/history/current suites pass 32 of 32 tests.

| Runner | Tests | Pass | Fail | Same as baseline |
| --- | ---: | ---: | ---: | --- |
| test-s1.mjs | 40 | 34 | 6 | Yes |
| test-s2.mjs | 19 | 11 | 8 | Yes |
| test-s3.mjs | 99 | 69 | 30 | Yes |
| test-s4.mjs | 121 | 82 | 39 | Yes |
| test-s5.mjs | 156 | 99 | 57 | Yes |
| test-component-identity.mjs | 39 | 35 | 4 | Yes |
| test-explaining-properties.mjs | 46 | 45 | 1 | Yes |
| test-olympiad-2011.mjs | 55 | 51 | 4 | Yes |

The frozen protected-app guard failed before and after with the same 529 historical differences across 1320 current paths. This includes existing sibling Git/build/cloud-readability changes and three added paths. Its frozen baseline was moved byte-identically, not refreshed. The source audit matches 236 of 237 frozen source hashes; the historical project-contract record differs after authorised scope additions. Historical control differences remain explicit. These failures are not relabelled PASS. User source files and the pre-existing explaining-properties test edit were preserved. The pre-existing untracked explaining-properties verifier received only necessary dependency/output-path changes; its evidence-reading sections require freshly generated .artifacts reports.

Current verification commands no longer assert deleted historical independent-review/freeze evidence. They report current deterministic checks; fresh substantive chemistry/browser acceptance remains separate. Progress histories retain their statuses and mark 206 deleted evidence references as retired. No sibling application was edited.

Root review restored the broad test-s5 runner and original source runtime guards in verify-landing. The executable write-s0-scope check was restored and remains invoked by validate-s0; its frozen twelve-activity scope differs from the current authorised fourteen-activity catalogue and therefore fails explicitly. See verification-restoration.json. No broad test suites were rerun for this correction.
