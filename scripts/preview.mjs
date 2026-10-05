// Local HTTP preview of both independent builds; no publishing side effects.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const project = path.resolve(import.meta.dirname, '..');
const portIndex = process.argv.indexOf('--port');
const port = Number(portIndex === -1 ? 5182 : process.argv[portIndex + 1]);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('Invalid preview port');
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf','.json':'application/json','.txt':'text/plain'};
const server = http.createServer((request, response) => {
  try {
    const segments = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).split('/').filter(Boolean);
    const course = segments.shift();
    if (!['alevel','igcse'].includes(course)) {response.writeHead(404).end();return;}
    const root = path.resolve(project, 'dist', course);
    const file = path.resolve(root, ...(segments.length ? segments : ['index.html']));
    if (!file.startsWith(root + path.sep) || segments.some(segment=>segment.startsWith('.')) || !fs.statSync(file).isFile()) {response.writeHead(404).end();return;}
    response.writeHead(200, {'Content-Type':mime[path.extname(file)] ?? 'application/octet-stream','Cache-Control':'no-store'});
    fs.createReadStream(file).pipe(response);
  } catch {response.writeHead(404).end();}
});
server.listen(port,'127.0.0.1',()=>console.log(`Local builds: http://127.0.0.1:${port}/alevel/ and http://127.0.0.1:${port}/igcse/`));
for (const event of ['SIGINT','SIGTERM']) process.on(event,()=>server.close(()=>process.exit(0)));
