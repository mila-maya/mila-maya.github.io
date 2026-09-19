/**
 * Writes a real HTML file per route after the Vite build.
 *
 * The site is a single-page app, so without this every shared link hands
 * crawlers the same document: whatever index.html happens to contain. Crawlers
 * that build link previews do not run JavaScript, so they never see the tags
 * React puts in the head, and every page previews as the homepage.
 *
 * Each generated file is the built app shell with that route's head tags
 * injected, not a redirect. A visitor who opens the URL directly gets the app
 * at that path in one load, and the router takes over from there.
 *
 * The values come from src/config/routeMeta.ts through resolveMeta, the same
 * function the SEO component uses at runtime.
 */
import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const distDir = path.join(root, 'dist');
const cacheDir = path.join(root, 'node_modules', '.cache', 'prerender');

// Marks the tags as ours, so the app can strip them once React takes over
// the head and would otherwise append a second, conflicting set.
const MARKER = 'data-prerendered';

const escapeAttribute = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const escapeText = (value) =>
  String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const headTags = (meta) => {
  const tags = [
    `<title ${MARKER}>${escapeText(meta.fullTitle)}</title>`,
    `<meta ${MARKER} name="description" content="${escapeAttribute(meta.description)}">`,
    `<meta ${MARKER} name="robots" content="index, follow">`,
    `<link ${MARKER} rel="canonical" href="${escapeAttribute(meta.url)}">`,
    `<meta ${MARKER} property="og:type" content="${escapeAttribute(meta.type)}">`,
    `<meta ${MARKER} property="og:site_name" content="${escapeAttribute(meta.siteName)}">`,
    `<meta ${MARKER} property="og:url" content="${escapeAttribute(meta.url)}">`,
    `<meta ${MARKER} property="og:title" content="${escapeAttribute(meta.fullTitle)}">`,
    `<meta ${MARKER} property="og:description" content="${escapeAttribute(meta.description)}">`,
    `<meta ${MARKER} name="twitter:card" content="${meta.image ? 'summary_large_image' : 'summary'}">`,
    `<meta ${MARKER} name="twitter:url" content="${escapeAttribute(meta.url)}">`,
    `<meta ${MARKER} name="twitter:title" content="${escapeAttribute(meta.fullTitle)}">`,
    `<meta ${MARKER} name="twitter:description" content="${escapeAttribute(meta.description)}">`,
  ];

  if (meta.image) {
    tags.push(`<meta ${MARKER} property="og:image" content="${escapeAttribute(meta.image)}">`);
    tags.push(`<meta ${MARKER} name="twitter:image" content="${escapeAttribute(meta.image)}">`);
  }

  return tags.map((tag) => `    ${tag}`).join('\n');
};

// routeMeta is TypeScript and pulls in the data modules, so bundle it into
// something Node can import rather than duplicating any of it here.
await mkdir(cacheDir, { recursive: true });
const bundlePath = path.join(cacheDir, 'route-meta.mjs');

await build({
  entryPoints: [path.join(root, 'src/config/routeMeta.ts')],
  outfile: bundlePath,
  bundle: true,
  format: 'esm',
  platform: 'node',
  tsconfig: path.join(root, 'tsconfig.json'),
  logLevel: 'warning',
});

const { allRoutes, resolveMeta } = await import(`${pathToFileURL(bundlePath).href}?t=${Date.now()}`);

const shell = await readFile(path.join(distDir, 'index.html'), 'utf8');
if (!shell.includes('</head>')) {
  throw new Error('dist/index.html has no </head> to inject into');
}

const routes = allRoutes();
const seen = new Set();

for (const route of routes) {
  if (seen.has(route.path)) {
    throw new Error(`Two routes claim the same path: ${route.path}`);
  }
  seen.add(route.path);

  const html = shell.replace('</head>', `${headTags(resolveMeta(route))}\n  </head>`);
  // Flat files, not directories. Cloudflare Pages serves foo.html at /foo as
  // is, whereas foo/index.html makes it redirect /foo to /foo/ - that would
  // cost every shared link a hop and leave each canonical pointing at a URL
  // that itself redirects.
  const target =
    route.path === '/'
      ? path.join(distDir, 'index.html')
      : path.join(distDir, `${route.path.slice(1)}.html`);

  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html, 'utf8');
}

console.log(`prerender: wrote ${routes.length} pages`);
