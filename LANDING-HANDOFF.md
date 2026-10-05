# Original landing restoration — Part 1

> Evidence retirement (5 October 2026): historical validation reports, screenshots and acceptance records were deleted by user request after executable dependencies were migrated. Remaining `validation/` path names and past test counts describe historical records, not present files or fresh acceptance. See [validation cleanup](docs/maintenance/validation-cleanup.md).

The shared app now opens the original course maps. It reuses the source CSS, SVGs, font, catalogue, DOM topology and applicable animation measurements, with React owning state/events and the existing player owning attempts. This restores the original visual hierarchy and map-based revision selection.

Both static entry points switch courses in place. A Level keeps Physical/Organic panes and the Lower/Upper Sixth flip; IGCSE keeps its three year columns and teacher eagle. Unavailable gems remain visible. The actual A Level source has **154 raw, 152 visible gems and two hidden redirects**; IGCSE has **64 gems**. Runnable content remains the accepted **16 curriculum leaves / 41 supported targets**, plus the separate A Level Olympiad challenge.

Gem choices launch the exact fixed level or mastery mode directly. Revision expands selected gems to supported levels and resumes a matching saved selection. Home and browser Back checkpoint/pause work and block departure when saving fails; Retry recovers the same attempt. Course progress, preferences and revision selections remain separate. Teacher entries preserve ionic/covalent categories and create no pupil evidence.

## Open locally

From this project directory:

```text
npm.cmd run build
npm.cmd run release:alevel
npm.cmd run release:igcse
npm.cmd run preview -- --port 5182
```

- A Level: http://127.0.0.1:5182/alevel/?course=alevel&view=home
- IGCSE: http://127.0.0.1:5182/igcse/?course=igcse&view=home

The original handoff left a preview running on 5182. For a fresh live-source preview on 5183, start it if needed with `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5183 --strictPort`.

## Verify and inspect

```text
npm.cmd run check:landing
node scripts/browser/landing/aggregate/prefix-browser.mjs
```

`check:landing` performs current deterministic landing checks; the retained browser recipe above performs fresh prefix checks. The original landing gate reused 156 regressions and passed seven focused landing tests and type/build/release checks. Its report artifacts were retired; these current recipes do not recreate historical acceptance.


The retired comparison sheets linked to full-resolution screenshots. The original/new pairs use identical synthetic history and viewports: desktop 1440×1000, tablet 820×1180 and mobile 390×844. They include awards/freshness, both A Level years, expanded topics, available/unavailable details, teacher details, revision, hover and keyboard focus. Original pages used fresh isolated browser contexts and read-only source serving. Infinite shine animations were paused at the same phase for screenshots; actual interaction checks kept animations running.

## Boundaries and limits

The authorised additions are the course switch and small Teacher/Import links; their extra row shifts maps down on narrow screens. Player/editor/statistics visual redesign and activity UI restoration are outside Part 1. No publication occurred.

Original app files and root controls remain unchanged: 1,317 protected files checked, with the existing 523 unreadable cloud files retaining metadata-only evidence. No real original browser profile or store was opened. New preferences use only the `masters-of-chemistry:landing:` namespace.

One original display quirk is deliberately preserved: the A Level map indexes its pH Titration Curves `[2,3]` award by `level - 1`, so a green/purple award may retain unstarted brightness. Correct mastery summaries and choice meters are unchanged. Fixing that original rendering quirk would be a separate change.

Failed probes and corrected-run evidence were deleted with validation history. Requested workers used Sol 6.1 / High; effective runtime settings and usage were not exposed. Historical root acceptance status is recorded in `landing-progress.json`; this cleanup does not reaccept the landing.
