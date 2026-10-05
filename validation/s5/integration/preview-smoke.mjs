import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
const project = path.resolve(import.meta.dirname, '../../..');
const child = spawn(process.execPath, ['scripts/preview.mjs'], { cwd: project, stdio: ['ignore', 'pipe', 'pipe'] });
const errors = [];
child.stderr.on('data', data => errors.push(String(data)));
const report = { status: 'FAIL', checkedAt: new Date().toISOString(), checks: [] };
try {
  await Promise.race([once(child.stdout, 'data'), once(child, 'exit').then(([code]) => { throw Error(`Preview exited ${code}: ${errors.join('')}`); })]);
  for (const course of ['alevel', 'igcse']) {
    const response = await fetch(`http://127.0.0.1:5182/${course}/`);
    assert.equal(response.status, 200);
    const html = await response.text();
    const asset = /src="(\.\/assets\/[^" ]+\.js)"/.exec(html)?.[1];
    assert(asset, 'Missing real course entry');
    const script = await fetch(new URL(asset, `http://127.0.0.1:5182/${course}/`));
    assert.equal(script.status, 200);
    assert.match(script.headers.get('content-type'), /javascript/);
    const manifest = JSON.parse(fs.readFileSync(path.join(project, 'release', `${course}.runtime.json`)));
    for (const alias of manifest.files.filter(file => file.role === 'compatibility-alias')) assert.equal((await fetch(`http://127.0.0.1:5182/${course}/${alias.path}`)).status, 200);
    report.checks.push({ course, index: 'PASS', realEntry: 'PASS', aliases: 6 });
  }
  for (const url of ['/alevel/.vite/manifest.json', '/alevel/%2e%2e%2fpackage.json', '/missing/', '/igcse/absent.js']) assert.equal((await fetch(`http://127.0.0.1:5182${url}`)).status, 404);
  report.status = 'PASS';
} catch (error) {
  report.error = error.stack;
  process.exitCode = 1;
} finally {
  child.kill();
  await once(child, 'exit');
  fs.writeFileSync(path.join(import.meta.dirname, 'preview-smoke.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
}
