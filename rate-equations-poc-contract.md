# Rate Equations proof of concept

User-authorised 9 October 2026. This addition authorises a development-only React preview, not production registration or publication. It supersedes full production acceptance requirements for this bounded proof of concept only.

- Four isolated preview gems use u6-t1-2-1 through u6-t1-2-4: Orders & Rate Calculations; Rate Graphs & Half-life; Rate Equations & Mechanisms; Arrhenius & Temperature.
- Twelve starting questions, one per gem and level (Structured, Unstructured, Applications). Numerical questions have deterministic seeded variants; three mechanism questions are fixed and reviewed.
- Orders: simple order comparison; two-reactant table to orders/equation/k/units; simultaneous changes followed by prediction.
- Graphs: instantaneous rate from tangent triangle; two half-lives to order/k; concentration plus instantaneous rate to k with minutes/seconds conversion.
- Mechanisms: select rate equation for supplied slow first step; complete missing step with reviewed species/coefficient choices; select a two-step mechanism matching measured orders and overall equation.
- Arrhenius: activation energy from supplied gradient; graph gradient with scaled axes; true intercept to A and k at a new temperature.
- All responses automatically marked. No practical-method questions, extended written responses, self-rubrics or illustrative-dataset labels.
- Draggable concentration/time curve marker and automatically aligned tangent at every level; adjustable triangle shows delta x and delta y but not quotient before assessment. Pin two readings for half-life; keyboard/direct-input alternatives. Arrhenius reuses coordinate/gradient tools on supplied lines; defer scatter/best-fit editing.
- Use the shared React player and existing attempt semantics through a DEV-only host. Keep production catalogue, revision registrations, existing evidence and atlas untouched. New editor interfaces may be added minimally if necessary, with production assets remaining excluded/lazy. All other project code boundaries remain applicable.
- Record the future renumbering in authoring notes only: old 1/2 -> new 1; old 3/4 -> new 2; old 6 -> new 3; old 7 -> new 4; old 5 parts routed by content to 1 or 2. Migration later must use catalogue-version context because IDs overlap, preserve historical evidence and marks, and update current app/atlas outputs together.
- Validation: check all 12 answers and mechanisms, small deterministic seed sample, focused type/build checks, protected-source comparison with existing failures distinguished, and real browser walkthrough of navigation/marking/answers/dragging/keyboard. Inspect actual rendered output. No broad regression or exhaustive generator/full revision acceptance required.
- Delegation: one gpt-6.1-sol/high foreman, two direct gpt-6.1-sol/high workers, narrow contexts. Root final acceptance; no routine reviewer agent. Foreman owns integration/shared interfaces and swarm log. Graph worker owns graph tools, graph and Arrhenius content; content worker owns orders and mechanisms. Preserve unrelated edits.

Completion: working local preview URL, concise handover, retained lightweight checks and limitations. No deployment, commits or atlas migration.

## Authorised interaction refinement (9 October 2026)

User requests MCQ answer cards without circular indicators, alongside each other (responsive wrapping allowed). Rate equations and rate-constant units must be typed and automatically format exponent digits as superscripts. Mechanism rate-equation questions also use typed answers; preserve the existing liked mechanism examples. Digits in chemical species must retain their formula meaning (e.g. NO2 becomes NO₂, whereas [NO2]2 becomes [NO₂]²). Accept chemically equivalent rate laws regardless of factor ordering/explicit powers one or zero, and equivalent unit factor ordering and conventional exponent entry; reject wrong species/orders/units. Prefer bounded DEV formatting/marking over global behaviour changes.

Triangle endpoints are no longer draggable or editable. Tangent/curve marker remains draggable and auto-aligned. Show Δt and Δ[A] with values and units directly on the concentration–time graph, using a deterministic triangle that stays within the plot. Retain keyboard/direct marker inputs, half-life readings and Arrhenius tools, and hide gradient quotient until assessment. Remove obsolete triangle resize instructions. Keep the same lightweight scope: targeted numerical/chemical input checks and actual browser/render inspection of changed controls; no full production acceptance.

The current marker's x/y coordinates must also appear in a label box next to the point, using quantity names/units appropriate to concentration–time or Arrhenius axes. Keep the box readable and within plot bounds as the marker moves, including endpoints and mobile scrolling.
