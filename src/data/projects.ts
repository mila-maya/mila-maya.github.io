import type { Project } from '@/types/content.types';
import dnaProteinImage from '../../content/dna-protein_1.png';

// Portfolio projects shown on the home and projects pages.
export const projects: Project[] = [
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
    cardUrl: '/projects/bioinformatic-toolbox',
    displayOrder: 1
  }
];
