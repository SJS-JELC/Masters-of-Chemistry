import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const project=path.resolve(import.meta.dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf','.json':'application/json','.txt':'text/plain'};
/** Serve the real combined output at root or one static hosting prefix. No SPA fallback. */
export function createPreviewServer({prefix='/'}={}) {
  if(!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(prefix)) throw Error('Prefix must be / or slash-delimited simple directories with a trailing slash');
  const root=path.resolve(project,'dist','app');
  return http.createServer((request,response)=>{
    try {
      const url=new URL(request.url,'http://localhost'),pathname=decodeURIComponent(url.pathname);
      if(prefix!=='/'&&pathname===prefix.slice(0,-1)){response.writeHead(301,{Location:prefix+url.search}).end();return;}
      if(!pathname.startsWith(prefix)){response.writeHead(404).end();return;}
      const segments=pathname.slice(prefix.length).split('/').filter(Boolean);
      if(segments.some(segment=>segment.startsWith('.')||segment.includes('\\'))){response.writeHead(404).end();return;}
      let file=path.resolve(root,...segments);
      if(file!==root&&!file.startsWith(root+path.sep)){response.writeHead(404).end();return;}
      if(fs.statSync(file).isDirectory()) {
        if(!pathname.endsWith('/')) {response.writeHead(301,{Location:url.pathname+'/'+url.search}).end();return;}
        file=path.join(file,'index.html');
      }
      if(!fs.statSync(file).isFile()){response.writeHead(404).end();return;}
      response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
      fs.createReadStream(file).pipe(response);
    } catch {response.writeHead(404).end();}
  });
}
