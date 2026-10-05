import type {
  ChemicalIssue,
  EditorState,
  EditorSubmissionCheck,
  MoleculeGraph,
} from '../../contracts/editors.ts';
import type { MarkingIssue, Question, Response, Responses } from '../../contracts/question.ts';

const issue = (message: string): ChemicalIssue => ({ code: 'input', message, objectIds: [] });
const finite = (...values: readonly number[]) => values.every(Number.isFinite);
/** Source acid input supports e notation, times-ten expressions and superscript exponents. */
export function parseScientificNumber(value: string): number {
  const superscripts: Readonly<Record<string, string>> = {
    '⁻': '-',
    '⁺': '+',
    '⁰': '0',
    '¹': '1',
    '²': '2',
    '³': '3',
    '⁴': '4',
    '⁵': '5',
    '⁶': '6',
    '⁷': '7',
    '⁸': '8',
    '⁹': '9',
  };
  const text = value
    .trim()
    .replace(/[⁻⁺⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (char) => superscripts[char] ?? char)
    .replace(/,/g, '')
    .replace(/−/g, '-');
  const atom = '[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)';
  const power = text.match(
    new RegExp(`^(${atom})\\s*(?:×|x|\\*)\\s*10\\s*\\^?\\s*([+-]?\\d+)$`, 'i'),
  );
  if (power) return Number(power[1]) * 10 ** Number(power[2]);
  return new RegExp(`^${atom}(?:e[+-]?\\d+)?$`, 'i').test(text) ? Number(text) : NaN;
}
export function checkMoleculeIntegrity(graph: MoleculeGraph): EditorSubmissionCheck {
  const ids = new Set<number>();
  for (const atom of graph.atoms) {
    if (
      !Number.isInteger(atom.id) ||
      ids.has(atom.id) ||
      !finite(atom.x, atom.y) ||
      !['C', 'O', 'N', 'Cl', 'F', 'H'].includes(atom.element) ||
      (atom.charge !== undefined && ![-1, 0, 1].includes(atom.charge)) ||
      (atom.h !== undefined && (!Number.isInteger(atom.h) || atom.h < 0 || atom.h > 4))
    ) {
      return { status: 'malformed', issues: [issue('Unsupported or duplicate molecular atom.')] };
    }
    ids.add(atom.id);
  }
  const bonds = new Set<string>();
  for (const bond of graph.bonds) {
    const key = [bond.a, bond.b].sort((a, b) => a - b).join(':');
    if (
      !ids.has(bond.a) ||
      !ids.has(bond.b) ||
      bond.a === bond.b ||
      ![1, 2, 3].includes(bond.order) ||
      bonds.has(key)
    ) {
      return { status: 'malformed', issues: [issue('Unsupported or dangling molecular bond.')] };
    }
    bonds.add(key);
  }
  if (graph.atoms.length > 100 || graph.atoms.filter((a) => a.element !== 'H').length > 20) {
    return { status: 'malformed', issues: [issue('Drawing exceeds supported graph limits.')] };
  }
  if (!graph.atoms.length)
    return { status: 'incomplete', issues: [issue('Place an atom to start your molecule.')] };
  // Valence, disconnected species, bond orders and charges are marked by chemistry policy.
  return { status: 'ready', chemicalIssues: [] };
}
export function checkEditorSubmission(response: EditorState): EditorSubmissionCheck {
  switch (response.kind) {
    case 'molecule':
      return checkMoleculeIntegrity(response.graph);
    case 'dot-and-cross': {
      if (!response.atoms.length)
        return { status: 'incomplete', issues: [issue('Place atoms to start your diagram.')] };
      const ids = new Set(response.atoms.map((a) => a.id));
      if (
        ids.size !== response.atoms.length ||
        response.atoms.some((a) => !a.id || !finite(a.x, a.y))
      )
        return { status: 'malformed', issues: [issue('Invalid diagram atoms.')] };
      const electronIds = new Set<string>(),
        slots = new Set<string>();
      for (const electron of response.electrons) {
        const anchor = electron.anchor;
        const key =
          anchor.kind === 'atom'
            ? `atom:${anchor.atomId}:${anchor.slot}`
            : `bond:${[anchor.a, anchor.b].sort().join('|')}:${anchor.slot}`;
        if (
          !electron.id ||
          electronIds.has(electron.id) ||
          slots.has(key) ||
          !['dot', 'cross', 'triangle'].includes(electron.symbol) ||
          (anchor.kind === 'atom'
            ? !ids.has(anchor.atomId) ||
              !Number.isInteger(anchor.slot) ||
              anchor.slot < 0 ||
              anchor.slot > 7
            : !ids.has(anchor.a) ||
              !ids.has(anchor.b) ||
              anchor.a === anchor.b ||
              !Number.isInteger(anchor.slot) ||
              anchor.slot < 0 ||
              anchor.slot > 5)
        ) {
          return {
            status: 'malformed',
            issues: [issue('Invalid or duplicate electron attachment.')],
          };
        }
        electronIds.add(electron.id);
        slots.add(key);
      }
      const groups = new Set<string>();
      for (const group of response.groups) {
        if (
          !group.id ||
          groups.has(group.id) ||
          !group.atomIds.length ||
          group.atomIds.some((id) => !ids.has(id)) ||
          new Set(group.atomIds).size !== group.atomIds.length ||
          !Number.isInteger(group.charge)
        ) {
          return { status: 'malformed', issues: [issue('Invalid diagram group.')] };
        }
        groups.add(group.id);
      }
      return { status: 'ready', chemicalIssues: [] };
    }
    case 'electron-configuration':
      return response.counts.length === 8 &&
        response.boxes.length === 8 &&
        response.boxes.every((row) => row.every((spin) => [0, 1, 2, 3].includes(spin)))
        ? { status: 'ready', chemicalIssues: [] }
        : { status: 'malformed', issues: [issue('Invalid orbital entries.')] };
    case 'energy-profile':
      return finite(response.r, response.p, response.peak)
        ? { status: 'ready', chemicalIssues: [] }
        : { status: 'malformed', issues: [issue('Invalid profile coordinates.')] };
    case 'titration-curve':
      return finite(response.initialPH, response.equivalenceVolume, response.finalPH)
        ? { status: 'ready', chemicalIssues: [] }
        : { status: 'malformed', issues: [issue('Invalid curve values.')] };
  }
}
function incomplete(response: Response): boolean {
  switch (response.kind) {
    case 'choice':
      return !response.selected.length;
    case 'text':
      return !response.value.trim();
    case 'numeric':
      return !Number.isFinite(parseScientificNumber(response.raw));
    case 'explanation':
      return !response.sections.length || response.sections.some((section) => !section.text.trim());
    case 'correction':
      return !response.selections.length || !response.replacement.trim();
    case 'diagram-selection':
      return !response.selectedObjectIds.length;
    default:
      return false;
  }
}
/** Required completeness is separate from chemically meaningful accepted incorrectness. */
export function checkQuestionInput(
  question: Question,
  responses: Responses,
): readonly MarkingIssue[] {
  const issues: MarkingIssue[] = [];
  for (const part of question.parts) {
    if (part.kind === 'drawing-self-check') continue; // genuine postnumeric model confirmation
    const response = responses[part.id];
    if (!response) {
      if (part.required)
        issues.push({ partId: part.id, message: 'Complete every required response.' });
      continue;
    }
    if (response.kind !== part.kind) {
      issues.push({ partId: part.id, message: 'Response type does not match this question.' });
      continue;
    }
    if (part.required && incomplete(response))
      issues.push({ partId: part.id, message: 'Enter a complete valid response.' });
    if (response.kind === 'choice' && part.kind === 'choice') {
      if (
        new Set(response.selected).size !== response.selected.length ||
        response.selected.some((id) => !part.options.some((option) => option.id === id)) ||
        (part.presentation !== 'multiple' && response.selected.length > 1)
      )
        issues.push({ partId: part.id, message: 'Choose from the displayed options.' });
    }
    if (response.kind === 'explanation' && part.kind === 'explanation') {
      if (
        new Set(response.sections.map((s) => s.id)).size !== response.sections.length ||
        response.sections.some((s) => !part.sections.some((section) => section.id === s.id)) ||
        part.sections.some((s) => !response.sections.some((section) => section.id === s.id))
      )
        issues.push({ partId: part.id, message: 'Complete the displayed explanation sections.' });
      for (const section of part.sections) {
        const value = response.sections.find((item) => item.id === section.id)?.text.trim() ?? '';
        if (section.minLength !== undefined && value.length < section.minLength)
          issues.push({
            partId: part.id,
            message: `${section.label}: write at least ${section.minLength} characters.`,
          });
      }
      if (
        part.minLength !== undefined &&
        response.sections.map((section) => section.text.trim()).join('\n').length < part.minLength
      )
        issues.push({
          partId: part.id,
          message: `Write at least ${part.minLength} characters before reviewing your explanation.`,
        });
    }
    if (
      [
        'electron-configuration',
        'dot-and-cross',
        'energy-profile',
        'titration-curve',
        'molecule',
      ].includes(response.kind)
    ) {
      // The switch narrows the data without erasing the distinct editor payloads.
      switch (response.kind) {
        case 'electron-configuration':
        case 'dot-and-cross':
        case 'energy-profile':
        case 'titration-curve':
        case 'molecule': {
          const check = checkEditorSubmission(response);
          if (check.status !== 'ready')
            for (const problem of check.issues)
              issues.push({ partId: part.id, message: problem.message });
        }
      }
    }
  }
  return issues;
}
