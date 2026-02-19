export interface BlogPost {
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
  title: string;
  slug: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  cardUrl?: string;
  hideLinks?: boolean;
  featuredImage?: {
    url: string;
    title: string;
    description?: string;
  };
  displayOrder: number;
}

export interface ContentfulImage {
  fields: {
    title: string;
    description?: string;
    file: {
      url: string;
      details: {
        size: number;
        image?: {
          width: number;
          height: number;
        };
      };
      fileName: string;
      contentType: string;
    };
  };
}
