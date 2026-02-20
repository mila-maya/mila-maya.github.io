import type { NcbiSearchResult } from '@services/bioinformaticsApi';
import type { SequenceType } from '@utils/bioinformatics';

export type SourceMode = 'ncbi' | 'manual';
export type StageStatus = 'idle' | 'running' | 'done' | 'failed';
export type PredictionInputMode = 'selected' | 'custom';
export type ProteinCandidateSource = 'cds_translation' | 'ncbi_translation' | 'orf_frame';

export interface ProteinCandidate {
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

export interface NcbiPipelineData {
  sourceLabel: string;
  nucleotideType: SequenceType;
  nucleotideSequence: string;
  rnaSequence: string;
  candidates: ProteinCandidate[];
  candidateBaseProtein: string;
  selectedCandidateId: string | null;
  selectedProtein: string;
  predictedPdb: string | null;
  structureSource: 'esmfold' | 'rcsb' | null;
  structureSourceLabel: string | null;
  ncbi: NcbiSearchResult;
}

export interface ManualPipelineData {
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
}

export const CANDIDATE_SOURCE_LABEL: Record<ProteinCandidateSource, string> = {
  cds_translation: 'GenBank CDS translation',
  ncbi_translation: 'NCBI /translation qualifier',
  orf_frame: 'Six-frame ORF scan'
};
