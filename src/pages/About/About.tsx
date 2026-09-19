import PageHeader from '@components/common/PageHeader/PageHeader';
import ProfessionalTimeline from '@components/common/ProfessionalTimeline/ProfessionalTimeline';
import ProfileBadge from '@components/common/ProfileBadge/ProfileBadge';
import SEO from '@components/common/SEO/SEO';
import { siteConfig } from '@/config/site';
import { pageMeta } from '@/config/routeMeta';
import { focusAreas, professionalTimeline, skillGroups } from '@/data/profile';
import styles from './About.module.css';

const About = () => {
  return (
    <>
      <SEO title="About" description={pageMeta.about.description} />

      <div className={styles.container}>
        <PageHeader title="About" description={pageMeta.about.description} />

        <div className={styles.lead}>
          <div className={styles.leadText}>
            <p>
              I build software that makes scientific analysis faster, more reliable and easier to
              operate. My background combines biotechnology, bioinformatics and production
              engineering &mdash; which mostly means I have seen both how an assay actually behaves
              in the lab and what it takes to run its analysis every day without surprises.
            </p>
            <p>
              At the Core is where that work becomes visible: the tools under Explore, the
              write-ups under Stories, and the methods underneath both.
            </p>
          </div>

          <aside className={styles.focus}>
            <ProfileBadge
              alt={siteConfig.name}
              imageSrc={siteConfig.profileImage}
              initials={siteConfig.initials}
              className={styles.avatar}
            />
            <p className={`label ${styles.focusTitle}`}>Current focus</p>
            <ul className={styles.focusList}>
              {focusAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
            <div className={styles.focusLinks}>
              <a href={siteConfig.githubUrl} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </div>
          </aside>
        </div>

        <section className={styles.section}>
          <p className="label">Professional timeline</p>
          <ProfessionalTimeline items={professionalTimeline} />
        </section>

        <section className={styles.section}>
          <p className="label">Skills and tools</p>
          <div className={styles.skillGroups}>
            {skillGroups.map((group) => (
              <article key={group.title} className={styles.skillGroup}>
                <h3 className={styles.skillGroupTitle}>{group.title}</h3>
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
        </section>

        <section className={styles.section}>
          <p className="label">Thesis template</p>
          <p className={styles.sectionText}>
            The LaTeX setup I wish I had on day one of my master&rsquo;s thesis, packaged so you can
            start writing instead of fighting your toolchain.
          </p>
          <div className={styles.downloads}>
            <a href={siteConfig.thesisTemplateUrl} className={styles.download}>
              Download the template {'->'}
            </a>
            <a href={siteConfig.thesisWorkflowUrl} className={styles.download}>
              Read the workflow post {'->'}
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;
