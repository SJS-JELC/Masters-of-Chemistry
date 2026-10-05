import type {
  ElectronConfigurationState,
  OrbitalSpin,
  SubshellValues,
  EditorSubmissionCheck,
} from '../../contracts/index.ts';
import { data } from './data.js';
import { blankResponse, boxes, abbreviation } from './core.js';
import type { SourceResponse } from './core.js';
export function tuple<T>(values: readonly T[]): SubshellValues<T> {
  if (values.length !== 8) throw Error('Eight subshell entries are required.');
  return values.slice() as unknown as SubshellValues<T>;
}
export function blankState(): ElectronConfigurationState {
  const response = blankResponse();
  return {
    kind: 'electron-configuration',
    counts: tuple(response.counts),
    core: '',
    boxes: tuple(response.boxes as readonly (readonly OrbitalSpin[])[]),
    identity: '',
    selectedSpeciesIds: [],
  };
}
export function sourceResponse(state: ElectronConfigurationState): SourceResponse {
  return { ...state, selected: state.selectedSpeciesIds };
}
export function integrity(state: ElectronConfigurationState): EditorSubmissionCheck {
  if (state.core && !Object.hasOwn(data.cores, state.core))
    return {
      status: 'malformed',
      issues: [
        {
          code: 'configuration-core',
          message: 'The saved configuration has an unsupported noble-gas core.',
          objectIds: [],
        },
      ],
    };
  const malformed =
    state.kind !== 'electron-configuration' ||
    !Array.isArray(state.counts) ||
    state.counts.length !== 8 ||
    state.counts.some((value) => typeof value !== 'string' || value.length > 2) ||
    typeof state.core !== 'string' ||
    typeof state.identity !== 'string' ||
    state.identity.length > 80 ||
    !Array.isArray(state.boxes) ||
    state.boxes.length !== 8 ||
    state.boxes.some(
      (row, index) =>
        !Array.isArray(row) ||
        row.length !== data.orbitals[index] ||
        row.some((spin) => ![0, 1, 2, 3].includes(spin)),
    ) ||
    !Array.isArray(state.selectedSpeciesIds) ||
    new Set(state.selectedSpeciesIds).size !== state.selectedSpeciesIds.length ||
    state.selectedSpeciesIds.some((id) => !data.species.some((item) => item.id === id));
  return malformed
    ? {
        status: 'malformed',
        issues: [
          {
            code: 'configuration-integrity',
            message: 'The saved configuration has invalid subshell, orbital or species entries.',
            objectIds: [],
          },
        ],
      }
    : { status: 'ready', chemicalIssues: [] };
}
export type Command =
  | { kind: 'count'; index: number; value: string }
  | { kind: 'spin'; index: number; orbital: number; value: OrbitalSpin }
  | { kind: 'core'; value: string }
  | { kind: 'identity'; value: string }
  | { kind: 'select'; id: string }
  | { kind: 'clear' };
export function apply(
  state: ElectronConfigurationState,
  command: Command,
): ElectronConfigurationState {
  switch (command.kind) {
    case 'clear':
      return blankState();
    case 'identity':
      return { ...state, identity: command.value.slice(0, 80) };
    case 'core': {
      if (command.value && !data.cores[command.value]) throw Error('Unknown noble-gas core.');
      return {
        ...state,
        core: command.value,
        counts: tuple(
          state.counts.map((value, i) => (data.cores[command.value]?.[i] ? '' : value)),
        ),
      };
    }
    case 'count': {
      if (!Number.isInteger(command.index) || command.index < 0 || command.index > 7)
        throw Error('Invalid subshell.');
      return {
        ...state,
        counts: tuple(
          state.counts.map((value, i) => (i === command.index ? command.value.slice(0, 2) : value)),
        ),
      };
    }
    case 'spin': {
      if (
        !Number.isInteger(command.index) ||
        !Number.isInteger(command.orbital) ||
        command.index < 0 ||
        command.index > 7 ||
        command.orbital < 0 ||
        command.orbital >= data.orbitals[command.index]! ||
        ![0, 1, 2, 3].includes(command.value)
      )
        throw Error('Invalid orbital.');
      return {
        ...state,
        boxes: tuple(
          state.boxes.map((row, i) =>
            i === command.index
              ? row.map((value, j) => (j === command.orbital ? command.value : value))
              : row,
          ),
        ),
      };
    }
    case 'select': {
      if (!data.species.some((item) => item.id === command.id)) throw Error('Unknown species.');
      return {
        ...state,
        selectedSpeciesIds: state.selectedSpeciesIds.includes(command.id)
          ? state.selectedSpeciesIds.filter((id) => id !== command.id)
          : [...state.selectedSpeciesIds, command.id],
      };
    }
  }
}
export function referenceState(id: string, representation: string): ElectronConfigurationState {
  const item = data.species.find((item) => item.id === id);
  if (!item) throw Error('Unknown species.');
  const short = abbreviation(item);
  return {
    ...blankState(),
    counts: tuple(
      (representation === 'short' ? short.counts : item.counts).map((n) => (n ? String(n) : '')),
    ),
    core: representation === 'short' ? short.core : '',
    boxes: tuple(boxes(item.counts)),
    identity: item.symbol,
  };
}
