import { Link } from 'react-router-dom';
import SEO from '@components/common/SEO/SEO';
import ProjectCard from '@components/projects/ProjectCard/ProjectCard';
import BlogCard from '@components/blog/BlogCard/BlogCard';
import { useProjects } from '@hooks/useProjects';
import { useBlogPosts } from '@hooks/useBlogPosts';
import styles from './Home.module.css';

const Home = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const { posts, loading: postsLoading } = useBlogPosts(3);

  const featuredProjects = projects.slice(0, 3);
  const recentPosts = posts.slice(0, 3);

  return (
    <>
      <SEO />

      <section className={styles.hero}>
        <img
          src="/avatar.jpg"
          alt="Mila"
          className={styles.avatar}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <h1 className={styles.heroTitle}>Hello, I'm Mila.</h1>
        <p className={styles.heroSubtitle}>
          I build web applications and open-source tools. Passionate about Python,
          JavaScript, and DevOps. Welcome to my digital space where I share my
          projects and thoughts.
        </p>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Featured Projects</h2>
          <Link to="/projects" className={styles.viewAllLink}>
            View All →
          </Link>
        </div>

        {projectsLoading ? (
          <div className={styles.loading}>Loading projects...</div>
        ) : featuredProjects.length > 0 ? (
          <div className={styles.grid}>
            {featuredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            No projects yet. Check back soon!
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Posts</h2>
          <Link to="/blog" className={styles.viewAllLink}>
            View All →
          </Link>
        </div>

        {postsLoading ? (
          <div className={styles.loading}>Loading posts...</div>
        ) : recentPosts.length > 0 ? (
          <div className={styles.grid}>
            {recentPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            No blog posts yet. Check back soon!
          </div>
        )}
      </section>
    </>
  );
};

export default Home;
