import { Link } from 'react-router-dom';
import type { Book } from '@/types/book.types';
import styles from './BookCard.module.css';

interface BookCardProps {
  book: Book;
}

const BookCard = ({ book }: BookCardProps) => {
  const authorLine = book.authors.length > 0 ? book.authors.join(', ') : null;

  return (
    <Link
      to={`/books/${book.slug}`}
      className={styles.card}
      aria-label={`Open book ${book.title}`}
    >
      <div className={styles.coverWrap}>
        {book.cover ? (
          <img
            src={book.cover}
            alt={`Cover of ${book.title}`}
            className={styles.cover}
            loading="lazy"
          />
        ) : (
          <div className={styles.coverPlaceholder} aria-hidden="true">
            {book.title.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{book.title}</h3>
        {authorLine && <p className={styles.author}>{authorLine}</p>}

        {book.categories.length > 0 && (
          <div className={styles.tags}>
            {book.categories.map((c) => (
              <span key={c} className={styles.tag}>
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default BookCard;
