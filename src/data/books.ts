import booksJson from './books.json';
import type { Book } from '@/types/book.types';

export const books: Book[] = booksJson as Book[];
