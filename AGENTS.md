# Masters-of-Chemistry implementation instructions

Read `project-contract.json`, `IMPLEMENTATION.md` and `progress.json` before work and after resuming. Read the workspace AGENTS.md for chemistry, provenance, rendering and timing standards. The user's specific rebuild instructions and this contract supersede the former independent-app-source convention for this new project only.

## Boundaries

- All implementation, dependencies, build products and verification artefacts belong in this project. The workspace swarm log and its archive are the only authorised orchestration writes outside it.
- Both sibling applications are read-only references. Do not change their files, Git state, dependencies, generated outputs or browser storage. Never run their build commands. Do not change workspace dependencies/configuration.
- Root owns the scope contract. Workers cannot change the contract, requirements, acceptance criteria or other workers' files. Shared interface changes go through the foreman and root.
- Existing question IDs and seeds reproduce questions. Do not introduce full question snapshots or speculative content-version infrastructure. Preserve original question IDs, curriculum IDs, chemistry and mastery mathematics. Use a new ID for a substantively replaced question.
- Rocket Recall is excluded from runtime, navigation, assets, dependencies and imported progress. Preserve its old implementation untouched.
- C3L6 is an Olympiad-only challenge with completion and saved drawings; no mastery, gems or curriculum revision registration. No mastery labels in its UI.
- Do not enable unpublished prototypes, create accounts/backend/offline-download features, or deploy.

## Architecture and authoring

- One shared React/TypeScript platform, two course build targets; reusable question player for practice/revision; no iframe/legacy-page wrappers.
- Keep chemistry/marking functions independent of React. Standardise incidental UI/state differences; preserve educational scaffolding, chemical validation and genuine staged-question dependencies.
- Shared attempt engine alone records first assessments, assistance and active timing. Teacher preview produces no evidence. Retries/reveals/reloads do not create independent evidence.
- Use explicit stable registrations for navigation, supported levels, revision, timing and release selection. Never generate identifiers from display order.
- Allow answer controllers/editor engines to be reused where checked, but replace page-level persistence, scheduling and DOM contracts.
- Scope status and evidence belong in progress/validation, not modifications of requirements.

## Delegation

Exactly one foreman parents all concurrent workers. All delegates use requested `gpt-6.1-sol` / `high`, narrow handoffs and no nested worker delegation. Maximum six implementation workers and two genuine-exception reviewers concurrently. Root accepts each stage before the next is dispatched. A worker PASS is not acceptance.

Workers own explicit paths and write compact completion manifests with job/agent IDs, PASS/ESCALATE/FAIL, output paths and validation references. The foreman alone owns the workspace swarm log during a stage. Record actual usage only when exposed.

## Acceptance

Run the protected-app check at every stage. Require type/build checks, chemistry/reference fixtures, runtime tests and actual browser/rendered inspection as appropriate. Never weaken checks to obtain PASS. Port old checks into this project or run read-only reference tests with output redirected here. Use the pinned workspace Playwright through an explicit read-only dependency path, not .scratch packages.

On resume: reconcile actual outputs and evidence with progress before assigning work. Preserve valid accepted work. Completion requires all contract requirements and stage gates, not merely worker completion.
