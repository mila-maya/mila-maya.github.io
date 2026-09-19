import { execSync } from 'node:child_process'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'


/**
 * Stamps the built page with the commit it came from.
 *
 * Without this there is no way to tell from outside which revision a
 * deployment is actually serving: if a build fails, Cloudflare Pages keeps
 * serving the last successful one, and a site whose code has not changed looks
 * identical either way.
 */
const buildInfo = (): Plugin => {
  const commit =
    process.env.CF_PAGES_COMMIT_SHA?.slice(0, 7) ??
    (() => {
      try {
        return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
      } catch {
        return 'unknown'
      }
    })()
  const builtAt = new Date().toISOString()

  return {
    name: 'build-info',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { name: 'build-commit', content: commit }, injectTo: 'head' as const },
      { tag: 'meta', attrs: { name: 'build-time', content: builtAt }, injectTo: 'head' as const },
    ],
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), buildInfo()],
  base: '/', // For user/org GitHub Pages (mila-maya.github.io)
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'markdown-vendor': [
            'react-markdown',
            'remark-gfm',
            'rehype-raw',
            'rehype-slug',
          ],
          'syntax-vendor': [
            'rehype-highlight',
            'highlight.js',
            'lowlight',
          ],
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@styles': path.resolve(__dirname, './src/styles'),
    }
  }
})
