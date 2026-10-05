import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import ts from '../../../node_modules/typescript/lib/typescript.js';
export const project=path.resolve(import.meta.dirname,'../../..');
export function server(){return http.createServer((req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 let file;
 if(pathname==='/probe.html'){res.writeHead(200,{'Content-Type':'text/html'}).end('<!doctype html><title>S5 independent actual-source browser probe</title><input aria-label="Trusted input"><p>Independent repository test surface</p>');return;}
 if(pathname.startsWith('/stage-s5/')){const parts=pathname.split('/').filter(Boolean);if(!['alevel','igcse'].includes(parts[1]))throw Error();file=path.resolve(project,'dist',parts[1],...parts.slice(2));}
 else if(pathname.startsWith('/src/')||pathname.startsWith('/node_modules/'))file=path.resolve(project,'.'+pathname);
 else throw Error();
 if(!file.startsWith(project+path.sep)||!fs.statSync(file).isFile())throw Error();
 let body=fs.readFileSync(file),ext=path.extname(file);
 if(ext==='.ts'||ext==='.tsx')body=ts.transpileModule(body.toString(),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText.replace(/(['"])dexie\1/g,"'/node_modules/dexie/dist/dexie.mjs'");
 res.writeHead(200,{'Content-Type':({'.ts':'text/javascript','.tsx':'text/javascript','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.html':'text/html','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf'}[ext]||'application/octet-stream'),'Cache-Control':'no-store'}).end(body);
 }catch(e){res.writeHead(404).end();}});}
if(process.argv[1]===import.meta.filename)server().listen(5201,'127.0.0.1',()=>console.log('S5 own static server 5201'));


