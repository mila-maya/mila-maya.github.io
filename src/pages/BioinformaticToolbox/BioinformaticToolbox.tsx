import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@components/common/SEO/SEO';
import ProteinViewer3D from '@components/bio/ProteinViewer3D/ProteinViewer3D';
import {
  ESMFOLD_MIN_SEQUENCE_LENGTH,
  buildMaturePeptideReport,
  createSequenceAnalysis,
  extractPlddtStatsFromPdb,
  generateReadingFrames,
  proteinsFromReadingFrames,
  validateProteinSequence,
  type SequenceType
} from '@utils/bioinformatics';
import {
  fetchNcbiSequence,
  fetchPdbStructure,
  predictProteinStructure,
  type NcbiSearchResult,
  type PdbSearchResult
} from '@services/bioinformaticsApi';
import styles from './BioinformaticToolbox.module.css';

type SourceMode = 'ncbi' | 'manual';
type StageStatus = 'idle' | 'running' | 'done' | 'failed';
type PredictionInputMode = 'selected' | 'custom';
type ProteinCandidateSource = 'cds_translation' | 'ncbi_translation' | 'orf_frame';

interface StageStates {
  source: StageStatus;
  translation: StageStatus;
  prediction: StageStatus;
}

interface ProteinCandidate {
  id: string;
  sequence: string;
  length: number;
  score: number;
  source: ProteinCandidateSource;
  label: string;
  evidence: string;
  cdsLocation: string | null;
  gene: string | null;
  product: string | null;
  proteinId: string | null;
}

interface PipelineData {
  sourceLabel: string;
  nucleotideType: SequenceType;
  nucleotideSequence: string;
  rnaSequence: string;
  readingFrames: string[];
  candidates: ProteinCandidate[];
  candidateBaseProtein: string;
  selectedCandidateId: string | null;
  selectedProtein: string;
  selectedMatureFragmentIndex: number | null;
  predictedPdb: string | null;
  structureSource: 'esmfold' | 'rcsb' | null;
  structureSourceLabel: string | null;
  ncbi: NcbiSearchResult | null;
}

const CANDIDATE_SOURCE_LABEL: Record<ProteinCandidateSource, string> = {
  cds_translation: 'GenBank CDS translation',
  ncbi_translation: 'NCBI /translation qualifier',
  orf_frame: 'Six-frame ORF scan'
};

function sanitizeProteinCandidateSequence(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase();
}

function mergeCandidates(existing: Omit<ProteinCandidate, 'id'>, incoming: Omit<ProteinCandidate, 'id'>): Omit<ProteinCandidate, 'id'> {
  const winner = incoming.score > existing.score ? incoming : existing;
  const evidenceParts = new Set([existing.evidence, incoming.evidence].filter(Boolean));

  return {
    ...winner,
    evidence: Array.from(evidenceParts).join(' | '),
    cdsLocation: winner.cdsLocation ?? existing.cdsLocation ?? incoming.cdsLocation,
    gene: winner.gene ?? existing.gene ?? incoming.gene,
    product: winner.product ?? existing.product ?? incoming.product,
    proteinId: winner.proteinId ?? existing.proteinId ?? incoming.proteinId
  };
}

function buildRankedProteinCandidates(orfProteins: string[], ncbi: NcbiSearchResult | null): ProteinCandidate[] {
  const merged = new Map<string, Omit<ProteinCandidate, 'id'>>();

  const addCandidate = (candidate: Omit<ProteinCandidate, 'id'>) => {
    const sequence = sanitizeProteinCandidateSequence(candidate.sequence);
    if (!sequence) {
      return;
    }

    const normalizedCandidate: Omit<ProteinCandidate, 'id'> = {
      ...candidate,
      sequence,
      length: sequence.length
    };

    const existing = merged.get(sequence);
    if (!existing) {
      merged.set(sequence, normalizedCandidate);
      return;
    }

    merged.set(sequence, mergeCandidates(existing, normalizedCandidate));
  };

  const cdsFeatures = ncbi?.cdsFeatures ?? [];
  cdsFeatures.forEach((cds, index) => {
    if (!cds.translation) {
      return;
    }

    const evidenceParts = [
      'Annotated CDS translation',
      cds.location ? `location=${cds.location}` : '',
      cds.product ? `product=${cds.product}` : '',
      cds.proteinId ? `protein_id=${cds.proteinId}` : '',
      cds.translTable ? `transl_table=${cds.translTable}` : ''
    ].filter(Boolean);

    addCandidate({
      sequence: cds.translation,
      length: cds.translation.length,
      score: 5000 + cds.translation.length + (cds.proteinId ? 50 : 0),
      source: 'cds_translation',
      label: cds.gene ? `CDS ${cds.gene}` : `CDS ${index + 1}`,
      evidence: evidenceParts.join('; '),
      cdsLocation: cds.location,
      gene: cds.gene,
      product: cds.product,
      proteinId: cds.proteinId
    });
  });

  if (ncbi?.proteinSequence) {
    addCandidate({
      sequence: ncbi.proteinSequence,
      length: ncbi.proteinSequence.length,
      score: 3500 + ncbi.proteinSequence.length,
      source: 'ncbi_translation',
      label: 'NCBI translation',
      evidence: 'Primary /translation qualifier from GenBank record',
      cdsLocation: null,
      gene: null,
      product: null,
      proteinId: ncbi.proteinId
    });
  }

  orfProteins.forEach((protein, index) => {
    addCandidate({
      sequence: protein,
      length: protein.length,
      score: 1000 + protein.length,
      source: 'orf_frame',
      label: `ORF ${index + 1}`,
      evidence: `Six-frame ORF candidate above cutoff (${protein.length} aa)`,
      cdsLocation: null,
      gene: null,
      product: null,
      proteinId: null
    });
  });

  const ranked = Array.from(merged.values()).sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.length - a.length;
  });

  return ranked.map((candidate, index) => ({
    ...candidate,
    id: `candidate-${index + 1}`
  }));
}

const BioinformaticToolbox = () => {
  const [sourceMode, setSourceMode] = useState<SourceMode>('ncbi');
  const [accessionInput, setAccessionInput] = useState('M57671.1');
  const [manualNucleotideInput, setManualNucleotideInput] = useState('');
  const [proteinCutoff, setProteinCutoff] = useState(50);

  const [stages, setStages] = useState<StageStates>({
    source: 'idle',
    translation: 'idle',
    prediction: 'idle'
  });

  const [pipeline, setPipeline] = useState<PipelineData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [pdbInput, setPdbInput] = useState('1a7f');
  const [pdbResult, setPdbResult] = useState<PdbSearchResult | null>(null);
  const [pdbLoading, setPdbLoading] = useState(false);
  const [pdbError, setPdbError] = useState<string | null>(null);
  const [predictionInputMode, setPredictionInputMode] = useState<PredictionInputMode>('selected');
  const [customPredictionSequence, setCustomPredictionSequence] = useState('');
  const isBusy = isWorkflowRunning || isPredicting;

  const runWorkflow = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsWorkflowRunning(true);
    setPipeline(null);

    let resolvedNcbi: NcbiSearchResult | null = null;

    try {
      setStages({ source: 'running', translation: 'idle', prediction: 'idle' });

      let nucleotideSequence: string;
      let sourceLabel: string;

      if (sourceMode === 'ncbi') {
        resolvedNcbi = await fetchNcbiSequence(accessionInput);
        nucleotideSequence = resolvedNcbi.sequence;
        sourceLabel = `NCBI ${resolvedNcbi.accession}`;
      } else {
        nucleotideSequence = manualNucleotideInput;
        sourceLabel = 'Manual sequence input';
      }

      setStages((prev) => ({ ...prev, source: 'done', translation: 'running' }));

      const analysis = createSequenceAnalysis(nucleotideSequence);
      const readingFrames = generateReadingFrames(analysis.sequence, analysis.type);
      const orfProteins = proteinsFromReadingFrames(readingFrames, proteinCutoff);
      const candidates = buildRankedProteinCandidates(orfProteins, resolvedNcbi);
      const selectedCandidate = candidates[0] ?? null;
      const selectedProtein = selectedCandidate?.sequence ?? '';
      const rnaSequence = analysis.type === 'DNA'
        ? analysis.sequence.replace(/T/g, 'U')
        : analysis.sequence;

      setPipeline({
        sourceLabel,
        nucleotideType: analysis.type,
        nucleotideSequence: analysis.sequence,
        rnaSequence,
        readingFrames,
        candidates,
        candidateBaseProtein: selectedProtein,
        selectedCandidateId: selectedCandidate?.id ?? null,
        selectedProtein,
        selectedMatureFragmentIndex: null,
        predictedPdb: null,
        structureSource: null,
        structureSourceLabel: null,
        ncbi: resolvedNcbi
      });
      setPredictionInputMode('selected');
      setStages({ source: 'done', translation: 'done', prediction: 'idle' });

      if (sourceMode === 'ncbi') {
        setManualNucleotideInput(analysis.sequence);
      }
    } catch (workflowError) {
      const message = workflowError instanceof Error ? workflowError.message : 'Workflow failed.';

      setStages((prev) => {
        if (prev.source === 'running') {
          return { source: 'failed', translation: 'idle', prediction: 'idle' };
        }

        if (prev.translation === 'running') {
          return { ...prev, translation: 'failed', prediction: 'idle' };
        }

        return prev;
      });

      setError(message);
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
    setPredictionInputMode('selected');
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
    setPredictionInputMode('selected');
    setPipeline({
      ...pipeline,
      selectedProtein: fragmentSequence,
      selectedMatureFragmentIndex: fragmentIndex,
      predictedPdb: null,
      structureSource: null,
      structureSourceLabel: null
    });
  };

  const runPredictionForSelectedProtein = async () => {
    if (!pipeline) {
      return;
    }

    setError(null);
    setIsPredicting(true);

    try {
      const rawPredictionInput = predictionInputMode === 'custom'
        ? customPredictionSequence
        : pipeline.selectedProtein;
      const validatedProtein = validateProteinSequence(rawPredictionInput, ESMFOLD_MIN_SEQUENCE_LENGTH);
      setStages((prev) => ({ ...prev, prediction: 'running' }));
      setPipeline((prev) => prev ? {
        ...prev,
        predictedPdb: null,
        structureSource: null,
        structureSourceLabel: null
      } : prev);

      const predictedPdb = await predictProteinStructure(validatedProtein);

      setPipeline((prev) => prev ? {
        ...prev,
        predictedPdb,
        structureSource: 'esmfold',
        structureSourceLabel: predictionInputMode === 'custom'
          ? 'ESMFold prediction (custom sequence input)'
          : 'ESMFold prediction (ranked candidate input)'
      } : prev);

      setStages((prev) => ({ ...prev, prediction: 'done' }));
    } catch (predictionError) {
      const message = predictionError instanceof Error ? predictionError.message : 'Prediction failed.';
      setStages((prev) => ({ ...prev, prediction: 'failed' }));
      setError(message);
    } finally {
      setIsPredicting(false);
    }
  };

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

  const selectedCandidate = useMemo(() => {
    if (!pipeline?.selectedCandidateId) {
      return null;
    }

    return pipeline.candidates.find((candidate) => candidate.id === pipeline.selectedCandidateId) ?? null;
  }, [pipeline]);

  const matureReport = useMemo(() => {
    if (!pipeline?.candidateBaseProtein) {
      return null;
    }

    return buildMaturePeptideReport(pipeline.candidateBaseProtein, 8);
  }, [pipeline?.candidateBaseProtein]);

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

  const predictedPreview = useMemo(() => {
    if (!pipeline?.predictedPdb) {
      return '';
    }

    return pipeline.predictedPdb.split(/\r?\n/).slice(0, 24).join('\n');
  }, [pipeline]);

  const predictedPlddt = useMemo(() => {
    if (!pipeline?.predictedPdb || pipeline.structureSource !== 'esmfold') {
      return null;
    }

    return extractPlddtStatsFromPdb(pipeline.predictedPdb);
  }, [pipeline?.predictedPdb, pipeline?.structureSource]);

  const pdbPreview = useMemo(() => {
    if (!pdbResult) {
      return '';
    }

    return pdbResult.pdbText.split(/\r?\n/).slice(0, 24).join('\n');
  }, [pdbResult]);

  const activePredictionSequence = useMemo(() => {
    if (!pipeline) {
      return '';
    }

    return predictionInputMode === 'custom'
      ? customPredictionSequence
      : pipeline.selectedProtein;
  }, [pipeline, predictionInputMode, customPredictionSequence]);

  const normalizedPredictionLength = activePredictionSequence.replace(/\s+/g, '').length;

  const stageClass = (status: StageStatus) => {
    if (status === 'done') {
      return styles.stageDone;
    }

    if (status === 'running') {
      return styles.stageRunning;
    }

    if (status === 'failed') {
      return styles.stageFailed;
    }

    return styles.stageIdle;
  };

  return (
    <>
      <SEO
        title="Bioinformatic Toolbox"
        description="CDS-aware ranked workflow from nucleotide sequences to mature peptide candidates and ESMFold 3D structures."
      />

      <div className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.kicker}>One Connected Workflow</p>
          <h1 className={styles.title}>DNA to RNA to Protein to 3D Structure</h1>
          <p className={styles.subtitle}>
            CDS-aware candidate ranking, mature peptide cleavage reporting, and ESMFold confidence analysis.
          </p>
          <Link to="/projects" className={styles.backLink}>
            Back to Projects
          </Link>
        </header>

        <section className={styles.statusBar}>
          <div className={`${styles.statusItem} ${stageClass(stages.source)}`}>
            1. Source
          </div>
          <div className={styles.arrow}>to</div>
          <div className={`${styles.statusItem} ${stageClass(stages.translation)}`}>
            2. Translation
          </div>
          <div className={styles.arrow}>to</div>
          <div className={`${styles.statusItem} ${stageClass(stages.prediction)}`}>
            3. Structure
          </div>
        </section>

        <section className={styles.workflowCard}>
          <h2>Run Workflow</h2>
          <form onSubmit={runWorkflow} className={styles.form}>
            <div className={styles.sourceToggle}>
              <button
                type="button"
                className={sourceMode === 'ncbi' ? styles.activeSource : styles.inactiveSource}
                onClick={() => setSourceMode('ncbi')}
                disabled={isBusy}
              >
                Start from NCBI accession
              </button>
              <button
                type="button"
                className={sourceMode === 'manual' ? styles.activeSource : styles.inactiveSource}
                onClick={() => setSourceMode('manual')}
                disabled={isBusy}
              >
                Start from manual sequence
              </button>
            </div>

            {sourceMode === 'ncbi' ? (
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
            ) : (
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
            )}

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
              {isWorkflowRunning ? 'Running source + translation...' : 'Run Workflow'}
            </button>
          </form>

          {error && <p className={styles.error}>{error}</p>}
        </section>

        {pipeline && (
          <section className={styles.resultsGrid}>
            <article className={styles.panel}>
              <h3>Stage 1 Output: Nucleotide Context</h3>
              <p>
                <strong>Source:</strong>{' '}
                {pipeline.ncbi ? (
                  <a
                    href={`https://www.ncbi.nlm.nih.gov/nuccore/${pipeline.ncbi.accession}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {pipeline.ncbi.accession}
                  </a>
                ) : (
                  pipeline.sourceLabel
                )}
              </p>
              <p><strong>Detected type:</strong> {pipeline.nucleotideType}</p>
              <p><strong>Length:</strong> {pipeline.nucleotideSequence.length} nt</p>
              {pipeline.ncbi?.proteinId && (
                <p>
                  <strong>Protein ID:</strong>{' '}
                  <a
                    href={`https://www.ncbi.nlm.nih.gov/protein/${pipeline.ncbi.proteinId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {pipeline.ncbi.proteinId}
                  </a>
                </p>
              )}
              {pipeline.ncbi?.description && <p><strong>Description:</strong> {pipeline.ncbi.description}</p>}
              <details className={styles.details}>
                <summary>Show sequence outputs</summary>
                <p><strong>DNA/RNA:</strong></p>
                <pre className={styles.code}>{pipeline.nucleotideSequence}</pre>
                <p><strong>RNA:</strong></p>
                <pre className={styles.code}>{pipeline.rnaSequence}</pre>
              </details>
            </article>

            <article className={styles.panel}>
              <h3>Stage 2 Output: Ranked Protein Candidates</h3>
              <p>
                {pipeline.candidates.length > 0
                  ? 'Candidates are ranked by CDS evidence first, then ORF evidence.'
                  : 'No candidates found from CDS annotations or ORF scan.'}
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
                    Mature fragment candidates from selected precursor (dibasic cleavage)
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

            <article className={styles.panelWide}>
              <h3>Stage 3 Output: Predicted 3D Structure</h3>
              <div className={styles.predictionInputCard}>
                <p><strong>Prediction Input</strong></p>
                <div className={styles.sourceToggle}>
                  <button
                    type="button"
                    className={predictionInputMode === 'selected' ? styles.activeSource : styles.inactiveSource}
                    onClick={() => setPredictionInputMode('selected')}
                    disabled={isBusy}
                  >
                    Use selected candidate
                  </button>
                  <button
                    type="button"
                    className={predictionInputMode === 'custom' ? styles.activeSource : styles.inactiveSource}
                    onClick={() => setPredictionInputMode('custom')}
                    disabled={isBusy}
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
                      disabled={isBusy}
                    />
                  </div>
                )}
                <p>
                  Prediction input length: <strong>{normalizedPredictionLength} aa</strong>
                </p>
              </div>
              {pipeline.structureSourceLabel && (
                <p className={styles.structureSource}>
                  <strong>Structure source:</strong> {pipeline.structureSourceLabel}
                </p>
              )}
              {pipeline.predictedPdb ? (
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
                  <ProteinViewer3D pdbData={pipeline.predictedPdb} height={380} />
                  <details className={styles.details}>
                    <summary>Show PDB preview</summary>
                    <pre className={styles.code}>{predictedPreview}</pre>
                  </details>
                </>
              ) : (
                <>
                  {stages.prediction === 'running' && (
                    <p className={styles.stageHint}>
                      ESMFold prediction is running for the selected protein.
                    </p>
                  )}
                  {stages.prediction === 'idle' && (
                    <p className={styles.stageHint}>
                      Run ESMFold on the selected protein to generate the 3D structure.
                    </p>
                  )}
                  {stages.prediction === 'failed' && (
                    <>
                      <p className={styles.stageHint}>
                        ESMFold prediction failed for the selected protein. Retry from this step.
                      </p>
                      {error && <p className={styles.error}>{error}</p>}
                    </>
                  )}
                  <button
                    type="button"
                    className={styles.runButton}
                    onClick={runPredictionForSelectedProtein}
                    disabled={isBusy || !activePredictionSequence.trim()}
                  >
                    {isPredicting ? 'Predicting with ESMFold...' : 'Predict with ESMFold'}
                  </button>
                </>
              )}
            </article>
          </section>
        )}

        <section className={styles.workflowCard}>
          <h3>PDB Database Search</h3>
          <p>Search an existing PDB structure by ID and visualize it here.</p>
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

          {pdbResult && (
            <>
              <p><strong>PDB ID:</strong> {pdbResult.pdbId}</p>
              <p><strong>Title:</strong> {pdbResult.title}</p>
              <a
                href={`https://www.rcsb.org/structure/${pdbResult.pdbId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in RCSB
              </a>
              <ProteinViewer3D pdbData={pdbResult.pdbText} height={380} />
              <details className={styles.details}>
                <summary>Show PDB preview</summary>
                <pre className={styles.code}>{pdbPreview}</pre>
              </details>
            </>
          )}
        </section>

        <section className={styles.note}>
          <h3>Pipeline Logic</h3>
          <p>
            1) Source sequence is resolved (NCBI or manual), 2) CDS-aware and ORF-based candidate ranking,
            3) mature cleavage report and fragment selection, 4) ESMFold prediction with pLDDT confidence summary.
          </p>
        </section>
      </div>
    </>
  );
};

export default BioinformaticToolbox;
