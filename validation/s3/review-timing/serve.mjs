import {createServer} from 'vite';
import {resolve} from 'node:path';
const project=resolve(import.meta.dirname,'../../..');
// CSS modules also import /@vite/client. Keep their style installation while
// removing development-only sockets/reload machinery; no app clock is altered.
const cssOnlyClient=`const styles=new Map();
export function updateStyle(id,content){let style=styles.get(id);if(!style){style=document.createElement('style');style.setAttribute('data-vite-dev-id',id);document.head.appendChild(style);styles.set(id,style);}style.textContent=content;}
export function removeStyle(id){const style=styles.get(id);if(style)style.remove();styles.delete(id);}
export function createHotContext(){return {data:{},accept(){},acceptExports(){},dispose(){},prune(){},invalidate(){},on(){},off(){},send(){}};}
export function injectQuery(url,query){const u=new URL(url,location.href);u.search+=(u.search?'&':'?')+query;return u.href;}`;
const server=await createServer({root:project,cacheDir:resolve(import.meta.dirname,'vite-cache'),server:{host:'127.0.0.1',port:5188,strictPort:true,hmr:false},plugins:[{
 name:'a06-isolated-review-remove-dev-lifecycle-client',
 configureServer(server){server.middlewares.use((req,res,next)=>{if(req.url?.split('?')[0]==='/@vite/client'){res.statusCode=200;res.setHeader('Content-Type','text/javascript');res.end(cssOnlyClient);}else next();});},
 transformIndexHtml:{order:'post',handler:html=>html.replace(/<script\b[^>]*src=["']\/@vite\/client[^"']*["'][^>]*>\s*<\/script>/g,'')}
}]});
await server.listen();server.printUrls();
