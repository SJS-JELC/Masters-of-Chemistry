import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf','.json':'application/json'};
const server=http.createServer((request,response)=>{try{
 const parts=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname).split('/').filter(Boolean);
 if(parts[0]!=='stage-s2'||!['alevel','igcse'].includes(parts[1])){response.writeHead(404).end();return;}
 const root=path.resolve(project,'dist',parts[1]),file=path.resolve(root,...(parts.slice(2).length?parts.slice(2):['index.html']));
 if(!file.startsWith(root+path.sep)||!fs.statSync(file).isFile()){response.writeHead(404).end();return;}
 response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(response);
}catch{response.writeHead(404).end();}});
server.listen(5184,'127.0.0.1',()=>console.log('Local S2 static production verification: http://127.0.0.1:5184/stage-s2/alevel/index.html (no Vite/HMR).'));
