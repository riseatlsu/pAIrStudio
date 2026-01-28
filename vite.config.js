import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: '/pAIrStudio/',
  server: {
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // GitHub Actions can sometimes fail on large chunks; this helps stability
    chunkSizeWarningLimit: 3000, 
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'index.html'),
        sandbox: resolve(rootDir, 'sandbox/index.html')
      },
      output: {
        // This ensures consistent naming across environments
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});