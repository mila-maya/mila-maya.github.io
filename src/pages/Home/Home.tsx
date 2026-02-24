import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEO from '@components/common/SEO/SEO';
import ProjectCard from '@components/projects/ProjectCard/ProjectCard';
import BlogCard from '@components/blog/BlogCard/BlogCard';
import { useProjects } from '@hooks/useProjects';
import { useBlogPosts } from '@hooks/useBlogPosts';
import styles from './Home.module.css';

const Home = () => {
  const timeline = [
    {
      period: 'Feb 2026 - Present',
      title: 'Career Development',
      detail: 'Deepening ML and AI skills through hands-on Python projects in model evaluation, dashboards, and financial analysis.'
    },
    {
      period: 'Nov 2024 - Jan 2026',
      title: 'Scientific Software Engineer (Part-time), RNAnalytics',
      detail: 'Built production workflows for nanoparticle analysis, quality checks, and cloud platform integration.'
    },
    {
      period: 'May 2017 - Jan 2026',
      title: 'Dipl.-Ing. Biotechnology (Bioinformatics), BOKU',
      detail: 'Master thesis on automated Taylorgram processing for nanoparticle size characterization.'
    },
    {
      period: 'Mar 2012 - Apr 2017',
      title: 'BSc Food and Biotechnology, BOKU',
      detail: 'Built a strong base in molecular biology, genetics, and bioprocessing.'
    }
  ];

  const rnAnalyticsImpact = [
    'Built a Python pipeline for hydrodynamic size determination from TDA data.',
    'Delivered a Dash app that replaced manual evaluation with batch processing and standardized outputs.',
    'Implemented automated QC and plausibility checks to flag anomalous runs.',
    'Integrated analysis modules into a Django + React cloud platform through APIs.'
  ];

  const skillGroups = [
    {
      title: 'Programming',
      skills: ['Python', 'R', 'TypeScript', 'JavaScript', 'SQL']
    },
    {
      title: 'Scientific and Data',
      skills: ['Taylor Dispersion Analysis', 'PCA and clustering', 'Automated QC', 'Data visualization']
    },
    {
      title: 'Product and Platform',
      skills: ['Dash', 'Flask', 'Django', 'React', 'REST APIs', 'GitHub']
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
  const location = useLocation();

  const featuredProjects = projects.slice(0, 3);
  const recentPosts = posts.slice(0, 3);

  useEffect(() => {
    if (location.hash !== '#about') {
      return;
    }

    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

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
              <Link to="/work#projects" className={`${styles.action} ${styles.primaryAction}`}>
                Explore Work
              </Link>
              <Link to="/#about" className={`${styles.action} ${styles.secondaryAction}`}>
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

      <section id="about" className={`${styles.section} ${styles.aboutSection}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>About My Work</h2>
        </div>
        <p className={styles.aboutIntro}>
          I build software that makes scientific analysis faster, more reliable, and easier to operate. My background combines biotechnology, bioinformatics, and production engineering.
        </p>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutColumn}>
            <h3 className={styles.subheading}>Professional Timeline</h3>
            <div className={styles.timeline}>
              {timeline.map((item) => (
                <article key={`${item.period}-${item.title}`} className={styles.timelineItem}>
                  <p className={styles.period}>{item.period}</p>
                  <h4 className={styles.itemTitle}>{item.title}</h4>
                  <p className={styles.itemText}>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
          <div className={styles.aboutColumn}>
            <h3 className={styles.subheading}>RNAnalytics Impact</h3>
            <ul className={styles.bulletList}>
              {rnAnalyticsImpact.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <h3 className={styles.subheading}>Skills and Tools</h3>
            <div className={styles.skillGroups}>
              {skillGroups.map((group) => (
                <article key={group.title} className={styles.skillGroup}>
                  <h4 className={styles.skillGroupTitle}>{group.title}</h4>
                  <div className={styles.skills}>
                    {group.skills.map((skill) => (
                      <span key={skill} className={styles.skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Featured Projects</h2>
          <Link to="/work#projects" className={styles.viewAllLink}>
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
          <Link to="/work#posts" className={styles.viewAllLink}>
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
