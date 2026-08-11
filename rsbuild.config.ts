import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';

const rootDir = dirname(fileURLToPath(import.meta.url));
const API_PORT = Number(process.env.API_PORT ?? 3001);
const WEB_PORT = Number(process.env.PORT ?? 3000);
const IS_STATIC = process.env.PUBLIC_STATIC === '1';
const BASE = process.env.ASSET_PREFIX ?? '/';

export default defineConfig({
  plugins: [pluginReact(), pluginTailwindcss()],
  output: {
    assetPrefix: BASE,
  },
  resolve: {
    alias: {
      '@': resolve(rootDir, 'src'),
    },
  },
  source: {
    entry: {
      index: './src/app/main.tsx',
    },
    define: {
      'process.env.PUBLIC_STATIC': JSON.stringify(IS_STATIC ? '1' : '0'),
      'process.env.PUBLIC_BASE': JSON.stringify(BASE),
    },
  },
  html: {
    title: 'PistaCerta',
    meta: {
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      description: 'Descubra qual é o carro a partir das pistas.',
      'theme-color': '#7f56d9',
    },
    tags: [
      { tag: 'link', attrs: { rel: 'manifest', href: 'manifest.webmanifest' } },
      { tag: 'link', attrs: { rel: 'icon', type: 'image/svg+xml', href: 'icon.svg' } },
      { tag: 'link', attrs: { rel: 'apple-touch-icon', href: 'icon.svg' } },
    ],
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
