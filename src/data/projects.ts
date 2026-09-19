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
    displayOrder: 2
  }
];
