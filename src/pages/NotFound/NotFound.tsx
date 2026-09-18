import { Link } from 'react-router-dom';
import SEO from '@components/common/SEO/SEO';
import { siteConfig } from '@/config/site';
import styles from './NotFound.module.css';

// Some paths were retired rather than redirected, so this page is a real
// landing spot for old links and offers the three rooms instead of a dead end.
const destinations = [
  { to: siteConfig.exploreUrl, label: 'Explore', hint: 'Interactive tools' },
  { to: siteConfig.storiesUrl, label: 'Stories', hint: 'Writing' },
  { to: siteConfig.aboutUrl, label: 'About', hint: 'The author' },
];

const NotFound = () => (
  <div className={styles.container}>
    <SEO title="Page Not Found" description="The requested page could not be found." />
    <p className={`label ${styles.kicker}`}>404</p>
    <h1 className={styles.title}>Page not found</h1>
    <p className={styles.description}>
      This page may have moved, or the link might point to something that is not published here.
      Everything on the site lives in one of these three places:
    </p>

    <ul className={styles.destinations}>
      {destinations.map((destination) => (
        <li key={destination.to}>
          <Link to={destination.to} className={styles.destination}>
            <span className={styles.destinationLabel}>{destination.label}</span>
            <span className={styles.destinationHint}>{destination.hint}</span>
          </Link>
        </li>
      ))}
    </ul>

    <Link to="/" className={styles.link}>
      Back to home {'->'}
    </Link>
  </div>
);

export default NotFound;
