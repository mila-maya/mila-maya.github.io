import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { BlogPost } from '@/types/contentful.types';
import styles from './BlogCard.module.css';

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard = ({ post }: BlogCardProps) => {
  const formattedDate = post.publishedDate
    ? format(new Date(post.publishedDate), 'MMM dd, yyyy')
    : '';
  const imageUrl = post.featuredImage?.url ?? '';
  const isSvg = /\.svg(\?|$)/i.test(imageUrl);

  return (
    <Link to={`/blog/${post.slug}`} className={styles.card}>
      {post.featuredImage ? (
        <img
          src={post.featuredImage.url}
          alt={post.featuredImage.title || post.title}
          className={`${styles.image} ${isSvg ? styles.imageContain : ''}`}
        />
      ) : (
        <div className={styles.imagePlaceholder}>
          {post.title.charAt(0)}
        </div>
      )}

      <div className={styles.content}>
        <h3 className={styles.title}>{post.title}</h3>

        <div className={styles.meta}>
          <span>{post.author}</span>
          {formattedDate && <span>| {formattedDate}</span>}
          {post.category && <span>| {post.category}</span>}
        </div>

        <p className={styles.excerpt}>{post.excerpt}</p>

        {post.tags && post.tags.length > 0 && (
          <div className={styles.tags}>
            {post.tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <span className={styles.readMore}>Read more {'->'}</span>
      </div>
    </Link>
  );
};

export default BlogCard;
