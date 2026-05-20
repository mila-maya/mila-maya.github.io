# Mila Lettmayer Personal Website

Personal portfolio and blog built with React, TypeScript, and Vite, deployed to GitHub Pages at https://mila-maya.github.io.

## Stack

- React 18 and TypeScript
- Vite 5
- React Router 7
- CSS Modules
- GitHub Pages deployment through GitHub Actions
- Local content in `src/data` and static assets in `public`

## Local Development

```bash
npm install
npm run dev
```

The local dev server runs at http://localhost:5173 by default.

No environment variables, CMS connection, or API keys are required for the site build.

## Content

- Blog posts: `src/data/blogPosts.ts`
- Projects: `src/data/projects.ts`
- Books: `src/data/books.json`
- Shared site metadata and links: `src/config/site.ts`
- Downloadable thesis template files: `content/thesis-template`

The production build syncs the thesis template into `public/template-files` and `public/downloads` before Vite builds the site.

## Routes

- `/`
- `/about`
- `/projects-and-posts`
- `/books`
- `/books/:slug`
- `/projects/bioinformatic-toolbox`
- `/blog/:slug`

`public/404.html` preserves the requested URL and redirects into the React app so direct links work on GitHub Pages. Static redirect stubs under `public/about`, `public/books`, `public/projects-and-posts`, `public/projects`, and `public/blog` provide metadata for important public routes.

## Deployment

GitHub Pages is configured in `.github/workflows/deploy.yml`.

The workflow:

1. Runs on pushes to `main` and manual dispatches.
2. Installs dependencies with `npm ci`.
3. Builds with `npm run build`.
4. Uploads `dist` using `actions/upload-pages-artifact`.
5. Deploys with `actions/deploy-pages`.

In the repository settings, Pages should use **GitHub Actions** as the source.

The Vite base path is `/`, which is correct for a user or organization GitHub Pages site served from `mila-maya.github.io`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run sync:thesis
npm run sync:thesis:strict
```

There is no separate `typecheck` or `test` script. TypeScript checking is part of `npm run build`.

## Project Structure

```text
.github/workflows/deploy.yml
content/
public/
scripts/
src/
  components/
  config/
  data/
  hooks/
  layouts/
  pages/
  services/
  styles/
  types/
```
