import { FormEvent, useMemo, useState } from 'react';
import {
  buildMaturePeptideReport,
  createSequenceAnalysis,
  generateReadingFrames
} from '@utils/bioinformatics';
import type { ManualPipelineData, ProteinCandidate, StageStatus } from '../types';
import { CANDIDATE_SOURCE_LABEL } from '../types';
import { buildManualOrfCandidates, stageClass } from '../helpers';
import PredictionPanel from './PredictionPanel';
import styles from '../BioinformaticToolbox.module.css';

interface ManualStages {
  source: StageStatus;
  translation: StageStatus;
  prediction: StageStatus;
}

const ManualWorkflow = () => {
  const [manualNucleotideInput, setManualNucleotideInput] = useState('');
  const [proteinCutoff, setProteinCutoff] = useState(50);
  const [stages, setStages] = useState<ManualStages>({ source: 'idle', translation: 'idle', prediction: 'idle' });
  const [pipeline, setPipeline] = useState<ManualPipelineData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);

  const isBusy = isWorkflowRunning;

  const runWorkflow = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsWorkflowRunning(true);
    setPipeline(null);

    try {
      setStages({ source: 'running', translation: 'idle', prediction: 'idle' });

      const analysis = createSequenceAnalysis(manualNucleotideInput);
      const readingFrames = generateReadingFrames(analysis.sequence, analysis.type);
      const candidates = buildManualOrfCandidates(readingFrames, proteinCutoff);
      const selected = candidates[0] ?? null;
      const rnaSequence = analysis.type === 'DNA'
        ? analysis.sequence.replace(/T/g, 'U')
        : analysis.sequence;

      setPipeline({
        sourceLabel: 'Manual sequence input',
        nucleotideType: analysis.type,
        nucleotideSequence: analysis.sequence,
        rnaSequence,
        readingFrames,
        candidates,
        candidateBaseProtein: selected?.sequence ?? '',
        selectedCandidateId: selected?.id ?? null,
        selectedProtein: selected?.sequence ?? '',
        selectedMatureFragmentIndex: null,
        predictedPdb: null,
        structureSource: null,
        structureSourceLabel: null
      });

      setStages({ source: 'done', translation: 'done', prediction: 'idle' });
    } catch (workflowError) {
      const message = workflowError instanceof Error ? workflowError.message : 'Workflow failed.';
      setError(message);
      setStages((prev) => {
        if (prev.source === 'running') {
          return { source: 'failed', translation: 'idle', prediction: 'idle' };
        }
        if (prev.translation === 'running') {
          return { ...prev, translation: 'failed', prediction: 'idle' };
        }
        return prev;
      });
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
      selectedMatureFragmentIndex: null,
      predictedPdb: null,
      structureSource: null,
      structureSourceLabel: null
    });
  };

  const selectMatureFragment = (fragmentSequence: string, fragmentIndex: number) => {
    if (!pipeline) {
      return;
    }

    setError(null);
    setStages((prev) => ({ ...prev, prediction: 'idle' }));
    setPipeline({
      ...pipeline,
      selectedProtein: fragmentSequence,
      selectedMatureFragmentIndex: fragmentIndex,
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

  const matureReport = useMemo(() => {
    if (!pipeline || !pipeline.candidateBaseProtein) {
      return null;
    }
    return buildMaturePeptideReport(pipeline.candidateBaseProtein, 8);
  }, [pipeline]);

  const matureFragments = matureReport?.fragments ?? [];

  const cleavageReportPreview = useMemo(() => {
    if (!matureReport || matureReport.fragments.length === 0) {
      return '';
    }

    const cleavageLine = matureReport.cleavageSites.length > 0
      ? matureReport.cleavageSites.map((site) => `${site.motif} [${site.start}-${site.end}]`).join(', ')
      : 'No dibasic cleavage motifs detected.';

    const fragmentLines = matureReport.fragments.map((fragment, index) => (
      `${index + 1}. ${fragment.sequence} (${fragment.start}-${fragment.end}, ${fragment.length} aa)`
    ));

    return [
      `Rule: ${matureReport.rule}`,
      `Precursor length: ${matureReport.precursorLength} aa`,
      `Cleavage sites: ${cleavageLine}`,
      '',
      'Fragment coordinates:',
      ...fragmentLines
    ].join('\n');
  }, [matureReport]);

  const predictionKey = `${pipeline?.selectedCandidateId ?? 'none'}-${pipeline?.selectedMatureFragmentIndex ?? 'base'}`;

  return (
    <>
      <section className={styles.statusBar}>
        <div className={`${styles.statusItem} ${stageClass(stages.source, styles)}`}>
          1. Source
        </div>
        <div className={styles.arrow}>to</div>
        <div className={`${styles.statusItem} ${stageClass(stages.translation, styles)}`}>
          2. Translation
        </div>
        <div className={styles.arrow}>to</div>
        <div className={`${styles.statusItem} ${stageClass(stages.prediction, styles)}`}>
          3. Structure
        </div>
      </section>

      <section className={styles.workflowCard}>
        <h2>Manual ORF Workflow</h2>
        <form onSubmit={runWorkflow} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="manual-sequence">DNA or RNA sequence</label>
            <textarea
              id="manual-sequence"
              value={manualNucleotideInput}
              onChange={(event) => setManualNucleotideInput(event.target.value)}
              rows={6}
              placeholder="ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG"
              required
            />
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label htmlFor="cutoff">ORF candidate cutoff length</label>
              <input
                id="cutoff"
                type="number"
                min={1}
                value={proteinCutoff}
                onChange={(event) => setProteinCutoff(Number(event.target.value) || 50)}
              />
            </div>
          </div>
          <button type="submit" className={styles.runButton} disabled={isBusy}>
            {isWorkflowRunning ? 'Running workflow...' : 'Run Manual Workflow'}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </section>

      {pipeline && (
        <section className={styles.resultsGrid}>
          <article className={styles.panel}>
            <h3>Stage 1 Output: Manual Sequence Context</h3>
            <p><strong>Source:</strong> {pipeline.sourceLabel}</p>
            <p><strong>Detected type:</strong> {pipeline.nucleotideType}</p>
            <p><strong>Length:</strong> {pipeline.nucleotideSequence.length} nt</p>
            <p><strong>Translation mode:</strong> six-frame ORF scan from manual sequence.</p>
            <details className={styles.details}>
              <summary>Show manual sequence outputs</summary>
              <p><strong>DNA/RNA:</strong></p>
              <pre className={styles.code}>{pipeline.nucleotideSequence}</pre>
              <p><strong>RNA:</strong></p>
              <pre className={styles.code}>{pipeline.rnaSequence}</pre>
              {pipeline.readingFrames.length > 0 && (
                <>
                  <p><strong>Six reading frames:</strong></p>
                  <pre className={styles.code}>
                    {pipeline.readingFrames.map((frame, index) => `Frame ${index + 1}: ${frame}`).join('\n')}
                  </pre>
                </>
              )}
            </details>
          </article>

          <article className={styles.panel}>
            <h3>Stage 2 Output: ORF Protein Candidates</h3>
            <p>
              {pipeline.candidates.length > 0
                ? 'Candidates are ranked from manual six-frame ORF analysis.'
                : 'No protein candidates found for this workflow.'}
            </p>

            {pipeline.candidates.length > 0 ? (
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
            ) : null}

            {selectedCandidate && (
              <div className={styles.candidateMeta}>
                <p><strong>Selected source:</strong> {CANDIDATE_SOURCE_LABEL[selectedCandidate.source]}</p>
                {selectedCandidate.gene && <p><strong>Gene:</strong> {selectedCandidate.gene}</p>}
                {selectedCandidate.product && <p><strong>Product:</strong> {selectedCandidate.product}</p>}
                {selectedCandidate.proteinId && <p><strong>Protein ID:</strong> {selectedCandidate.proteinId}</p>}
                {selectedCandidate.cdsLocation && <p><strong>CDS location:</strong> {selectedCandidate.cdsLocation}</p>}
                <p><strong>Evidence:</strong> {selectedCandidate.evidence}</p>
              </div>
            )}

            {matureFragments.length > 0 && (
              <>
                <p className={styles.matureLead}>
                  Mature fragment candidates from selected precursor
                </p>
                <div className={styles.chips}>
                  {matureFragments.map((fragment, index) => (
                    <button
                      key={`${index}-${fragment.start}-${fragment.end}`}
                      type="button"
                      className={pipeline.selectedMatureFragmentIndex === index ? styles.chipMatureActive : styles.chipMature}
                      onClick={() => selectMatureFragment(fragment.sequence, index)}
                      disabled={isBusy}
                    >
                      Frag {index + 1} ({fragment.start}-{fragment.end}, {fragment.length} aa)
                    </button>
                  ))}
                </div>
                <details className={styles.details}>
                  <summary>Show cleavage report with coordinates</summary>
                  <pre className={styles.code}>{cleavageReportPreview}</pre>
                </details>
              </>
            )}

            <p><strong>Selected protein for Stage 3:</strong></p>
            {pipeline.selectedMatureFragmentIndex !== null && (
              <p className={styles.selectionHint}>
                Using mature fragment {pipeline.selectedMatureFragmentIndex + 1} from the selected precursor.
              </p>
            )}
            <pre className={styles.code}>{pipeline.selectedProtein}</pre>
          </article>

          <PredictionPanel
            key={predictionKey}
            selectedProtein={pipeline.selectedProtein}
            predictedPdb={pipeline.predictedPdb}
            structureSource={pipeline.structureSource}
            structureSourceLabel={pipeline.structureSourceLabel}
            predictionStatus={stages.prediction}
            isBusy={isBusy}
            selectedLabel="Use selected candidate"
            runningHint="ESMFold prediction is running for the selected protein."
            idleHint="Run ESMFold on the selected protein to generate the 3D structure."
            failedHint="ESMFold prediction failed for the selected protein. Retry from this step."
            sourceLabel="ESMFold prediction (manual ORF candidate)"
            panelTitle="Stage 3 Output: Predicted 3D Structure"
            panelClassName={styles.panelWide}
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

export default ManualWorkflow;
