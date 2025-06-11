import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          elk: ['elkjs/lib/elk.bundled.js'],
        },
      },
    },
  },
});
