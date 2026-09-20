import { useState } from 'react';
import type { TimelineItem } from '@/data/profile';
import styles from './ProfessionalTimeline.module.css';

/** Anything still running sorts above every finished year. */
const ONGOING = 9999;

const startYearOf = (period: string): number => Number.parseInt(period, 10) || 0;

const endYearOf = (period: string): number => {
  const end = period.split(' - ')[1]?.trim();
  if (!end) {
    return startYearOf(period);
  }

  // "Present" and anything else that is not a year means the entry has not ended.
  const asYear = Number.parseInt(end, 10);
  return Number.isNaN(asYear) ? ONGOING : asYear;
};

/**
 * A logo served from somebody else's site can disappear without anyone
 * noticing - the RNAnalytics one did, and left a broken image in the timeline
 * for who knows how long. If one fails to load, show initials instead.
 */
const TimelineIcon = ({ item }: { item: TimelineItem }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    // The alt text names the organisation, which is what the tile should say.
    // Initials taken from the entry title produce nonsense: "Scientific
    // Software Engineer, RNAnalytics" gives "SS".
    const name = item.icon.alt.replace(/s*(logo|icon|image)s*$/i, '').trim() || item.title;

    return (
      <span className={styles.iconFallback} aria-label={item.icon.alt} role="img">
        {name}
      </span>
    );
  }

  return (
    <img
      src={item.icon.src}
      alt={item.icon.alt}
      className={styles.icon}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

interface ProfessionalTimelineProps {
  items: TimelineItem[];
}

const ProfessionalTimeline = ({ items }: ProfessionalTimelineProps) => {
  // Ordered by when each entry ended, not when it began: what a reader wants to
  // know first is what is most recent. Ties fall back to the later start.
  const ordered = [...items].sort(
    (a, b) =>
      endYearOf(b.period) - endYearOf(a.period) ||
      startYearOf(b.period) - startYearOf(a.period)
  );

  return (
    <div className={styles.timeline}>
      {ordered.map((item) => {
        // Both ends, not just the start: without the end year a reader cannot
        // see when a degree finished or how long a role lasted.
        const [startYear, endYear] = item.period.split(' - ');

        return (
          <article key={`${item.period}-${item.title}`} className={styles.item}>
            {/* End above start: the most recent year is what a reader looks
                for, so it sits on top and carries the weight. */}
            <p className={styles.year} aria-label={item.period}>
              {endYear && <span className={styles.yearEnd}>{endYear}</span>}
              <span className={styles.yearStart}>{startYear}</span>
            </p>
            <div className={styles.marker}>
              <span className={styles.iconFrame}>
                <TimelineIcon item={item} />
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
