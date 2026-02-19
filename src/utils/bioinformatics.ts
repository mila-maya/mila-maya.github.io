export type SequenceType = 'DNA' | 'RNA';
export const ESMFOLD_MIN_SEQUENCE_LENGTH = 16;

const DNA_NUCLEOTIDES = new Set(['A', 'T', 'C', 'G']);
const RNA_NUCLEOTIDES = new Set(['A', 'U', 'C', 'G']);

export const CODON_DNA: Record<string, string> = {
  GCT: 'A', GCC: 'A', GCA: 'A', GCG: 'A',
  TGT: 'C', TGC: 'C',
  GAT: 'D', GAC: 'D',
  GAA: 'E', GAG: 'E',
  TTT: 'F', TTC: 'F',
  GGT: 'G', GGC: 'G', GGA: 'G', GGG: 'G',
  CAT: 'H', CAC: 'H',
  ATA: 'I', ATT: 'I', ATC: 'I',
  AAA: 'K', AAG: 'K',
  TTA: 'L', TTG: 'L', CTT: 'L', CTC: 'L', CTA: 'L', CTG: 'L',
  ATG: 'M',
  AAT: 'N', AAC: 'N',
  CCT: 'P', CCC: 'P', CCA: 'P', CCG: 'P',
  CAA: 'Q', CAG: 'Q',
  CGT: 'R', CGC: 'R', CGA: 'R', CGG: 'R', AGA: 'R', AGG: 'R',
  TCT: 'S', TCC: 'S', TCA: 'S', TCG: 'S', AGT: 'S', AGC: 'S',
  ACT: 'T', ACC: 'T', ACA: 'T', ACG: 'T',
  GTT: 'V', GTC: 'V', GTA: 'V', GTG: 'V',
  TGG: 'W',
  TAT: 'Y', TAC: 'Y',
  TAA: '*', TAG: '*', TGA: '*'
};

export const CODON_RNA: Record<string, string> = {
  GCU: 'A', GCC: 'A', GCA: 'A', GCG: 'A',
  UGU: 'C', UGC: 'C',
  GAU: 'D', GAC: 'D',
  GAA: 'E', GAG: 'E',
  UUU: 'F', UUC: 'F',
  GGU: 'G', GGC: 'G', GGA: 'G', GGG: 'G',
  CAU: 'H', CAC: 'H',
  AUA: 'I', AUU: 'I', AUC: 'I',
  AAA: 'K', AAG: 'K',
  UUA: 'L', UUG: 'L', CUU: 'L', CUC: 'L', CUA: 'L', CUG: 'L',
  AUG: 'M',
  AAU: 'N', AAC: 'N',
  CCU: 'P', CCC: 'P', CCA: 'P', CCG: 'P',
  CAA: 'Q', CAG: 'Q',
  CGU: 'R', CGC: 'R', CGA: 'R', CGG: 'R', AGA: 'R', AGG: 'R',
  UCU: 'S', UCC: 'S', UCA: 'S', UCG: 'S', AGU: 'S', AGC: 'S',
  ACU: 'T', ACC: 'T', ACA: 'T', ACG: 'T',
  GUU: 'V', GUC: 'V', GUA: 'V', GUG: 'V',
  UGG: 'W',
  UAU: 'Y', UAC: 'Y',
  UAA: '*', UAG: '*', UGA: '*'
};

const VALID_PROTEIN_AMINO_ACIDS = new Set([
  'D', 'F', 'K', 'C', 'S', 'T', 'R', 'I', 'Y', 'P', 'V', 'X',
  'Z', 'J', 'L', 'W', 'Q', 'N', 'H', 'A', 'E', 'B', 'G', 'M'
]);

export interface SequenceAnalysis {
  sequence: string;
  type: SequenceType;
}

export function normalizeSequence(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase();
}

export function detectSequenceType(sequence: string): SequenceType {
  const hasT = sequence.includes('T');
  const hasU = sequence.includes('U');

  if (hasT && hasU) {
    throw new Error('Sequence cannot contain both T and U.');
  }

  return hasU ? 'RNA' : 'DNA';
}

export function validateNucleotideSequence(sequence: string, type: SequenceType): boolean {
  const allowed = type === 'RNA' ? RNA_NUCLEOTIDES : DNA_NUCLEOTIDES;
  return [...sequence].every((nucleotide) => allowed.has(nucleotide));
}

export function createSequenceAnalysis(rawSequence: string): SequenceAnalysis {
  const sequence = normalizeSequence(rawSequence);

  if (!sequence) {
    throw new Error('Please provide a nucleotide sequence.');
  }

  const type = detectSequenceType(sequence);

  if (!validateNucleotideSequence(sequence, type)) {
    throw new Error('Allowed nucleotides are A/T/C/G for DNA and A/U/C/G for RNA.');
  }

  return { sequence, type };
}

export function reverseComplement(sequence: string, type: SequenceType): string {
  const complementMap = type === 'DNA'
    ? new Map([
        ['A', 'T'],
        ['T', 'A'],
        ['C', 'G'],
        ['G', 'C']
      ])
    : new Map([
        ['A', 'U'],
        ['U', 'A'],
        ['C', 'G'],
        ['G', 'C']
      ]);

  return [...sequence]
    .reverse()
    .map((nucleotide) => complementMap.get(nucleotide) ?? nucleotide)
    .join('');
}

export function translateSequence(sequence: string, type: SequenceType, start = 0): string {
  const codonTable = type === 'RNA' ? CODON_RNA : CODON_DNA;
  const aminoAcids: string[] = [];

  for (let index = start; index <= sequence.length - 3; index += 3) {
    const codon = sequence.slice(index, index + 3);
    aminoAcids.push(codonTable[codon] ?? 'X');
  }

  return aminoAcids.join('');
}

export function generateReadingFrames(sequence: string, type: SequenceType): string[] {
  const reverse = reverseComplement(sequence, type);

  return [
    translateSequence(sequence, type, 0),
    translateSequence(sequence, type, 1),
    translateSequence(sequence, type, 2),
    translateSequence(reverse, type, 0),
    translateSequence(reverse, type, 1),
    translateSequence(reverse, type, 2)
  ];
}

export function findProteins(aminoAcidSequence: string): string[] {
  const activeProteins: string[] = [];
  const foundProteins: string[] = [];

  for (const aminoAcid of aminoAcidSequence) {
    if (aminoAcid === '*') {
      foundProteins.push(...activeProteins);
      activeProteins.length = 0;
      continue;
    }

    if (aminoAcid === 'M') {
      activeProteins.push('');
    }

    for (let index = 0; index < activeProteins.length; index += 1) {
      activeProteins[index] += aminoAcid;
    }
  }

  return foundProteins;
}

export function proteinsFromReadingFrames(frames: string[], minLength = 50): string[] {
  const proteins: string[] = [];

  for (const frame of frames) {
    for (const protein of findProteins(frame)) {
      if (protein.length > minLength) {
        proteins.push(protein);
      }
    }
  }

  return proteins.sort((a, b) => b.length - a.length);
}

export function validateProteinSequence(rawSequence: string, minLength = 1): string {
  const sequence = normalizeSequence(rawSequence);

  if (!sequence) {
    throw new Error('Please provide an amino acid sequence.');
  }

  const isValid = [...sequence].every((aminoAcid) => VALID_PROTEIN_AMINO_ACIDS.has(aminoAcid));

  if (!isValid) {
    throw new Error('Sequence contains unsupported amino acids.');
  }

  if (sequence.length < minLength) {
    throw new Error(`Sequence must be at least ${minLength} amino acids long.`);
  }

  return sequence;
}

export function buildTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

export function buildFilename(action: string, extension: 'txt' | 'pdb'): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${action}_${stamp}.${extension}`;
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(objectUrl);
}
