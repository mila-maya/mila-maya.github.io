import { FormEvent, useCallback, useMemo, useState } from 'react';
import ProteinViewer3D from '@components/bio/ProteinViewer3D/ProteinViewer3D';
import { fetchNcbiSequence, predictProteinStructure } from '@services/bioinformaticsApi';
import {
  buildTimestamp,
  createSequenceAnalysis,
  downloadFile,
  extractPlddtStatsFromPdb,
  validateProteinSequence,
  ESMFOLD_MIN_SEQUENCE_LENGTH
} from '@utils/bioinformatics';
import { useWorkflowHistory, type HistoryEntry } from '../hooks/useWorkflowHistory';
import HistoryPanel from './HistoryPanel';
import type { NcbiPipelineData, ProteinCandidate, StageStatus } from '../types';
import { CANDIDATE_SOURCE_LABEL } from '../types';
import { buildNcbiAnnotatedCandidates, stageClass } from '../helpers';
import styles from '../BioinformaticToolbox.module.css';

function buildNcbiReport(
  pipeline: NcbiPipelineData,
  selectedCandidate: ProteinCandidate | null,
  plddt: ReturnType<typeof extractPlddtStatsFromPdb> | null
): string {
  const lines: string[] = [
    '=== NCBI Search Report ===',
    `Generated: ${buildTimestamp()}`,
    '',
    '--- Source ---',
    `Accession: ${pipeline.ncbi.accession}`,
    `Description: ${pipeline.ncbi.description}`,
    `Nucleotide Type: ${pipeline.nucleotideType}`,
    `Nucleotide Length: ${pipeline.nucleotideSequence.length} nt`,
    '',
    '--- Selected Protein ---',
    `Label: ${selectedCandidate?.label ?? 'N/A'}`,
    `Length: ${selectedCandidate?.length ?? 0} aa`,
    `Gene: ${selectedCandidate?.gene ?? 'N/A'}`,
    `Product: ${selectedCandidate?.product ?? 'N/A'}`,
    `Protein ID: ${selectedCandidate?.proteinId ?? 'N/A'}`,
    '',
    '--- Sequences ---',
    'DNA/RNA:',
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
  const { history, addEntry, removeEntry, clearHistory } = useWorkflowHistory('ncbi');

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
        throw new Error('No annotated protein translation found in this NCBI record. Use the Sequence to Protein workflow for ORF analysis.');
      }

      const selected = candidates[0];

      const newPipeline: NcbiPipelineData = {
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
      };

      setPipeline(newPipeline);
      setStages({ source: 'done', prediction: 'running' });

      const validatedProtein = validateProteinSequence(selected.sequence, ESMFOLD_MIN_SEQUENCE_LENGTH);
      const predictedPdb = await predictProteinStructure(validatedProtein);

      setPipeline((prev) => prev ? {
        ...prev,
        predictedPdb,
        structureSource: 'esmfold',
        structureSourceLabel: 'ESMFold prediction (NCBI annotated protein)'
      } : prev);
      setStages({ source: 'done', prediction: 'done' });

      addEntry(
        ncbi.accession,
        `${selected.label} (${selected.length} aa)`,
        { accession: ncbi.accession }
      );
    } catch (workflowError) {
      const message = workflowError instanceof Error ? workflowError.message : 'Workflow failed.';
      setError(message);
      setStages((prev) => {
        if (prev.source === 'running') {
          return { source: 'failed', prediction: 'idle' };
        }
        return { ...prev, prediction: 'failed' };
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
      predictedPdb: null,
      structureSource: null,
      structureSourceLabel: null
    });
    setStages((prev) => ({ ...prev, prediction: 'running' }));

    try {
      const validatedProtein = validateProteinSequence(candidate.sequence, ESMFOLD_MIN_SEQUENCE_LENGTH);
      const predictedPdb = await predictProteinStructure(validatedProtein);

      setPipeline((prev) => prev ? {
        ...prev,
        predictedPdb,
        structureSource: 'esmfold',
        structureSourceLabel: 'ESMFold prediction (NCBI annotated protein)'
      } : prev);
      setStages((prev) => ({ ...prev, prediction: 'done' }));
    } catch (predictionError) {
      const message = predictionError instanceof Error ? predictionError.message : 'Prediction failed.';
      setError(message);
      setStages((prev) => ({ ...prev, prediction: 'failed' }));
    } finally {
      setIsWorkflowRunning(false);
    }
  };

  const selectedCandidate = useMemo(() => {
    if (!pipeline?.selectedCandidateId) {
      return null;
    }
    return pipeline.candidates.find((c) => c.id === pipeline.selectedCandidateId) ?? null;
  }, [pipeline]);

  const predictedPlddt = useMemo(() => {
    if (!pipeline?.predictedPdb || pipeline.structureSource !== 'esmfold') {
      return null;
    }
    return extractPlddtStatsFromPdb(pipeline.predictedPdb);
  }, [pipeline?.predictedPdb, pipeline?.structureSource]);

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    const accession = entry.data.accession as string;
    if (accession) {
      setAccessionInput(accession);
    }
  }, []);

  const handleDownloadReport = useCallback(() => {
    if (!pipeline) return;
    const report = buildNcbiReport(pipeline, selectedCandidate, predictedPlddt);
    const filename = `ncbi_${pipeline.ncbi.accession}_${Date.now()}.txt`;
    downloadFile(report, filename, 'text/plain');
  }, [pipeline, selectedCandidate, predictedPlddt]);

  const handleDownloadPdb = useCallback(() => {
    if (!pipeline?.predictedPdb) return;
    const filename = `ncbi_${pipeline.ncbi.accession}_structure.pdb`;
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
          1. NCBI Extract
        </div>
        <div className={styles.arrow}>&rarr;</div>
        <div className={`${styles.statusItem} ${stageClass(stages.prediction, styles)}`}>
          2. ESMFold Prediction
        </div>
      </section>

      <section className={styles.workflowCard}>
        <h2>NCBI Search</h2>
        <p>Enter an accession number to fetch the annotated protein and automatically predict its 3D structure.</p>
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
            {isWorkflowRunning ? 'Running...' : 'Fetch & Predict'}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </section>

      {pipeline && (
        <>
          <article className={styles.workflowCard}>
            <h3>NCBI Record</h3>
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
            <p><strong>Type:</strong> {pipeline.nucleotideType} &middot; <strong>Length:</strong> {pipeline.nucleotideSequence.length} nt</p>
            {pipeline.ncbi.description && <p><strong>Description:</strong> {pipeline.ncbi.description}</p>}
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
                <p><strong>Protein:</strong> {selectedCandidate.label} ({selectedCandidate.length} aa)</p>
                <p><strong>Source:</strong> {CANDIDATE_SOURCE_LABEL[selectedCandidate.source]}</p>
                {selectedCandidate.gene && <p><strong>Gene:</strong> {selectedCandidate.gene}</p>}
                {selectedCandidate.product && <p><strong>Product:</strong> {selectedCandidate.product}</p>}
                {selectedCandidate.cdsLocation && <p><strong>CDS location:</strong> {selectedCandidate.cdsLocation}</p>}
              </div>
            )}

            <details className={styles.details}>
              <summary>Show sequences</summary>
              <p><strong>DNA/RNA:</strong></p>
              <pre className={styles.code}>{pipeline.nucleotideSequence}</pre>
              <p><strong>RNA:</strong></p>
              <pre className={styles.code}>{pipeline.rnaSequence}</pre>
              <p><strong>Protein:</strong></p>
              <pre className={styles.code}>{pipeline.selectedProtein}</pre>
            </details>
          </article>

          <article className={styles.workflowCard}>
            <h3>3D Structure</h3>
            {stages.prediction === 'running' && (
              <p className={styles.stageHint}>ESMFold prediction is running&hellip;</p>
            )}
            {stages.prediction === 'failed' && !pipeline.predictedPdb && (
              <p className={styles.stageHint}>Prediction failed. Select a different candidate or retry.</p>
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

export default NcbiWorkflow;
