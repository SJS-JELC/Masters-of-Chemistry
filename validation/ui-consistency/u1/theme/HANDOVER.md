# U03 — UI-THEME-U1 handover

## Outcome

Shared viewport background, Comfortaa typography, a 1120px question-pane cap and short directional course transitions are implemented. Source edits are limited to OriginalLanding.tsx and15 existing CSS files (see changed-files.json; list includes15CSS files plus TSX). Chemistry, canonical IDs, marking, immutable outlined assets and approved NMR files were not edited.

## Implementation

- platform.css owns --app-background, --question-pane-max-width and --ui-font-family. The exact landing gradient definitions and fixed star texture are applied once through body/body::before. Landing/course viewport wrappers are transparent; cards/editors retain local readable surfaces. Body background is fixed so scroll position never changes the shared viewport backdrop.
- Every UI descendant and live SVG text uses Comfortaa. Local font shorthands/family overrides were migrated in owned CSS; the unused Playwrite font-face was removed. A narrow Comfortaa-first Segoe UI Symbol fallback remains only on spin-arrow cells (.ec-box / .ec-source .orbital). External immutable image assets were not regenerated.
- Dot-and-cross no longer overrides shell gutters or removes the1120px width cap. Its drawing canvas still fits or magnifies/pans inside its own viewport.
- Course change uses110ms fade/16px out plus110ms fade/16px in, with direction following IGCSE/A Level. Existing guard, cancellation identity, inert state, focus restoration, preference/routing and single-course mounting are retained. L6/U6 remains the existing650ms 3D year flip.
- Final mobile inspection found a pre-existing EC energy-axis label starting17px outside the internal scroll origin. Scoped CSS shifts the axis13→30px and left diagram padding45→62px, retaining the axis-to-orbital spacing while putting the complete label inside scrollable content. Canonical EC-N8EG2F proves350/390/1440 label containment and mobile internal pan.
- Private GemPaths was replaced by the foreman's exact extracted shared component import.

## Validation and renders

- typecheck.txt: current npm.cmd run typecheck PASS.
- browser-results.json: PASS66 measurements,61 distinct fullpage frames over1440/820/390/350. All11 curriculum families covered at desktop390and350; representative diagram families820; landing/stats/teacher/import/Olympiad all widths. Computed Comfortaa, one identical body background, transparent wrappers and zero page overflow. Every curriculum pane has1120px cap.
- transition-cancellation-results.json: PASS paused out-animation canceled by pop navigation releases inert; paused slide unmount through Stats and Home remount is clear; year flip retains650ms transform/preserve-3d and correct active/inert year panels. browser-results.json also records both slide directions, rapid-toggle rejection, routing/focus restoration and immediate reduced motion.
- static-results.json: PASS23 settled final build frames on http://127.0.0.1:5192/alevel/ and /igcse/. Numeric/text/dot/EC/energy/titration plus both Olympiad challenges at1440/390, live spin-arrow and dot magnification. Exactly one four-button question-end row,44px heights, one line and right edge alignment pass. Source closure/build fingerprints are foreman-owned. Final EC scoped fix is additionally covered by ec-axis-source-results.json and final static refresh ec-axis-static-results.json. These targeted final EC frames supersede the EC frames from the23-frame static suite; all other family frames remain applicable. Final desktop/mobile contact sheets use the refreshed EC teacher-preview frame.
- Canonical EC-N8EG2F is a checked existing As/build/energy/minimum-level1 variant, used for focused axis checks in teacher preview, not an invented question. Source checks pass350/390/1440, label fully inside scroll bounds, mobile scrollLeft100, Comfortaa labels/spin fallback and no page overflow.
- Contact sheets: contact-desktop.png, contact-tablet.png, contact-mobile.png, contact-final-1440.png, contact-final-390.png. Fullsize PNGs accompany every frame. Desktop/mobile final sheet, full EC live-spin, corrected EC390detail and mobile bond frame visually inspected; original long pages retain fullsize screenshots. Bond reaction SVGs deliberately use internal horizontal pan (verified at390), preserving readable structure labels.
- Diagnostic browser-attempt1/2, browser-extra*, final-browser-results and static-attempt1 retain harness/ live-HMR failures; they are not final acceptance suites. Final settled static suite, focused axis suite and main responsive suite are the authoritative PASS evidence. Dot live-label fit/magnify/pan checks are independently retained in browser-extra-attempt1.json before that diagnostic run reached its obsolete EC selector.
- Browser uses pinned workspace Playwright1.62.1, Edge headless, isolated nonpersistent contexts, app-owned .u03tmp. No sibling app browser storage used. Contact sheets use Pillow12.3.0 with repository Comfortaa Bold for labels.

## Evidence-process exception (root accepted)

At22:11:22UTC I ran legacy scripts/protect-originals.mjs check without --output. It overwrote the generated validation/original-app-check.json summary and attempted reads of523 pre-existing offline placeholders; all failed and were recorded metadata-only, no contents hydrated. Original1317-file inventory returned zero changes. Copied this generated report to legacy-original-check-incident.json. Root accepted the bounded summary overwrite as an evidence-process exception, instructed no reconstruction/restoration because no exact backup exists, and retained the separate current stat-only guard as authoritative. No further legacy guard runs occurred. Foreman's validation/ui-consistency/u1/original-preservation.json compares794 readable files and stats523 offline placeholders without opening them.

## Regeneration

From app root run node validation/ui-consistency/u1/theme/static-browser.mjs against foreman-built5192; node validation/ui-consistency/u1/theme/transition-cancellation.mjs against source5188; node validation/ui-consistency/u1/theme/ec-axis-check.mjs for source; set U03_BASE=http://127.0.0.1:5192/alevel/ for its static refresh. Contact sheets regenerate with python validation/ui-consistency/u1/theme/contact-sheets.py and contact-final.py. Main browser-check.mjs supplements its retained attempt2 evidence to avoid repeating already-valid frames. Do not run historical default-output check scripts.
