/** Dependency gate for the retired app validation directory. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
const project=path.resolve(import.meta.dirname,'..');
const oldRoot=path.join(project,'validation');
assert(!fs.existsSync(oldRoot),'The retired validation directory must not be recreated');
const failures=[],historicalIdentifiers=[],externalReferences=[],templateImports=[];
let checkedFiles=0;
function exists(file){return ['', '.ts','.tsx','.js','.mjs','.json','/index.ts','/index.js'].some(suffix=>fs.existsSync(file+suffix));}
function walk(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())walk(file);else if(/\.(?:mjs|cjs|js|ts|tsx|html)$/.test(entry.name)){
 const relative=path.relative(project,file).replaceAll('\\','/');if(relative==='scripts/check-retired-validation.mjs')continue;
 checkedFiles++;const text=fs.readFileSync(file,'utf8'),source=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true);
 function visit(node){
  if(ts.isStringLiteralLike(node)){
   const value=node.text;
   if(/(?:^|\/)validation\//.test(value)){
    if(/^(?:\.\.\/)*(?:development|resources)\//.test(value))externalReferences.push({file:relative,value});
    else if(relative==='scripts/validate-s0.mjs'&&['validation/original-app-baseline.json','validation/root-contract-lock.json'].includes(value))historicalIdentifiers.push({file:relative,value,disposition:'Frozen control-key aliases resolve to retained resource files.'});
    else failures.push({file:relative,value,reason:'Executable literal refers to the retired directory'});
   }
  }
  let specifier=null;
  if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteralLike(node.moduleSpecifier))specifier=node.moduleSpecifier.text;
  if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword&&node.arguments[0]&&ts.isStringLiteralLike(node.arguments[0]))specifier=node.arguments[0].text;
  if(specifier?.startsWith('.')){
   if(relative.startsWith('development/authoring/templates/'))templateImports.push({file:relative,value:specifier,disposition:'Resolved relative to the generated family destination by the scaffold; instantiated families are checked normally.'});
   else if(!exists(path.resolve(path.dirname(file),specifier.replace(/\?(?:url|raw)$/, ''))))failures.push({file:relative,value:specifier,reason:'Missing relative module'});
  }
  ts.forEachChild(node,visit);
 }visit(source);
}}}
for(const root of ['scripts','src','development'])walk(path.join(project,root));
for(const name of ['package.json','tsconfig.json','vite.config.ts'])assert(!/['"](?:\.\.\/)*validation\//.test(fs.readFileSync(path.join(project,name),'utf8')),`${name} refers to retired validation`);
const report={status:failures.length?'FAIL':'PASS',checkedFiles,failures,historicalIdentifiers,externalReferences,templateImports,scope:'Executable literals and relative static/dynamic module imports, including Vite URL/raw imports. Scaffold template module paths resolve after instantiation; generated families are checked normally. JSON provenance identifiers and comments are historical data; actual browser/build/test gates supplement this audit.'};
const outputIndex=process.argv.indexOf('--output');
if(outputIndex!==-1){const output=path.resolve(project,process.argv[outputIndex+1]);assert(output.startsWith(path.join(project,'.artifacts')+path.sep),'Audit output must stay under ignored app artifacts');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report,null,2));if(failures.length)process.exitCode=1;
