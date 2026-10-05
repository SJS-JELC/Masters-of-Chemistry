import {createServer} from 'vite';
// Same production app sources. Isolated port disables HMR document replacement during review.
const server=await createServer({server:{host:'127.0.0.1',port:5187,strictPort:true,hmr:false}});
await server.listen();server.printUrls();
