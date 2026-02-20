import { FormEvent, useMemo, useState } from 'react';
import { fetchNcbiSequence } from '@services/bioinformaticsApi';
import { createSequenceAnalysis } from '@utils/bioinformatics';
import type { NcbiPipelineData, ProteinCandidate, StageStatus } from '../types';
import { CANDIDATE_SOURCE_LABEL } from '../types';
import { buildNcbiAnnotatedCandidates, stageClass } from '../helpers';
import PredictionPanel from './PredictionPanel';
import styles from '../BioinformaticToolbox.module.css';

interface NcbiStages {
  source: StageStatus;
  prediction: StageStatus;
}

const NcbiWorkflow = () => {
  const [accessionInput, setAccessionInput] = useState('M57671.1');
  const [stages, setStages] = useState<NcbiStages>({ source: 'idle', prediction: 'idle' });
  const [pipeline, setPipeline] = useState<NcbiPipelineData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);

  const isBusy = isWorkflowRunning;

  const runWorkflow = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsWorkflowRunning(true);
    setPipeline(null);

    try {
      setStages({ source: 'running', prediction: 'idle' });

      const ncbi = await fetchNcbiSequence(accessionInput);
      const analysis = createSequenceAnalysis(ncbi.sequence);
      const rnaSequence = analysis.type === 'DNA'
        ? analysis.sequence.replace(/T/g, 'U')
        : analysis.sequence;
      const candidates = buildNcbiAnnotatedCandidates(ncbi);

      if (candidates.length === 0) {
        throw new Error('No annotated protein translation found in this NCBI record. Use manual workflow for ORF analysis.');
      }

      const selected = candidates[0];

      setPipeline({
        sourceLabel: `NCBI ${ncbi.accession}`,
        nucleotideType: analysis.type,
        nucleotideSequence: analysis.sequence,
        rnaSequence,
        candidates,
        candidateBaseProtein: selected.sequence,
        selectedCandidateId: selected.id,
        selectedProtein: selected.sequence,
        predictedPdb: null,
        structureSource: null,
        structureSourceLabel: null,
        ncbi
      });

      setStages({ source: 'done', prediction: 'idle' });
    } catch (workflowError) {
      const message = workflowError instanceof Error ? workflowError.message : 'Workflow failed.';
      setError(message);
      setStages({ source: 'failed', prediction: 'idle' });
    } finally {
      setIsWorkflowRunning(false);
    }
  };

  const selectProteinCandidate = (candidate: ProteinCandidate) => {
    if (!pipeline) {
      return;
    }

    setError(null);
    setStages((prev) => ({ ...prev, prediction: 'idle' }));
    setPipeline({
      ...pipeline,
      candidateBaseProtein: candidate.sequence,
      selectedCandidateId: candidate.id,
      selectedProtein: candidate.sequence,
      predictedPdb: null,
      structureSource: null,
      structureSourceLabel: null
    });
  };

  const selectedCandidate = useMemo(() => {
    if (!pipeline?.selectedCandidateId) {
      return null;
    }
    return pipeline.candidates.find((c) => c.id === pipeline.selectedCandidateId) ?? null;
  }, [pipeline]);

  const predictionKey = pipeline?.selectedCandidateId ?? 'none';

  return (
    <>
      <section className={styles.statusBar}>
        <div className={`${styles.statusItem} ${stageClass(stages.source, styles)}`}>
          1. NCBI Extract
        </div>
        <div className={styles.arrow}>to</div>
        <div className={`${styles.statusItem} ${stageClass(stages.prediction, styles)}`}>
          2. Structure
        </div>
      </section>

      <section className={styles.workflowCard}>
        <h2>NCBI Annotation Workflow</h2>
        <form onSubmit={runWorkflow} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="accession">NCBI accession</label>
            <input
              id="accession"
              type="text"
              value={accessionInput}
              onChange={(event) => setAccessionInput(event.target.value)}
              placeholder="M57671.1"
              required
            />
          </div>
          <button type="submit" className={styles.runButton} disabled={isBusy}>
            {isWorkflowRunning ? 'Running workflow...' : 'Run NCBI Workflow'}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </section>

      {pipeline && (
        <section className={styles.resultsGrid}>
          <article className={styles.panel}>
            <h3>NCBI Extract: DNA/RNA/Protein</h3>
            <p>
              <strong>Source:</strong>{' '}
              <a
                href={`https://www.ncbi.nlm.nih.gov/nuccore/${pipeline.ncbi.accession}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {pipeline.ncbi.accession}
              </a>
            </p>
            <p><strong>Detected type:</strong> {pipeline.nucleotideType}</p>
            <p><strong>Length:</strong> {pipeline.nucleotideSequence.length} nt</p>
            <p><strong>Extraction mode:</strong> use GenBank/NCBI annotated protein directly (no ORF conversion).</p>
            {selectedCandidate?.proteinId && (
              <p>
                <strong>Protein ID:</strong>{' '}
                <a
                  href={`https://www.ncbi.nlm.nih.gov/protein/${selectedCandidate.proteinId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {selectedCandidate.proteinId}
                </a>
              </p>
            )}
            {pipeline.ncbi.description && <p><strong>Description:</strong> {pipeline.ncbi.description}</p>}

            {pipeline.candidates.length > 1 && (
              <div className={styles.chips}>
                {pipeline.candidates.slice(0, 14).map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    className={pipeline.selectedCandidateId === candidate.id ? styles.chipActive : styles.chip}
                    onClick={() => selectProteinCandidate(candidate)}
                    disabled={isBusy}
                  >
                    {candidate.label} ({candidate.length} aa)
                  </button>
                ))}
              </div>
            )}

            {selectedCandidate && (
              <div className={styles.candidateMeta}>
                <p><strong>Protein selected for prediction:</strong> {selectedCandidate.label} ({selectedCandidate.length} aa)</p>
                <p><strong>Source:</strong> {CANDIDATE_SOURCE_LABEL[selectedCandidate.source]}</p>
                {selectedCandidate.gene && <p><strong>Gene:</strong> {selectedCandidate.gene}</p>}
                {selectedCandidate.product && <p><strong>Product:</strong> {selectedCandidate.product}</p>}
                {selectedCandidate.cdsLocation && <p><strong>CDS location:</strong> {selectedCandidate.cdsLocation}</p>}
              </div>
            )}
            <details className={styles.details}>
              <summary>Show NCBI sequence outputs</summary>
              <p><strong>DNA/RNA:</strong></p>
              <pre className={styles.code}>{pipeline.nucleotideSequence}</pre>
              <p><strong>RNA:</strong></p>
              <pre className={styles.code}>{pipeline.rnaSequence}</pre>
              <p><strong>Protein used for structure prediction:</strong></p>
              <pre className={styles.code}>{pipeline.selectedProtein}</pre>
            </details>
          </article>

          <PredictionPanel
            key={predictionKey}
            selectedProtein={pipeline.selectedProtein}
            predictedPdb={pipeline.predictedPdb}
            structureSource={pipeline.structureSource}
            structureSourceLabel={pipeline.structureSourceLabel}
            predictionStatus={stages.prediction}
            isBusy={isBusy}
            selectedLabel="Use NCBI protein"
            runningHint="ESMFold prediction is running for the extracted NCBI protein."
            idleHint="Run ESMFold on the extracted NCBI protein to generate the 3D structure."
            failedHint="ESMFold prediction failed for the extracted NCBI protein. Retry from this step."
            sourceLabel="ESMFold prediction (NCBI annotated protein)"
            panelTitle="Predict Structure (ESMFold)"
            panelClassName={styles.panel}
            onPredictionStart={() => {
              setStages((prev) => ({ ...prev, prediction: 'running' }));
              setPipeline((prev) => prev ? {
                ...prev,
                predictedPdb: null,
                structureSource: null,
                structureSourceLabel: null
              } : prev);
            }}
            onPredictionComplete={(pdb, label) => {
              setPipeline((prev) => prev ? {
                ...prev,
                predictedPdb: pdb,
                structureSource: 'esmfold',
                structureSourceLabel: label
              } : prev);
              setStages((prev) => ({ ...prev, prediction: 'done' }));
            }}
            onPredictionFail={() => {
              setStages((prev) => ({ ...prev, prediction: 'failed' }));
            }}
          />
        </section>
      )}
    </>
  );
};

export default NcbiWorkflow;
