// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()], // Remove tailwindcss() from here
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});