import { blogPosts } from '@/data/blogPosts';
import { projects } from '@/data/projects';
import type { Origin } from '@/types/content.types';

/**
 * One shape for everything on the site, whatever kind it is.
 *
 * A piece of work belongs to several things at once - the peak finding post is
 * an algorithm, a runnable tool, chromatography, and part of the thesis - so
 * these are attributes it carries, not a folder it sits in. Anything that wants
 * to group content asks for the attribute rather than keeping its own list.
 */
export interface FacetedItem {
  kind: 'project' | 'post';
  slug: string;
  title: string;
  summary: string;
  href: string;
  origin?: Origin;
  /** The item's own preview picture, for cards that show one. */
  image?: { url: string; alt: string };
  /** Topics and tools together: the item's own tags or technologies. */
  labels: string[];
}

export const allItems = (): FacetedItem[] => [
  ...projects.map((project) => ({
    kind: 'project' as const,
    slug: project.slug,
    title: project.title,
    summary: project.description,
    href: project.cardUrl ?? `/projects/${project.slug}`,
    origin: project.origin,
    image: project.featuredImage
      ? { url: project.featuredImage.url, alt: project.featuredImage.title || project.title }
      : undefined,
    labels: project.technologies ?? [],
  })),
  ...blogPosts.map((post) => ({
    kind: 'post' as const,
    slug: post.slug,
    title: post.title,
    summary: post.excerpt,
    href: `/blog/${post.slug}`,
    origin: post.origin,
    image: post.featuredImage
      ? { url: post.featuredImage.url, alt: post.featuredImage.title || post.title }
      : undefined,
    labels: post.tags ?? [],
  })),
];

/** Everything that came out of the same work, excluding the item asking. */
export const sharingOrigin = (origin: Origin | undefined, exceptSlug?: string): FacetedItem[] =>
  origin ? allItems().filter((item) => item.origin === origin && item.slug !== exceptSlug) : [];

/** The origins actually in use, in the order they first appear. */
export const originsInUse = (): Origin[] => [
  ...new Set(allItems().map((item) => item.origin).filter((o): o is Origin => Boolean(o))),
];
