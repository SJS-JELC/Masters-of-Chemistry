# L02 / LANDING-DESIGN — original landing restoration

## Owned changes

- `src/landing/OriginalLanding.tsx` and `index.ts`: React-owned source landing topology and events. The course boundary closes gem details on switching; the host owns course URLs and launching.
- `src/landing/catalogue-data.json` / `catalogue.ts`: actual full source catalogues, independent of the runnable registry. A Level has **154 raw / 152 visible / two hidden redirects**; IGCSE has 64 gems and 15 topics. The old README's 153 count is stale. Both hidden IDs and redirects are retained exactly.
- `src/landing/alevel.css`, `igcse.css`: original final source CSS cascade, with component selector boundaries and font URL adaptation. Root selection-state classes remain on the component boundary. No generic map replacement.
- `src/landing/animation.ts`: original A Level WAAPI translation measurements, 420 ms and `cubic-bezier(.22,1,.36,1)`. Each topic column has one expanded topic; inactive flip faces are inert. Original reduced-motion rules apply.
- `src/landing/progress.ts`: existing shared validated mastery summaries plus original map display lookup/freshness. No evidence recording or mastery arithmetic changes. Preferences use only `masters-of-chemistry:landing:v1:<course>:year|selection|mode`.
- `src/landing/adaptation.css`: resets inherited generic platform defaults; positions the authorised original-style course switch and small Teacher/Import controls.
- `public/assets/landing/SJS-Eagle.svg` and `public/assets/landing/fonts/Comfortaa-Bold.ttf`: byte-identical original assets. Comfortaa's identical font is covered by the existing `public/assets/fonts/OFL-Comfortaa.txt` licence.

## Source reuse and bounded departures

`source-fingerprints.json` identifies the current source HTML, catalogue, JS, CSS and copied assets. `reuse-originals.mjs` reproduces the scoped CSS, catalogue JSON and asset copies from read-only originals. Original DOM class names, gem and sparkle geometry, pane/column topology, details markup, revision chips/bulk selection controls and tile SVGs are reused. React replaces DOM construction, handlers and local state; the new host replaces legacy page launches and revision frame/session ownership.

The authorised additions are the IGCSE/A Level switch using the original year-toggle design and unobtrusive Teacher/Import access. Their extra row can move maps down on narrow screens; map widths/heights remain source-equivalent. Tiles are buttons with host callbacks instead of page links. New project course-separated preference keys replace original storage keys. Actual activity availability and supported levels come from the passed registry; all other display gems remain visible but cannot launch.

Original Revision remains a map selection mode: eligible leaves only, original topic ADD/REMOVE ALL, A Level year ADD/REMOVE ALL, removable chips/count/Clear/Cancel/GO and typed unique action tokens. Selection survives activity unmount/remount and remains separate per course. Direct fixed-level and mastery launches use the chosen gem without a second setup screen.

IGCSE retains its nonmodal centred details, outside/Escape dismissal, original SVG focus restoration and pupil/teacher eagle. Teacher gem actions pass the selected gem ID to the host. A Level retains modal details and original hidden-alias deep-link redirects.

## Explicit source rendering quirk

The original A Level `refreshProgress` chooses `award.states[award.level - 1]`. pH Titration Curves supports levels `[2,3]`: its level-2 award indexes the level-3 state, and its level-3 award indexes a missing state. Its gem may therefore keep unstarted brightness despite a green/purple award and recorded review dates. The landing preserves this **display-only source quirk**, as directed by the foreman. Correct per-level summaries and choice meters remain unchanged. The source-equivalence tests exercise all supported levels and this lookup; no engine/bank fix is implied.

## Verification and inspection

- `invariants.test.mjs`: original catalogue equality and stable hidden redirect inventory; all 16 active leaves; source recurrence, supported levels, awards and exact display lookup; 0/7/8/21/22-day freshness boundaries; scoped gem-body token integrity. Three suites pass.
- `browser-comparison.json` / `screens/`: 75 original/new identical-viewport pairs, across desktop 1440×1000, tablet 820×1180, mobile 390×844. Unassessed, yellow/fresh, green/steady and purple/due; A Level both years; expanded topics, available/unavailable gem details, IGCSE teacher details, representative two-band choice variants and revision selections. Desktop Revision hover/focus are compared in both courses. Each final pair checks map widths/heights; base states check gem fill/stroke/opacity/filter and original accessibility text. Screenshot geometry is inspected in addition to overflow. The report records matching start/end landing-source fingerprints.
- `browser-interactions.json`: meaningful keyboard/mouse controls, unavailable eligibility, fixed-level launch and unique tokens, topic/year bulk selection, inactive faces, course-separated year/selection memory, IGCSE teacher mode, outside/Escape/focus restoration, reload, reduced-motion layout and historical alias deep link. PASS.
- `alevel-contact-sheet.html/png`, `igcse-contact-sheet.html/png`: selected final pairs for review; HTML thumbnails link to full-resolution images.
- `output-fingerprints.json`: final owned runtime files. Run `node validation/landing-restoration/design/write-review.mjs` after the comparison to regenerate review sheets and hashes.
- `typecheck-final.log`, `invariants-final.log`: final successful compiler and three source-equivalence checks. `visual-inspection.json` records the rendered inspection. `completion.json` is the worker manifest; `finalise-evidence.mjs` verifies its referenced screenshots and current runtime hashes before writing it.

Browser runs use pinned workspace Playwright 1.62.1 with headless Microsoft Edge and fresh browser contexts. The original apps are served read-only on a fresh ephemeral origin; only synthetic storage in those isolated contexts is written. Original user's browser profiles/stores are never opened. HMR WebSockets are blocked in comparison pages so concurrent host source edits cannot reset the reviewed state. Infinite shine/sparkle CSS animations are paused at phase zero in both screenshot pages; interaction tests use unfrozen animations.

Retained probes include the initial stale-count assertion, CSS root-state scoping/bulk-controls defect, an aria-disabled negative-click test correction, a mock-harness course URL reload correction, the original pH brightness quirk, and a global Vite reload interrupting a comparison. Raw failures remain explicit; final reruns supersede them. No chemistry, source bank, activity/editor, original app or deployment changes were made by L02.

## Reproduce

From the new project directory, with its Vite dev server on 5183:

```text
node validation/landing-restoration/design/reuse-originals.mjs
node --test validation/landing-restoration/design/invariants.test.mjs
node validation/landing-restoration/design/interaction-browser.mjs
node validation/landing-restoration/design/compare-browser.mjs
node validation/landing-restoration/design/write-review.mjs
npm.cmd run typecheck
node validation/landing-restoration/design/finalise-evidence.mjs
```

PASS is worker completion only; foreman integration and root acceptance remain required.
