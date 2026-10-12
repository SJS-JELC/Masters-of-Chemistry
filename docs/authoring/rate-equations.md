# Rate Equations

The combined React app owns one A Level Rate Equations activity with four gems,
each supporting Structured, Unstructured and Applications levels. The user
authorized main-app integration on12 October2026. Publication remains separate.

| Stable gem | Family | OCR Chemistry A |
| --- | --- | --- |
|`u6-t1-2-orders`|Orders & Rate Calculations|5.1.1(a–c)|
|`u6-t1-2-graphs`|Rate Graphs & Half-life|5.1.1(d–f)|
|`u6-t1-2-mechanisms`|Rate Equations & Mechanisms|5.1.1(i)|
|`u6-t1-2-arrhenius`|Arrhenius & Temperature|5.1.1(k)|

Source: `src/activities/alevel/rate-equations/`. The12 accepted prototype
question identities remain `RATE-POC-{family}-L{level}` internally; permanent
display aliases use `RE-000001` through `RE-00000C`. Numerical families restore
from the source ID and uint32 seed; the three checked mechanisms use seed0.
These are the existing examples and numerical variants, not a full5.1.1 bank.
Practical-method questions and scattered-data best-fit editing remain deferred.

Practice and revision use the same QuestionPlayer, attempt controller, active
clock, scheduler and IndexedDB repository. All four registered gems supply
all three levels to topic ADD ALL. First independent responses, marks and time
remain immutable. Teacher mode produces no pupil evidence. Five minutes of idle
allowance supports the multipart numerical and graph work.

The graph workspace is an unmarked measuring aid. It persists only marker,
two pinned readings and the Arrhenius extension toggle, under the same attempt
ID. Curves and tangent geometry regenerate analytically. Drag rendering stays
local and checkpoints on release; keyboard/direct inputs remain available.
The gradient quotient appears only after assessment.

Typed rate laws and k units keep the checked bounded semantic parser: equivalent
factor ordering and supported powers are accepted; malformed input, wrong
species/case/orders and incorrect units are rejected. This is not a general
algebra parser. Formula digits remain subscripts; factor powers format as
superscripts. The source-reviewed fixed mechanism chemistry is unchanged.

Historical numeric rate gem IDs retain their old meaning in frozen Recall/atlas
provenance. No numeric redirect, historical score import, catalogue reinterpretation
or atlas migration is performed. Landing display slots explicitly map to the four
new semantic IDs.

## Reproducible checks

Run from the app folder:

```powershell
npm.cmd run typecheck
node --test scripts/tests/rate-equations-content.test.mjs scripts/tests/rate-equations-workspace.test.mjs scripts/test_revision_registration.mjs scripts/test_active_question_time.mjs
node scripts/review_active_question_time.mjs
npm.cmd run build
node scripts/release-s4.mjs app
node scripts/validate-s4-release.mjs app
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5261 --strictPort
# In another terminal; RATE_APP_URL can override localhost5261:
node scripts/rate-equations-integration-browser.mjs
node scripts/rate-equations-integration-timing-browser.mjs
```

The timing browser uses real Microsoft Edge with a real300-second idle period.
Keep source unchanged during this measurement so development hot reload cannot
restart the clock. Generated screenshots, temporary browser profiles and reports
are disposable verification outputs. Durable preservation fixtures live in
`scripts/tests/fixtures/rate-equations-preservation.json`; they do not depend on
old validation trees. Browser timing reports distinguish real event-loop
suspension-gap verification from native operating-system suspend.

The development preview remains `?harness=rate-equations`, importing the same
production engines. Its own memory-only host is separate from pupil persistence.
