import SEO from '@components/common/SEO/SEO';
import BlogCard from '@components/blog/BlogCard/BlogCard';
import { useBlogPosts } from '@hooks/useBlogPosts';
import styles from './Blog.module.css';

const Blog = () => {
  const { posts, loading, error } = useBlogPosts();

  return (
    <>
      <SEO
        title="Blog"
        description="Read my latest articles, tutorials, and thoughts on software development, web technologies, and programming."
      />

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Blog</h1>
          <p className={styles.description}>
            Thoughts, tutorials, and insights on software development, web
            technologies, and everything I'm learning.
          </p>
        </header>

        {loading ? (
          <div className={styles.loading}>Loading blog posts...</div>
        ) : error ? (
          <div className={styles.error}>
            Error loading blog posts. Please try again later.
          </div>
        ) : posts.length > 0 ? (
          <div className={styles.grid}>
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            No blog posts available yet. Check back soon!
          </div>
        )}
      </div>
    </>
  );
};

export default Blog;
