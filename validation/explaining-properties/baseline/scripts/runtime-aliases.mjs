import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { compatibilityRoutes } from '../src/compatibility/routes.ts';
const project = path.resolve(import.meta.dirname, '..');
export function writeRuntimeAliases(course) {
  assert(['alevel', 'igcse'].includes(course));
  const root = path.join(project, 'dist', course),
    entries = [];
  for (const route of compatibilityRoutes[course]) {
    assert(/^activities\/[a-z0-9-]+\/index\.html$/.test(route));
    const slug = route.split('/')[1],
      activityId = `${course}/${slug}`,
      olympiad = slug === 'c3l6-organic-reactions';
    const file = path.resolve(root, route);
    assert(file.startsWith(root + path.sep));
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const html = `<!doctype html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Open chemistry activity</title></head><body><p>Opening your chemistry activity. <a href="../../index.html?view=${olympiad ? 'olympiad' : 'practice'}&amp;activity=${encodeURIComponent(activityId)}">Continue</a></p><script>\nconst oldLink=new URL(location.href);\nconst target=new URL('../../index.html',oldLink);\ntarget.search=oldLink.search;\nif(['review','question','code'].some(key=>oldLink.searchParams.has(key))){target.searchParams.set('activity',${JSON.stringify(activityId)});}else{target.searchParams.set('view',${JSON.stringify(olympiad ? 'olympiad' : 'practice')});target.searchParams.set('activity',${JSON.stringify(activityId)});}\nlocation.replace(target.href);\n</script></body></html>\n`;
    fs.writeFileSync(file, html);
    entries.push({
      course,
      route,
      activityId,
      kind: olympiad ? 'olympiad' : 'curriculum',
      bytes: Buffer.byteLength(html),
    });
  }
  return entries;
}
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  for (const course of ['alevel', 'igcse'])
    console.log(JSON.stringify(writeRuntimeAliases(course)));
}
