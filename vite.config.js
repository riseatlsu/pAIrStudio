import { defineConfig } from 'vite';

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