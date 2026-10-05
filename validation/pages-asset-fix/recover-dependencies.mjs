// Recovery only: fill the app-local cache from exact integrity-checked lockfile tarballs.
// Does not change dependency versions, package metadata or lockfiles.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const app = path.resolve(import.meta.dirname, '../..');
const cache = path.join(app, '.npm-cache');
const archives = path.join(cache, 'locked-tarballs');
fs.mkdirSync(archives, { recursive: true });
const lock = JSON.parse(fs.readFileSync(path.join(app, 'package-lock.json'), 'utf8'));
const npmCli = path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
const report = { status: 'RUNNING', startedAt: new Date().toISOString(), mirror: 'https://registry.npmmirror.com', packages: [] };
try {
  for (const [name, pkg] of Object.entries(lock.packages)) {
    if (!pkg.resolved) continue;
    if (pkg.os && !pkg.os.includes(process.platform)) continue;
    if (pkg.cpu && !pkg.cpu.includes(process.arch)) continue;
    assert(pkg.resolved.startsWith('https://registry.npmjs.org/'), 'Unexpected lockfile registry');
    const url = pkg.resolved.replace('https://registry.npmjs.org', report.mirror);
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200, name + ' download failed');
    const bytes = Buffer.from(await response.arrayBuffer());
    const [algorithm, expected] = pkg.integrity.split('-');
    assert.equal(crypto.createHash(algorithm).update(bytes).digest('base64'), expected, name + ' locked integrity mismatch');
    const archive = path.join(archives, name.replaceAll('/', '-') + '.tgz');
    fs.writeFileSync(archive, bytes);
    const added = spawnSync(process.execPath, [npmCli, 'cache', 'add', archive, '--cache', cache, '--offline'], { cwd: app, encoding: 'utf8' });
    assert.equal(added.status, 0, name + ' cache add failed: ' + added.stderr);
    report.packages.push({ name, version: pkg.version, bytes: bytes.length, integrity: pkg.integrity, status: 'VERIFIED-AND-CACHED' });
    console.log(name + ': locked integrity verified and cached');
  }
  report.status = 'PASS';
} catch (error) { report.status = 'FAIL'; report.failure = error.stack; process.exitCode = 1; }
finally {
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(import.meta.dirname, 'dependency-recovery.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: report.status, packages: report.packages.length, failure: report.failure }));
}
