import { useState, useEffect } from 'react';
import { getBlogPosts } from '@services/contentful';
import type { BlogPost } from '@types/contentful.types';

export const useBlogPosts = (limit = 100) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedPosts = await getBlogPosts(limit);
        setPosts(fetchedPosts);
      } catch (err) {
        setError(err as Error);
        console.error('Error in useBlogPosts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [limit]);

  return { posts, loading, error };
};
