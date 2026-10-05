# L03 LANDING-TEACHER-CATEGORY

## Outcome

The IGCSE eagle's ionic and covalent gem links preserve their source category in the shared teacher chooser. The existing Search catalogue control starts with the category, its initial options use exact `TeacherCatalogueEntry.group` equality, and its default question is the first matching source entry. Clearing Search catalogue exposes all questions. No UI element, bank, question, marking policy or mastery/persistence mathematics changed.

The selected teacher activity/category is encoded in the new project's URL for reload and browser history. Old source category+fresh+teacher links carry the same initial category. Exact coded reviews take priority and remain unfiltered. Generic teacher entry and the selected calorimetry/energy routes remain unfiltered. Teacher preview creates no attempt or independent evidence.

## Source authority

- `apps/Masters-of-IGCSE-Chemistry/src/landing/catalog.js:40`: fourth-3-1 href carries `category=ionic`.
- `apps/Masters-of-IGCSE-Chemistry/src/landing/catalog.js:44`: fourth-3-2 href carries `category=covalent`.
- Original `src/activities/dot-and-cross/app.js` reads the category and filters its teacher pool against the record category.
- Migrated `src/activities/igcse/dot-and-cross/provider.ts` retains the exact `categoryByGem` mapping and unchanged bank records.
- Existing `src/ui/teacher-catalogue.ts` labels every diagram configuration with its original record category.

Original source files were read only; no original app/origin/storage was opened or modified.

## Diff / ownership

- `src/foundation/ProductionFoundation.tsx`: selected canonical gem maps to the authoritative category; teacher URL carries activity/category; category is restored from old/new URLs; ordinary view navigation clears it.
- `src/contracts/integration.ts`: optional `initialTeacherGroup` limited to ionic/covalent.
- `src/foundation/ActivityHost.tsx`: forwards the optional group to TeacherPicker.
- `src/ui/TeacherPicker.tsx` (explicitly transferred ownership): optional `initialGroup`; initial existing search control, exact group filter and matching default row; exact code lookup clears the search. Existing UI and generic behavior retained.
- `validation/landing-restoration/integration/teacher-category/**`: new browser fixture/results, screenshots, source review, handover and completion. Previous PASS evidence preserved unchanged.

## Verification

- Local pinned TypeScript: PASS, `typecheck.txt` retained with no diagnostics.
- Local pinned Prettier on the four changed source paths: applied.
- `browser-results.json`: all 3 actual-source browser scenarios PASS; no page errors.
- Eagle ionic: 55 matching configurations, default `nacl`; eagle covalent: 47 matching configurations, default `h2`. Each reload retains its category/default. Clearing yields all 104 configurations.
- Old category+fresh+teacher URLs preserve each category. A covalent exact coded review with an ionic category query opens the exact covalent question and all-category chooser.
- Selected calorimetry, selected energy, and generic teacher remain unfiltered. Every scenario has zero pupil attempts and zero independent evidence.
- Browser uses live React source at Vite 5183, fresh isolated synthetic profiles, headless Microsoft Edge 154.0.4258.48 and the workspace's pinned read-only Playwright 1.62.1.
- Manually inspected both final teacher screenshots: existing controls are unchanged, category text/default question/answer agree, NaCl shows correctly charged ions and H2 shows the shared dot-and-cross pair. No new editor or activity rendering was generated.

## Limits / remaining acceptance

No package/build/release/deployment change. Foreman owns final combined build/regression/protected-original gates and root acceptance. Effective model settings and actual usage are not exposed; remain null. No substantive chemistry/content changes or new curriculum scope are claimed.
