import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@components/common/SEO/SEO';
import type { SourceMode } from './types';
import NcbiWorkflow from './components/NcbiWorkflow';
import ManualWorkflow from './components/ManualWorkflow';
import PdbSearch from './components/PdbSearch';
import styles from './BioinformaticToolbox.module.css';

const BioinformaticToolbox = () => {
  const [sourceMode, setSourceMode] = useState<SourceMode>('ncbi');

  return (
    <>
      <SEO
        title="Bioinformatic Toolbox"
        description="Separated NCBI and manual workflows from sequence source to protein candidates and 3D structure prediction."
      />

      <div className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.kicker}>One Connected Workflow</p>
          <h1 className={styles.title}>DNA to RNA to Protein to 3D Structure</h1>
          <p className={styles.subtitle}>
            NCBI mode is annotation-driven. Manual mode is ORF-driven. The flows are intentionally separated.
          </p>
          <Link to="/projects" className={styles.backLink}>
            Back to Projects
          </Link>
        </header>

        <div className={styles.workflowSelector}>
          <button
            type="button"
            className={sourceMode === 'ncbi' ? styles.activeSource : styles.inactiveSource}
            onClick={() => setSourceMode('ncbi')}
          >
            NCBI Annotation Workflow
          </button>
          <button
            type="button"
            className={sourceMode === 'manual' ? styles.activeSource : styles.inactiveSource}
            onClick={() => setSourceMode('manual')}
          >
            Manual ORF Workflow
          </button>
        </div>

        {sourceMode === 'ncbi' ? <NcbiWorkflow /> : <ManualWorkflow />}

        <PdbSearch />

        <section className={styles.note}>
          <h3>Workflow Split</h3>
          <p>
            NCBI mode uses only annotated proteins from GenBank/NCBI records. Manual mode uses six-frame ORF analysis from raw DNA/RNA.
          </p>
        </section>
      </div>
    </>
  );
};

export default BioinformaticToolbox;
