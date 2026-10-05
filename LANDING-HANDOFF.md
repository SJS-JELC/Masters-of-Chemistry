# Original landing restoration — Part 1

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

The existing preview on 5182 was left running. Live source is also available on 5183; start it if needed with `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5183 --strictPort`.

## Verify and inspect

```text
npm.cmd run check:landing
node scripts/verify-landing-freeze.mjs
node validation/landing-restoration/aggregate/prefix-browser.mjs
```

The current landing check preserves historical S0–S5 acceptance and writes new evidence under `validation/landing-restoration`. `check:s5` remains the historical final freeze and is expected to detect the later landing changes. The final gate reused the successful 156 retained regressions after confirming unchanged chemistry, banks, marking, editors, mastery, timing and persistence sources; seven focused landing tests and current type/build/release checks passed.

- [Aggregate](validation/landing-restoration/foreman-report.json)
- [Current deterministic checks](validation/landing-restoration/aggregate/checks.json)
- [Source reuse and rendering details](validation/landing-restoration/design/HANDOVER.md)
- [75-pair state matrix](validation/landing-restoration/design/state-matrix.json)
- [A Level comparison sheet](validation/landing-restoration/design/alevel-contact-sheet.html)
- [IGCSE comparison sheet](validation/landing-restoration/design/igcse-contact-sheet.html)
- [Launch/save/revision browser evidence](validation/landing-restoration/integration/HANDOVER.md)
- [Teacher category evidence](validation/landing-restoration/integration/teacher-category/HANDOVER.md)

Comparison sheets link to all full-resolution screenshots. The original/new pairs use identical synthetic history and viewports: desktop 1440×1000, tablet 820×1180 and mobile 390×844. They include awards/freshness, both A Level years, expanded topics, available/unavailable details, teacher details, revision, hover and keyboard focus. Original pages used fresh isolated browser contexts and read-only source serving. Infinite shine animations were paused at the same phase for screenshots; actual interaction checks kept animations running.

## Boundaries and limits

The authorised additions are the course switch and small Teacher/Import links; their extra row shifts maps down on narrow screens. Player/editor/statistics visual redesign and activity UI restoration are outside Part 1. No publication occurred.

Original app files and root controls remain unchanged: 1,317 protected files checked, with the existing 523 unreadable cloud files retaining metadata-only evidence. No real original browser profile or store was opened. New preferences use only the `masters-of-chemistry:landing:` namespace.

One original display quirk is deliberately preserved: the A Level map indexes its pH Titration Curves `[2,3]` award by `level - 1`, so a green/purple award may retain unstarted brightness. Correct mastery summaries and choice meters are unchanged. Fixing that original rendering quirk would be a separate change.

Raw failed probes remain alongside their accepted corrected runs. Requested workers used Sol 6.1 / High; effective runtime settings and usage were not exposed. Final root code/render acceptance is pending in `landing-progress.json`.
