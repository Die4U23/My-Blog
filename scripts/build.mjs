import { cp, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

export const entries = {
  client: 'src/client.jsx',
  'sky-entry': 'src/sky-entry.tsx',
  scrollbar: 'js/scrollbar.js',
  ...Object.fromEntries(['common', 'board', 'index', 'post', 'link', 'code'].map(name => [name, `css/${name}.css`])),
};

async function loadPosts() {
  const posts = await Promise.all((await readdir('content/posts')).map(async slug => {
    const dir = path.join('content/posts', slug);
    const meta = JSON.parse(await readFile(path.join(dir, 'meta.json'), 'utf8'));
    const body = await readFile(path.join(dir, 'body.html'), 'utf8');
    return { ...meta, slug, body };
  }));
  return posts.sort((a, b) => b.date.localeCompare(a.date) || (a.listOrder ?? 0) - (b.listOrder ?? 0));
}

async function themeBootstrap() {
  // Apply the saved reading theme before CSS paints or the module graph loads.
  const result = await build({ entryPoints: ['src/init-theme.js'], bundle: true, minify: true, write: false });
  return result.outputFiles[0].text;
}

export function staticBlog() {
  return {
    name: 'daydreamer-static-pages',
    enforce: 'post',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        if (!/^\/(?:about\/?|posts\/[a-z0-9-]+\/?)?(?:index\.html)?$/.test(url.pathname)) return next();
        try {
          const file = path.posix.join(url.pathname.replace(/^\/|index\.html$/g, ''), 'index.html');
          const { pages } = await server.ssrLoadModule('/src/pages.jsx');
          const assets = Object.fromEntries(Object.entries(entries).map(([key, src]) => [key, '/' + src]));
          assets.themeScript = await themeBootstrap();
          for (const [name, html] of pages(await loadPosts(), assets, file)) {
            if (name !== file) continue;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(await server.transformIndexHtml(req.url, html));
            return;
          }
          next();
        } catch (error) {
          next(error);
        }
      });
      server.watcher.on('all', (event, file) => {
        if (['add', 'change', 'unlink'].includes(event) && file.includes(path.join('content', 'posts'))) {
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
    async generateBundle(_, bundle) {
      // Only the interactive components are sent to the browser.
      await build({
        entryPoints: ['src/pages.jsx'], outfile: '.build/pages.mjs', bundle: true,
        platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic',
      });
      const { pages } = await import(pathToFileURL(path.resolve('.build/pages.mjs')).href);
      const assets = { themeScript: await themeBootstrap() };
      for (const file of Object.values(bundle)) {
        if (file.type === 'chunk' && file.isEntry && !entries[file.name]?.endsWith('.css')) {
          assets[file.name] = '/' + file.fileName;
        }
        if (file.type === 'asset' && file.name?.endsWith('.css')) {
          assets[path.parse(file.name).name] = '/' + file.fileName;
        }
      }
      for (const key of Object.keys(entries)) {
        if (!assets[key]) throw new Error('Missing browser asset: ' + key);
      }
      for (const [fileName, source] of pages(await loadPosts(), assets)) {
        this.emitFile({ type: 'asset', fileName, source });
      }
    },
    async writeBundle({ dir }) {
      for (const name of ['images', 'data', 'js/highlight.min.js', 'favicon.ico', 'favicon.png',
        'favicon-moon.ico', 'favicon-moon-32.png', 'apple-touch-icon-moon.png']) {
        await cp(name, path.join(dir, name), { recursive: true });
      }
    },
  };
}
