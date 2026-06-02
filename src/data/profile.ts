export interface TimelineItem {
  period: string;
  title: string;
  detail: string;
  icon: {
    src: string;
    alt: string;
  };
  bullets?: string[];
}

export interface SkillGroup {
  title: string;
  skills: string[];
}

export const professionalTimeline: TimelineItem[] = [
  {
    period: '2026 - Present',
    title: 'Career Development',
    icon: {
      src: '/favicon.svg',
      alt: 'Mila Lettmayer homepage icon'
    },
    detail:
      'Focused on strengthening ML and AI skills through hands-on Python projects in model evaluation, dashboards, and financial data analysis.'
  },
  {
    period: '2024 - 2026',
    title: 'Scientific Software Engineer, RNAnalytics',
    icon: {
      src: 'https://www.rnanalytics.eu/.cm4all/uproc.php/0/Logo%20Lockup_Black.svg?_=197606d7a88',
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
    period: '2017 - 2026',
    title: 'Dipl.-Ing. Biotechnology / Bioinformatics, BOKU',
    icon: {
      src: 'https://boku.ac.at/fileadmin/data/themen/Marketing/Downloads/BOKU_Hauptlogo_RGB.svg',
      alt: 'BOKU University logo'
    },
    detail:
      'Master thesis focused on automated Taylorgram processing for nanoparticle size characterization.',
    bullets: [
      'Automated peak detection, multi-Gaussian fitting, and diameter calculation with built-in validity checks.',
      'Used physics-based synthetic Taylorgrams to validate robustness and guide parameter tuning.',
      'Benchmarked against DLS with polystyrene standards and observed TDA values about 7 percent lower than volume-weighted DLS.',
      'Introduced marker-free elution-time validation by predicting residence times from experimental configuration.'
    ]
  },
  {
    period: '2012 - 2017',
    title: 'BSc Food and Biotechnology, BOKU',
    icon: {
      src: 'https://boku.ac.at/fileadmin/data/themen/Marketing/Downloads/BOKU_Hauptlogo_RGB.svg',
      alt: 'BOKU University logo'
    },
    detail: 'Developed strong foundations in molecular biology, genetics, and bioprocessing.'
  }
];

export const skillGroups: SkillGroup[] = [
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

export const focusAreas = [
  'ML model evaluation and applied AI workflows in Python',
  'Taylor dispersion data processing and robust QC automation',
  'Dashboards and end-to-end analysis pipelines',
  'Scientific software architecture and API integration'
];
