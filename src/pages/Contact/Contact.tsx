import { useState, FormEvent } from 'react';
import SEO from '@components/common/SEO/SEO';
import styles from './Contact.module.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Note: This is a basic mailto implementation
    // For production, consider using a service like Formspree, EmailJS, or a backend API
    const { name, email, message } = formData;
    const mailtoLink = `mailto:your.email@example.com?subject=Contact from ${encodeURIComponent(name)}&body=${encodeURIComponent(`From: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
    window.location.href = mailtoLink;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <SEO
        title="Contact"
        description="Get in touch with Mila. Send me a message or connect on social media."
      />

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Get In Touch</h1>
          <p className={styles.description}>
            Have a question or want to work together? Feel free to reach out!
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={styles.input}
              placeholder="Your Name"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={styles.input}
              placeholder="your.email@example.com"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message" className={styles.label}>
              Message
            </label>
            <textarea
              id="message"
              name="message"
              className={styles.textarea}
              placeholder="Your message..."
              required
              value={formData.message}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className={styles.button}>
            Send Message
          </button>
        </form>

        <div className={styles.note}>
          <strong>Note:</strong> This form uses a basic mailto link. For a better
          experience, consider integrating with a form service like Formspree or
          EmailJS in the future.
        </div>

        <section className={styles.links}>
          <h2 className={styles.linksTitle}>Connect With Me</h2>
          <div className={styles.socialLinks}>
            <a
              href="https://github.com/mila-maya"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/mila-lettmayer/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              LinkedIn
            </a>
            <a
              href="https://twitter.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              Twitter
            </a>
            <a
              href="mailto:your.email@example.com"
              className={styles.socialLink}
            >
              Email
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

export default Contact;
