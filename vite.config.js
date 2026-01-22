import { defineConfig } from 'vite';

export default defineConfig({
base: '/pAIrStudio/', 
  server: {
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',

    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth'],
  },
});
