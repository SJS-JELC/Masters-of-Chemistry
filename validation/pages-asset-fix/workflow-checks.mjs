import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const app = path.resolve(import.meta.dirname, '../..');
const npmCli = path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const generated = ['release/alevel.runtime.json', 'release/igcse.runtime.json', 'validation/s5/integration/release-checks.json'];
const originals = new Map(generated.map(file => [file, fs.existsSync(path.join(app, file)) ? fs.readFileSync(path.join(app, file)) : null]));
const report = { status: 'RUNNING', startedAt: new Date().toISOString(), node: process.version, steps: [], packaging: null };
try {
  for (const step of ['typecheck', 'build', 'release:alevel', 'release:igcse', 'check:release']) {
    const result = spawnSync(process.execPath, [npmCli, 'run', step], { cwd: app, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
    fs.writeFileSync(path.join(import.meta.dirname, step.replaceAll(':', '-') + '.log'), result.stdout + result.stderr);
    report.steps.push({ command: 'npm run ' + step, exitCode: result.status });
    console.log(step + ': ' + result.status);
    assert.equal(result.status, 0, step + ' failed; see retained log');
  }
  for (const file of generated) fs.copyFileSync(path.join(app, file), path.join(import.meta.dirname, path.basename(file)));
  const manifest = JSON.parse(fs.readFileSync(path.join(app, 'release/alevel.runtime.json'), 'utf8'));
  const site = path.join(app, '.browser/pages-asset-fix/_site');
  fs.mkdirSync(site, { recursive: true });
  // The same approved-file copy loop as .github/workflows/pages.yml; local target stays ignored.
  for (const { path: file, sha256 } of manifest.files) {
    const target = path.join(site, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(app, 'dist/alevel', file), target);
    assert.equal(sha(fs.readFileSync(target)), sha256, 'Packaged byte mismatch: ' + file);
  }
  const spectrum = manifest.files.find(file => /^assets\/compound-3-.*\.svg$/.test(file.path));
  assert(spectrum, 'Approved spectrum missing from release');
  assert.equal(spectrum.sha256, '07d75b648f1117fadaa701ecb875e68331f2dc4a8a451cea1f9591a257ea1d7d');
  report.packaging = { status: 'PASS', runtimeFileCount: manifest.files.length, site: '.browser/pages-asset-fix/_site', spectrum };
  report.status = 'PASS';
} catch (error) { report.status = 'FAIL'; report.failure = error.stack; process.exitCode = 1; }
finally {
  // Preserve historical release/acceptance artifacts byte-for-byte; current evidence lives here.
  for (const [file, bytes] of originals) {
    if (bytes) fs.writeFileSync(path.join(app, file), bytes);
    else if (fs.existsSync(path.join(app, file))) fs.unlinkSync(path.join(app, file));
  }
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(import.meta.dirname, 'workflow-checks.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
}
