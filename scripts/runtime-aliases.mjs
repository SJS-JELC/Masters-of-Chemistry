import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {compatibilityRoutes} from '../src/compatibility/routes.ts';
const project=path.resolve(import.meta.dirname,'..');
/** Flat collisions retain A Level by default; explicit course and qualified paths win. */
export function runtimeAliasDefinitions() {
  const byRoute=new Map();
  for(const course of ['alevel','igcse']) for(const route of compatibilityRoutes[course]) {
    assert(/^activities\/[a-z0-9-]+\/index\.html$/.test(route));
    const activityId=course+'/'+route.split('/')[1],candidates=byRoute.get(route)||{};
    candidates[course]=activityId;
    byRoute.set(route,candidates);
    byRoute.set(course+'/'+route,{[course]:activityId});
  }
  return [...byRoute].sort(([a],[b])=>a.localeCompare(b)).map(([route,candidates])=>({route,candidates,defaultCourse:candidates.alevel?'alevel':'igcse',rootLink:'../'.repeat(route.split('/').length-1)+'index.html'}));
}
export function runtimeAliasHtml({candidates,defaultCourse,rootLink}) {
  const activity=candidates[defaultCourse],view=activity.endsWith('/c3l6-organic-reactions')?'olympiad':'practice';
  return '<!doctype html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Open chemistry activity</title></head><body><p>Opening your chemistry activity. <a href="'+rootLink+'?course='+defaultCourse+'&amp;view='+view+'&amp;activity='+encodeURIComponent(activity)+'">Continue</a></p><script>\n'+
    'const oldLink=new URL(location.href);\nconst target=new URL('+JSON.stringify(rootLink)+',oldLink);\ntarget.search=oldLink.search;\ntarget.hash=oldLink.hash;\nconst candidates='+JSON.stringify(candidates)+';\nconst requested=oldLink.searchParams.get("course");\nconst course=Object.hasOwn(candidates,requested)?requested:'+JSON.stringify(defaultCourse)+';\nconst activity=candidates[course];\ntarget.searchParams.set("course",course);\ntarget.searchParams.set("activity",activity);\nif(!["review","question","code"].some(key=>oldLink.searchParams.has(key)))target.searchParams.set("view",activity.endsWith("/c3l6-organic-reactions")?"olympiad":"practice");\nlocation.replace(target.href);\n</script></body></html>\n';
}
export function writeRuntimeAliases() {
  const root=path.join(project,'dist','app');
  return runtimeAliasDefinitions().map(definition=>{
    const file=path.resolve(root,definition.route);assert(file.startsWith(root+path.sep));
    const html=runtimeAliasHtml(definition);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html);
    return {...definition,bytes:Buffer.byteLength(html)};
  });
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename)) console.log(JSON.stringify(writeRuntimeAliases()));
