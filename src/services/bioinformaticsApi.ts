import { createSequenceAnalysis, type SequenceType } from '@utils/bioinformatics';

export interface NcbiSearchResult {
  accession: string;
  description: string;
  sequence: string;
  sequenceType: SequenceType;
  proteinId: string | null;
  proteinSequence: string | null;
  rawGenBank: string;
}

export interface PdbSearchResult {
  pdbId: string;
  title: string;
  pdbText: string;
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

  return {
    accession: parseAccession(genBankText),
    description: parseDefinition(genBankText),
    sequence,
    sequenceType: analysis.type,
    proteinId: parseProteinId(genBankText),
    proteinSequence: parseProteinTranslation(genBankText),
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
      throw new Error('ESMFold request timed out. Please retry.');
    }

    if (error instanceof TypeError) {
      throw new Error(
        'Prediction request could not be completed from the browser. Use a sequence with at least 16 amino acids and try again.'
      );
    }

    throw error;
  }

  if (!response.ok) {
    let message = `Protein structure generation with ESM Atlas failed (${response.status}).`;

    try {
      const raw = await response.text();
      if (response.status === 504 || raw.toLowerCase().includes('timed out')) {
        message = 'ESMFold timed out for this input. Use a sequence with at least 16 amino acids and retry.';
      }
    } catch {
      // Best-effort message enrichment only.
    }

    throw new Error(message);
  }

  return response.text();
}
