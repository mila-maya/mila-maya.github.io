export interface Book {
  id: string;
  slug: string;
  title: string;
  authors: string[];
  categories: string[];
  rating: string[];
  finished: string | null;
  url: string | null;
  notionUrl: string;
  cover: string | null;
  takeaways: string[];
}
