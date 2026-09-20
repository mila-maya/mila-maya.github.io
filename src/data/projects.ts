import type { Project } from '@/types/content.types';
import dnaProteinImage from '../../content/dna-protein_1.png';

// The interactive pieces of the site, both listed under Explore.
export const projects: Project[] = [
  {
    title: 'Automated Taylorgram Processing',
    slug: 'taylor-board',
    origin: 'Master thesis',
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
    origin: 'Harvard CS50',
    description:
      'React one-page migration of the original Flask app: NCBI search, nucleotide translation, ESMFold prediction, and PDB retrieval with browser-based history and file exports.',
    technologies: ['React', 'TypeScript', 'Vite', 'Web APIs', 'Bioinformatics'],
    githubUrl: 'https://github.com/mila-maya/mila-maya.github.io/tree/main/src/pages/BioinformaticToolbox',
    featuredImage: {
      url: dnaProteinImage,
      title: 'DNA to protein workflow visualization'
    },
    cardUrl: '/projects/bioinformatic-toolbox',
    cardCta: 'Open the toolbox',
    provenance: {
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
