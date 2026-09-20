import { Link } from 'react-router-dom';
import SEO from '@components/common/SEO/SEO';
import { pageMeta } from '@/config/routeMeta';
import { siteConfig } from '@/config/site';
import styles from './TaylorBoard.module.css';

/**
 * The thesis abstract, word for word as it stands in the thesis, with only the
 * LaTeX markup resolved. Nothing here is written for the site, and nothing from
 * the chapters themselves appears: the thesis is under embargo.
 */
const ABSTRACT = [
  'Accurate nanoparticle sizing is critical for pharmaceutical formulation development, yet the standard method — dynamic light scattering (DLS) — systematically overestimates size by favoring larger particles. Taylor dispersion analysis (TDA) offers a calibration-free alternative but has seen limited adoption due to manual, operator-dependent data processing.',
  'This thesis introduces Taylor Board, a web application that largely automates TDA analysis. The pipeline handles everything from raw instrument files through peak detection, Gaussian fitting, and size calculation — with built-in validity checks ensuring results stay within the Taylor regime.',
  'Algorithm validation relied on virtual experiments — realistic synthetic Taylorgrams generated from physical principles — which also guided automated parameter tuning. Benchmarks on these virtual experiments achieved <3% diameter error for well-resolved mixtures and ~4% near the theoretical resolution limit. Experimental validation with polystyrene standards confirmed real-world performance: 96.3 ± 1.7 nm (SCB 50, n=5, 1.8% RSD), consistent with DLS volume-weighted values (103.1 nm). Region selection emerged as the main source of algorithmic uncertainty, with even slight parameter variations shifting diameter estimates by ~3%.',
  'A key contribution is marker-free elution time validation: by predicting residence times directly from experimental configuration, the pipeline verifies Taylor regime without requiring dedicated tracer runs. The application enables reproducible TDA analysis with multi-file processing, aggregating size estimates across replicates, lowering the barrier to routine nanoparticle characterization.',
];

/**
 * Lifted word for word from the abstract below. An abstract is a wall of text;
 * these are the three things a reader would otherwise have to dig for. Nothing
 * here is written for the site - every phrase appears verbatim above.
 */
const HIGHLIGHTS = [
  { value: '<3%', text: 'diameter error for well-resolved mixtures' },
  {
    value: '96.3 ± 1.7 nm',
    text: 'with polystyrene standards, consistent with DLS volume-weighted values (103.1 nm)',
  },
  {
    value: 'marker-free',
    text: 'elution time validation, without requiring dedicated tracer runs',
  },
];

/** Everything already published that came out of this work. */
const parts = [
  {
    to: '/blog/taylor-dispersion-analysis-general-theory',
    label: 'The method',
    hint: 'What Taylor dispersion measures, when the model holds and where it breaks.',
  },
  {
    to: siteConfig.peakFindingPostUrl,
    label: 'The algorithm',
    hint: 'Peak detection and multi-Gaussian fitting, in three runnable steps.',
  },
  {
    to: siteConfig.thesisWorkflowUrl,
    label: 'The writing setup',
    hint: 'The LaTeX and tooling this thesis was written with, and the template.',
  },
];

const TaylorBoard = () => (
  <>
    <SEO {...pageMeta.taylorBoard} />

    <article className={styles.container}>
      <Link to={siteConfig.exploreUrl} className={styles.backLink}>
        {'<-'} Back to Explore
      </Link>

      <header className={styles.header}>
        <p className={`label ${styles.kicker}`}>Master thesis &middot; BOKU</p>
        <h1 className={styles.title}>
          Automated Taylorgram Processing for Nanoparticle Size Characterization
        </h1>
      </header>

      <ul className={styles.highlights}>
        {HIGHLIGHTS.map((item) => (
          <li key={item.value} className={styles.highlight}>
            <span className={styles.highlightValue}>{item.value}</span>
            <span className={styles.highlightText}>{item.text}</span>
          </li>
        ))}
      </ul>

      <section className={styles.abstract}>
        <p className={`label ${styles.abstractLabel}`}>Abstract</p>
        {ABSTRACT.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </section>

      <section className={styles.parts}>
        <p className={`label ${styles.partsLabel}`}>Published from this work</p>
        <ul className={styles.partList}>
          {parts.map((part) => (
            <li key={part.to}>
              <Link to={part.to} className={styles.part}>
                <span className={styles.partLabel}>{part.label}</span>
                <span className={styles.partHint}>{part.hint}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  </>
);

export default TaylorBoard;
