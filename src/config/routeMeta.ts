import { siteConfig } from './site';
import { blogPosts } from '../data/blogPosts';
import { books } from '../data/books';
import type { BlogPost } from '../types/content.types';
import type { Book } from '../types/book.types';

export interface RouteMeta {
  path: string;
  /** Left out for the homepage, which uses the brand title. */
  title?: string;
  description: string;
  image?: string;
  type?: string;
}

/**
 * Every route's metadata, in one place.
 *
 * The page components read from here at runtime, and scripts/prerender.mjs
 * writes the same values into a static HTML file per route at build time, so
 * crawlers that do not execute JavaScript see them too. One source is the whole
 * point: the hand-written stubs this replaces drifted until their canonical
 * URLs pointed at pages that no longer existed.
 */
export const pageMeta = {
  home: {
    path: '/',
    description: siteConfig.description,
  },
  explore: {
    path: siteConfig.exploreUrl,
    title: 'Explore',
    description:
      'Interactive tools you can actually run. Change the inputs, watch the method react, and see where it breaks.',
  },
  peakFinding: {
    path: siteConfig.peakFindingUrl,
    title: 'Peak Finding Playground (Pyodide)',
    description:
      'Build a synthetic chromatogram with noise, drift and overlapping peaks, then run detection and multi-Gaussian fitting over it in the browser.',
    type: 'article',
  },
  taylorBoard: {
    path: siteConfig.taylorBoardUrl,
    title: 'Automated Taylorgram Processing',
    description:
      'Master thesis: Taylor Board, a web application that automates Taylor dispersion analysis from raw instrument files through peak detection and Gaussian fitting to nanoparticle size.',
  },
  bioinformaticToolbox: {
    path: siteConfig.bioinformaticToolboxUrl,
    title: 'Bioinformatic Toolbox',
    description:
      'Four practical bioinformatics workflows: NCBI annotation search, manual sequence-to-protein translation, structure prediction, and PDB lookup.',
  },
  stories: {
    path: siteConfig.storiesUrl,
    title: 'Stories',
    description:
      'Longer pieces that take one question and follow it down to the mechanism underneath: chromatography, nanoparticle sizing, and the practical side of scientific work.',
  },
  about: {
    path: siteConfig.aboutUrl,
    title: 'About',
    description:
      'Mila Lettmayer, scientific software engineer: background in biotechnology and bioinformatics, production analysis pipelines, and interactive scientific tooling.',
  },
  books: {
    path: siteConfig.booksUrl,
    title: 'Books',
    description:
      'Books that left a mark: what I read, how I rated it and when. A record rather than a set of reviews.',
  },
} satisfies Record<string, RouteMeta>;

export const blogPostMeta = (post: BlogPost): RouteMeta => ({
  path: `/blog/${post.slug}`,
  title: post.title,
  description: post.excerpt,
  image: post.featuredImage?.url,
  type: 'article',
});

export const bookMeta = (book: Book): RouteMeta => {
  const authorLine = book.authors.join(', ');
  const facts = [
    authorLine ? `by ${authorLine}` : null,
    book.rating[0] ?? null,
    book.finished ? `read ${book.finished.slice(0, 4)}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return {
    path: `/books/${book.slug}`,
    title: `${book.title} | Books`,
    // Only promises takeaways once an entry actually has some. Every entry is
    // currently without, and a preview card that offers them would be a lie.
    description: book.takeaways[0] ?? `${book.title}${facts ? ` — ${facts}` : ''}.`,
    image: book.cover ?? undefined,
    type: 'article',
  };
};

/** Every route the build should emit a static HTML file for. */
export const allRoutes = (): RouteMeta[] => [
  ...Object.values(pageMeta),
  ...blogPosts.map(blogPostMeta),
  ...books.map(bookMeta),
];

/** What actually goes into the document head, after defaults are applied. */
export interface ResolvedMeta {
  fullTitle: string;
  description: string;
  url: string;
  image?: string;
  type: string;
  siteName: string;
}

const toAbsoluteUrl = (value: string): string =>
  /^https?:\/\//i.test(value)
    ? value
    : `${siteConfig.siteUrl}${value.startsWith('/') ? value : `/${value}`}`;

/**
 * Turns a route into the exact values the head needs.
 *
 * Both the SEO component and the build-time prerender go through here, so a
 * page cannot end up with one title in the rendered app and another in the
 * static HTML a crawler receives.
 */
export const resolveMeta = (route: RouteMeta): ResolvedMeta => {
  const image = route.image ?? siteConfig.defaultShareImage;

  return {
    fullTitle: route.title
      ? `${route.title} | ${siteConfig.brandName}`
      : `${siteConfig.brandName} | ${siteConfig.name}, ${siteConfig.role}`,
    description: route.description,
    url: toAbsoluteUrl(route.path),
    image: image ? toAbsoluteUrl(image) : undefined,
    type: route.type ?? 'website',
    siteName: siteConfig.brandName,
  };
};
