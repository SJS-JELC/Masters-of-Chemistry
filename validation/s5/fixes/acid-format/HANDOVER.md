# A08 — S5-FIX-ACID-FORMAT

## Change and rationale

Only `src/activities/alevel/acid-base-calculations/provider.ts` changed. The provider now states precision beside each numerical response, using that response's actual source `format`, symbol and unit. The general context retains standard-form entry guidance and refers pupils to those instructions. This applies to both current and historical questions, including mixed-format multipart questions.

| Source format | Pupil instruction |
| --- | --- |
| `dp2` | to 2 decimal places |
| `dp3` | to 3 decimal places |
| `sf3` | to 3 significant figures |
| `sf4` | to 4 significant figures |
| `integer` | as a whole number |

For the independently reported historical `AB-0000SN`, the volume response now says **Give Volume of Sr(OH)₂ (cm³) to 2 decimal places.** Its expected value remains 46.875 with absolute tolerance 0.0051. The original source and real adapter marking still accept 46.88 and reject 46.9. The former universal 3-significant-figure instruction was incompatible with this response.

The five-format mapping covers the existing typed source contract. The real generated samples contain `dp2` and `sf3`; `dp3`, `sf4` and `integer` are separately labelled helper-contract checks, not claims that those formats occur in the current bank. Unitless quantities have no empty parentheses. Source notation conversion remains in use.

## Verification

Run these from `apps/Masters-of-Chemistry`:

```powershell
node validation/s5/fixes/acid-format/format-regression.mjs
npm.cmd run typecheck
node node_modules/prettier/bin/prettier.cjs --check src/activities/alevel/acid-base-calculations/provider.ts validation/s5/fixes/acid-format/format-regression.mjs
```

All pass. The regression checks all 63 current template/level routes at six seeds (378 questions), all 33 frozen historical fixtures, and the additional exact failure code: 412 real questions and 715 responses. It executes the actual original `data.js`, `core.js` and `levels.js` read-only in an isolated VM and compares complete source questions, instructed rounded-answer acceptance and restoration identities. It exercises the real adapter's marking and incomplete-response rejection. It also compares complete new common Questions to the retained pre-fix provider, allowing only the general rounding sentence and one added per-response instruction to differ. Thus numerical acceptance, IDs/seeds, prompt chemistry, worked answers, response count/order, scaffold differences and all other Question fields are unchanged.

`fingerprints.json` records before/after provider SHA-256, original-source hashes and all acid-source hashes. The retained before-provider hash matches A22's independent initial fingerprint. The other ten acid source files match A22's initial fingerprints exactly. `provider.diff` is the exact source difference; `git diff --no-index` exit 1 means a difference was found. Prettier 3.6.2 was applied only to the owned provider and regression script; the provider was already compliant and unchanged by formatting.

Evidence:

- `format-results.json`: successful real-bank/source/marking regression, actual format counts and examples.
- `compiler.json`: strict `tsc --noEmit` success, after the final source change.
- `before-provider.ts`, `provider.diff`, `fingerprints.json`: reproducible source preservation evidence.

The first validation harness attempt failed because a single-quoted file URL contained the apostrophe in the workspace path. The harness now uses JSON string literals for its module imports. A second harness assertion mistakenly looked for the unit `cm3`; the actual source unit is `cm³`. It now looks up the real `volume` key and asserts `cm³`. Neither failure involved source code, marking or chemistry changes; the second failure is retained in `harness-unit-lookup-failure.log`. Final complete regression passes. No blind source retry occurred.

## Boundary and disposition

Source is frozen. A22 owns the independent recheck against current source and final build; A01 owns rebuild/release/integration. This worker PASS is not S5 final acceptance. No build, deployment, shared contract, policy, engine, bank, marking or original-source edits were made. This precision fix makes no new curriculum-scope or specification-version claim.

Requested model/effort: GPT-6.1 Sol High. Effective runtime model/effort and usage were not exposed. No delegation.
