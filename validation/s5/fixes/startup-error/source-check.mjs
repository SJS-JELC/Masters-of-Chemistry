import fs from 'node:fs';import assert from 'node:assert/strict';import crypto from 'node:crypto';
import ts from '../../../../node_modules/typescript/lib/typescript.js';
const here=import.meta.dirname,before=fs.readFileSync(here+'/before-ActivityHost.tsx','utf8'),after=fs.readFileSync('src/foundation/ActivityHost.tsx','utf8');
const parse=text=>ts.createSourceFile('ActivityHost.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),old=parse(before),current=parse(after);
function find(source,name){let result;function visit(node){if(ts.isVariableDeclaration(node)&&ts.isIdentifier(node.name)&&node.name.text===name)result=node;ts.forEachChild(node,visit);}visit(source);assert(result,name);return result;}
function tokens(node){const scanner=ts.createScanner(ts.ScriptTarget.Latest,true,ts.LanguageVariant.JSX,node.getText()),out=[];while(scanner.scan()!==ts.SyntaxKind.EndOfFileToken)out.push([scanner.getToken(),scanner.getTokenText()]);return out;}
const preserved=['runtime','resolve','applySession','applyAttempt','loadHistory','save','adopt','fresh','executeCommand','command','nextQuestion','resume','retry','leaveAttempt','selectView','openTeacherQuestion'];
for(const name of preserved)assert.deepEqual(tokens(find(current,name)),tokens(find(old,name)),name+' changed');
assert(!/repository\.(?:save|delete|clear|import)/.test(find(current,'readSavedData').getText()));
const report={status:'PASS',sourceHash:crypto.createHash('sha256').update(after).digest('hex'),unchangedHostFunctions:preserved,restoreReadOnly:true,scope:'Read/restore error state, same-name repository retry, visible notice and startup guards only; owned ActivityHost'};
fs.writeFileSync(here+'/source-check-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
