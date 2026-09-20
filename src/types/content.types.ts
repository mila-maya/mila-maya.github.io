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

/**
 * How a project got here: the stages it went through before this version.
 *
 * Separate from Origin above, which only says which body of work something
 * belongs to. A project can carry both: the toolbox came out of Harvard CS50
 * (the origin) across four implementations (the provenance).
 */
export interface Provenance {
  /** One line for the card. */
  summary: string;
  /** The stages it went through, oldest first. */
  history?: { year: string; what: string }[];
}

export interface Project {
  origin?: Origin;
  provenance?: Provenance;
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
