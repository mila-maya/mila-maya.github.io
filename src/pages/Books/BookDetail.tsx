import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import SEO from '@components/common/SEO/SEO';
import { books } from '@/data/books';
import styles from './BookDetail.module.css';

const BookDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const book = books.find((b) => b.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!book) {
    return (
      <div className={styles.container}>
        <Link to="/books" className={styles.backLink}>
          {'<-'} Back to Books
        </Link>
        <p className={styles.notFound}>Book not found.</p>
      </div>
    );
  }

  const authorLine = book.authors.length > 0 ? book.authors.join(', ') : null;
  const formattedDate = book.finished
    ? format(new Date(book.finished), 'MMMM yyyy')
    : null;

  return (
    <>
      <SEO
        title={`${book.title} - Books - Mila Maya`}
        description={
          book.takeaways[0] ??
          `Takeaways from ${book.title}${authorLine ? ' by ' + authorLine : ''}.`
        }
        image={book.cover ?? undefined}
        type="article"
      />

      <article className={styles.container}>
        <Link to="/books" className={styles.backLink}>
          {'<-'} Back to Books
        </Link>

        <header className={styles.header}>
          <div className={styles.coverWrap}>
            {book.cover ? (
              <img
                src={book.cover}
                alt={`Cover of ${book.title}`}
                className={styles.cover}
              />
            ) : (
              <div className={styles.coverPlaceholder} aria-hidden="true">
                {book.title.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className={styles.meta}>
            <h1 className={styles.title}>{book.title}</h1>
            {authorLine && <p className={styles.author}>by {authorLine}</p>}

            <dl className={styles.facts}>
              {book.categories.length > 0 && (
                <>
                  <dt>Category</dt>
                  <dd>{book.categories.join(', ')}</dd>
                </>
              )}
              {book.rating.length > 0 && (
                <>
                  <dt>Rating</dt>
                  <dd>{book.rating.join(', ')}</dd>
                </>
              )}
              {formattedDate && (
                <>
                  <dt>Finished</dt>
                  <dd>{formattedDate}</dd>
                </>
              )}
            </dl>

            {book.url && (
              <a
                href={book.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalLink}
              >
                Reference {'->'}
              </a>
            )}
          </div>
        </header>

        <section className={styles.takeawaysSection}>
          <h2 className={styles.sectionTitle}>Main Takeaways</h2>
          {book.takeaways.length > 0 ? (
            <ol className={styles.takeaways}>
              {book.takeaways.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ol>
          ) : (
            <p className={styles.empty}>Takeaways coming soon.</p>
          )}
        </section>
      </article>
    </>
  );
};

export default BookDetail;
