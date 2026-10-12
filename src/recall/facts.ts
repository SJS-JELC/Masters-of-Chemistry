import { isPrimaryRecallGem } from './selection.ts';
import type { Course } from '../contracts/identity.ts';
import type { RecallFact } from '../contracts/recall.ts';
import approvedIGCSE from './approved-igcse-facts.json' with { type: 'json' };
import provenance from './provenance.json' with { type: 'json' };
import { starterDecks } from './starter-decks.ts';
import { existingRecallGemLinks } from '../activities/igcse/formulae/recall-facts.ts';
import catalogueData from '../landing/catalogue-data.json' with { type: 'json' };
const catalogue = catalogueData as unknown as Record<
  Course,
  { groups: readonly { key: string; topics: readonly [number, string, readonly string[]][] }[] }
>;
export const recallFactAliases: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries({
    nitrate: '027',
    carbonate: '028',
    ammonium: '029',
    zinc: '030',
    silver: '031',
    hydroxide: '032',
    sulfate: '033',
  }).flatMap(([ion, n]) =>
    ['formula', 'charge'].map((type) => ['igcse-ion-' + ion + '-' + type, 'igcse-recall-' + n]),
  ),
);
const links: Readonly<Record<string, readonly string[]>> = {
  'electron-shell-capacities': ['l6-t2-1-1', 'l6-t2-1-2'],
  'subshell-capacities': ['l6-t2-1-1', 'l6-t2-1-2'],
  'orbital-filling-rules': ['l6-t2-1-1', 'l6-t2-1-2'],
  'ionic-lattice-solid': ['l6-t2-1-1', 'l6-t2-1-3', 'l6-t2-1-4'],
  'coordinate-bond': ['l6-t2-1-1', 'l6-t2-1-3'],
  'bond-enthalpy-strength': ['l6-t1-8-3'],
};
const conceptual: Readonly<Record<string, RecallFact['matching']>> = {
  'orbital-filling-rules': {
    kind: 'concepts',
    all: [
      [
        'lower-energy orbitals first',
        'lowest energy orbitals first',
        'lower energy orbitals first',
      ],
      ['two electrons', '2 electrons'],
      ['opposite spins', 'opposite spin'],
      ['equal energy', 'same energy'],
      ['singly', 'single electrons'],
      ['parallel spins', 'parallel spin'],
      ['before pairing', 'before electrons pair'],
    ],
  },
  'coordinate-bond': {
    kind: 'concepts',
    all: [
      ['covalent bond'],
      ['both electrons', 'two electrons', '2 electrons'],
      ['shared pair', 'shared electron pair'],
      ['supplied by one atom', 'donated by one atom', 'from one atom', 'come from one atom'],
    ],
  },
  'bond-enthalpy-strength': {
    kind: 'concepts',
    all: [
      ['enthalpy change', 'energy required'],
      ['break one mole', 'break 1 mole', 'breaking one mole', 'breaking 1 mole'],
      ['specified type', 'particular type', 'given type', 'same type'],
      ['covalent bond', 'covalent bonds'],
      ['gaseous', 'gas phase'],
      ['averaged', 'average'],
      ['different compounds'],
    ],
  },
};
const alevel: RecallFact[] = starterDecks.alevel.map((card) => ({
  id: card.id,
  course: 'alevel',
  prompt: card.prompt.map((b) => ('text' in b ? b.text : '')).join('\n'),
  answer: card.answer.map((b) => ('text' in b ? b.text : '')).join('\n'),
  gemIds: links[card.id]!,
  sources: [{ ...provenance.sources.alevel, symbolOrSection: card.id }],
  ...(conceptual[card.id] ? { matching: conceptual[card.id]! } : {}),
  ...(card.id === 'electron-shell-capacities' ? { accepted: ['2 8 18 32', '2; 8; 18; 32'] } : {}),
  ...(card.id === 'subshell-capacities'
    ? { accepted: ['s=2 p=6 d=10', '2, 6, 10', '2 6 10'] }
    : {}),
  ...(card.id === 'ionic-lattice-solid' ? { accepted: ['giant ionic lattice structure'] } : {}),
}));
// Formula/charge memorisation belongs primarily to Formulae within Formulae & Equations.
// Keep the previous bonding and analytical links as secondary supporting knowledge.
const formulaRecallIds = new Set([
  'igcse-recall-026', 'igcse-recall-027', 'igcse-recall-028', 'igcse-recall-029',
  'igcse-recall-030', 'igcse-recall-031', 'igcse-recall-032', 'igcse-recall-033',
]);
const igcse = (approvedIGCSE as readonly RecallFact[]).map((f) => ({
  ...f,
  gemIds: [
    ...new Set([
      ...(formulaRecallIds.has(f.id) ? ['fourth-16-1'] : []),
      ...f.gemIds,
      ...(existingRecallGemLinks[f.id] ?? []),
      ...(Object.values(recallFactAliases).includes(f.id) ? ['fourth-16-1', 'fourth-16-2'] : []),
    ]),
  ],
}));
export const recallFacts: readonly RecallFact[] = [...alevel, ...igcse];
export function factsFor(
  course: Course,
  gemIds: readonly string[] | null = null,
): readonly RecallFact[] {
  return recallFacts.filter(
    (f) => f.course === course && (gemIds === null || isPrimaryRecallGem(f, gemIds)),
  );
}
/** Includes curriculum gems with zero approved facts rather than inventing coverage. */
export function recallCoverage(
  course: Course,
): readonly { gemId: string; label: string; factIds: readonly string[] }[] {
  const result = catalogue[course].groups.flatMap((group) =>
    group.topics.flatMap((topic) =>
      topic[2].map((label, i) => ({
        gemId: group.key + '-' + topic[0] + '-' + (i + 1),
        label,
        factIds: factsFor(course, [group.key + '-' + topic[0] + '-' + (i + 1)]).map((f) => f.id),
      })),
    ),
  );
  if (course === 'igcse' && !result.some((x) => x.gemId === 'fourth-16-1'))
    result.push(
      ...['Formulae', 'Equations'].map((label, i) => ({
        gemId: 'fourth-16-' + (i + 1),
        label,
        factIds: factsFor(course, ['fourth-16-' + (i + 1)]).map((f) => f.id),
      })),
    );
  return result;
}
