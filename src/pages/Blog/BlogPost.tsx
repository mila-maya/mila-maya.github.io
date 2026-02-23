import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import SEO from '@/components/common/SEO/SEO';
import { getBlogPostBySlug } from '@/services/contentful';
import type { BlogPost as BlogPostType } from '@/types/contentful.types';
import styles from './BlogPost.module.css';
import 'highlight.js/styles/github.css';

function extractHeadings(markdown: string) {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: { level: number; text: string; id: string }[] = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
    headings.push({ level: match[1].length, text, id });
  }
  return headings;
}

const markdownComponents = {
  a: ({ href, children, ...props }: any) => {
    if (href && href.startsWith('/downloads/')) {
      return (
        <a href={href} className={styles.downloadButton} download {...props}>
          {children}
        </a>
      );
    }
    return <a href={href} {...props}>{children}</a>;
  },
};

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

  const readingTime = Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200));
  const headings = extractHeadings(post.content);

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
            <span>• {readingTime} min read</span>
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

        {headings.length >= 3 && (
          <nav className={styles.toc}>
            <h2 className={styles.tocTitle}>Table of Contents</h2>
            <ul className={styles.tocList}>
              {headings.map((h, i) => (
                <li key={i} className={h.level === 3 ? styles.tocSubItem : styles.tocItem}>
                  <a href={`#${h.id}`}>{h.text}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className={styles.content}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeSlug]}
            components={markdownComponents}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {post.featuredImage && (
          <img
            src={post.featuredImage.url}
            alt={post.featuredImage.title || post.title}
            className={styles.featuredImage}
          />
        )}
      </article>
    </>
  );
};

export default BlogPost;
