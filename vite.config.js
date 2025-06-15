// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'Usuarios',              // aquí vive tu index.html de desarrollo
  build: {
    outDir: '../public',         // salida que Express sirve
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'Usuarios')
    }
  }
});
