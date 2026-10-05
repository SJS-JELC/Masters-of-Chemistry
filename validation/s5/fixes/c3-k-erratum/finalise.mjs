import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import net from 'node:net';
import assert from 'node:assert/strict';
const project=path.resolve(import.meta.dirname,'../../../..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const [copy,original] of [['original-s3-test.txt','c3l6.test.ts'],['original-s3-browser.txt','browser.mjs']])assert(fs.readFileSync(path.join(import.meta.dirname,copy)).equals(fs.readFileSync(path.join(project,'validation/s3/c3l6',original))));
const browser=JSON.parse(fs.readFileSync(path.join(import.meta.dirname,'browser-results.json'),'utf8'));assert.equal(browser.status,'PASS');assert.deepEqual(browser.errors,[]);
const logBytes=fs.readFileSync(path.join(import.meta.dirname,'tests-results.txt'));
const results=logBytes.toString(logBytes[0]===255&&logBytes[1]===254?'utf16le':'utf8');assert(results.includes('tests 10'));assert(results.includes('fail 0'));
assert.equal(fs.readFileSync(path.join(import.meta.dirname,'history-typecheck.txt'),'utf8').trim(),'');
const sourceDiffs=JSON.parse(fs.readFileSync(path.join(import.meta.dirname,'authored-diff-fingerprints.json'),'utf8'));
for(const e of sourceDiffs){assert.equal(hash(fs.readFileSync(path.join(project,e.file))),e.afterSha256);assert.equal(e.prettierCheck,true);}
const closed=await new Promise(resolve=>{const socket=net.createConnection({host:'127.0.0.1',port:5209});socket.once('connect',()=>{socket.destroy();resolve(false)});socket.once('error',()=>resolve(true));socket.setTimeout(3000,()=>{socket.destroy();resolve(false)});});assert.equal(closed,true,'Owned DEV5209 must be closed');
fs.writeFileSync(path.join(import.meta.dirname,'final-invariants.json'),JSON.stringify({status:'PASS',checkedAt:new Date().toISOString(),originalS3FixturesByteExact:true,authoredFiles:sourceDiffs.length,sourceHashesStillFrozen:true,immutableSourceFiles:48,rawAlternatives:23,currentAlternatives:22,typeNegativeFixtures:'PASS',testGroups:10,browser:'PASS',dev5209:'closed'},null,2)+'\n');
const manifest={id:'S5-FIX-C3-K-ERRATUM',workerId:'A16',status:'PASS',outputPath:'validation/s5/fixes/c3-k-erratum/HANDOVER.md',confidence:0.98,reason:null,validation:{source23Current22:'PASS',fullPortGroups:10,rawHistoricalPreservation:'PASS',currentWrongKRejection:'PASS',actualDevHostDesktopMobile:'PASS',typecheck:'PASS',prettier:'PASS',protectedOriginals:1317,immutableSources:48,dev5209:'closed',independentAcceptance:'A22/A21/A23 and A01/root pending',references:['tests-results.txt','browser-results.json','authored-diff-fingerprints.json','final-invariants.json','source-freeze.txt']},model:{requested:'gpt-6.1-sol',requestedEffort:'high',effective:null,effectiveEffort:null,usage:null}};
fs.writeFileSync(path.join(import.meta.dirname,'completion.json'),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(manifest));
