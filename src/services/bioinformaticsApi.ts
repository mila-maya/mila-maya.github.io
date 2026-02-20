import { createSequenceAnalysis, type SequenceType } from '@utils/bioinformatics';

export interface CdsFeature {
  location: string;
  gene: string | null;
  product: string | null;
  proteinId: string | null;
  translation: string | null;
  codonStart: number | null;
  translTable: number | null;
}

export interface NcbiSearchResult {
  accession: string;
  description: string;
  sequence: string;
  sequenceType: SequenceType;
  proteinId: string | null;
  proteinSequence: string | null;
  cdsFeatures: CdsFeature[];
  rawGenBank: string;
}

export interface PdbSearchResult {
  pdbId: string;
  title: string;
  pdbText: string;
}

export interface ClosestPdbStructureResult extends PdbSearchResult {
  matchIdentifier: string;
  score: number;
}

async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs = 30000): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

function buildEsmfoldHttpError(status: number, rawBody: string): string {
  const body = rawBody.toLowerCase();

  if (status === 422) {
    return 'ESMFold rejected this amino acid sequence format. Check for unsupported residue characters.';
  }

  if (status === 400 || body.includes('at least 16') || body.includes('minimum length')) {
    return 'ESMFold requires an amino acid sequence with at least 16 residues.';
  }

  if (status === 429) {
    return 'ESMFold is rate-limiting requests right now. Please retry in a moment.';
  }

  if (status === 502 || status === 503 || status === 504) {
    return 'ESMFold is temporarily unavailable or timing out. Please retry in a moment.';
  }

  return `Protein structure generation with ESM Atlas failed (${status}).`;
}

function parseDefinition(genBankText: string): string {
  const match = genBankText.match(/DEFINITION\s+([\s\S]*?)\nACCESSION/);
  if (!match) {
    return 'No definition available';
  }

  return match[1]
    .replace(/\n\s+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseAccession(genBankText: string): string {
  const versionMatch = genBankText.match(/\nVERSION\s+(\S+)/);
  if (versionMatch?.[1]) {
    return versionMatch[1];
  }

  const accessionMatch = genBankText.match(/\nACCESSION\s+(\S+)/);
  return accessionMatch?.[1] ?? 'Unknown accession';
}

function parseNucleotideSequence(genBankText: string): string {
  const originMatch = genBankText.match(/\nORIGIN([\s\S]*?)\n\/\//);
  if (!originMatch?.[1]) {
    throw new Error('NCBI response did not contain ORIGIN sequence data.');
  }

  return originMatch[1].replace(/[^A-Za-z]/g, '').toUpperCase();
}

function parseProteinId(genBankText: string): string | null {
  const proteinIdMatch = genBankText.match(/\/protein_id="([^"]+)"/);
  return proteinIdMatch?.[1] ?? null;
}

function parseProteinTranslation(genBankText: string): string | null {
  const translationMatch = genBankText.match(/\/translation="([\s\S]*?)"/);
  if (!translationMatch?.[1]) {
    return null;
  }

  return translationMatch[1].replace(/\s+/g, '').toUpperCase();
}

interface FeatureEntry {
  key: string;
  content: string;
}

function parseFeatureEntries(featuresBlock: string): FeatureEntry[] {
  const lines = featuresBlock.split(/\r?\n/);
  const entries: FeatureEntry[] = [];
  let current: FeatureEntry | null = null;

  for (const line of lines) {
    const featureMatch = line.match(/^ {5}(\S+)\s+(.+)$/);
    if (featureMatch) {
      if (current) {
        entries.push(current);
      }

      current = {
        key: featureMatch[1],
        content: featureMatch[2]
      };
      continue;
    }

    if (!current) {
      continue;
    }

    if (line.trim()) {
      current.content += `\n${line}`;
    }
  }

  if (current) {
    entries.push(current);
  }

  return entries;
}

function parseFeatureLocation(content: string): string {
  const lines = content.split(/\r?\n/);
  const locationParts: string[] = [lines[0]?.trim() ?? ''];

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s{21}\//.test(line)) {
      break;
    }

    const continuationMatch = line.match(/^\s{21}(.+)$/);
    if (continuationMatch?.[1]) {
      locationParts.push(continuationMatch[1].trim());
    }
  }

  return locationParts.join('');
}

function cleanQualifierValue(name: string, rawValue: string): string {
  const withoutBoundaryQuotes = rawValue.trim().replace(/^"/, '').replace(/"$/, '');

  if (name === 'translation') {
    return withoutBoundaryQuotes.replace(/\s+/g, '').toUpperCase();
  }

  return withoutBoundaryQuotes.replace(/\s+/g, ' ').trim();
}

function parseFeatureQualifiers(content: string): Record<string, string[]> {
  const qualifiers: Record<string, string[]> = {};
  const lines = content.split(/\r?\n/);
  let currentName: string | null = null;
  let currentValue = '';

  const flushCurrent = () => {
    if (!currentName) {
      return;
    }

    const cleaned = cleanQualifierValue(currentName, currentValue);
    if (!qualifiers[currentName]) {
      qualifiers[currentName] = [];
    }
    qualifiers[currentName].push(cleaned);
    currentName = null;
    currentValue = '';
  };

  for (const line of lines) {
    const qualifierStart = line.match(/^\s{21}\/([A-Za-z0-9_]+)(?:=(.*))?$/);
    if (qualifierStart) {
      flushCurrent();
      currentName = qualifierStart[1];
      currentValue = qualifierStart[2] ?? '';
      continue;
    }

    const continuationMatch = line.match(/^\s{21}(?!\/)(.*)$/);
    if (currentName && continuationMatch) {
      currentValue += ` ${continuationMatch[1].trim()}`;
    }
  }

  flushCurrent();

  return qualifiers;
}

function parseIntOrNull(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCdsFeatures(genBankText: string): CdsFeature[] {
  const featuresMatch = genBankText.match(/\nFEATURES\s+Location\/Qualifiers([\s\S]*?)\nORIGIN/);
  if (!featuresMatch?.[1]) {
    return [];
  }

  const entries = parseFeatureEntries(featuresMatch[1]);
  const cdsEntries = entries.filter((entry) => entry.key === 'CDS');

  return cdsEntries.map((entry) => {
    const location = parseFeatureLocation(entry.content);
    const qualifiers = parseFeatureQualifiers(entry.content);

    const proteinId = qualifiers.protein_id?.[0] ?? null;
    const gene = qualifiers.gene?.[0] ?? null;
    const product = qualifiers.product?.[0] ?? null;
    const translationRaw = qualifiers.translation?.[0] ?? null;
    const translation = translationRaw
      ? translationRaw.replace(/[^A-Za-z*]/g, '').toUpperCase()
      : null;

    return {
      location,
      gene,
      product,
      proteinId,
      translation,
      codonStart: parseIntOrNull(qualifiers.codon_start?.[0] ?? null),
      translTable: parseIntOrNull(qualifiers.transl_table?.[0] ?? null)
    };
  });
}

function parsePdbTitle(pdbText: string): string {
  const titleLines = pdbText
    .split(/\r?\n/)
    .filter((line) => line.startsWith('TITLE'))
    .map((line) => line.replace(/^TITLE\s+\d*\s*/, '').trim())
    .filter(Boolean);

  if (titleLines.length === 0) {
    return 'Title unavailable';
  }

  return titleLines.join(' ');
}

export async function fetchNcbiSequence(accessionId: string): Promise<NcbiSearchResult> {
  const sequenceId = accessionId.trim();

  if (!sequenceId || sequenceId.length < 6) {
    throw new Error('Provide a valid NCBI accession number.');
  }

  const params = new URLSearchParams({
    db: 'nucleotide',
    id: sequenceId,
    rettype: 'gb',
    retmode: 'text'
  });

  const response = await fetchWithTimeout(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`NCBI request failed (${response.status}).`);
  }

  const genBankText = await response.text();
  const sequence = parseNucleotideSequence(genBankText);
  const analysis = createSequenceAnalysis(sequence);
  const cdsFeatures = parseCdsFeatures(genBankText);
  const primaryCds = cdsFeatures.find((feature) => feature.translation) ?? cdsFeatures[0] ?? null;

  return {
    accession: parseAccession(genBankText),
    description: parseDefinition(genBankText),
    sequence,
    sequenceType: analysis.type,
    proteinId: primaryCds?.proteinId ?? parseProteinId(genBankText),
    proteinSequence: primaryCds?.translation ?? parseProteinTranslation(genBankText),
    cdsFeatures,
    rawGenBank: genBankText
  };
}

export async function fetchPdbStructure(pdbIdRaw: string): Promise<PdbSearchResult> {
  const pdbId = pdbIdRaw.trim().toLowerCase();

  if (!/^[a-z0-9]{4}$/.test(pdbId)) {
    throw new Error('Provide a 4-character alphanumeric PDB ID.');
  }

  const response = await fetchWithTimeout(`https://files.rcsb.org/download/${pdbId}.pdb`);

  if (!response.ok) {
    throw new Error('Provided protein ID was not found in the PDB database.');
  }

  const pdbText = await response.text();

  return {
    pdbId,
    title: parsePdbTitle(pdbText),
    pdbText
  };
}

export async function predictProteinStructure(aminoAcidSequence: string): Promise<string> {
  let response: Response;

  try {
    response = await fetchWithTimeout('https://api.esmatlas.com/foldSequence/v1/pdb/', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: aminoAcidSequence
    }, 90000);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('ESMFold request timed out. Please retry in a moment.');
    }

    if (error instanceof TypeError) {
      const offlineHint = typeof navigator !== 'undefined' && !navigator.onLine
        ? ' Your device appears to be offline.'
        : '';
      throw new Error(
        `Prediction request could not be completed from the browser (network/CORS).${offlineHint} Please retry in a moment.`
      );
    }

    throw error;
  }

  if (!response.ok) {
    const rawBody = await response.text().catch(() => '');
    throw new Error(buildEsmfoldHttpError(response.status, rawBody));
  }

  return response.text();
}

interface RcsbSequenceSearchResultItem {
  identifier: string;
  score: number;
}

interface RcsbSequenceSearchResponse {
  result_set?: RcsbSequenceSearchResultItem[];
}

export async function findClosestPdbStructureBySequence(aminoAcidSequence: string): Promise<ClosestPdbStructureResult> {
  const sequence = aminoAcidSequence.trim().toUpperCase();

  if (!sequence) {
    throw new Error('Provide an amino acid sequence for RCSB fallback lookup.');
  }

  const payload = {
    query: {
      type: 'terminal',
      service: 'sequence',
      parameters: {
        evalue_cutoff: 1,
        identity_cutoff: 0.3,
        target: 'pdb_protein_sequence',
        value: sequence
      }
    },
    return_type: 'polymer_entity',
    request_options: {
      scoring_strategy: 'sequence',
      paginate: {
        start: 0,
        rows: 1
      }
    }
  };

  const response = await fetchWithTimeout('https://search.rcsb.org/rcsbsearch/v2/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`RCSB sequence search failed (${response.status}).`);
  }

  const searchResult = await response.json() as RcsbSequenceSearchResponse;
  const topMatch = searchResult.result_set?.[0];

  if (!topMatch?.identifier) {
    throw new Error('No close structure match found in RCSB for this sequence.');
  }

  const [pdbIdToken] = topMatch.identifier.split('_');
  const pdbId = (pdbIdToken ?? '').toLowerCase();

  if (!/^[a-z0-9]{4}$/.test(pdbId)) {
    throw new Error('RCSB returned an invalid PDB identifier for the closest match.');
  }

  const structure = await fetchPdbStructure(pdbId);

  return {
    ...structure,
    matchIdentifier: topMatch.identifier,
    score: topMatch.score
  };
}
