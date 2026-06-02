import { Link } from 'react-router-dom';
import BlogCard from '@components/blog/BlogCard/BlogCard';
import ProfessionalTimeline from '@components/common/ProfessionalTimeline/ProfessionalTimeline';
import ProfileBadge from '@components/common/ProfileBadge/ProfileBadge';
import SEO from '@components/common/SEO/SEO';
import ProjectCard from '@components/projects/ProjectCard/ProjectCard';
import { siteConfig } from '@/config/site';
import { focusAreas, professionalTimeline, skillGroups } from '@/data/profile';
import { useBlogPosts } from '@hooks/useBlogPosts';
import { useProjects } from '@hooks/useProjects';
import styles from './Home.module.css';

const Home = () => {
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
        </div>
        <p className={styles.aboutIntro}>
          I build software that makes scientific analysis faster, more reliable, and easier to
          operate. My background combines biotechnology, bioinformatics, and production
          engineering.
        </p>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutColumn}>
            <h3 className={styles.subheading}>Professional Timeline</h3>
            <ProfessionalTimeline items={professionalTimeline} />
          </div>
          <div className={styles.aboutColumn}>
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

