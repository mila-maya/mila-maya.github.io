import type { BlogPost, Project } from '@/types/content.types';
import { blogPosts as localBlogPosts } from '@/data/blogPosts';
import { projects as localProjects } from '@/data/projects';

// Content is stored locally so the GitHub Pages build has no CMS dependency.
const legacyBlogSlugAliases: Record<string, string> = {
  'peak-finding-area-gain-synthetic-chromatogram':
    'peak-detection-deconvolution-overlapping-chromatograms'
};

const normalizeSlug = (value: string): string =>
  decodeURIComponent(value)
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase();

export const getBlogPosts = async (limit = 100): Promise<BlogPost[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const posts = [...localBlogPosts]
        .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
        .slice(0, limit);
      resolve(posts);
    }, 100); // Small delay to simulate loading
  });
};

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normalizedSlug = normalizeSlug(slug);
      const resolvedSlug = legacyBlogSlugAliases[normalizedSlug] ?? normalizedSlug;
      const post = localBlogPosts.find((entry) => normalizeSlug(entry.slug) === resolvedSlug) || null;
      resolve(post);
    }, 100);
  });
};

export const getProjects = async (): Promise<Project[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const projects = [...localProjects]
        .sort((a, b) => a.displayOrder - b.displayOrder);
      resolve(projects);
    }, 100);
  });
};
