import { Link } from 'react-router-dom';
import ThemeSwitch from '@components/common/ThemeSwitch/ThemeSwitch';
import { siteConfig } from '@/config/site';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topRow}>
          <div className={styles.copy}>
            <p className={`label ${styles.wordmark}`}>{siteConfig.brandWordmark}</p>
            <p className={styles.subtitle}>{siteConfig.tagline}</p>
          </div>

          <nav className={styles.links} aria-label="Footer">
            <Link to={siteConfig.exploreUrl} className={styles.link}>
              Explore
            </Link>
            <Link to={siteConfig.storiesUrl} className={styles.link}>
              Stories
            </Link>
            <Link to={siteConfig.aboutUrl} className={styles.link}>
              About
            </Link>
            <Link to={siteConfig.booksUrl} className={styles.link}>
              Books
            </Link>
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
          </nav>
        </div>
        <div className={styles.bottomRow}>
          <p className={styles.copyright}>
            &copy; {currentYear} {siteConfig.name}
          </p>
          <ThemeSwitch />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
