import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const workspace=path.resolve(import.meta.dirname,'../../../../../..');
const roots={alevel:path.join(workspace,'apps/Masters-of-A-Level-Chemistry/src'),igcse:path.join(workspace,'apps/Masters-of-IGCSE-Chemistry/src')};
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf','.png':'image/png','.json':'application/json'};
http.createServer((req,res)=>{
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
 const [course,...parts]=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname).split('/').filter(Boolean);
 const root=roots[course];if(!root){res.writeHead(404);return res.end();}
 const target=path.resolve(root,...parts);if(!target.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 try {const file=fs.statSync(target).isDirectory()?path.join(target,'index.html'):target;res.setHeader('Content-Type',types[path.extname(file)]??'application/octet-stream');res.setHeader('Cache-Control','no-store');if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);}catch{res.writeHead(404);res.end();}
}).listen(5197,'127.0.0.1',()=>console.log('Read-only originals: http://127.0.0.1:5197/alevel/ and /igcse/'));
