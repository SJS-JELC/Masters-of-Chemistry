import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
export const projectRoot = path.resolve(import.meta.dirname, '../..');
export const workspaceRequire = createRequire(path.join(projectRoot, '../../package.json'));
if (workspaceRequire('playwright/package.json').version !== '1.62.1') throw new Error('Expected pinned workspace Playwright 1.62.1');
export const { chromium } = workspaceRequire('playwright');
export const devOrigin = process.env.BROWSER_BASE_URL || 'http://127.0.0.1:5181';
export const previewOrigin = process.env.BROWSER_PREVIEW_URL || 'http://127.0.0.1:5182';
export function outputDirectory(suite) {
  if (!/^[a-z0-9/-]+$/.test(suite) || suite.includes('..')) throw new Error('Invalid browser suite output path');
  const directory = path.join(projectRoot, '.artifacts/browser', suite);
  fs.mkdirSync(path.join(directory, '.tmp'), { recursive: true });
  process.env.TEMP = path.join(directory, '.tmp');
  process.env.TMP = process.env.TEMP;
  return directory;
}
