import fs from 'node:fs/promises';
const source=await fs.readFile('apps/Masters-of-A-Level-Chemistry/src/activities/molecule-builder/layout.js','utf8');
const body=source.slice(source.indexOf('  const LENGTH'),source.indexOf('  root.MoleculeLayout'));
// Preserve checked source arithmetic; explicit typed input/output is validated by engine.ts.
await fs.writeFile('apps/Masters-of-Chemistry/src/chemistry/molecule/layout.ts', '// @ts-nocheck\n/** Exact source layout algorithm, with an ES module boundary. Engine validates both graphs. */\nimport type { MoleculeGraph } from "../../contracts/editors.ts";\n'+body.replace('function clean(graph)', 'export function clean(graph: MoleculeGraph): MoleculeGraph'));
