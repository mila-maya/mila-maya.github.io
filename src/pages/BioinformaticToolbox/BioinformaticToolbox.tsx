import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@components/common/SEO/SEO';
import { pageMeta } from '@/config/routeMeta';
import { siteConfig } from '@/config/site';
import { projects } from '@/data/projects';
import type { SourceMode } from './types';
import { toolboxWorkflows } from '@/data/toolboxWorkflows';
import { countWordCapitalised } from '@/utils/counting';
import NcbiWorkflow from './components/NcbiWorkflow';
import ManualWorkflow from './components/ManualWorkflow';
import AaWorkflow from './components/AaWorkflow';
import PdbSearch from './components/PdbSearch';
import styles from './BioinformaticToolbox.module.css';


// Provenance lives with the project data, not in this component.
const toolboxHistory = projects.find((p) => p.slug === 'bioinformatic-toolbox')?.provenance;

const BioinformaticToolbox = () => {
  const [sourceMode, setSourceMode] = useState<SourceMode>('ncbi');

  return (
    <>
      <SEO {...pageMeta.bioinformaticToolbox} />

      <div className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.kicker}>Bioinformatic Toolbox</p>
          <h1 className={styles.title}>DNA &rarr; RNA &rarr; Protein &rarr; 3D Structure</h1>
          <p className={styles.subtitle}>
            {countWordCapitalised(toolboxWorkflows.length)} practical workflows for protein analysis, from
            sequence retrieval to structure prediction.
          </p>
          <div className={styles.heroActions}>
            <Link to={siteConfig.exploreUrl} className={styles.backLink}>
              &larr; Back to Explore
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

          {toolboxHistory?.history && toolboxHistory.history.length > 0 && (
            <section className={styles.origin}>
              <p className={`label ${styles.originLabel}`}>Where this comes from</p>
              <ol className={styles.originList}>
                {toolboxHistory.history.map((stage) => (
                  <li key={stage.year} className={styles.originStage}>
                    <span className={styles.originYear}>{stage.year}</span>
                    <span>{stage.what}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </header>

        <nav className={styles.tabBar} role="tablist">
          {toolboxWorkflows.map((tab) => (
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

