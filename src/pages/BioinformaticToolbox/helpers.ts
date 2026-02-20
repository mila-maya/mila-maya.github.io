import { proteinsFromReadingFrames } from '@utils/bioinformatics';
import type { NcbiSearchResult } from '@services/bioinformaticsApi';
import type { ProteinCandidate, StageStatus } from './types';

export function sanitizeProteinCandidateSequence(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase();
}

function mergeCandidates(
  existing: Omit<ProteinCandidate, 'id'>,
  incoming: Omit<ProteinCandidate, 'id'>
): Omit<ProteinCandidate, 'id'> {
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

export function buildNcbiAnnotatedCandidates(ncbi: NcbiSearchResult): ProteinCandidate[] {
  const merged = new Map<string, Omit<ProteinCandidate, 'id'>>();

  const addCandidate = (candidate: Omit<ProteinCandidate, 'id'>) => {
    const sequence = sanitizeProteinCandidateSequence(candidate.sequence);
    if (!sequence) {
      return;
    }

    const normalized: Omit<ProteinCandidate, 'id'> = {
      ...candidate,
      sequence,
      length: sequence.length
    };

    const existing = merged.get(sequence);
    if (!existing) {
      merged.set(sequence, normalized);
      return;
    }

    merged.set(sequence, mergeCandidates(existing, normalized));
  };

  ncbi.cdsFeatures.forEach((cds, index) => {
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

  if (ncbi.proteinSequence) {
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

export function buildManualOrfCandidates(readingFrames: string[], minLength: number): ProteinCandidate[] {
  const proteins = proteinsFromReadingFrames(readingFrames, minLength);
  const unique = new Map<string, ProteinCandidate>();
  let candidateCounter = 1;

  proteins.forEach((protein) => {
    const sequence = sanitizeProteinCandidateSequence(protein);
    if (!sequence || unique.has(sequence)) {
      return;
    }

    unique.set(sequence, {
      id: `candidate-${candidateCounter}`,
      sequence,
      length: sequence.length,
      score: 1000 + sequence.length,
      source: 'orf_frame',
      label: `ORF ${candidateCounter}`,
      evidence: `Six-frame ORF candidate above cutoff (${sequence.length} aa)`,
      cdsLocation: null,
      gene: null,
      product: null,
      proteinId: null
    });

    candidateCounter += 1;
  });

  return Array.from(unique.values());
}

export function stageClass(status: StageStatus, styles: Record<string, string>): string {
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
}
