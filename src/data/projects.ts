import type { Project } from '@/types/contentful.types';
import dnaProteinImage from '../../content/dna-protein_1.png';

// Portfolio projects shown on the home and projects pages.
export const projects: Project[] = [
  {
    title: 'Peak Finding Playground (Pyodide)',
    slug: 'peak-finding-playground',
    description:
      'Interactive browser playground for synthetic chromatograms, area-gain peak detection, and multi-Gaussian fitting with live parameter controls.',
    technologies: ['React', 'TypeScript', 'Pyodide', 'SciPy', 'Data Analysis'],
    featuredImage: {
      url: '/images/blog/tda-theory/gaussian-fitting.svg',
      title: 'Peak finding and multi-Gaussian fitting'
    },
    cardUrl: '/projects/peak-finding',
    hideLinks: true,
    displayOrder: 2
  },
  {
    title: 'Bioinformatic Toolbox',
    slug: 'bioinformatic-toolbox',
    description:
      'React one-page migration of the original Flask app: NCBI search, nucleotide translation, ESMFold prediction, and PDB retrieval with browser-based history and file exports.',
    technologies: ['React', 'TypeScript', 'Vite', 'Web APIs', 'Bioinformatics'],
    featuredImage: {
      url: dnaProteinImage,
      title: 'DNA to protein workflow visualization'
    },
    cardUrl: '/projects/bioinformatic-toolbox',
    hideLinks: true,
    displayOrder: 3
  }
];
