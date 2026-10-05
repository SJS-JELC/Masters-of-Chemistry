# Root-gated footer width correction

Added `width: auto` to the existing specific shared question-action button selector. This removes calorimetry's inherited `width:100%` and keeps the footer compact/right aligned centrally. The retained pre-fix browser probe reproduces the desktop failure; no chemistry, keyboard, assessment or Olympiad behavior changed.

[Report](report.json), [one-property source patch](source-changes.patch), [desktop calorimetry](igcse-calorimetry-1440.png), [350px calorimetry](igcse-calorimetry-350.png), [browser results](browser-results.json), [current input closure](current-inputs.json).

All11 curriculum families pass at1440/390/350px:33 actual static Edge checks, exact four controls in one row,44px button heights, Comfortaa, compact natural widths/right alignment and no page overflow. Desktop calorimetry now occupies347.02px of its1074px footer; mobile occupies227.89px of320/280px. The new compact-width assertion detects the previous failure that right-edge alignment alone missed. Both builds/typecheck/releases and stat-only originals guard pass. All283 prior U1 evidence hashes remain unchanged.

Current645-input tree: `3a24f663f5a723272f58ec02e323ae11db8a6ce9eb21b7e268ca1fa75b201b8f`. Root U1 gate and U2 remain pending. No publication.

Reproduce from the app directory:

```powershell
node validation/ui-consistency/u1-footer-fix/build-and-release.mjs
node validation/ui-consistency/u1-footer-fix/browser.mjs
node validation/ui-consistency/u1-footer-fix/check-originals.mjs
node validation/ui-consistency/u1-footer-fix/finalize.mjs
```

Static preview5192 serves both new builds. Browser uses pinned workspace Playwright1.62.1/headless Edge in an isolated context with app-owned short temporary storage. Prior U1 evidence is preserved; this folder contains the correction evidence.
