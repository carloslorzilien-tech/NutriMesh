import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    // Alertar si algún chunk supera 500 KB
    chunkSizeWarningLimit: 500,
  },
  server: {
    port: 5173,
  },
});
