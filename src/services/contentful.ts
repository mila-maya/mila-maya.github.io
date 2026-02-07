import type { BlogPost, Project } from '@/types/contentful.types';
import { blogPosts as localBlogPosts } from '@/data/blogPosts';
import { projects as localProjects } from '@/data/projects';

// Using local data files instead of Contentful CMS
// To add/edit content, simply update the files in src/data/blogPosts.ts and src/data/projects.ts

// Fetch all blog posts
export const getBlogPosts = async (limit = 100): Promise<BlogPost[]> => {
  // Simulate async behavior (in case you want to switch to an API later)
  return new Promise((resolve) => {
    setTimeout(() => {
      const posts = [...localBlogPosts]
        .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
        .slice(0, limit);
      resolve(posts);
    }, 100); // Small delay to simulate loading
  });
};

// Fetch a single blog post by slug
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const post = localBlogPosts.find(p => p.slug === slug) || null;
      resolve(post);
    }, 100);
  });
};

// Fetch all projects
export const getProjects = async (): Promise<Project[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const projects = [...localProjects]
        .sort((a, b) => a.displayOrder - b.displayOrder);
      resolve(projects);
    }, 100);
  });
};
