import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
    minify: 'esbuild',
    target: 'es2020',
    cssCodeSplit: false
  },
  esbuild: {
    drop: ['console', 'debugger']
  }
});
