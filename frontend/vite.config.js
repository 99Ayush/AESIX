import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '::',
    port: 3000,
    strictPort: false,
    allowedHosts: true,
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
});
