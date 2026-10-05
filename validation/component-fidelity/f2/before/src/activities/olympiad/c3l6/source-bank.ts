import type {
  C3BSlot,
  C3CSlot,
  C3DrawingSlot,
  C3Classification,
  C3L6Challenge,
} from '../../../contracts/olympiad.ts';
import bankData from './bank.json' with { type: 'json' };
import { c3Dependencies } from './dependencies.ts';
type Bank = {
  stages: {
    a: { answers: { id: string; label: string; answer: C3Classification }[] };
    b: { answers: C3DrawingSlot<C3BSlot>[] };
    c: { answers: C3DrawingSlot<C3CSlot>[] };
  };
};
export const sourceBank = bankData as unknown as Bank;
/** The extracted source remains immutable; this reviewed policy projects current accepted answers. */
export const c3KErratum = {
  issueId: 'CHEM-03-C3-K-ORTHOACID',
  acceptedSmiles: 'O=C(O)C(O)O',
  rejectedSourceSmiles: 'O=CC(O)(O)O',
  note: 'Source erratum for K: the accepted product is the aldehyde hydrate, 2,2-dihydroxyacetic acid. The inherited alternative retains the aldehyde and forms a hypothetical orthoacid at the carboxyl group; it is not accepted for this reaction. Both have formula C₂H₄O₄ and Mr 92, so formula and mass alone do not distinguish them.',
} as const;
export const currentBAnswers = sourceBank.stages.b.answers.map((slot) => {
  if (slot.id !== 'K') return slot;
  const alternatives = slot.alternatives.filter((a) => a.smiles === c3KErratum.acceptedSmiles);
  if (alternatives.length !== 1 || slot.alternatives.length !== 2)
    throw Error('K erratum no longer matches the retained source bank; review required.');
  return { ...slot, alternatives };
});
export const bUnits = c3Dependencies.bUnits;
/** Chemistry-only projection used for historical revalidation without UI/asset loading. */
export const chemicalChallenge: C3L6Challenge = {
  activityId: 'alevel/c3l6-organic-reactions',
  introduction: [],
  classifications: sourceBank.stages.a.answers.map((a) => ({ ...a, reaction: [] })),
  hydrolysis: bUnits.map((u) => ({
    unitId: u.id,
    context: [],
    slots: u.slots.map((id) => currentBAnswers.find((a) => a.id === id)!),
  })),
  network: { context: [], slots: sourceBank.stages.c.answers },
  dependencies: c3Dependencies,
};
