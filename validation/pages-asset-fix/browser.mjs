import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const app = path.resolve(import.meta.dirname, '../..');
const require = createRequire(path.join(app, '../../package.json'));
const site = path.join(app, '.browser/pages-asset-fix/_site');
const prefix = '/Masters-of-Chemistry/';
const report = { status: 'RUNNING', startedAt: new Date().toISOString(), prefix, errors: [], checks: [] };
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' };
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const file = path.resolve(site, pathname.startsWith(prefix) ? pathname.slice(prefix.length) || 'index.html' : '__missing');
  if (!file.startsWith(site + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end(); return; }
  response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  response.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}${prefix}`;
const temp = path.join(app, '.browser/pages-asset-fix/temp');
fs.mkdirSync(temp, { recursive: true });
process.env.TEMP = temp;
process.env.TMP = temp;
let browser;
try {
  browser = await require('playwright').chromium.launch({ channel: 'msedge', headless: true });
  report.browserVersion = browser.version();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(base + '?course=alevel&view=olympiad&activity=alevel/olympiad-2011-q4');
  const image = page.locator('.isomer-spectrum img');
  await image.waitFor();
  await image.evaluate(img => img.decode());
  const properties = await image.evaluate(img => ({ source: img.currentSrc, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight }));
  assert(properties.naturalWidth > 0 && properties.naturalHeight > 0);
  assert(properties.source.startsWith(base), 'Asset must respect the Pages URL prefix');
  const response = await page.request.get(properties.source);
  assert.equal(response.status(), 200);
  const sha256 = crypto.createHash('sha256').update(await response.body()).digest('hex');
  assert.equal(sha256, '07d75b648f1117fadaa701ecb875e68331f2dc4a8a451cea1f9591a257ea1d7d');
  report.checks.push({ check: 'Packaged SVG loads under Pages prefix with approved bytes', status: 'PASS', ...properties, sha256 });
  await image.scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(import.meta.dirname, 'spectrum-desktop.png'), fullPage: true });
  await page.getByRole('button', { name: 'Enlarge compound 3 NMR spectrum' }).click();
  const dialog = page.getByRole('dialog', { name: 'Enlarged compound 3 NMR spectrum' });
  await dialog.waitFor();
  await dialog.locator('img').evaluate(img => img.decode());
  await page.screenshot({ path: path.join(import.meta.dirname, 'spectrum-zoom.png') });
  await page.getByRole('button', { name: 'Close spectrum', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await image.scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(import.meta.dirname, 'spectrum-mobile.png'), fullPage: true });
  await page.reload();
  await page.locator('.isomer-spectrum img').evaluate(img => img.decode());
  report.checks.push({ check: 'Desktop, mobile, zoom and direct reload image rendering', status: 'PASS' });
  assert.deepEqual(report.errors, []);
  report.status = 'PASS';
} catch (error) { report.status = 'FAIL'; report.failure = error.stack; process.exitCode = 1; }
finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(import.meta.dirname, 'browser.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
}
