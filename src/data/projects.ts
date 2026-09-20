import type { Project } from '@/types/content.types';
import dnaProteinImage from '../../content/dna-protein_1.png';

// The interactive pieces of the site, both listed under Explore.
export const projects: Project[] = [
  {
    title: 'Automated Taylorgram Processing',
    slug: 'taylor-board',
    description:
      'Master thesis. Taylor Board automates Taylor dispersion analysis end to end: raw instrument files, peak detection, Gaussian fitting, size calculation, and validity checks that keep results inside the Taylor regime.',
    technologies: ['Python', 'Signal Processing', 'Chromatography', 'Nanoparticle Sizing'],
    featuredImage: {
      url: '/images/blog/tda-theory/tda-combined-presentation.png',
      title: 'Taylor dispersion analysis principle'
    },
    cardUrl: '/projects/taylor-board',
    cardCta: 'Open the project',
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
