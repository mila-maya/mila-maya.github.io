import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Mila</h1>
          <p className={styles.subtitle}>
            Scientific Software Engineer | Bioinformatics | ML and AI Development
          </p>
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
              to="/projects-and-posts"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              Projects and Posts
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
