import { createClient, Entry } from 'contentful';
import type { BlogPost, Project } from '@/types/contentful.types';

// Initialize Contentful client
const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
  environment: import.meta.env.VITE_CONTENTFUL_ENVIRONMENT || 'master',
});

export const contentfulClient = client;

// Helper function to extract image data
const extractImage = (image: any): BlogPost['featuredImage'] | undefined => {
  if (!image?.fields?.file?.url) return undefined;

  return {
    url: `https:${image.fields.file.url}`,
    title: image.fields.title || '',
    description: image.fields.description,
  };
};

// Fetch all blog posts
export const getBlogPosts = async (limit = 100): Promise<BlogPost[]> => {
  try {
    const entries = await client.getEntries({
      content_type: 'blogPost',
      order: ['-fields.publishedDate'],
      limit,
    });

    return entries.items.map((item: Entry<any>) => ({
      title: item.fields.title as string,
      slug: item.fields.slug as string,
      excerpt: item.fields.excerpt as string,
      content: item.fields.content as string,
      featuredImage: extractImage(item.fields.featuredImage),
      author: item.fields.author as string,
      publishedDate: item.fields.publishedDate as string,
      tags: item.fields.tags as string[] | undefined,
      category: item.fields.category as string | undefined,
    }));
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};

// Fetch a single blog post by slug
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    const entries = await client.getEntries({
      content_type: 'blogPost',
      'fields.slug': slug,
      limit: 1,
    });

    if (entries.items.length === 0) return null;

    const item = entries.items[0];
    return {
      title: item.fields.title as string,
      slug: item.fields.slug as string,
      excerpt: item.fields.excerpt as string,
      content: item.fields.content as string,
      featuredImage: extractImage(item.fields.featuredImage),
      author: item.fields.author as string,
      publishedDate: item.fields.publishedDate as string,
      tags: item.fields.tags as string[] | undefined,
      category: item.fields.category as string | undefined,
    };
  } catch (error) {
    console.error(`Error fetching blog post with slug ${slug}:`, error);
    return null;
  }
};

// Fetch all projects
export const getProjects = async (): Promise<Project[]> => {
  try {
    const entries = await client.getEntries({
      content_type: 'project',
      order: ['fields.displayOrder'],
    });

    return entries.items.map((item: Entry<any>) => ({
      title: item.fields.title as string,
      slug: item.fields.slug as string,
      description: item.fields.description as string,
      technologies: item.fields.technologies as string[],
      githubUrl: item.fields.githubUrl as string | undefined,
      liveUrl: item.fields.liveUrl as string | undefined,
      featuredImage: extractImage(item.fields.featuredImage),
      displayOrder: item.fields.displayOrder as number,
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};
