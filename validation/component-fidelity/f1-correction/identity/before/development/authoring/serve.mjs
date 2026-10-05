import {createServer} from '../../node_modules/vite/dist/node/index.js';
import path from 'node:path';
const project=path.resolve(import.meta.dirname,'../..');
const cacheRoot=process.argv.includes('--refinement')?'validation/s4/authoring-release/refinement/vite-cache':'validation/s4/authoring-release/vite-cache';
const server=await createServer({configFile:false,root:project,cacheDir:path.join(project,cacheRoot),server:{host:'127.0.0.1',port:5195,strictPort:true},publicDir:path.join(project,'public')});
await server.listen();console.log('Authoring proof: http://127.0.0.1:5195/development/authoring/index.html');
for(const event of ['SIGINT','SIGTERM'])process.on(event,async()=>{await server.close();process.exit(0);});
