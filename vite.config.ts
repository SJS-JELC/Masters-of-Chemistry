import {defineConfig} from 'vite';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const project = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig(() => {
  return {
    base: process.env.MASTERS_BASE_PATH || './',
    publicDir: path.join(project, 'public'),
    server: {host:'127.0.0.1', port:5181, strictPort:true, watch:{ignored:['**/.artifacts/**']}},
    build: {
      outDir:path.join(project, 'dist','app'), emptyOutDir:true,
      manifest:true,
      rollupOptions:{input:path.join(project,'index.html')}
    }
  };
});
