import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import SEO from '@/components/common/SEO/SEO';
import { getBlogPostBySlug } from '@/services/contentful';
import type { BlogPost as BlogPostType } from '@/types/contentful.types';
import styles from './BlogPost.module.css';
import 'highlight.js/styles/github.css';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);
        const fetchedPost = await getBlogPostBySlug(slug);
        setPost(fetchedPost);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching blog post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return <div className={styles.loading}>Loading post...</div>;
  }

  if (error || !post) {
    return (
      <div className={styles.error}>
        Post not found or error loading post.
      </div>
    );
  }

  const formattedDate = post.publishedDate
    ? format(new Date(post.publishedDate), 'MMMM dd, yyyy')
    : '';

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        image={post.featuredImage?.url}
        type="article"
      />

      <article className={styles.container}>
        <Link to="/blog" className={styles.backLink}>
          ← Back to Blog
        </Link>

        <header className={styles.header}>
          <h1 className={styles.title}>{post.title}</h1>

          <div className={styles.meta}>
            <span>{post.author}</span>
            {formattedDate && <span>• {formattedDate}</span>}
            {post.category && <span>• {post.category}</span>}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className={styles.tags}>
              {post.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {post.featuredImage && (
          <img
            src={post.featuredImage.url}
            alt={post.featuredImage.title || post.title}
            className={styles.featuredImage}
          />
        )}

        <div className={styles.content}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </>
  );
};

export default BlogPost;
