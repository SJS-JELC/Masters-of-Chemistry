import type { Flashcard } from '../../recall/FlashcardTable.tsx';

// Verbatim teacher-reviewed sample. See provenance.json.
export const reviewedCards: readonly Flashcard[] = [
  {
    id: 'electron-shell-capacities',
    prompt: [
      {
        kind: 'text',
        text: 'State the maximum number of electrons in the first four principal electron shells.',
      },
    ],
    answer: [
      {
        kind: 'text',
        text: '2, 8, 18, 32',
      },
    ],
  },
  {
    id: 'subshell-capacities',
    prompt: [
      {
        kind: 'text',
        text: 'State the maximum number of electrons in an s, p and d subshell.',
      },
    ],
    answer: [
      {
        kind: 'text',
        text: 's = 2; p = 6; d = 10',
      },
    ],
  },
  {
    id: 'orbital-filling-rules',
    prompt: [
      {
        kind: 'text',
        text: 'What rules used to fill orbitals in the ground-state electron configuration of an atom.',
      },
    ],
    answer: [
      {
        kind: 'text',
        text: 'Fill lower-energy orbitals first.\nEach orbital holds a maximum of two electrons with opposite spins.\nOrbitals of equal energy are occupied singly with parallel spins before pairing.',
      },
    ],
  },
  {
    id: 'ionic-lattice',
    prompt: [
      {
        kind: 'text',
        text: 'What structure do ionic compounds have?',
      },
    ],
    answer: [
      {
        kind: 'text',
        text: 'Giant ionic lattice',
      },
    ],
  },
  {
    id: 'coordinate-bond',
    prompt: [
      {
        kind: 'text',
        text: 'Define the term dative bond',
      },
    ],
    answer: [
      {
        kind: 'text',
        text: 'A covalent bond in which both electrons in the shared pair are supplied by one atom.',
      },
    ],
  },
  {
    id: 'bond-enthalpy-strength',
    prompt: [
      {
        kind: 'text',
        text: 'Define the term average bond enthalpy',
      },
    ],
    answer: [
      {
        kind: 'text',
        text: 'The enthalpy change required to break one mole of a specified type of covalent bond in gaseous molecules, averaged over different compounds.',
      },
    ],
  },
];
