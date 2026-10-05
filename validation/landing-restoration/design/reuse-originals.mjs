import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import postcss from '../../../node_modules/postcss/lib/postcss.mjs';
const project = path.resolve(import.meta.dirname, '../../..');
const workspace = path.resolve(project, '../..');
const fingerprints = [];
function original(course, rel) {
  const root = course === 'alevel' ? 'Masters-of-A-Level-Chemistry' : 'Masters-of-IGCSE-Chemistry';
  const file = path.join(workspace, 'apps', root, 'src', rel);
  const bytes = fs.readFileSync(file);
  fingerprints.push({course, path:path.relative(workspace,file).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
  return bytes.toString('utf8');
}
const catalogues = {};
for (const course of ['alevel', 'igcse']) {
  const context = {}; vm.runInNewContext(original(course,'landing/catalog.js'), context);
  catalogues[course] = {groups:context.MASTERS_HIERARCHY,activities:context.MASTERS_ACTIVITIES,display:context.MASTERS_DISPLAY || {hiddenGems:[],redirects:{}}};
  const files = ['assets/shared-theme.css', course === 'alevel' ? 'landing/ocr.css' : 'landing/styles.css', ...(course === 'alevel' ? ['assets/alevel-mastery.css'] : []), 'assets/test-mode.css'];
  const scope = `.original-landing.${course}`;
  const sheets = files.map(file => {
    const root = postcss.parse(original(course,file));
    root.walkRules(rule => {
      if (rule.parent.type === 'atrule' && rule.parent.name.endsWith('keyframes')) return;
      rule.selectors = rule.selectors.map(selector => {
        let result = selector.replace(/:root|(?<![\w.#-])(?:html|body)(?![\w-])/g, scope);
        // Root/body combinations become the same component boundary.
        result = result.replaceAll(`${scope} ${scope}`,scope);
        if(result.startsWith('.test-selecting')||result.startsWith('.test-revising'))return scope+result;
        return result.startsWith(scope) ? result : `${scope} ${result}`;
      });
    });
    root.walkDecls('src', decl => decl.value = decl.value.replace('fonts/Comfortaa-Bold.ttf','../../public/assets/landing/fonts/Comfortaa-Bold.ttf'));
    return `/* Reused ${course}/${file}; selector boundary only. */\n${root.toString()}`;
  });
  if(course==='igcse'){
    const toggle=postcss.parse(original('alevel','landing/ocr.css'));
    toggle.walkRules(rule=>{if(!/(subject-toggle|toggle-track|toggle-sun|toggle-moon|toggle-thumb|physical-label|organic-label)/.test(rule.selector))rule.remove();else rule.selectors=rule.selectors.map(selector=>`${scope} ${selector}`);});
    // Only source toggle rules are transferred; unrelated source root/animations excluded.
    toggle.walkAtRules(rule=>{if(rule.name==='keyframes'||!rule.nodes?.length)rule.remove();});
    sheets.push('/* Authorised course switch: original A Level year toggle rules. */\n'+toggle.toString());
  }
  fs.writeFileSync(path.join(project,`src/landing/${course}.css`),sheets.join('\n'));
  original(course,'index.html'); original(course,'landing/app.js');
  original(course,course === 'alevel' ? 'assets/alevel-mastery.js' : 'landing/progress.js');
  original(course,'assets/test-mode.js');
}
fs.writeFileSync(path.join(project,'src/landing/catalogue-data.json'),JSON.stringify(catalogues,null,2)+'\n');
for (const asset of ['SJS-Eagle.svg','fonts/Comfortaa-Bold.ttf']) {
  original('alevel',`assets/${asset}`);
  fs.copyFileSync(path.join(workspace,'apps/Masters-of-A-Level-Chemistry/src/assets',asset),path.join(project,'public/assets/landing',asset));
}
fs.writeFileSync(path.join(project,'validation/landing-restoration/design/source-fingerprints.json'),JSON.stringify(fingerprints,null,2)+'\n');
