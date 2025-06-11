import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [
    preact(),
    // Add any required dynamic imports for plugins here
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          elk: ['elkjs/lib/elk.bundled.js'], // Ensure elkjs is properly loaded
        },
      },
    },
  },
});
