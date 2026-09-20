import SEO from '@components/common/SEO/SEO';
import PageHeader from '@components/common/PageHeader/PageHeader';
import BlogCard from '@components/blog/BlogCard/BlogCard';
import { pageMeta } from '@/config/routeMeta';
import { useBlogPosts } from '@hooks/useBlogPosts';
import styles from '@/styles/listPage.module.css';

const Stories = () => {
  const { posts, loading, error } = useBlogPosts();

  return (
    <>
      <SEO title="Stories" description={pageMeta.stories.description} />

      <div className={styles.container}>
        <PageHeader title="Stories" description={pageMeta.stories.description} />

        {loading ? (
          <p className={styles.status}>Loading stories...</p>
        ) : error && posts.length === 0 ? (
          <p className={styles.status}>Could not load the stories. Please try again later.</p>
        ) : (
          <div className={styles.grid}>
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Stories;
