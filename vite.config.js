import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'Usuarios',              // tu src de frontend
  build: {
    outDir: '../public',         // Express servirá esta carpeta
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'Usuarios')
    }
  },
  server: {
    proxy: {
      '/imagenesProductos': 'http://localhost:4000',
      '/api':              'http://localhost:4000'
    }
  }
});
