import type { TimelineItem } from '@/data/profile';
import styles from './ProfessionalTimeline.module.css';

interface ProfessionalTimelineProps {
  items: TimelineItem[];
}

const ProfessionalTimeline = ({ items }: ProfessionalTimelineProps) => {
  return (
    <div className={styles.timeline}>
      {items.map((item) => {
        const year = item.period.split(' - ')[0];

        return (
          <article key={`${item.period}-${item.title}`} className={styles.item}>
            <p className={styles.year} aria-label={item.period}>
              {year}
            </p>
            <div className={styles.marker}>
              <span className={styles.iconFrame}>
                <img
                  src={item.icon.src}
                  alt={item.icon.alt}
                  className={styles.icon}
                  loading="lazy"
                />
              </span>
            </div>
            <div className={styles.content}>
              <h4 className={styles.title}>{item.title}</h4>
              <p className={styles.detail}>{item.detail}</p>
              {item.bullets && (
                <ul className={styles.bullets}>
                  {item.bullets.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default ProfessionalTimeline;
