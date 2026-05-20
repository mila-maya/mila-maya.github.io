import { siteConfig } from '@/config/site';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topRow}>
          <div className={styles.copy}>
            <p className={styles.title}>Code, writing, and practical scientific tooling.</p>
            <p className={styles.subtitle}>
              Use GitHub for the code, LinkedIn for the background, and the thesis template if you
              want the most immediately reusable download on the site.
            </p>
          </div>

          <div className={styles.links}>
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              GitHub
            </a>
            <a
              href={siteConfig.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              LinkedIn
            </a>
            <a href={siteConfig.thesisTemplateUrl} className={styles.link}>
              Thesis Template
            </a>
            <a href={siteConfig.projectsUrl} className={styles.link}>
              Projects & Posts
            </a>
          </div>
        </div>
        <p className={styles.copyright}>(c) {currentYear} Mila. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
