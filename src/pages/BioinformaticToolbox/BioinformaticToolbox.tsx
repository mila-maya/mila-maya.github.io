import { useEffect, useMemo, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@components/common/SEO/SEO';
import ProteinViewer3D from '@components/bio/ProteinViewer3D/ProteinViewer3D';
import {
  buildFilename,
  buildTimestamp,
  createSequenceAnalysis,
  downloadFile,
  ESMFOLD_MIN_SEQUENCE_LENGTH,
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

type HistoryStatus = 'success' | 'failure';

interface HistoryEntry {
  id: string;
  action: 'search_genes' | 'translate' | 'predict' | 'search_proteins';
  timestamp: string;
  status: HistoryStatus;
  detail: string;
}

interface TranslationResult {
  sequenceType: SequenceType;
  sequence: string;
  readingFrames: string[];
  proteins: string[];
  minLength: number;
}

const HISTORY_STORAGE_KEY = 'bioinformatic-toolbox-history-v1';

function readHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (entry): entry is HistoryEntry =>
        entry &&
        typeof entry.id === 'string' &&
        typeof entry.action === 'string' &&
        typeof entry.timestamp === 'string' &&
        typeof entry.status === 'string' &&
        typeof entry.detail === 'string'
    );
  } catch {
    return [];
  }
}

const BioinformaticToolbox = () => {
  const [history, setHistory] = useState<HistoryEntry[]>(() => readHistory());

  const [ncbiInput, setNcbiInput] = useState('M57671.1');
  const [ncbiResult, setNcbiResult] = useState<NcbiSearchResult | null>(null);
  const [ncbiLoading, setNcbiLoading] = useState(false);
  const [ncbiError, setNcbiError] = useState<string | null>(null);

  const [translateInput, setTranslateInput] = useState('');
  const [translateCutoff, setTranslateCutoff] = useState(50);
  const [translateResult, setTranslateResult] = useState<TranslationResult | null>(null);
  const [translateError, setTranslateError] = useState<string | null>(null);

  const [predictInput, setPredictInput] = useState('');
  const [predictResult, setPredictResult] = useState<string | null>(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);

  const [pdbInput, setPdbInput] = useState('1a7f');
  const [pdbResult, setPdbResult] = useState<PdbSearchResult | null>(null);
  const [pdbLoading, setPdbLoading] = useState(false);
  const [pdbError, setPdbError] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addHistory = (
    action: HistoryEntry['action'],
    status: HistoryStatus,
    detail: string
  ) => {
    setHistory((prev) => {
      const next: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        action,
        timestamp: buildTimestamp(),
        status,
        detail
      };
      return [next, ...prev].slice(0, 100);
    });
  };

  const handleNcbiSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNcbiLoading(true);
    setNcbiError(null);

    try {
      const result = await fetchNcbiSequence(ncbiInput);
      setNcbiResult(result);
      addHistory('search_genes', 'success', result.accession);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'NCBI request failed.';
      setNcbiError(message);
      addHistory('search_genes', 'failure', message);
    } finally {
      setNcbiLoading(false);
    }
  };

  const handleDownloadNcbi = () => {
    if (!ncbiResult) {
      return;
    }

    const report = [
      `Sequence accession: ${ncbiResult.accession}`,
      `Description: ${ncbiResult.description}`,
      `Nucleotide type: ${ncbiResult.sequenceType}`,
      `Protein ID: ${ncbiResult.proteinId ?? 'Not available'}`,
      '',
      'Nucleotide sequence:',
      ncbiResult.sequence,
      '',
      'Protein sequence:',
      ncbiResult.proteinSequence ?? 'Not available'
    ].join('\n');

    downloadFile(report, buildFilename('search_genes', 'txt'), 'text/plain');
  };

  const handleTranslate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTranslateError(null);

    try {
      const analysis = createSequenceAnalysis(translateInput);
      const readingFrames = generateReadingFrames(analysis.sequence, analysis.type);
      const proteins = proteinsFromReadingFrames(readingFrames, translateCutoff);

      const result: TranslationResult = {
        sequenceType: analysis.type,
        sequence: analysis.sequence,
        readingFrames,
        proteins,
        minLength: translateCutoff
      };

      setTranslateResult(result);
      addHistory('translate', 'success', `${proteins.length} proteins`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Translation failed.';
      setTranslateError(message);
      addHistory('translate', 'failure', message);
    }
  };

  const handleDownloadTranslation = () => {
    if (!translateResult) {
      return;
    }

    const frameLines = translateResult.readingFrames
      .map((frame, index) => `Frame ${index + 1}: ${frame}`)
      .join('\n');

    const proteinsText = translateResult.proteins.length > 0
      ? translateResult.proteins.map((protein, index) => `${index + 1}. ${protein}`).join('\n')
      : 'No proteins found with the selected length cutoff.';

    const report = [
      `Nucleotide type: ${translateResult.sequenceType}`,
      `Sequence length: ${translateResult.sequence.length}`,
      `Protein length cutoff: ${translateResult.minLength}`,
      '',
      'Input sequence:',
      translateResult.sequence,
      '',
      'Reading frames:',
      frameLines,
      '',
      'Potential proteins:',
      proteinsText
    ].join('\n');

    downloadFile(report, buildFilename('translate', 'txt'), 'text/plain');
  };

  const handlePredict = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPredictLoading(true);
    setPredictError(null);

    try {
      const sequence = validateProteinSequence(predictInput, ESMFOLD_MIN_SEQUENCE_LENGTH);
      const pdbText = await predictProteinStructure(sequence);
      setPredictResult(pdbText);
      addHistory('predict', 'success', `${sequence.length} aa`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Prediction failed.';
      setPredictError(message);
      addHistory('predict', 'failure', message);
    } finally {
      setPredictLoading(false);
    }
  };

  const handleDownloadPredicted = () => {
    if (!predictResult) {
      return;
    }

    downloadFile(predictResult, buildFilename('predict', 'pdb'), 'chemical/x-pdb');
  };

  const handleSearchPdb = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPdbLoading(true);
    setPdbError(null);

    try {
      const result = await fetchPdbStructure(pdbInput);
      setPdbResult(result);
      addHistory('search_proteins', 'success', result.pdbId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'PDB request failed.';
      setPdbError(message);
      addHistory('search_proteins', 'failure', message);
    } finally {
      setPdbLoading(false);
    }
  };

  const handleDownloadPdb = () => {
    if (!pdbResult) {
      return;
    }

    downloadFile(pdbResult.pdbText, buildFilename('search_proteins', 'pdb'), 'chemical/x-pdb');
  };

  const predictedPreview = useMemo(() => {
    if (!predictResult) {
      return '';
    }
    return predictResult.split(/\r?\n/).slice(0, 24).join('\n');
  }, [predictResult]);

  const pdbPreview = useMemo(() => {
    if (!pdbResult) {
      return '';
    }
    return pdbResult.pdbText.split(/\r?\n/).slice(0, 24).join('\n');
  }, [pdbResult]);

  return (
    <>
      <SEO
        title="Bioinformatic Toolbox"
        description="One-page React implementation of sequence search, translation, structure prediction, and PDB lookup workflows."
      />

      <div className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.kicker}>Bioinformatics in One React Page</p>
          <h1 className={styles.title}>Bioinformatic Toolbox</h1>
          <p className={styles.subtitle}>
            Client-side migration of the original Flask project: NCBI search,
            nucleotide translation, ESMFold prediction, and PDB retrieval.
          </p>
          <p className={styles.helperText}>
            Data runs directly in your browser. History is saved locally in
            localStorage instead of SQLite.
          </p>
          <Link to="/projects" className={styles.backLink}>
            Back to Projects
          </Link>
        </header>

        <section className={styles.grid}>
          <article className={styles.card}>
            <h2>1. Search NCBI</h2>
            <p className={styles.cardLead}>
              Fetch sequence metadata and translated protein data by accession ID.
            </p>
            <form onSubmit={handleNcbiSearch} className={styles.form}>
              <label htmlFor="ncbi-id">NCBI accession number</label>
              <input
                id="ncbi-id"
                type="text"
                value={ncbiInput}
                onChange={(event) => setNcbiInput(event.target.value)}
                placeholder="M57671.1"
                required
              />
              <button type="submit" disabled={ncbiLoading}>
                {ncbiLoading ? 'Searching...' : 'Search NCBI'}
              </button>
            </form>

            {ncbiError && <p className={styles.error}>{ncbiError}</p>}

            {ncbiResult && (
              <div className={styles.result}>
                <div className={styles.metaGrid}>
                  <span>Accession</span>
                  <strong>{ncbiResult.accession}</strong>
                  <span>Type</span>
                  <strong>{ncbiResult.sequenceType}</strong>
                  <span>Protein ID</span>
                  <strong>{ncbiResult.proteinId ?? 'Not available'}</strong>
                </div>
                <p className={styles.description}>{ncbiResult.description}</p>
                <button type="button" className={styles.secondaryButton} onClick={handleDownloadNcbi}>
                  Download TXT
                </button>
              </div>
            )}
          </article>

          <article className={styles.card}>
            <h2>2. Translate Nucleotide Sequence</h2>
            <p className={styles.cardLead}>
              Generate 6 reading frames and list potential proteins by length cutoff.
            </p>
            <form onSubmit={handleTranslate} className={styles.form}>
              <label htmlFor="translate-seq">DNA or RNA sequence</label>
              <textarea
                id="translate-seq"
                value={translateInput}
                onChange={(event) => setTranslateInput(event.target.value)}
                rows={6}
                placeholder="ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG"
                required
              />
              <label htmlFor="length-cutoff">Minimum protein length</label>
              <input
                id="length-cutoff"
                type="number"
                min={1}
                value={translateCutoff}
                onChange={(event) => setTranslateCutoff(Number(event.target.value) || 50)}
              />
              <button type="submit">Translate</button>
            </form>

            {translateError && <p className={styles.error}>{translateError}</p>}

            {translateResult && (
              <div className={styles.result}>
                <p>
                  <strong>Detected type:</strong> {translateResult.sequenceType}
                </p>
                <p>
                  <strong>Proteins found:</strong> {translateResult.proteins.length}
                </p>
                <div className={styles.codeBlock}>
                  <pre>{translateResult.readingFrames.map((frame, index) => `Frame ${index + 1}: ${frame}`).join('\n')}</pre>
                </div>
                <button type="button" className={styles.secondaryButton} onClick={handleDownloadTranslation}>
                  Download TXT
                </button>
              </div>
            )}
          </article>

          <article className={styles.card}>
            <h2>3. Predict with ESMFold</h2>
            <p className={styles.cardLead}>
              Submit an amino acid sequence (minimum {ESMFOLD_MIN_SEQUENCE_LENGTH} aa) and receive a predicted PDB structure.
            </p>
            <form onSubmit={handlePredict} className={styles.form}>
              <label htmlFor="predict-seq">Amino acid sequence</label>
              <textarea
                id="predict-seq"
                value={predictInput}
                onChange={(event) => setPredictInput(event.target.value)}
                rows={6}
                placeholder="MKTAYIAKQRQISFVKSHFSRQDILDLWIYHTQGYFP"
                minLength={ESMFOLD_MIN_SEQUENCE_LENGTH}
                required
              />
              <button type="submit" disabled={predictLoading}>
                {predictLoading ? 'Predicting...' : 'Predict Structure'}
              </button>
            </form>

            {predictError && <p className={styles.error}>{predictError}</p>}

            {predictResult && (
              <div className={styles.result}>
                <p>
                  <strong>PDB lines:</strong> {predictResult.split(/\r?\n/).length}
                </p>
                <div className={styles.viewerBlock}>
                  <p className={styles.viewerLabel}>3D Structure Preview</p>
                  <ProteinViewer3D pdbData={predictResult} height={320} />
                </div>
                <div className={styles.codeBlock}>
                  <pre>{predictedPreview}</pre>
                </div>
                <button type="button" className={styles.secondaryButton} onClick={handleDownloadPredicted}>
                  Download PDB
                </button>
              </div>
            )}
          </article>

          <article className={styles.card}>
            <h2>4. Search PDB</h2>
            <p className={styles.cardLead}>
              Retrieve an existing structure by PDB ID and inspect its metadata.
            </p>
            <form onSubmit={handleSearchPdb} className={styles.form}>
              <label htmlFor="pdb-id">PDB ID</label>
              <input
                id="pdb-id"
                type="text"
                value={pdbInput}
                onChange={(event) => setPdbInput(event.target.value)}
                placeholder="1a7f"
                required
              />
              <button type="submit" disabled={pdbLoading}>
                {pdbLoading ? 'Searching...' : 'Search PDB'}
              </button>
            </form>

            {pdbError && <p className={styles.error}>{pdbError}</p>}

            {pdbResult && (
              <div className={styles.result}>
                <p>
                  <strong>PDB ID:</strong> {pdbResult.pdbId}
                </p>
                <p>
                  <strong>Title:</strong> {pdbResult.title}
                </p>
                <a
                  href={`https://www.rcsb.org/structure/${pdbResult.pdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.externalLink}
                >
                  Open in RCSB
                </a>
                <div className={styles.viewerBlock}>
                  <p className={styles.viewerLabel}>3D Structure Preview</p>
                  <ProteinViewer3D pdbData={pdbResult.pdbText} height={320} />
                </div>
                <div className={styles.codeBlock}>
                  <pre>{pdbPreview}</pre>
                </div>
                <button type="button" className={styles.secondaryButton} onClick={handleDownloadPdb}>
                  Download PDB
                </button>
              </div>
            )}
          </article>
        </section>

        <section className={styles.historySection}>
          <h2>Local Request History</h2>
          <p className={styles.cardLead}>
            Equivalent to Flask request history, but stored in browser localStorage.
          </p>

          {history.length === 0 ? (
            <p className={styles.empty}>No requests yet.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.action}</td>
                      <td>{entry.timestamp}</td>
                      <td>
                        <span className={entry.status === 'success' ? styles.success : styles.failure}>
                          {entry.status}
                        </span>
                      </td>
                      <td>{entry.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default BioinformaticToolbox;
