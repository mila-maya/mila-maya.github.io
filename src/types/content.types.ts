/**
 * Where a piece of work came from. It is a shared attribute rather than a
 * parent: a post can be theory and a tool and part of the thesis at once, and
 * a tree would force it to pick one.
 */
export type Origin = 'Master thesis' | 'Harvard CS50';

export interface BlogPost {
  origin?: Origin;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: {
    url: string;
    title: string;
    description?: string;
  };
  author: string;
  publishedDate: string;
  tags?: string[];
  category?: string;
}

export interface Project {
  origin?: Origin;
  title: string;
  slug: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  cardUrl?: string;
  /** Label for the card link; defaults to a generic one. */
  cardCta?: string;
  hideLinks?: boolean;
  featuredImage?: {
    url: string;
    title: string;
    description?: string;
  };
  displayOrder: number;
}
