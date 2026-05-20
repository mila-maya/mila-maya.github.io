import { useState } from 'react';
import styles from './ProfileBadge.module.css';

interface ProfileBadgeProps {
  alt: string;
  imageSrc?: string;
  initials: string;
  className?: string;
}

const ProfileBadge = ({ alt, imageSrc, initials, className = '' }: ProfileBadgeProps) => {
  const [hasImageError, setHasImageError] = useState(false);
  const showFallback = !imageSrc || hasImageError;

  return (
    <div className={`${styles.root} ${className}`.trim()} aria-label={alt}>
      {showFallback ? (
        <span className={styles.fallback}>{initials}</span>
      ) : (
        <img
          src={imageSrc}
          alt={alt}
          className={styles.image}
          onError={() => setHasImageError(true)}
        />
      )}
    </div>
  );
};

export default ProfileBadge;

