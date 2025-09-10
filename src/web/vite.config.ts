import react from '@vitejs/plugin-react';
import dns from 'dns';
import fs from 'fs';

import { fileURLToPath, URL } from 'node:url';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/server-options.html#server-host
dns.setDefaultResultOrder('verbatim');

const rootDir = __dirname;
// make sure vite picks up all html files in rootDir, needed for vite build
const allHtmlEntries = fs
  .readdirSync(rootDir)
  .filter(file => path.extname(file) === '.html')
  .reduce((acc: Record<string, string>, file) => {
    acc[path.basename(file, '.html')] = path.resolve(rootDir, file);

    return acc;
  }, {});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: __dirname,
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: allHtmlEntries,
        external: ['elkjs/lib/elk.bundled.js', 'exceljs'],
      },
    },
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_PORT),
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: false,
        },
        '/oauth': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
