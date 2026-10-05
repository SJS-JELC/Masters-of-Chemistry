import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { currentInputs } from './current-inputs.mjs';
const project = path.resolve(import.meta.dirname, '..');
/** Current landing source/build closure. Historical acceptance reports were retired. */
export function landingInputs() {
  const existing = currentInputs();
  const extra = [
    'landing-contract.json', 'LANDING-HANDOFF.md',
    'scripts/verify-landing.mjs', 'scripts/landing-legacy-gates.mjs',
    'scripts/landing-inputs.mjs',
    'scripts/browser/landing/aggregate/prefix-browser.mjs',
    'scripts/browser/landing/design/reuse-originals.mjs',
    'scripts/tests/landing/invariants.test.mjs',
    'scripts/browser/landing/design/compare-browser.mjs',
    'scripts/browser/landing/design/interaction-browser.mjs',
    'scripts/browser/fixtures/landing/harness.tsx',
    'scripts/browser/fixtures/landing/harness.html',
    'scripts/tests/landing/launch-routing.test.ts',
    'scripts/browser/landing/integration/browser.mjs',
    'scripts/browser/landing/integration/revision-browser.mjs',
    'scripts/browser/landing/integration/failure-browser.mjs',
    'scripts/browser/landing/integration/teacher-category/browser.mjs',
  ].map(relative => {
    const file = path.join(project, relative), bytes = fs.readFileSync(file);
    return { path: relative, bytes: bytes.length,
      sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
  });
  return [...new Map([...existing, ...extra].map(item => [item.path, item])).values()]
    .sort((a, b) => a.path.localeCompare(b.path));
}
