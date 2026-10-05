export interface EnergyField {
  label: string;
  accept: string[];
  options?: string[];
}
export interface ProfileOptions {
  type: 'levels' | 'profile' | 'labels' | 'repair' | 'catalyst';
  fixed?: boolean;
  fixedR?: boolean;
  formula?: string[];
  axes?: boolean;
  arrows: ('ea' | 'delta')[];
  eaX?: number;
  pathLabel?: boolean;
  overlay?: boolean;
  letters?: boolean;
  numberArrows?: boolean;
}
export interface EnergyRecord {
  id: string;
  strand: 'energy' | 'draw' | 'bonds';
  grade: 1 | 2;
  family: string;
  prompt: string;
  feedback: string;
  polarity?: 'exo' | 'endo';
  fields?: EnergyField[];
  points: string[];
  kind?: 'build';
  editor?: ProfileOptions;
  checks?: string[];
  diagram?: string;
  equation?: string;
  enthalpyText?: string;
}
export interface EnergyBank {
  questions: EnergyRecord[];
  strands: { id: string; name: string; grade: number }[];
  hints: Record<string, string>;
  vocab: Record<string, string[]>;
}
