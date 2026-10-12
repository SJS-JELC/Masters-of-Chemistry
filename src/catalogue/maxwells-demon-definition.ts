import type { ActivityDefinition } from './registry.ts';
export const maxwellDefinition = {
  id: 'alevel/maxwells-demon',
  course: 'alevel',
  strand: 'olympiad',
  title: 'Maxwell’s Demon',
  gems: [],
  source: [
    {
      path: "tmp/maxwell's demon/Level 2.png",
      sha256: 'f354fd16aa6455cccb16d04933ac61cc45c7dc9d5765bd7637e3090bee0bbda5',
      symbolOrSection:
        'User-supplied thermochemistry exercises; Level 2 data explicitly hypothetical. Original Level 1 reference/classification. Source-reviewed exact Hess answers; see docs/maxwells-demon.md.',
    },
    {
      path: "tmp/maxwell's demon/Hess' Hypothetical Problems.docx",
      sha256: '8aeeb7b6333051f43dcaa914e340da4a01c70155b421c8cd21a9811f40edb2c5',
      symbolOrSection:
        'User-supplied thermochemistry exercises; Level 2 data explicitly hypothetical. Original Level 1 reference/classification. Source-reviewed exact Hess answers; see docs/maxwells-demon.md.',
    },
    {
      path: "tmp/maxwell's demon/level 3.png",
      sha256: '3ef9de718ca94c08163fa81e06c5a2665aef84a282866236921b07a88f130acf',
      symbolOrSection:
        'User-supplied thermochemistry exercises; Level 2 data explicitly hypothetical. Original Level 1 reference/classification. Source-reviewed exact Hess answers; see docs/maxwells-demon.md.',
    },
  ],
} as const satisfies ActivityDefinition;
