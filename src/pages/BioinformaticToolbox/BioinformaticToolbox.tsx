import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@components/common/SEO/SEO';
import { siteConfig } from '@/config/site';
import type { SourceMode } from './types';
import NcbiWorkflow from './components/NcbiWorkflow';
import ManualWorkflow from './components/ManualWorkflow';
import AaWorkflow from './components/AaWorkflow';
import PdbSearch from './components/PdbSearch';
import styles from './BioinformaticToolbox.module.css';

interface WorkflowTab {
  id: SourceMode;
  label: string;
  description: string;
}

const WORKFLOW_TABS: WorkflowTab[] = [
  { id: 'ncbi', label: 'NCBI Search', description: 'Fetch annotated proteins from GenBank records' },
  { id: 'manual', label: 'Sequence to Protein', description: 'Six-frame ORF scan from raw DNA / RNA' },
  { id: 'aa', label: 'Protein to Structure', description: 'Predict 3D structure from amino acid sequence' },
  { id: 'pdb', label: 'PDB Search', description: 'Look up known 3D structures by PDB ID' }
];

const BioinformaticToolbox = () => {
  const [sourceMode, setSourceMode] = useState<SourceMode>('ncbi');

  return (
    <>
      <SEO
        title="Bioinformatic Toolbox"
        description="Four practical bioinformatics workflows: NCBI annotation search, manual sequence-to-protein translation, structure prediction, and PDB lookup."
      />

      <div className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.kicker}>Bioinformatic Toolbox</p>
          <h1 className={styles.title}>DNA &rarr; RNA &rarr; Protein &rarr; 3D Structure</h1>
          <p className={styles.subtitle}>
            Four practical workflows for protein analysis - from sequence retrieval to structure
            prediction.
          </p>
          <div className={styles.heroActions}>
            <Link to="/projects-and-posts#projects" className={styles.backLink}>
              &larr; Back to Projects & Posts
            </Link>
            <a
              href={siteConfig.bioinformaticToolboxSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.sourceLink}
            >
              View Source &rarr;
            </a>
          </div>
        </header>

        <nav className={styles.tabBar} role="tablist">
          {WORKFLOW_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={sourceMode === tab.id}
              className={sourceMode === tab.id ? styles.tabActive : styles.tab}
              onClick={() => setSourceMode(tab.id)}
            >
              <span className={styles.tabLabel}>{tab.label}</span>
              <span className={styles.tabDescription}>{tab.description}</span>
            </button>
          ))}
        </nav>

        <div className={styles.workflowContent}>
          {sourceMode === 'ncbi' && <NcbiWorkflow />}
          {sourceMode === 'manual' && <ManualWorkflow />}
          {sourceMode === 'aa' && <AaWorkflow />}
          {sourceMode === 'pdb' && <PdbSearch />}
        </div>
      </div>
    </>
  );
};

export default BioinformaticToolbox;

