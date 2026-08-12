import { readFileSync } from 'node:fs';
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
const { version } = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf8')) as {
  version: string;
};
const APP_VERSION = version.replace(/\.0$/, '');

export default defineConfig({
  plugins: [pluginReact(), pluginTailwindcss()],
  output: {
    assetPrefix: BASE,
  },
  resolve: {
    alias: {
      ...(IS_STATIC
        ? {}
        : { '@/lib/static-backend': resolve(rootDir, 'src/lib/static-backend.stub.ts') }),
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
      'process.env.PUBLIC_APP_VERSION': JSON.stringify(APP_VERSION),
    },
  },
  html: {
    title: 'PistaCerta',
    meta: {
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      description: 'Descubra automóveis a partir de pistas progressivas.',
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
