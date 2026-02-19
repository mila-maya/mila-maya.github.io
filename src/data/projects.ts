import type { Project } from '@/types/contentful.types';

// Portfolio projects shown on the home and projects pages.
export const projects: Project[] = [
  {
    title: 'Automated Taylorgram Processing for Nanoparticle Size Characterization',
    slug: 'automated-taylorgram-processing',
    description:
      'Master thesis project at BOKU and RNAnalytics: automated Taylor dispersion analysis with peak detection, multi-Gaussian fitting, diameter estimation, and validity checks for robust nanoparticle sizing.',
    technologies: [
      'Python',
      'Taylor Dispersion Analysis',
      'Signal Processing',
      'Data Validation',
      'Scientific Computing'
    ],
    displayOrder: 1
  },
  {
    title: 'Scientific Analysis Workflow for RNAnalytics Platform',
    slug: 'rnanalytics-scientific-analysis-workflow',
    description:
      'Production workflow combining Python analysis services, Dash evaluation UI, automated QC checks, and Django + React cloud platform integration for batch processing and standardized reporting.',
    technologies: ['Python', 'Dash', 'Django', 'React', 'REST APIs', 'GitHub'],
    displayOrder: 2
  },
  {
    title: 'Bioinformatic Toolbox',
    slug: 'bioinformatic-toolbox',
    description:
      'Flask + SQLite web app for sequence and protein workflows: NCBI search, nucleotide translation, structure prediction via ESM Atlas API, and PDB exploration with exportable outputs.',
    technologies: ['Python', 'Flask', 'SQLite', 'HTML', 'CSS', 'NCBI API'],
    displayOrder: 3
  },
  {
    title: 'From Nucleotide Sequence to Protein (CS50P Final Project)',
    slug: 'from-nucleotide-sequence-to-protein',
    description:
      'Command-line Python tool that detects potential coding regions, translates nucleotide sequences, and optionally matches candidate proteins against NCBI references.',
    technologies: ['Python', 'CLI', 'Bioinformatics'],
    displayOrder: 4
  }
];
