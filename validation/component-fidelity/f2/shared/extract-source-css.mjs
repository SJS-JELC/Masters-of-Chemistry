import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const app=path.resolve(here,'../../../..');
const workspace=path.resolve(app,'../..');
const require=createRequire(path.join(app,'package.json'));
const postcss=require('postcss');
const matrix=JSON.parse(fs.readFileSync(path.join(app,'validation/component-fidelity/f1/ui-pilot/reference-matrix.json')));
const families={'alevel/acid-base-calculations':'acid','alevel/electrons-bonding':'bonding','igcse/calorimetry':'calorimetry','igcse/bond-enthalpy':'bond','igcse/energy-enthalpy':'energy','igcse/structure-and-bonding':'comparison'};
let css='/* Generated component CSS in canonical linked stylesheet cascade order. Originals are read-only. */\n';
const provenance=[];
for(const activity of matrix.activities){
  const family=families[activity.id];if(!family)continue;
  const scope=`.source-player.source-${family}`;
  for(const file of activity.sourceFiles.filter(x=>x.path.endsWith('.css'))){
    if(/navigation|mastery/.test(file.path))continue;
    const content=fs.readFileSync(path.join(workspace,file.path),'utf8');
    const ast=postcss.parse(content);
    ast.walkAtRules(rule=>{if(rule.name==='font-face'||rule.name==='import'||rule.name==='keyframes')rule.remove();});
    ast.walkRules(rule=>{
      const rootRule=[':root','body','html'].includes(rule.selector);
      if(rootRule)rule.walkDecls(decl=>{if(!decl.prop.startsWith('--')&&!['color','font','font-family','font-weight','font-size','line-height','color-scheme'].includes(decl.prop))decl.remove();});
      const selectors=postcss.list.comma(rule.selector).flatMap(selector=>{
        if(/\.brand|\.page\b|\.controls\b|\.site-|\.mode-|\.progress-|\.eyebrow|\.print-|\.revision-|\.active-time|\.question-code|\.question-id|\.question-header|#questionId|#questionCode|#activityMode|^header\b|^nav\b|^h1\b|^main\b/.test(selector))return [];
        if(selector===':root'||selector==='body'||selector==='html')return [scope];
        // Original pupil page state is supplied as a scoped component state.
        selector=selector.replace(/body\.(?:comparison-pupil|pupil-mode|mastery-mode|levels-mode)\s*/g,'').replace(/\.comparison-pupil\s+/g,'').replace(/#prompt\b/g,'.source-prompt').replace(/#questionContent\b/g,'.source-content').replace(/#answerParts\b/g,'.source-calculations');
        if(/^body|^html/.test(selector))return [];
        if(!/\.data-table|\.response|\.answer|\.unit\b|\.part-label|\.rounding|\.working|\.math|\.fraction|\.exam|\.scaffold|\.diagram|\.profile|\.axis|\.reference|\.written|\.choice|\.field-note|\.feedback|\.mark-list|\.pass\b|\.fail\b|\.review-card|\.scheme|\.point|\.instruction|\.decision|\.exclusion|\.evidence|\.locked|\.guided|\.student-response|\.comparison-writing|\.level-intro|\.mark-footer|\.next-label|\.auto-note|\.question-equation|\.enthalpy|\.source-prompt|\.source-content|\.actions|\.action-row|\.pupil-answer-actions|\.button|^\*|^\[hidden\]|^(?:p|h2|h3|h4|label|button|input|textarea|select|details|summary|sup|sub|code|strong|em)\b/.test(selector))return [];
        return [`${scope} ${selector}`];
      });
      if(!selectors.length)rule.remove();else rule.selector=selectors.join(',\n');
    });
    ast.walkAtRules(rule=>{if(!rule.nodes?.length)rule.remove();});
    ast.walkComments(comment=>comment.remove());
    css+=`\n/* ${file.path} */\n${ast.toString()}\n`;
    provenance.push({family,path:file.path,sha256:createHash('sha256').update(content).digest('hex')});
  }
}
fs.writeFileSync(path.join(app,'src/ui/source-components.css'),css);
fs.writeFileSync(path.join(here,'css-provenance.json'),JSON.stringify({scope:'source component declarations only; page/masthead/navigation/timer omitted; linked order retained',sources:provenance},null,2));
