import react from '@vitejs/plugin-react'
import dns from 'dns'
import fs from 'fs'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'

dns.setDefaultResultOrder('verbatim')

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src/web')
const htmlEntries = fs
  .readdirSync(webRoot)
  .filter((f) => path.extname(f) === '.html')
  .reduce<Record<string, string>>((acc, f) => {
    acc[path.basename(f, '.html')] = path.resolve(webRoot, f)
    return acc
  }, {})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    root: webRoot,
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: htmlEntries,
        external: ['elkjs/lib/elk.bundled.js', 'exceljs'],
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src/frontend', import.meta.url)),
      },
    },
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_PORT || '3000', 10),
      proxy: {
        '/api': { target: env.VITE_BACKEND_URL, changeOrigin: true, secure: false },
        '/oauth': { target: env.VITE_BACKEND_URL, changeOrigin: true, secure: false },
      },
    },
  }
})
