import { Link, NavLink } from 'react-router-dom';
import { siteConfig } from '@/config/site';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.brand}>
            <span className={styles.brandName}>{siteConfig.name}</span>
            <span className={styles.brandRole}>{siteConfig.headline}</span>
          </Link>

          <nav className={styles.nav}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to={siteConfig.aboutUrl}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/projects-and-posts"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              Projects & Posts
            </NavLink>
            <NavLink
              to="/books"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              Books
            </NavLink>
          </nav>

          <div className={styles.actions}>
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionLink}
            >
              GitHub
            </a>
            <a
              href={siteConfig.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.actionLink} ${styles.actionPrimary}`}
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
