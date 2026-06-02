import { Link } from 'react-router-dom';
import BlogCard from '@components/blog/BlogCard/BlogCard';
import ProfileBadge from '@components/common/ProfileBadge/ProfileBadge';
import SEO from '@components/common/SEO/SEO';
import ProjectCard from '@components/projects/ProjectCard/ProjectCard';
import { siteConfig } from '@/config/site';
import { useBlogPosts } from '@hooks/useBlogPosts';
import { useProjects } from '@hooks/useProjects';
import styles from './Home.module.css';

const Home = () => {
  const timeline = [
    {
      period: 'Feb 2026 - Present',
      title: 'Career Development',
      detail:
        'Deepening ML and AI skills through hands-on Python projects in model evaluation, dashboards, and financial analysis.'
    },
    {
      period: 'Nov 2024 - Jan 2026',
      title: 'Scientific Software Engineer (Part-time), RNAnalytics',
      detail:
        'Built production workflows for nanoparticle analysis, quality checks, and cloud platform integration.'
    },
    {
      period: 'May 2017 - Jan 2026',
      title: 'Dipl.-Ing. Biotechnology (Bioinformatics), BOKU',
      detail:
        'Master thesis on automated Taylorgram processing for nanoparticle size characterization.'
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
  const { posts, loading: postsLoading } = useBlogPosts();
  const featuredProject = projects[0];
  const recentPosts = posts.slice(0, 2);

  return (
    <>
      <SEO
        description="Scientific software engineer with a bioinformatics background, sharing interactive tools, technical writing, and applied ML work."
      />

      <section className={styles.heroWrap}>
        <div className={styles.hero}>
          <div className={styles.heroMain}>
            <span className={styles.kicker}>{siteConfig.headline}</span>
            <h1 className={styles.heroTitle}>Hi, I&apos;m Mila Lettmayer.</h1>
            <p className={styles.heroSubtitle}>
              I build reliable analysis software for biotech and research teams. This site is my
              working shelf for interactive tools, scientific write-ups, and practical notes from
              bioinformatics and applied ML work.
            </p>
            <div className={styles.actions}>
              <Link to={siteConfig.projectsUrl} className={`${styles.action} ${styles.primaryAction}`}>
                Explore Projects & Posts
              </Link>
              <Link to={siteConfig.aboutUrl} className={`${styles.action} ${styles.secondaryAction}`}>
                Read Full Background
              </Link>
              <a
                href={siteConfig.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.action} ${styles.ghostAction}`}
              >
                View GitHub
              </a>
            </div>

          </div>

          <aside className={styles.heroAside}>
            <ProfileBadge
              alt={siteConfig.name}
              imageSrc={siteConfig.profileImage}
              initials={siteConfig.initials}
              className={styles.avatar}
            />
            <h2 className={styles.asideTitle}>Current Focus</h2>
            <ul className={styles.focusList}>
              {focusAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
            <div className={styles.asideLinks}>
              <a
                href={siteConfig.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.asideLink}
              >
                LinkedIn
              </a>
              <Link to={siteConfig.thesisWorkflowUrl} className={styles.asideLink}>
                Thesis Workflow
              </Link>
              <a href={siteConfig.thesisTemplateUrl} className={styles.asideLink}>
                Template Download
              </a>
            </div>
          </aside>
        </div>
      </section>

      <section id="about" className={`${styles.section} ${styles.aboutSection}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>About My Work</h2>
          <Link to={siteConfig.aboutUrl} className={styles.sectionCta}>
            Full background
          </Link>
        </div>
        <p className={styles.aboutIntro}>
          I build software that makes scientific analysis faster, more reliable, and easier to
          operate. My background combines biotechnology, bioinformatics, and production
          engineering.
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
          <div>
            <h2 className={styles.sectionTitle}>Featured Work</h2>
            <p className={styles.sectionLead}>
              A quick way to see what the site is really about before you browse everything.
            </p>
          </div>
          <Link to={siteConfig.projectsUrl} className={styles.sectionCta}>
            All projects & posts
          </Link>
        </div>

        <div className={styles.featuredLayout}>
          <div className={styles.featuredColumn}>
            <h3 className={styles.subheading}>Featured Project</h3>
            {projectsLoading ? (
              <p className={styles.statusText}>Loading project...</p>
            ) : featuredProject ? (
              <ProjectCard project={featuredProject} />
            ) : (
              <p className={styles.statusText}>Project details coming soon.</p>
            )}
          </div>

          <div className={styles.featuredColumn}>
            <h3 className={styles.subheading}>Recent Writing</h3>
            <div className={styles.stack}>
              {postsLoading ? (
                <p className={styles.statusText}>Loading posts...</p>
              ) : recentPosts.length > 0 ? (
                recentPosts.map((post) => <BlogCard key={post.slug} post={post} />)
              ) : (
                <p className={styles.statusText}>Posts coming soon.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;

