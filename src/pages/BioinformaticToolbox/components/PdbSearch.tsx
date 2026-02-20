import { FormEvent, useMemo, useState } from 'react';
import ProteinViewer3D from '@components/bio/ProteinViewer3D/ProteinViewer3D';
import { fetchPdbStructure, type PdbSearchResult } from '@services/bioinformaticsApi';
import styles from '../BioinformaticToolbox.module.css';

const PdbSearch = () => {
  const [pdbInput, setPdbInput] = useState('1a7f');
  const [pdbResult, setPdbResult] = useState<PdbSearchResult | null>(null);
  const [pdbLoading, setPdbLoading] = useState(false);
  const [pdbError, setPdbError] = useState<string | null>(null);

  const handleSearchPdb = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPdbLoading(true);
    setPdbError(null);

    try {
      const result = await fetchPdbStructure(pdbInput);
      setPdbResult(result);
    } catch (searchError) {
      const message = searchError instanceof Error ? searchError.message : 'PDB request failed.';
      setPdbError(message);
    } finally {
      setPdbLoading(false);
    }
  };

  const pdbPreview = useMemo(() => {
    if (!pdbResult) {
      return '';
    }
    return pdbResult.pdbText.split(/\r?\n/).slice(0, 24).join('\n');
  }, [pdbResult]);

  return (
    <>
      <section className={styles.workflowCard}>
        <h2>PDB Structure Lookup</h2>
        <p>Enter a 4-character PDB ID to fetch and visualize its 3D structure from RCSB.</p>
        <form onSubmit={handleSearchPdb} className={styles.form}>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label htmlFor="pdb-id">PDB ID</label>
              <input
                id="pdb-id"
                type="text"
                value={pdbInput}
                onChange={(event) => setPdbInput(event.target.value)}
                placeholder="1a7f"
                required
              />
            </div>
          </div>
          <button type="submit" className={styles.runButton} disabled={pdbLoading}>
            {pdbLoading ? 'Searching PDB...' : 'Search PDB'}
          </button>
        </form>
        {pdbError && <p className={styles.error}>{pdbError}</p>}
      </section>

      {pdbResult && (
        <>
          <article className={styles.workflowCard}>
            <h3>Structure Info</h3>
            <p>
              <strong>PDB ID:</strong> {pdbResult.pdbId.toUpperCase()} &middot;{' '}
              <a
                href={`https://www.rcsb.org/structure/${pdbResult.pdbId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in RCSB
              </a>
            </p>
            <p><strong>Title:</strong> {pdbResult.title}</p>
            {pdbResult.classification && (
              <p><strong>Classification:</strong> {pdbResult.classification}</p>
            )}
            {pdbResult.organism && (
              <p><strong>Organism:</strong> <em>{pdbResult.organism}</em></p>
            )}
            {pdbResult.experimentMethod && (
              <p><strong>Method:</strong> {pdbResult.experimentMethod}</p>
            )}
            {pdbResult.resolution && (
              <p><strong>Resolution:</strong> {pdbResult.resolution}</p>
            )}
            {(pdbResult.depositionDate || pdbResult.releaseDate) && (
              <p>
                {pdbResult.depositionDate && <><strong>Deposited:</strong> {pdbResult.depositionDate}</>}
                {pdbResult.depositionDate && pdbResult.releaseDate && ' · '}
                {pdbResult.releaseDate && <><strong>Released:</strong> {pdbResult.releaseDate}</>}
              </p>
            )}
            {pdbResult.chains.length > 0 && (
              <details className={styles.details}>
                <summary>Show amino acid sequences ({pdbResult.chains.length} chain{pdbResult.chains.length > 1 ? 's' : ''})</summary>
                {pdbResult.chains.map((chain) => (
                  <div key={chain.chainId}>
                    <p><strong>Chain {chain.chainId}:</strong> {chain.sequence.length} aa</p>
                    <pre className={styles.code}>{chain.sequence}</pre>
                  </div>
                ))}
              </details>
            )}
          </article>

          <article className={styles.workflowCard}>
            <h3>3D Viewer</h3>
            <ProteinViewer3D pdbData={pdbResult.pdbText} height={420} />
            <details className={styles.details}>
              <summary>Show PDB preview</summary>
              <pre className={styles.code}>{pdbPreview}</pre>
            </details>
          </article>
        </>
      )}
    </>
  );
};

export default PdbSearch;
