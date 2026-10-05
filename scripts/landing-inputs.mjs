import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { currentInputs } from './current-inputs.mjs';
const project = path.resolve(import.meta.dirname, '..');
/** Current landing source/build closure; historical S5 acceptance remains intact. */
export function landingInputs() {
  const existing = currentInputs();
  const extra = [
    'landing-contract.json', 'LANDING-HANDOFF.md',
    'scripts/verify-landing.mjs', 'scripts/landing-legacy-gates.mjs',
    'scripts/landing-inputs.mjs', 'scripts/verify-landing-freeze.mjs',
    'scripts/write-landing-aggregate.mjs',
    'validation/landing-restoration/aggregate/prefix-browser.mjs',
    'validation/landing-restoration/design/reuse-originals.mjs',
    'validation/landing-restoration/design/invariants.test.mjs',
    'validation/landing-restoration/design/compare-browser.mjs',
    'validation/landing-restoration/design/interaction-browser.mjs',
    'validation/landing-restoration/design/harness.tsx',
    'validation/landing-restoration/design/harness.html',
    'validation/landing-restoration/design/write-review.mjs',
    'validation/landing-restoration/integration/launch-routing.test.ts',
    'validation/landing-restoration/integration/browser.mjs',
    'validation/landing-restoration/integration/revision-browser.mjs',
    'validation/landing-restoration/integration/failure-browser.mjs',
    'validation/landing-restoration/integration/teacher-category/browser.mjs',
  ].map(relative => {
    const file = path.join(project, relative), bytes = fs.readFileSync(file);
    return { path: relative, bytes: bytes.length,
      sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
  });
  return [...new Map([...existing, ...extra].map(item => [item.path, item])).values()]
    .sort((a, b) => a.path.localeCompare(b.path));
}
