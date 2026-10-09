import fs from 'node:fs';
import path from 'node:path';
import { validateRelease } from './validate-s4-release.mjs';
const project = path.resolve(import.meta.dirname, '..');
const directory = path.join(project, '.artifacts/checks/s5');
fs.mkdirSync(directory, { recursive: true });
const report = [validateRelease()];
fs.writeFileSync(path.join(directory, 'release-checks.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
