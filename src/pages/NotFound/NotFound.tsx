import { Link } from 'react-router-dom';
import SEO from '@components/common/SEO/SEO';
import styles from './NotFound.module.css';

const NotFound = () => (
  <div className={styles.container}>
    <SEO title="Page Not Found" description="The requested page could not be found." />
    <p className={styles.kicker}>404</p>
    <h1 className={styles.title}>Page not found</h1>
    <p className={styles.description}>
      This page may have moved, or the link might point to something that is not published here.
    </p>
    <Link to="/" className={styles.link}>
      Back to home
    </Link>
  </div>
);

export default NotFound;
