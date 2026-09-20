import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from '@components/blog/BlogCard/BlogCard';
import SEO from '@components/common/SEO/SEO';
import { pageMeta } from '@/config/routeMeta';
import { siteConfig } from '@/config/site';
import { useBlogPosts } from '@hooks/useBlogPosts';
import styles from './Home.module.css';

// The playground is by far the heaviest component on the site, so the
// homepage loads it only once the rest of the page is on screen.
const PeakFindingPlayground = lazy(
  () => import('@pages/PeakFindingPlayground/PeakFindingPlayground')
);

const entryPoints = [
  {
    label: 'Surface',
    caption: 'What we observe',
    title: 'Explore',
    description:
      'Interactive tools you can actually run. Change the inputs and watch the method react.',
    to: siteConfig.exploreUrl,
    cta: 'Open the tools',
  },
  {
    label: 'Mechanism',
    caption: 'What is happening',
    title: 'Stories',
    description:
      'Longer pieces that take one question and follow it down to the mechanism underneath.',
    to: siteConfig.storiesUrl,
    cta: 'Read the writing',
  },
  {
    label: 'Core',
    caption: 'Why it works',
    title: 'About',
    description:
      'Mila Lettmayer builds scientific software for biotech and research teams. Background, work and contact.',
    to: siteConfig.aboutUrl,
    cta: 'Meet the author',
  },
];

const Home = () => {
  const { posts, loading: postsLoading } = useBlogPosts();
  const recentPosts = posts.slice(0, 3);

  return (
    <>
      <SEO {...pageMeta.home} />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.wordmark}>
            At the <span className={styles.wordmarkAccent}>Core</span>
          </h1>
          <p className={styles.tagline}>{siteConfig.tagline}</p>
          <p className={styles.blurb}>{siteConfig.brandBlurb}</p>
          <p className={`label ${styles.byline}`}>
            by {siteConfig.name} &middot; {siteConfig.role}
          </p>
        </div>
      </section>

      <section className={styles.core}>
        <div className={styles.coreInner}>
          <p className="label">The current core</p>
          <h2 className={styles.coreTitle}>
            How do you find a peak in messy scientific data?
          </h2>
          <p className={styles.coreLead}>
            Real chromatograms overlap, drift and hide behind noise. Start by building the mess
            yourself &mdash; a synthetic signal with baseline drift, noise and peaks that run into
            each other &mdash; and then watch an algorithm pull them apart again.
          </p>

          <div className={styles.coreStage}>
            <Suspense
              fallback={<p className={styles.stageFallback}>Loading the playground&hellip;</p>}
            >
              <PeakFindingPlayground embedded focusStep={1} />
            </Suspense>
          </div>

          <div className={styles.coreActions}>
            <Link to={siteConfig.peakFindingPostUrl} className={styles.primaryAction}>
              Read the full story and run every step {'->'}
            </Link>
            <Link to={siteConfig.taylorBoardUrl} className={styles.secondaryAction}>
              The project it came from {'->'}
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.paths}>
        <div className={styles.pathsInner}>
          <ol className={styles.pathList}>
            {entryPoints.map((entry) => (
              <li key={entry.title} className={styles.path}>
                <Link to={entry.to} className={styles.pathLink}>
                  <span className={`label ${styles.pathLabel}`}>{entry.label}</span>
                  <span className={styles.pathCaption}>{entry.caption}</span>
                  <h3 className={styles.pathTitle}>{entry.title}</h3>
                  <p className={styles.pathDescription}>{entry.description}</p>
                  <span className={styles.pathCta}>{entry.cta} {'->'}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.recent}>
        <div className={styles.recentInner}>
          <div className={styles.recentHeader}>
            <p className="label">Recent</p>
            <Link to={siteConfig.storiesUrl} className={styles.recentCta}>
              All stories {'->'}
            </Link>
          </div>

          {postsLoading ? (
            <p className={styles.stageFallback}>Loading posts&hellip;</p>
          ) : (
            <div className={styles.recentGrid}>
              {recentPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={styles.author}>
        <div className={styles.authorInner}>
          <p className="label">The author</p>
          <p className={styles.authorText}>
            I am <strong>{siteConfig.name}</strong>, a scientific software engineer with a
            background in biotechnology and bioinformatics. I build analysis pipelines, interactive
            tools and practical ML workflows &mdash; and I write about what is happening underneath
            them.
          </p>
          <Link to={siteConfig.aboutUrl} className={styles.authorLink}>
            Read more about my work {'->'}
          </Link>
        </div>
      </section>
    </>
  );
};

export default Home;
