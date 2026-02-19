import { Link } from 'react-router-dom';
import SEO from '@components/common/SEO/SEO';
import ProjectCard from '@components/projects/ProjectCard/ProjectCard';
import BlogCard from '@components/blog/BlogCard/BlogCard';
import { useProjects } from '@hooks/useProjects';
import { useBlogPosts } from '@hooks/useBlogPosts';
import styles from './Home.module.css';

const Home = () => {
  const highlights = [
    {
      title: 'Career Development (Feb 2026 - Present)',
      text: 'Focused on strengthening ML and AI skills through hands-on Python work in model evaluation, dashboards, and financial data analysis.'
    },
    {
      title: 'Scientific Software Engineer @ RNAnalytics',
      text: 'Built production-grade Python and Dash workflows for automated Taylor dispersion analysis, QC, and cloud-platform integration.'
    },
    {
      title: 'Dipl.-Ing. Biotechnology (Bioinformatics)',
      text: 'Completed at BOKU University in January 2026, with a thesis on automated Taylorgram processing for nanoparticle size characterization.'
    }
  ];

  const focusAreas = [
    'ML model evaluation and applied AI workflows in Python',
    'Taylor dispersion data processing and robust QC automation',
    'Dashboards and end-to-end analysis pipelines',
    'Scientific software architecture and API integration'
  ];

  const { projects, loading: projectsLoading } = useProjects();
  const { posts, loading: postsLoading } = useBlogPosts(3);

  const featuredProjects = projects.slice(0, 3);
  const recentPosts = posts.slice(0, 3);

  return (
    <>
      <SEO />

      <section className={styles.heroWrap}>
        <div className={styles.hero}>
          <div className={styles.heroMain}>
            <span className={styles.kicker}>Scientific Software x Bioinformatics x ML</span>
            <h1 className={styles.heroTitle}>Hi, I am Mila Lettmayer.</h1>
            <p className={styles.heroSubtitle}>
              I build reliable analysis software for biotech and research teams. My
              work spans automated scientific pipelines, dashboard products, and now
              focused ML and AI skill development for data-driven applications.
            </p>
            <div className={styles.actions}>
              <Link to="/projects" className={`${styles.action} ${styles.primaryAction}`}>
                Explore Projects
              </Link>
              <Link to="/about" className={`${styles.action} ${styles.secondaryAction}`}>
                About My Work
              </Link>
              <a
                href="https://www.linkedin.com/in/mila-lettmayer/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.action} ${styles.ghostAction}`}
              >
                LinkedIn
              </a>
            </div>
          </div>

          <aside className={styles.heroAside}>
            <img
              src="/avatar.jpg"
              alt="Mila Lettmayer"
              className={styles.avatar}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h2 className={styles.asideTitle}>Current Focus</h2>
            <ul className={styles.focusList}>
              {focusAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className={styles.highlightsSection}>
        <div className={styles.highlightsGrid}>
          {highlights.map((item) => (
            <article key={item.title} className={styles.highlightCard}>
              <h2 className={styles.highlightTitle}>{item.title}</h2>
              <p className={styles.highlightText}>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Featured Projects</h2>
          <Link to="/projects" className={styles.viewAllLink}>
            View All {'->'}
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
          <div className={styles.empty}>No projects yet. Check back soon!</div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Posts</h2>
          <Link to="/blog" className={styles.viewAllLink}>
            View All {'->'}
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
          <div className={styles.empty}>No blog posts yet. Check back soon!</div>
        )}
      </section>
    </>
  );
};

export default Home;
