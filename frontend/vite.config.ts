import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/core-api': {
        target: 'http://api.core-engine.40.82.176.176.nip.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/core-api/, ''),
      },
    },
  },
  build: {
    sourcemap: true
  }
});
