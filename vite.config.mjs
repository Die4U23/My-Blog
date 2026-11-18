import { defineConfig } from 'vite';
import { realpathSync } from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import { entries, staticBlog } from './scripts/build.mjs';

// Keep Vite and its dependency optimizer on the same path in junction-based checkouts.
process.chdir(realpathSync.native(process.cwd()));
export default defineConfig({
  root: process.cwd(),
  appType: 'mpa',
  publicDir: false,
  plugins: [tailwindcss(), staticBlog()],
  esbuild: { jsx: 'automatic' },
  build: { rollupOptions: { input: entries } },
  server: { host: '127.0.0.1', port: 5173 },
  preview: { host: '127.0.0.1', port: 5173 },
});
