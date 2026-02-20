import { FormEvent, useCallback, useMemo, useState } from 'react';
import ProteinViewer3D from '@components/bio/ProteinViewer3D/ProteinViewer3D';
import { predictProteinStructure } from '@services/bioinformaticsApi';
import {
  buildMaturePeptideReport,
  buildTimestamp,
  createSequenceAnalysis,
  downloadFile,
  extractPlddtStatsFromPdb,
  generateReadingFrames,
  validateProteinSequence,
  ESMFOLD_MIN_SEQUENCE_LENGTH
} from '@utils/bioinformatics';
import { useWorkflowHistory, type HistoryEntry } from '../hooks/useWorkflowHistory';
import HistoryPanel from './HistoryPanel';
import type { ManualPipelineData, ProteinCandidate, StageStatus } from '../types';
import { CANDIDATE_SOURCE_LABEL } from '../types';
import { buildManualOrfCandidates, stageClass } from '../helpers';
import styles from '../BioinformaticToolbox.module.css';

function buildManualReport(
  pipeline: ManualPipelineData,
  selectedCandidate: ProteinCandidate | null,
  plddt: ReturnType<typeof extractPlddtStatsFromPdb> | null
): string {
  const lines: string[] = [
    '=== Sequence to Protein Report ===',
    `Generated: ${buildTimestamp()}`,
    '',
    '--- Source ---',
    `Input Type: ${pipeline.nucleotideType}`,
    `Nucleotide Length: ${pipeline.nucleotideSequence.length} nt`,
    `ORF Candidates Found: ${pipeline.candidates.length}`,
    '',
    '--- Selected Protein ---',
    `Label: ${selectedCandidate?.label ?? 'N/A'}`,
    `Length: ${selectedCandidate?.length ?? 0} aa`,
    '',
    '--- Sequences ---',
    'Input Sequence:',
    pipeline.nucleotideSequence,
    '',
    'Protein:',
    pipeline.selectedProtein,
    ''
  ];

  if (plddt) {
    lines.push(
      '--- ESMFold Confidence (pLDDT) ---',
      `Mean: ${plddt.mean.toFixed(1)}`,
      `Min: ${plddt.min.toFixed(1)}`,
      `Max: ${plddt.max.toFixed(1)}`,
      `Residues: ${plddt.residueCount}`,
      `>=90: ${plddt.veryHigh} | 70-89: ${plddt.confident} | 50-69: ${plddt.low} | <50: ${plddt.veryLow}`,
      ''
    );
  }

  if (pipeline.predictedPdb) {
    lines.push('--- PDB Structure ---', pipeline.predictedPdb);
  }

  return lines.join('\n');
}

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
  const { history, addEntry, removeEntry, clearHistory } = useWorkflowHistory('manual');

  const isBusy = isWorkflowRunning;

  const runPrediction = async (proteinSequence: string) => {
    setStages((prev) => ({ ...prev, prediction: 'running' }));
    try {
      const validatedProtein = validateProteinSequence(proteinSequence, ESMFOLD_MIN_SEQUENCE_LENGTH);
      const predictedPdb = await predictProteinStructure(validatedProtein);
      setPipeline((prev) => prev ? {
        ...prev,
        predictedPdb,
        structureSource: 'esmfold',
        structureSourceLabel: 'ESMFold prediction (ORF candidate)'
      } : prev);
      setStages((prev) => ({ ...prev, prediction: 'done' }));
    } catch (predictionError) {
      const message = predictionError instanceof Error ? predictionError.message : 'Prediction failed.';
      setError(message);
      setStages((prev) => ({ ...prev, prediction: 'failed' }));
    }
  };

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

      if (selected) {
        await runPrediction(selected.sequence);
        const seqPreview = analysis.sequence.slice(0, 30) + (analysis.sequence.length > 30 ? '...' : '');
        addEntry(
          seqPreview,
          `${candidates.length} ORF(s), ${selected.label}`,
          { sequence: analysis.sequence, cutoff: proteinCutoff }
        );
      }
    } catch (workflowError) {
      const message = workflowError instanceof Error ? workflowError.message : 'Workflow failed.';
      setError(message);
      setStages((prev) => {
        if (prev.source === 'running') {
          return { source: 'failed', translation: 'idle', prediction: 'idle' };
        }
        return prev;
      });
    } finally {
      setIsWorkflowRunning(false);
    }
  };

  const selectProteinCandidate = async (candidate: ProteinCandidate) => {
    if (!pipeline || isBusy) {
      return;
    }

    setError(null);
    setIsWorkflowRunning(true);

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

    await runPrediction(candidate.sequence);
    setIsWorkflowRunning(false);
  };

  const selectMatureFragment = async (fragmentSequence: string, fragmentIndex: number) => {
    if (!pipeline || isBusy) {
      return;
    }

    setError(null);
    setIsWorkflowRunning(true);

    setPipeline({
      ...pipeline,
      selectedProtein: fragmentSequence,
      selectedMatureFragmentIndex: fragmentIndex,
      predictedPdb: null,
      structureSource: null,
      structureSourceLabel: null
    });

    await runPrediction(fragmentSequence);
    setIsWorkflowRunning(false);
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

  const predictedPlddt = useMemo(() => {
    if (!pipeline?.predictedPdb || pipeline.structureSource !== 'esmfold') {
      return null;
    }
    return extractPlddtStatsFromPdb(pipeline.predictedPdb);
  }, [pipeline?.predictedPdb, pipeline?.structureSource]);

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    const sequence = entry.data.sequence as string;
    const cutoff = entry.data.cutoff as number;
    if (sequence) {
      setManualNucleotideInput(sequence);
    }
    if (cutoff) {
      setProteinCutoff(cutoff);
    }
  }, []);

  const handleDownloadReport = useCallback(() => {
    if (!pipeline) return;
    const report = buildManualReport(pipeline, selectedCandidate, predictedPlddt);
    const filename = `manual_sequence_${Date.now()}.txt`;
    downloadFile(report, filename, 'text/plain');
  }, [pipeline, selectedCandidate, predictedPlddt]);

  const handleDownloadPdb = useCallback(() => {
    if (!pipeline?.predictedPdb) return;
    const filename = `manual_structure_${Date.now()}.pdb`;
    downloadFile(pipeline.predictedPdb, filename, 'chemical/x-pdb');
  }, [pipeline]);

  const predictedPreview = useMemo(() => {
    if (!pipeline?.predictedPdb) {
      return '';
    }
    return pipeline.predictedPdb.split(/\r?\n/).slice(0, 24).join('\n');
  }, [pipeline?.predictedPdb]);

  return (
    <>
      <section className={styles.statusBar}>
        <div className={`${styles.statusItem} ${stageClass(stages.source, styles)}`}>
          1. Parse
        </div>
        <div className={styles.arrow}>&rarr;</div>
        <div className={`${styles.statusItem} ${stageClass(stages.translation, styles)}`}>
          2. ORF Scan
        </div>
        <div className={styles.arrow}>&rarr;</div>
        <div className={`${styles.statusItem} ${stageClass(stages.prediction, styles)}`}>
          3. ESMFold
        </div>
      </section>

      <section className={styles.workflowCard}>
        <h2>Sequence to Protein</h2>
        <p>Enter a DNA or RNA sequence to find ORF candidates and predict their 3D structure.</p>
        <form onSubmit={runWorkflow} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="manual-sequence">DNA or RNA sequence</label>
            <textarea
              id="manual-sequence"
              value={manualNucleotideInput}
              onChange={(event) => setManualNucleotideInput(event.target.value)}
              rows={5}
              placeholder="ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG"
              required
            />
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label htmlFor="cutoff">Min ORF length (aa)</label>
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
            {isWorkflowRunning ? 'Running...' : 'Analyze & Predict'}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </section>

      {pipeline && (
        <>
          <article className={styles.workflowCard}>
            <h3>Sequence Info</h3>
            <p><strong>Type:</strong> {pipeline.nucleotideType} &middot; <strong>Length:</strong> {pipeline.nucleotideSequence.length} nt</p>
            <details className={styles.details}>
              <summary>Show sequences</summary>
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

          <article className={styles.workflowCard}>
            <h3>ORF Candidates</h3>
            {pipeline.candidates.length > 0 ? (
              <>
                <p>Select an ORF candidate to predict its structure:</p>
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

                {selectedCandidate && (
                  <div className={styles.candidateMeta}>
                    <p><strong>Selected:</strong> {selectedCandidate.label} ({selectedCandidate.length} aa)</p>
                    <p><strong>Source:</strong> {CANDIDATE_SOURCE_LABEL[selectedCandidate.source]}</p>
                  </div>
                )}

                {matureFragments.length > 0 && (
                  <>
                    <p className={styles.matureLead}>Mature fragment candidates:</p>
                    <div className={styles.chips}>
                      {matureFragments.map((fragment, index) => (
                        <button
                          key={`${index}-${fragment.start}-${fragment.end}`}
                          type="button"
                          className={pipeline.selectedMatureFragmentIndex === index ? styles.chipMatureActive : styles.chipMature}
                          onClick={() => selectMatureFragment(fragment.sequence, index)}
                          disabled={isBusy}
                        >
                          Frag {index + 1} ({fragment.length} aa)
                        </button>
                      ))}
                    </div>
                    <details className={styles.details}>
                      <summary>Show cleavage report</summary>
                      <pre className={styles.code}>{cleavageReportPreview}</pre>
                    </details>
                  </>
                )}

                <details className={styles.details}>
                  <summary>Show selected protein sequence</summary>
                  <pre className={styles.code}>{pipeline.selectedProtein}</pre>
                </details>
              </>
            ) : (
              <p>No ORF candidates found above the minimum length threshold.</p>
            )}
          </article>

          <article className={styles.workflowCard}>
            <h3>3D Structure</h3>
            {stages.prediction === 'running' && (
              <p className={styles.stageHint}>ESMFold prediction is running&hellip;</p>
            )}
            {stages.prediction === 'failed' && !pipeline.predictedPdb && (
              <p className={styles.stageHint}>Prediction failed. Try a different candidate.</p>
            )}
            {pipeline.predictedPdb && (
              <>
                {pipeline.structureSourceLabel && (
                  <p className={styles.structureSource}>
                    <strong>Source:</strong> {pipeline.structureSourceLabel}
                  </p>
                )}
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
                <ProteinViewer3D pdbData={pipeline.predictedPdb} height={420} />
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
              </>
            )}
          </article>
        </>
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

export default ManualWorkflow;
