import { useMemo, useState } from 'react';
import SEO from '@components/common/SEO/SEO';
import PageHeader from '@components/common/PageHeader/PageHeader';
import FilterBar, { type FilterOption } from '@components/common/FilterBar/FilterBar';
import BookCard from '@components/books/BookCard/BookCard';
import { pageMeta } from '@/config/routeMeta';
import { books } from '@/data/books';
import styles from './Books.module.css';

const ALL_ID = 'all';

const Books = () => {
  const [activeCategory, setActiveCategory] = useState<string>(ALL_ID);

  const filterOptions = useMemo<FilterOption[]>(() => {
    const set = new Set<string>();
    books.forEach((b) => b.categories.forEach((c) => set.add(c)));
    return [
      { id: ALL_ID, label: 'All' },
      ...Array.from(set)
        .sort()
        .map((c) => ({ id: c, label: c })),
    ];
  }, []);

  const visibleBooks = useMemo(() => {
    if (activeCategory === ALL_ID) return books;
    return books.filter((b) => b.categories.includes(activeCategory));
  }, [activeCategory]);

  return (
    <div className={styles.container}>
      <SEO title="Books" description={pageMeta.books.description} />
      <PageHeader title="Books" description={pageMeta.books.description} />

      {filterOptions.length > 1 && (
        <FilterBar
          options={filterOptions}
          activeId={activeCategory}
          onChange={setActiveCategory}
          ariaLabel="Filter books by category"
        />
      )}

      {visibleBooks.length === 0 ? (
        <p className={styles.empty}>No books in this category yet.</p>
      ) : (
        <div className={styles.grid}>
          {visibleBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Books;

