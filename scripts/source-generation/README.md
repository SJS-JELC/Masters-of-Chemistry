# Retained source extraction

Run these tools from `apps/Masters-of-Chemistry`. They read the original sibling
applications and retain the original chemistry extraction algorithms. Frozen
catalogue/identity inputs live in `resources/source-generation/inventory/`;
historical control hashes live in `resources/source-generation/controls/`.

Use a read-only check first, for example:

```powershell
node scripts/source-generation/structure/extract-source.mjs --check
node scripts/write-catalogue-definitions.mjs --check
node scripts/validate-s0.mjs
```

Every extractor supports `--check`: it compares final generated outputs without
writing source files, copied assets or reports. Omitting `--check` explicitly
regenerates the extractor's source outputs and writes diagnostic fingerprints to
`.artifacts/source-generation/`. These tools expect the app working directory.

Historical extraction is a starting pathway. The acid extractor, A Level
dot-and-cross layout and both CSS extractors report existing differences from
subsequently refined live outputs. Review and preserve those refinements before
regeneration. The migration changed paths and provenance comments only; all twelve
extractors produced identical content before and after relocation. See
`docs/maintenance/generator-migration.json` for the comparison and exact drift list.

`validate-s0.mjs` deliberately reports differences from its immutable historical
baseline and returns a failure while those differences exist. It does not replace
hashes to assert current acceptance. `--sources-only` excludes historical-control
equality from its exit condition, but the historical contract is also a frozen
inventory source, so that source mismatch remains visible. Current catalogue
regeneration is checked independently by `write-catalogue-definitions.mjs --check`.

Deleted historical reports and screenshots are not regenerated or used as inputs.
Path identifiers inside frozen provenance data remain historical identifiers.
