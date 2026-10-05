/** Editor state describes chemical/user data, never DOM nodes or serialized pages. */
export interface Point {
  readonly x: number;
  readonly y: number;
}
export type OrbitalSpin = 0 | 1 | 2 | 3; // empty, up, down, opposite-spin pair
export type SubshellValues<T> = readonly [T, T, T, T, T, T, T, T]; // 1s through 4p
export interface ElectronConfigurationState {
  readonly kind: 'electron-configuration';
  readonly counts: SubshellValues<string>;
  readonly core: string;
  readonly boxes: SubshellValues<readonly OrbitalSpin[]>;
  readonly identity: string;
  readonly selectedSpeciesIds: readonly string[];
}
export type DotCrossElement =
  | 'H'
  | 'B'
  | 'C'
  | 'Si'
  | 'N'
  | 'O'
  | 'P'
  | 'S'
  | 'F'
  | 'Cl'
  | 'Br'
  | 'I'
  | 'Li'
  | 'K'
  | 'Na'
  | 'Mg'
  | 'Ca'
  | 'Al';
export type ElectronSymbol = 'dot' | 'cross' | 'triangle';
export type DotCrossAnchor =
  | Readonly<{ kind: 'atom'; atomId: string; slot: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 }>
  | Readonly<{ kind: 'bond'; a: string; b: string; slot: 0 | 1 | 2 | 3 | 4 | 5 }>;
export interface DotCrossSnapshot {
  readonly kind: 'dot-and-cross';
  readonly atoms: readonly (Point & Readonly<{ id: string; element: DotCrossElement }>)[];
  readonly electrons: readonly Readonly<{
    id: string;
    symbol: ElectronSymbol;
    anchor: DotCrossAnchor;
  }>[];
  readonly groups: readonly Readonly<{
    id: string;
    atomIds: readonly string[];
    charge: number;
    bracket: boolean;
  }>[];
}
export interface DotCrossState extends DotCrossSnapshot {
  /** Display preference only; absent historic drafts show circles. Not chemical history. */
  readonly circles?: boolean;
  /** Semantic snapshots only, bounded to 100. Snapshots cannot contain history. */
  readonly history?: readonly DotCrossSnapshot[];
  readonly future?: readonly DotCrossSnapshot[];
}
export type EnergyAnchor = 'r' | 'p' | 'peak';
export type EnergyArrowEnd = Readonly<{ anchor: EnergyAnchor }> | Readonly<{ y: number }>;
export interface EnergyProfileState {
  readonly kind: 'energy-profile';
  readonly r: number;
  readonly p: number;
  readonly peak: number;
  readonly left: string;
  readonly right: string;
  readonly vertical: string;
  readonly horizontal: string;
  readonly pathLabel: string;
  readonly arrows: Readonly<
    Partial<
      Record<'ea' | 'delta', Readonly<{ x: number; tail: EnergyArrowEnd; head: EnergyArrowEnd }>>
    >
  >;
}
export interface TitrationCurveState {
  readonly kind: 'titration-curve';
  readonly before: string | null;
  readonly after: string | null;
  readonly initialPH: number;
  readonly equivalenceVolume: number;
  readonly finalPH: number;
  readonly indicator: string | null;
}
export type MoleculeElement = 'C' | 'O' | 'N' | 'Cl' | 'F' | 'H';
export interface MoleculeAtom extends Point {
  readonly id: number;
  readonly element: MoleculeElement;
  readonly charge?: -1 | 0 | 1;
  readonly h?: 0 | 1 | 2 | 3 | 4;
  readonly pairs?: readonly number[];
  readonly dipole?: -1 | 1;
  readonly chargeAngle?: number;
  readonly dipoleAngle?: number;
}
export type MoleculeAnchor =
  | Readonly<{ kind: 'bond'; a: number; b: number }>
  | Readonly<{ kind: 'atom' | 'charge'; id: number }>
  | Readonly<{ kind: 'pair'; id: number; index?: number }>;
/** Optional annotation data is preserved; mechanism prototype is not registered. */
export interface MoleculeGraph {
  readonly atoms: readonly MoleculeAtom[];
  readonly bonds: readonly Readonly<{ a: number; b: number; order: 1 | 2 | 3 }>[];
  readonly arrows?: readonly Readonly<{
    id: number;
    from: MoleculeAnchor;
    to: MoleculeAnchor;
    bend: number;
  }>[];
}
export interface MoleculeState {
  readonly kind: 'molecule';
  readonly graph: MoleculeGraph;
  readonly history: readonly MoleculeGraph[]; // bounded to 100 semantic edits
}
export type EditorState =
  | ElectronConfigurationState
  | DotCrossState
  | EnergyProfileState
  | TitrationCurveState
  | MoleculeState;
export type EditorKind = EditorState['kind'];
export type EditorStateFor<K extends EditorKind> = Extract<EditorState, { readonly kind: K }>;
export interface ChemicalIssue {
  readonly code: string;
  readonly message: string;
  readonly objectIds: readonly (string | number)[];
}
export type EditorValidation =
  | Readonly<{ valid: true }>
  | Readonly<{ valid: false; issues: readonly ChemicalIssue[] }>;
/** Integrity/completion can block submission; chemical wrongness remains assessable. */
export type EditorSubmissionCheck =
  | Readonly<{ status: 'ready'; chemicalIssues: readonly ChemicalIssue[] }>
  | Readonly<{ status: 'incomplete' | 'malformed'; issues: readonly ChemicalIssue[] }>;
/** Each activity implements checked chemical semantics; React is an adapter. */
export interface EditorEngine<K extends EditorKind, Command> {
  readonly kind: K;
  readonly apply: (state: EditorStateFor<K>, command: Command) => EditorStateFor<K>;
  readonly checkSubmission: (state: EditorStateFor<K>) => EditorSubmissionCheck;
  readonly validate: (state: EditorStateFor<K>) => EditorValidation;
}
