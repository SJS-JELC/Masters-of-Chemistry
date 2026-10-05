# Authored source formatting

> Evidence retirement (5 October 2026): historical validation reports, screenshots and acceptance records were deleted by user request after executable dependencies were migrated. Remaining `validation/` path names and past test counts describe historical records, not present files or fresh acceptance. See [validation cleanup](../maintenance/validation-cleanup.md).

From this project, run `npm.cmd run format` and `npm.cmd run format:check`.
Prettier 3.6.2 is pinned in the project lockfile. Configuration uses two spaces,
semicolons, single quotes and a 100-column target.

The command formats authored TS/TSX under `src` and the authoring template.
It preserves extracted chemistry data, source/provenance fingerprints, generated
catalogue definitions, declaration files and retained CLI-generated instances.
Generated instances bind their exact original output in `generation-manifest.json`;
new instances copy the current formatted templates.

Before writing, the command compares source syntax, type nodes and transformed
executable JSX syntax. It ignores comments, parentheses and equivalent property
quotes. Adjacent React text children are merged for comparison because formatting
may introduce an explicit space child. Ordinary data arrays remain exact.
`node scripts/format-authored.mjs --self-test` checks accepted formatting cases and
rejection of changed answers, operators, types, JSX labels and ordinary arrays.

The first formatting pass recorded the original text and before/after hashes under
`validation/s4/refinement/formatting`. This is additional refinement evidence;
earlier stage source hashes remain historical snapshots, not current-byte claims.
