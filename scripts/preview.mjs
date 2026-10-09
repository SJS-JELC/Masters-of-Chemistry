// Local combined production preview; no publishing side effects.
import {createPreviewServer} from './preview-server.mjs';
const option=(name,fallback)=>{const i=process.argv.indexOf(name);return i===-1?fallback:process.argv[i+1];};
const port=Number(option('--port','5182')),prefix=option('--prefix','/');
if(!Number.isInteger(port)||port<1024||port>65535) throw Error('Invalid preview port');
const server=createPreviewServer({prefix});
server.listen(port,'127.0.0.1',()=>console.log('Combined app: http://127.0.0.1:'+port+prefix));
for(const event of ['SIGINT','SIGTERM']) process.on(event,()=>server.close(()=>process.exit(0)));
