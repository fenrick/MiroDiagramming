import path from 'path';
import fs from 'fs';
import dns from 'dns';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/server-options.html#server-host
dns.setDefaultResultOrder('verbatim');

const rootDir = path.resolve(__dirname, 'fenrick.miro.ux');
// make sure vite picks up all html files in rootDir, needed for vite build
const allHtmlEntries = fs
  .readdirSync(rootDir)
  .filter((file) => path.extname(file) === '.html')
  .reduce((acc: Record<string, string>, file) => {
    acc[path.basename(file, '.html')] = path.resolve(rootDir, file);

    return acc;
  }, {});

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, 'fenrick.miro.ux'),
  build: {
    rollupOptions: {
      input: allHtmlEntries,
      external: ['elkjs/lib/elk.bundled.js', 'exceljs'],
    },
  },
  resolve: {
    alias: {
      'fenrick.miro.ux': path.resolve(__dirname, 'fenrick.miro.ux/src'),
    },
  },
  plugins: [react()],
  server: { port: 3000 },
});
