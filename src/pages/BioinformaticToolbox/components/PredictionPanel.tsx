import { useMemo, useState } from 'react';
import ProteinViewer3D from '@components/bio/ProteinViewer3D/ProteinViewer3D';
import {
  ESMFOLD_MIN_SEQUENCE_LENGTH,
  extractPlddtStatsFromPdb,
  validateProteinSequence
} from '@utils/bioinformatics';
import { predictProteinStructure } from '@services/bioinformaticsApi';
import type { PredictionInputMode, StageStatus } from '../types';
import styles from '../BioinformaticToolbox.module.css';

interface PredictionPanelProps {
  selectedProtein: string;
  predictedPdb: string | null;
  structureSource: 'esmfold' | 'rcsb' | null;
  structureSourceLabel: string | null;
  predictionStatus: StageStatus;
  isBusy: boolean;
  selectedLabel: string;
  runningHint: string;
  idleHint: string;
  failedHint: string;
  sourceLabel: string;
  panelTitle: string;
  panelClassName: string;
  onPredictionComplete: (pdb: string, label: string) => void;
  onPredictionStart: () => void;
  onPredictionFail: (error: string) => void;
}

const PredictionPanel = ({
  selectedProtein,
  predictedPdb,
  structureSource,
  structureSourceLabel,
  predictionStatus,
  isBusy,
  selectedLabel,
  runningHint,
  idleHint,
  failedHint,
  sourceLabel,
  panelTitle,
  panelClassName,
  onPredictionComplete,
  onPredictionStart,
  onPredictionFail
}: PredictionPanelProps) => {
  const [predictionInputMode, setPredictionInputMode] = useState<PredictionInputMode>('selected');
  const [customPredictionSequence, setCustomPredictionSequence] = useState('');
  const [isPredicting, setIsPredicting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const activePredictionSequence = useMemo(() => {
    return predictionInputMode === 'custom'
      ? customPredictionSequence
      : selectedProtein;
  }, [predictionInputMode, customPredictionSequence, selectedProtein]);

  const normalizedPredictionLength = activePredictionSequence.replace(/\s+/g, '').length;

  const predictedPreview = useMemo(() => {
    if (!predictedPdb) {
      return '';
    }
    return predictedPdb.split(/\r?\n/).slice(0, 24).join('\n');
  }, [predictedPdb]);

  const predictedPlddt = useMemo(() => {
    if (!predictedPdb || structureSource !== 'esmfold') {
      return null;
    }
    return extractPlddtStatsFromPdb(predictedPdb);
  }, [predictedPdb, structureSource]);

  const runPrediction = async () => {
    setLocalError(null);
    setIsPredicting(true);

    try {
      const rawInput = predictionInputMode === 'custom'
        ? customPredictionSequence
        : selectedProtein;
      const validatedProtein = validateProteinSequence(rawInput, ESMFOLD_MIN_SEQUENCE_LENGTH);

      onPredictionStart();

      const pdb = await predictProteinStructure(validatedProtein);
      const label = predictionInputMode === 'custom'
        ? 'ESMFold prediction (custom sequence input)'
        : sourceLabel;

      onPredictionComplete(pdb, label);
    } catch (predictionError) {
      const message = predictionError instanceof Error ? predictionError.message : 'Prediction failed.';
      setLocalError(message);
      onPredictionFail(message);
    } finally {
      setIsPredicting(false);
    }
  };

  const busy = isBusy || isPredicting;

  return (
    <article className={panelClassName}>
      <h3>{panelTitle}</h3>
      <div className={styles.predictionInputCard}>
        <p><strong>Prediction Input</strong></p>
        <div className={styles.sourceToggle}>
          <button
            type="button"
            className={predictionInputMode === 'selected' ? styles.activeSource : styles.inactiveSource}
            onClick={() => setPredictionInputMode('selected')}
            disabled={busy}
          >
            {selectedLabel}
          </button>
          <button
            type="button"
            className={predictionInputMode === 'custom' ? styles.activeSource : styles.inactiveSource}
            onClick={() => setPredictionInputMode('custom')}
            disabled={busy}
          >
            Use custom sequence
          </button>
        </div>
        {predictionInputMode === 'custom' && (
          <div className={styles.fieldGroup}>
            <label htmlFor="custom-protein-input">Custom amino acid sequence</label>
            <textarea
              id="custom-protein-input"
              value={customPredictionSequence}
              onChange={(event) => setCustomPredictionSequence(event.target.value)}
              rows={5}
              placeholder="MKTAYIAKQRQISFVKSHFSRQDILDLWIYHTQGYFP"
              disabled={busy}
            />
          </div>
        )}
        <p>
          Prediction input length: <strong>{normalizedPredictionLength} aa</strong>
        </p>
      </div>

      {structureSourceLabel && (
        <p className={styles.structureSource}>
          <strong>Structure source:</strong> {structureSourceLabel}
        </p>
      )}

      {predictedPdb ? (
        <>
          {predictedPlddt && (
            <div className={styles.confidenceCard}>
              <p><strong>ESMFold confidence (pLDDT from B-factor)</strong></p>
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
          <ProteinViewer3D pdbData={predictedPdb} height={380} />
          <details className={styles.details}>
            <summary>Show PDB preview</summary>
            <pre className={styles.code}>{predictedPreview}</pre>
          </details>
        </>
      ) : (
        <>
          {predictionStatus === 'running' && (
            <p className={styles.stageHint}>{runningHint}</p>
          )}
          {predictionStatus === 'idle' && (
            <p className={styles.stageHint}>{idleHint}</p>
          )}
          {predictionStatus === 'failed' && (
            <>
              <p className={styles.stageHint}>{failedHint}</p>
              {localError && <p className={styles.error}>{localError}</p>}
            </>
          )}
          <button
            type="button"
            className={styles.runButton}
            onClick={runPrediction}
            disabled={busy || !activePredictionSequence.trim()}
          >
            {isPredicting ? 'Predicting with ESMFold...' : 'Predict with ESMFold'}
          </button>
        </>
      )}
    </article>
  );
};

export default PredictionPanel;
