import { chromium } from '../../../../../node_modules/playwright/index.mjs';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const folder = fileURLToPath(new URL('./', import.meta.url));
const stage = process.argv[2] || 'before';
if (!['before', 'after'].includes(stage)) throw Error('Expected before or after');
const profile = resolve(folder, 'browser-profile', `fonts-${stage}-${Date.now()}`);
const contained = () => profile.startsWith(resolve(folder, 'browser-profile') + sep);
if (!contained()) throw Error('Profile containment');
await mkdir(folder, { recursive: true });
const context = await chromium.launchPersistentContext(profile, { channel: 'msedge', headless: true, viewport: { width: 1440, height: 1000 } });
const results = [];
try {
  for (const course of ['alevel', 'igcse']) {
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:5181/${course}.html?run=fonts-${stage}-${Date.now()}&fixture=numeric`);
    await page.getByRole('button', { name: 'Start fixture', exact: true }).click();
    await page.getByTestId('attempt-phase').filter({ hasText: 'answering' }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    const computed = await page.evaluate(() => {
      const selectors = ['html', 'body', '#root', '.course-shell', '.question-player', '.question-player>.content p', '.question-part .content p', '.support-note', 'h1', 'h2', '.question-part input'];
      return selectors.map(selector => { const element = document.querySelector(selector); if (!element) return { selector, found: false }; const style = getComputedStyle(element); return { selector, tag: element.tagName, fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight, lineHeight: style.lineHeight, inlineStyle: element.getAttribute('style') }; });
    });
    const session = await context.newCDPSession(page); await session.send('DOM.enable'); await session.send('CSS.enable');
    const { root } = await session.send('DOM.getDocument');
    const rendered = [];
    for (const selector of ['.question-player>.content p', '.question-part .content p', 'h1', 'h2']) {
      const { nodeId } = await session.send('DOM.querySelector', { nodeId: root.nodeId, selector });
      const fonts = await session.send('CSS.getPlatformFontsForNode', { nodeId }); rendered.push({ selector, fonts: fonts.fonts });
    }
    const rules = await page.evaluate(() => Array.from(document.styleSheets).flatMap(sheet => { try { return Array.from(sheet.cssRules).filter(rule => rule instanceof CSSStyleRule && (rule.style.fontFamily || rule.style.font)).map(rule => ({ sheet: sheet.href, selector: rule.selectorText, fontFamily: rule.style.fontFamily, font: rule.style.font })); } catch { return []; } }));
    results.push({ course, computed, rendered, rules });
    await page.screenshot({ path: resolve(folder, `fonts-${stage}-${course}.png`), fullPage: true });
    await page.close();
  }
  await writeFile(resolve(folder, `fonts-${stage}.json`), JSON.stringify({ stage, browser: context.browser().version(), testedAt: new Date().toISOString(), results }, null, 2));
  console.log(JSON.stringify(results.map(result => ({ course: result.course, computed: result.computed, rendered: result.rendered }))));
} finally { await context.close(); if (!contained()) throw Error('Cleanup containment'); await rm(profile, { recursive: true, force: true }); }
