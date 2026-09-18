import { Link, NavLink } from 'react-router-dom';
import { siteConfig } from '@/config/site';
import styles from './Header.module.css';

const navItems = [
  { to: siteConfig.exploreUrl, label: 'Explore' },
  { to: siteConfig.storiesUrl, label: 'Stories' },
  { to: siteConfig.aboutUrl, label: 'About' },
];

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label={`${siteConfig.brandName} - home`}>
          <span className={styles.brandLead}>At the</span>
          <span className={styles.brandCore}>Core</span>
        </Link>

        <nav className={styles.nav} aria-label="Main">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
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
        </div>
      </div>
    </header>
  );
};

export default Header;
