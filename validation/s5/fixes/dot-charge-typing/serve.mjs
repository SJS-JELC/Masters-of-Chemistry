import fs from 'node:fs';
import path from 'node:path';
import {createServer} from '../../../../node_modules/vite/dist/node/index.js';
const here=import.meta.dirname,root=path.resolve(here,'../../../..');
// Freeze served modules during a bounded interaction test; other S5 workers own
// shared modules and their saves must not reload this isolated browser mid-edit.
const server=await createServer({root,cacheDir:path.join(here,'vite-cache'),server:{host:'127.0.0.1',port:5211,strictPort:true,hmr:false,watch:{ignored:['**/*']}}});
await server.listen();
fs.writeFileSync(path.join(here,'server.json'),JSON.stringify({pid:process.pid,port:5211,status:'running',startedAt:new Date().toISOString()},null,2));
console.log('A15 owned DEV server http://127.0.0.1:5211');
const close=async()=>{await server.close();fs.writeFileSync(path.join(here,'server.json'),JSON.stringify({pid:process.pid,port:5211,status:'closed',closedAt:new Date().toISOString()},null,2));process.exit(0);};
process.on('SIGINT',close);process.on('SIGTERM',close);
