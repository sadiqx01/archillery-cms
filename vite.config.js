import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'axios': path.resolve(__dirname, 'src/utils/mockAxios.js')
    }
  },
  server: {
    port: 5173
  }
});
