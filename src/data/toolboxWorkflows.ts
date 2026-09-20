/**
 * The toolbox's workflows, in the order the tabs show them.
 *
 * Kept here rather than inside the page component so the page metadata can
 * count them and name them instead of repeating "Four practical workflows" in
 * prose that goes wrong the day a fifth one is added.
 */
export interface ToolboxWorkflow {
  id: 'ncbi' | 'manual' | 'aa' | 'pdb';
  label: string;
  description: string;
  /** How the workflow is named in a running sentence, lower case. */
  summary: string;
}

export const toolboxWorkflows: ToolboxWorkflow[] = [
  {
    id: 'ncbi',
    label: 'NCBI Search',
    description: 'Fetch annotated proteins from GenBank records',
    summary: 'NCBI annotation search',
  },
  {
    id: 'manual',
    label: 'Sequence to Protein',
    description: 'Six-frame ORF scan from raw DNA / RNA',
    summary: 'manual sequence-to-protein translation',
  },
  {
    id: 'aa',
    label: 'Protein to Structure',
    description: 'Predict 3D structure from amino acid sequence',
    summary: 'structure prediction',
  },
  {
    id: 'pdb',
    label: 'PDB Search',
    description: 'Look up known 3D structures by PDB ID',
    summary: 'PDB lookup',
  },
];
