import type { OlympiadActivityId } from '../contracts/index.ts';

// Related A Level topics, not mastery registrations or a claim that all challenge
// chemistry is in the specification. See resources/curriculum/ocr-a-level/
// a-level-specification-map.md for the corresponding curriculum branches.
export const olympiadTopics = {
  'alevel/c3l6-organic-reactions': [
    'Functional Groups', 'Oxidation & Reduction', 'Hydrolysis', 'Organic Synthesis',
  ],
  'alevel/olympiad-2011-q4': [
    'Isomerism', 'Intermolecular Forces', 'Infrared Spectroscopy', 'NMR Spectroscopy',
  ],
} as const satisfies Record<OlympiadActivityId, readonly string[]>;
