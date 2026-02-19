import SEO from '@components/common/SEO/SEO';
import styles from './About.module.css';

const About = () => {
  const timeline = [
    {
      period: 'Feb 2026 - Present',
      title: 'Professional Development (Career Break)',
      detail:
        'Focused on strengthening ML and AI skills through hands-on Python projects in model evaluation, dashboards, and financial data analysis.'
    },
    {
      period: 'Nov 2024 - Jan 2026',
      title: 'Scientific Software Engineer (Part-time), RNAnalytics',
      detail:
        'Designed and implemented production workflows for nanoparticle analysis, quality checks, and cloud-platform integration.'
    },
    {
      period: 'May 2017 - Jan 2026',
      title: 'Dipl.-Ing. Biotechnology with emphasis in Bioinformatics, BOKU',
      detail:
        'Master thesis focused on automated Taylorgram processing for nanoparticle size characterization.'
    },
    {
      period: 'Mar 2012 - Apr 2017',
      title: 'BSc Food and Biotechnology, BOKU',
      detail:
        'Developed strong foundations in molecular biology, genetics, and bioprocessing.'
    }
  ];

  const rnAnalyticsImpact = [
    'Built a Python pipeline for hydrodynamic size determination from Taylor Dispersion Analysis data.',
    'Delivered a Dash application replacing manual evaluation with end-to-end batch processing and standardized outputs.',
    'Structured the codebase into core, service, and UI layers with persistence for better maintainability.',
    'Implemented automated QC and plausibility checks to flag anomalous runs.',
    'Created a synthetic data generator to benchmark robustness, accuracy, and resolution limits.',
    'Integrated analysis logic into a Django + React cloud platform through modular APIs.',
    'Maintained production-quality delivery with GitHub-based workflows and technical documentation.'
  ];

  const thesisHighlights = [
    'Automated peak detection, multi-Gaussian fitting, and diameter calculation with built-in validity checks.',
    'Used physics-based synthetic Taylorgrams to validate robustness and guide parameter tuning.',
    'Benchmarked against DLS with polystyrene standards and observed TDA values about 7 percent lower than volume-weighted DLS.',
    'Introduced marker-free elution-time validation by predicting residence times from experimental configuration.'
  ];

  const projects = [
    {
      title: 'Bioinformatic Toolbox',
      period: 'Dec 2023 - Jan 2024',
      detail:
        'Python web app (Flask + SQLite) connecting nucleotide sequence workflows to protein structure discovery via NCBI, ESM Atlas, and PDB APIs.'
    },
    {
      title: 'From Nucleotide Sequence to Protein',
      period: 'Sep 2023',
      detail:
        'CS50P final project that detects coding regions, translates sequences, and matches potential proteins against NCBI references.'
    }
  ];

  const skillGroups = [
    {
      title: 'Programming',
      skills: ['Python', 'R', 'TypeScript', 'JavaScript', 'SQL']
    },
    {
      title: 'Scientific and Data',
      skills: [
        'Taylor Dispersion Analysis',
        'Multivariate Statistics',
        'PCA and Clustering',
        'Automated QC',
        'Data Visualization'
      ]
    },
    {
      title: 'Product and Platform',
      skills: ['Dash', 'Flask', 'Django', 'React', 'REST APIs', 'GitHub']
    }
  ];

  return (
    <>
      <SEO
        title="About"
        description="Mila Lettmayer - scientific software engineer with a bioinformatics background, focused on ML/AI development and practical research tooling."
      />

      <div className={styles.container}>
        <header className={styles.header}>
          <img
            src="/avatar.jpg"
            alt="Mila Lettmayer"
            className={styles.avatar}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <h1 className={styles.title}>About Me</h1>
          <p className={styles.subtitle}>
            Scientific Software Engineer | Bioinformatics | ML and AI Development
          </p>
          <p className={styles.intro}>
            I enjoy building tools that make scientific analysis faster, more
            reliable, and easier to operate. My background combines biotechnology,
            bioinformatics, and production software engineering.
          </p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Professional Timeline</h2>
          <div className={styles.timeline}>
            {timeline.map((item) => (
              <article key={`${item.period}-${item.title}`} className={styles.timelineItem}>
                <p className={styles.period}>{item.period}</p>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemText}>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>RNAnalytics Impact</h2>
          <ul className={styles.bulletList}>
            {rnAnalyticsImpact.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Master Thesis Highlights</h2>
          <ul className={styles.bulletList}>
            {thesisHighlights.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Earlier Bioinformatics Projects</h2>
          <div className={styles.projectsGrid}>
            {projects.map((project) => (
              <article key={project.title} className={styles.projectCard}>
                <p className={styles.period}>{project.period}</p>
                <h3 className={styles.itemTitle}>{project.title}</h3>
                <p className={styles.itemText}>{project.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills and Tools</h2>
          <div className={styles.skillGroups}>
            {skillGroups.map((group) => (
              <article key={group.title} className={styles.skillGroup}>
                <h3 className={styles.itemTitle}>{group.title}</h3>
                <div className={styles.skills}>
                  {group.skills.map((skill) => (
                    <span key={skill} className={styles.skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default About;
