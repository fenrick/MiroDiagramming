import path from 'path';
import fs from 'fs';
import dns from 'dns';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { fileURLToPath, URL } from 'node:url';

import plugin from '@vitejs/plugin-react';
import child_process from 'child_process';
import { env } from 'process';

const baseFolder =
  env.APPDATA !== undefined && env.APPDATA !== ''
    ? `${env.APPDATA}/ASP.NET/https`
    : `${env.HOME}/.aspnet/https`;

const certificateName = 'fenrick.miro.client';
const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

if (!fs.existsSync(baseFolder)) {
  fs.mkdirSync(baseFolder, { recursive: true });
}

if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
  if (
    0 !==
    child_process.spawnSync(
      'dotnet',
      [
        'dev-certs',
        'https',
        '--export-path',
        certFilePath,
        '--format',
        'Pem',
        '--no-password',
      ],
      { stdio: 'inherit' },
    ).status
  ) {
    throw new Error('Could not create certificate.');
  }
}

const target =
  env['services__fenrick-miro-server__https__0'] ?? 'https://localhost:7274';

// https://vitejs.dev/config/server-options.html#server-host
dns.setDefaultResultOrder('verbatim');

const rootDir = __dirname;
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
  root: __dirname,
  build: {
    rollupOptions: {
      input: allHtmlEntries,
      external: ['elkjs/lib/elk.bundled.js', 'exceljs'],
    },
  },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  plugins: [react(), plugin()],
  server: {
    proxy: { '^/api': { target, secure: false } },
    port: parseInt(env.DEV_SERVER_PORT || '53253'),
    https: {
      key: fs.readFileSync(keyFilePath),
      cert: fs.readFileSync(certFilePath),
    },
  },
});
