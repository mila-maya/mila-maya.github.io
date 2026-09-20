import type { Project } from '@/types/content.types';
import dnaProteinImage from '../../content/dna-protein_1.png';

// The interactive pieces of the site, both listed under Explore.
export const projects: Project[] = [
  {
    title: 'Peak Finding Playground',
    slug: 'peak-finding',
    description:
      'Build a synthetic chromatogram with noise, baseline drift and overlapping peaks, then run detection and multi-Gaussian fitting over it step by step and watch which peaks survive.',
    technologies: ['React', 'TypeScript', 'Pyodide', 'Signal Processing', 'Chromatography'],
    featuredImage: {
      url: '/images/blog/peak-deconvolution/gaussian-fitting.svg',
      title: 'Multi-Gaussian fit through overlapping chromatographic peaks'
    },
    cardUrl: '/explore/peak-finding',
    cardCta: 'Open the playground',
    origin: {
      summary: 'From my master thesis, 2026',
      history: [
        {
          year: '2026',
          what: 'A pared-down version of work from my master thesis, written again for the browser. The text and the implementation are its own and the scope is smaller: it exists so the method can be tried rather than only described.',
        },
      ],
    },
    displayOrder: 1
  },
  {
    title: 'Bioinformatic Toolbox',
    slug: 'bioinformatic-toolbox',
    description:
      'React one-page migration of the original Flask app: NCBI search, nucleotide translation, ESMFold prediction, and PDB retrieval with browser-based history and file exports.',
    technologies: ['React', 'TypeScript', 'Vite', 'Web APIs', 'Bioinformatics'],
    githubUrl: 'https://github.com/mila-maya/mila-maya.github.io/tree/main/src/pages/BioinformaticToolbox',
    featuredImage: {
      url: dnaProteinImage,
      title: 'DNA to protein workflow visualization'
    },
    cardUrl: '/explore/bioinformatic-toolbox',
    cardCta: 'Open the toolbox',
    origin: {
      summary: 'Harvard CS50x final project, 2024',
      history: [
        {
          year: '2023',
          what: 'Started as the CS50P final project: a command line tool that translates a nucleotide sequence in all six reading frames and checks what it finds against NCBI.',
        },
        {
          year: '2024',
          what: 'Rebuilt as a Flask and SQLite web application for the CS50x final project, with the four features it still has today.',
        },
        {
          year: '2026',
          what: 'Migrated to this site as a single React page that runs entirely in the browser, with no server behind it.',
        },
      ],
    },
    displayOrder: 2
  }
];
