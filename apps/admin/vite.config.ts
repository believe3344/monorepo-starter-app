import transformerDirectives from '@unocss/transformer-directives';
import react from '@vitejs/plugin-react';
import path from 'path';
import Unocss from 'unocss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    Unocss({
      transformers: [transformerDirectives()],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
