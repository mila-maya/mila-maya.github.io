import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.links}>
          <span className={styles.connectLabel}>Connect With Me:</span>
          <a
            href="https://www.linkedin.com/in/mila-lettmayer/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            LinkedIn
          </a>
        </div>
        <p className={styles.copyright}>(c) {currentYear} Mila. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;


