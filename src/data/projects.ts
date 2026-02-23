import type { Project } from '@/types/contentful.types';
import dnaProteinImage from '../../content/dna-protein_1.png';

// Portfolio projects shown on the home and projects pages.
export const projects: Project[] = [
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
