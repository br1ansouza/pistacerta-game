import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';

const rootDir = dirname(fileURLToPath(import.meta.url));
const API_PORT = Number(process.env.API_PORT ?? 3001);
const WEB_PORT = Number(process.env.PORT ?? 3000);

export default defineConfig({
  plugins: [pluginReact(), pluginTailwindcss()],
  resolve: {
    alias: {
      '@': resolve(rootDir, 'src'),
    },
  },
  source: {
    entry: {
      index: './src/app/main.tsx',
    },
  },
  html: {
    title: 'PistaCerta',
    meta: {
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      description: 'Descubra qual é o carro a partir das pistas.',
    },
  },
  server: {
    host: '0.0.0.0',
    port: WEB_PORT,
    strictPort: true,
    proxy: {
      '/api': `http://127.0.0.1:${API_PORT}`,
    },
  },
});
