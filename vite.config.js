import { defineConfig } from 'vite';

export default defineConfig({
  base: '/pAIrStudio/',
  server: {
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
