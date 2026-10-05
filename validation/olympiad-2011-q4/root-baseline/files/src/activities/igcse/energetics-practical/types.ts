export interface PracticalField {
  id: string;
  label: string;
  model: string;
  answers: string[];
  feedback?: string;
  options?: string[];
  multiselect?: boolean;
  selectCount?: number;
}
export interface PracticalRecord {
  id: string;
  band: '7-8' | '9';
  type: string;
  context: string;
  prompt: string;
  fields: PracticalField[];
  diagram: string | null;
  highlight: string | null;
  selection: { correct: string } | null;
  correction: { segments: { id: string; text: string }[]; errorId: string } | null;
  pattern: string;
  sources: { id: string; summary: string }[];
  objectives: string[];
  reviewNote: string;
}
export interface PracticalResponse {
  fields: Record<string, string | string[]>;
  selectedId: string;
  errorId: string;
  overrides: string[];
}
export interface PracticalPoint {
  id: string;
  correct: boolean;
  automaticCorrect: boolean;
  overrideable: boolean;
  model: string;
  feedback: string;
}
