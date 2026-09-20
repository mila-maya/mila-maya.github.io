/**
 * A bullet is either a plain line or a line with its own year.
 *
 * The year goes in front, in its own column, the way the timeline itself and
 * the toolbox's history already show one. Trailing it behind the text buries
 * the one thing a reader scans for.
 */
export type TimelineBullet = string | { year: string; what: string };

export interface TimelineItem {
  period: string;
  title: string;
  detail: string;
  icon: {
    src: string;
    alt: string;
  };
  bullets?: TimelineBullet[];
}

export interface SkillGroup {
  title: string;
  skills: string[];
}

export const professionalTimeline: TimelineItem[] = [
  {
    period: '2026 - Present',
    title: 'Kori, personal project',
    icon: {
      src: '/favicon.svg',
      alt: 'At the Core icon'
    },
    detail:
      'Building Kori, a household and meal planning application, as a full-stack project: an explicit relational domain model in PostgreSQL behind a typed API, with a Next.js front end.',
    bullets: [
      'Modelled the domain explicitly rather than by convention: recipes hold ordered ingredient lines with nested options, and whether a recipe is vegetarian, vegan or gluten-free is derived from what its ingredients are made of rather than typed on the recipe.',
      'Django with a typed Django Ninja API over PostgreSQL, and Django Admin for data work.',
      'Next.js interfaces for food, recipes, menu planning and the pantry, in light and dark themes.',
      'Developed in reviewed phases with explicit gates, so each stage is finished and approved before the next begins.'
    ]
  },
  {
    period: '2024 - 2026',
    title: 'Scientific Software Engineer, RNAnalytics',
    icon: {
      src: '/images/logos/rnanalytics.png',
      alt: 'RNAnalytics logo'
    },
    detail:
      'Designed and implemented production workflows for nanoparticle analysis, quality checks, and cloud-platform integration.',
    bullets: [
      'Built a Python pipeline for hydrodynamic size determination from Taylor Dispersion Analysis data.',
      'Delivered a Dash application replacing manual evaluation with end-to-end batch processing and standardized outputs.',
      'Structured the codebase into core, service, and UI layers with persistence for better maintainability.',
      'Implemented automated QC and plausibility checks to flag anomalous runs.',
      'Created a synthetic data generator to benchmark robustness, accuracy, and resolution limits.',
      'Integrated analysis logic into a Django + React cloud platform through modular APIs.',
      'Maintained production-quality delivery with GitHub-based workflows and technical documentation.'
    ]
  },
  {
    period: '2023 - 2024',
    title: 'Harvard CS50, online',
    icon: {
      src: '/favicon.svg',
      alt: 'At the Core icon'
    },
    detail:
      'CS50 certificates taken alongside the diploma studies, from Python and computer science fundamentals through web programming to applied AI.',
    bullets: [
      { year: '2024', what: "CS50's Introduction to Artificial Intelligence with Python." },
      { year: '2024', what: "CS50's Web Programming with Python and JavaScript." },
      {
        year: '2024',
        what: 'CS50x, Introduction to Computer Science. Final project: the Bioinformatic Toolbox as a Flask web application.'
      },
      {
        year: '2023',
        what: "CS50's Introduction to Programming with Python. Final project: a command line tool for nucleotide translation, which later became the Bioinformatic Toolbox."
      }
    ]
  },
  {
    // Its own station rather than four bullets inside the degree: it is the
    // piece of work two posts, a playground and a project page all come out of,
    // and buried under the diploma none of that had anywhere to point.
    period: '2025 - 2026',
    title: 'Master thesis, Automated Taylorgram Processing',
    icon: {
      src: '/images/logos/boku.svg',
      alt: 'BOKU University logo'
    },
    detail:
      'Carried out at RNAnalytics for the BOKU diploma: automated Taylorgram processing for nanoparticle size characterization.',
    bullets: [
      'Automated peak detection, multi-Gaussian fitting, and diameter calculation with built-in validity checks.',
      'Used physics-based synthetic Taylorgrams to validate robustness and guide parameter tuning.',
      'Benchmarked against DLS with polystyrene standards and observed TDA values about 7 percent lower than volume-weighted DLS.',
      'Introduced marker-free elution-time validation by predicting residence times from experimental configuration.'
    ]
  },
  {
    period: '2017 - 2026',
    title: 'Dipl.-Ing. Biotechnology / Bioinformatics, BOKU',
    icon: {
      src: '/images/logos/boku.svg',
      alt: 'BOKU University logo'
    },
    detail:
      'Master programme in biotechnology at the University of Natural Resources and Life Sciences, with the emphasis on bioinformatics.'
  },
  {
    period: '2012 - 2017',
    title: 'BSc Food and Biotechnology, BOKU',
    icon: {
      src: '/images/logos/boku.svg',
      alt: 'BOKU University logo'
    },
    detail: 'Developed strong foundations in molecular biology, genetics, and bioprocessing.'
  }
];

export const skillGroups: SkillGroup[] = [
  {
    title: 'Programming',
    skills: ['Python', 'R', 'TypeScript', 'JavaScript', 'PostgreSQL']
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
    skills: ['Dash', 'Flask', 'Django', 'React', 'REST APIs', 'Docker', 'GitHub']
  }
];

export const focusAreas = [
  'ML model evaluation and applied AI workflows in Python',
  'Taylor dispersion data processing and robust QC automation',
  'Dashboards and end-to-end analysis pipelines',
  'Scientific software architecture and API integration'
];
