import { FormEvent, useCallback, useMemo, useState } from 'react';
import ProteinViewer3D from '@components/bio/ProteinViewer3D/ProteinViewer3D';
import { predictProteinStructure } from '@services/bioinformaticsApi';
import {
  buildTimestamp,
  downloadFile,
  extractPlddtStatsFromPdb,
  validateProteinSequence,
  ESMFOLD_MIN_SEQUENCE_LENGTH
} from '@utils/bioinformatics';
import { useWorkflowHistory, type HistoryEntry } from '../hooks/useWorkflowHistory';
import HistoryPanel from './HistoryPanel';
import type { StageStatus } from '../types';
import { stageClass } from '../helpers';
import styles from '../BioinformaticToolbox.module.css';

interface AaStages {
  prediction: StageStatus;
}

const AaWorkflow = () => {
  const [aaInput, setAaInput] = useState('');
  const [stages, setStages] = useState<AaStages>({ prediction: 'idle' });
  const [predictedPdb, setPredictedPdb] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { history, addEntry, removeEntry, clearHistory } = useWorkflowHistory('aa');

  const runPrediction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsRunning(true);
    setPredictedPdb(null);
    setStages({ prediction: 'running' });

    try {
      const validatedProtein = validateProteinSequence(aaInput, ESMFOLD_MIN_SEQUENCE_LENGTH);
      const pdb = await predictProteinStructure(validatedProtein);
      setPredictedPdb(pdb);
      setStages({ prediction: 'done' });

      const seqPreview = validatedProtein.slice(0, 30) + (validatedProtein.length > 30 ? '...' : '');
      addEntry(seqPreview, `${validatedProtein.length} aa`, { sequence: validatedProtein, predictedPdb: pdb });
    } catch (predictionError) {
      const message = predictionError instanceof Error ? predictionError.message : 'Prediction failed.';
      setError(message);
      setStages({ prediction: 'failed' });
    } finally {
      setIsRunning(false);
    }
  };

  const predictedPlddt = useMemo(() => {
    if (!predictedPdb) {
      return null;
    }
    return extractPlddtStatsFromPdb(predictedPdb);
  }, [predictedPdb]);

  const predictedPreview = useMemo(() => {
    if (!predictedPdb) {
      return '';
    }
    return predictedPdb.split(/\r?\n/).slice(0, 24).join('\n');
  }, [predictedPdb]);

  const normalizedLength = aaInput.replace(/\s+/g, '').length;
  const normalizedSequence = aaInput.replace(/\s+/g, '').toUpperCase();

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    const sequence = entry.data.sequence as string;
    const savedPdb = entry.data.predictedPdb as string | undefined;
    if (sequence) {
      setAaInput(sequence);
    }
    if (savedPdb) {
      setPredictedPdb(savedPdb);
      setStages({ prediction: 'done' });
      setError(null);
    }
  }, []);

  const handleDownloadReport = useCallback(() => {
    if (!predictedPdb) return;
    const lines = [
      '=== Protein Structure Prediction Report ===',
      `Generated: ${buildTimestamp()}`,
      '',
      '--- Input ---',
      `Sequence Length: ${normalizedLength} aa`,
      '',
      '--- Sequence ---',
      normalizedSequence,
      ''
    ];

    if (predictedPlddt) {
      lines.push(
        '--- ESMFold Confidence (pLDDT) ---',
        `Mean: ${predictedPlddt.mean.toFixed(1)}`,
        `Min: ${predictedPlddt.min.toFixed(1)}`,
        `Max: ${predictedPlddt.max.toFixed(1)}`,
        `Residues: ${predictedPlddt.residueCount}`,
        `>=90: ${predictedPlddt.veryHigh} | 70-89: ${predictedPlddt.confident} | 50-69: ${predictedPlddt.low} | <50: ${predictedPlddt.veryLow}`,
        ''
      );
    }

    lines.push('--- PDB Structure ---', predictedPdb);
    downloadFile(lines.join('\n'), `aa_prediction_${Date.now()}.txt`, 'text/plain');
  }, [predictedPdb, predictedPlddt, normalizedLength, normalizedSequence]);

  const handleDownloadPdb = useCallback(() => {
    if (!predictedPdb) return;
    downloadFile(predictedPdb, `aa_structure_${Date.now()}.pdb`, 'chemical/x-pdb');
  }, [predictedPdb]);

  return (
    <>
      <section className={styles.statusBar}>
        <div className={`${styles.statusItem} ${stageClass(stages.prediction, styles)}`}>
          ESMFold Prediction
        </div>
      </section>

      <section className={styles.workflowCard}>
        <h2>Protein Structure Prediction</h2>
        <p>Enter an amino acid sequence to predict its 3D structure using ESMFold.</p>
        <form onSubmit={runPrediction} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="aa-sequence">Amino acid sequence</label>
            <textarea
              id="aa-sequence"
              value={aaInput}
              onChange={(event) => setAaInput(event.target.value)}
              rows={5}
              placeholder="MKTAYIAKQRQISFVKSHFSRQDILDLWIYHTQGYFPDWQNYTPGPGVRYPLTFGWCYKLVPVEPDKVEEANKGENLVFREVDVVLNHPVRELKFKL"
              required
            />
          </div>
          <p>Sequence length: <strong>{normalizedLength} aa</strong></p>
          <button type="submit" className={styles.runButton} disabled={isRunning}>
            {isRunning ? 'Predicting...' : 'Predict Structure'}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </section>

      {predictedPdb && (
        <article className={styles.workflowCard}>
          <h3>3D Structure</h3>
          {predictedPlddt && (
            <div className={styles.confidenceCard}>
              <p><strong>ESMFold confidence (pLDDT)</strong></p>
              <p>
                Mean: {predictedPlddt.mean.toFixed(1)} | Min: {predictedPlddt.min.toFixed(1)} | Max: {predictedPlddt.max.toFixed(1)}
              </p>
              <p>
                Residues: {predictedPlddt.residueCount} | Atoms: {predictedPlddt.atomCount}
              </p>
              <p>
                {'>=90'}: {predictedPlddt.veryHigh} | 70-89: {predictedPlddt.confident} | 50-69: {predictedPlddt.low} | {'<'}50: {predictedPlddt.veryLow}
              </p>
            </div>
          )}
          <ProteinViewer3D pdbData={predictedPdb} height={420} />
          <details className={styles.details}>
            <summary>Show PDB preview</summary>
            <pre className={styles.code}>{predictedPreview}</pre>
          </details>
          <div className={styles.downloadBar}>
            <button type="button" className={styles.secondaryButton} onClick={handleDownloadReport}>
              Download Report (.txt)
            </button>
            <button type="button" className={styles.secondaryButton} onClick={handleDownloadPdb}>
              Download Structure (.pdb)
            </button>
          </div>
        </article>
      )}

      {stages.prediction === 'running' && (
        <article className={styles.workflowCard}>
          <h3>3D Structure</h3>
          <p className={styles.stageHint}>ESMFold prediction is running&hellip;</p>
        </article>
      )}

      <HistoryPanel
        history={history}
        onSelect={handleHistorySelect}
        onRemove={removeEntry}
        onClear={clearHistory}
      />
    </>
  );
};

export default AaWorkflow;
