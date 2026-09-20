export const siteConfig = {
  /* --- The publication ------------------------------------------------- */
  brandName: 'At the Core',
  brandWordmark: 'AT THE CORE',
  tagline: 'Science, software, and the ideas underneath.',
  brandBlurb: 'Tools, experiments, and stories about how things actually work.',

  /* --- The person behind it -------------------------------------------- */
  name: 'Mila Lettmayer',
  shortName: 'Mila',
  initials: 'ML',
  role: 'Scientific Software Engineer',
  headline: 'Scientific software, bioinformatics, and applied ML',
  description:
    'Tools, experiments and stories about scientific software, bioinformatics and applied machine learning, by Mila Lettmayer.',

  siteUrl: 'https://at-the-core.pages.dev',
  githubUrl: 'https://github.com/mila-maya',
  portfolioRepoUrl: 'https://github.com/mila-maya/mila-maya.github.io',
  bioinformaticToolboxSourceUrl:
    'https://github.com/mila-maya/mila-maya.github.io/tree/main/src/pages/BioinformaticToolbox',
  defaultShareImage: '/images/blog/tda-theory/tda-combined-presentation.png',
  /* Her GitHub avatar, served from this repo rather than from
     avatars.githubusercontent.com: an image on somebody else's host can go
     away without anyone noticing, which is how the RNAnalytics logo broke.
     The badge still falls back to her initials if it ever fails to load. */
  profileImage: '/images/mila-github.jpg',

  /* --- Routes ----------------------------------------------------------
   * The three rooms of the site. Everything now lives under one of them.
   * -------------------------------------------------------------------- */
  /** The one room: both projects and the writing that belongs to them. */
  exploreUrl: '/explore',
  storiesUrl: '/stories',
  aboutUrl: '/about',
  /** Kept only so the old path can redirect; the playground itself lives in the post. */
  peakFindingUrl: '/explore/peak-finding',
  peakFindingPostUrl: '/blog/peak-detection-deconvolution-overlapping-chromatograms',
  bioinformaticToolboxUrl: '/projects/bioinformatic-toolbox',
  taylorBoardUrl: '/projects/taylor-board',
  booksUrl: '/books',

  thesisWorkflowUrl: '/blog/getting-started-masters-thesis-workflow',
  thesisPdfUrl: '/downloads/thesis-template.pdf',
  thesisTemplateUrl: '/downloads/thesis-template.zip',
} as const;
