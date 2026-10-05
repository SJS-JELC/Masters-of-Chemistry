import { validatePreviousQuestionIds } from '../../../content/canonical-identity.ts';
import type {
  Level,
  Question,
  QuestionProvider,
  QuestionRef,
  QuestionSelection,
  ContentBlock,
} from '../../../contracts/index.ts';
import { data } from '../../../chemistry/electron-configuration/data.js';
import { abbreviation, explanation, same } from '../../../chemistry/electron-configuration/core.js';
import { blankState } from '../../../chemistry/electron-configuration/engine.ts';
import {
  variants,
  matchingFamilies,
  getVariant,
  format,
  capacity,
  matchingFromId,
} from '../../../chemistry/electron-configuration/identity.ts';
import {
  notation,
  diagramImage,
  speciesLabel,
} from '../../../chemistry/electron-configuration/display.ts';
import { electronSources as source } from '../../../chemistry/electron-configuration/provenance.ts';
function seedCheck(seed: number) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw Error('Question seed must be unsigned 32-bit.');
}
export function allowedVariants(level: Level) {
  return variants.filter((item) => item.minimumLevel <= level);
}
function restore(ref: QuestionRef): Question {
  if (ref.activityId !== 'alevel/electron-configurations' || ![1, 2, 3].includes(ref.level))
    throw Error('Invalid configuration route.');
  seedCheck(ref.seed);
  const q = getVariant(ref.questionId);
  if (q.kind === 'bonus' && ref.seed !== parseInt(q.questionId.slice(4), 36))
    throw Error('Matching code and seed disagree.');
  if ((q.kind === 'main' && q.minimumLevel > ref.level) || (q.kind === 'bonus' && ref.level !== 3))
    throw Error('Question is unavailable at the requested level.');
  const text = (text: string): ContentBlock => ({ kind: 'text', text });
  let context: ContentBlock[], worked: ContentBlock[], title: string;
  if (q.kind === 'bonus') {
    title = 'Match the electron configuration';
    context = [
      text(
        'Select every species with exactly this configuration. Equal electron totals alone do not always mean identical configurations.',
      ),
      { kind: 'formula', text: notation(q.counts) },
    ];
    worked = q.options.flatMap((id) => {
      const item = data.species.find((item) => item.id === id)!;
      return [
        text(
          `${speciesLabel(id)} ${same(item.counts, q.counts) ? 'matches' : 'has a different configuration'}`,
        ),
        { kind: 'formula' as const, text: notation(item.counts) },
      ];
    });
  } else {
    const item = data.species.find((item) => item.id === q.speciesId)!,
      short = abbreviation(item);
    title = q.direction === 'build' ? 'Build the configuration' : 'Which element is this?';
    context =
      q.direction === 'build'
        ? [
            text(
              `${item.name} ${item.charge ? 'ion' : 'atom'}: ${speciesLabel(item.id)}. Atomic number ${item.z}; ${item.charge ? `charge ${item.charge > 0 ? '+' : ''}${item.charge}` : 'neutral atom'}.`,
            ),
          ]
        : [
            text(
              item.charge
                ? `This ion has charge ${item.charge > 0 ? '+' : ''}${item.charge}. Which element does it belong to?`
                : 'This configuration belongs to a neutral atom. Which element is it?',
            ),
          ];
    worked = [
      text(`${item.name} · ${speciesLabel(item.id)}`),
      ...explanation(item).map(text),
      text('Full notation'),
      { kind: 'formula', text: notation(item.counts) },
      text('Abbreviated notation'),
      short.core
        ? { kind: 'formula', text: notation(short.counts, short.core) }
        : text('There is no preceding noble-gas core for this atom. Use full notation.'),
      text('Boxes in a row'),
      {
        kind: 'image',
        src: diagramImage(item.counts, 'row'),
        alt: `${item.name}: checked horizontal orbital diagram. ${notation(item.counts)}`,
      },
      text('Boxes on energy levels'),
      {
        kind: 'image',
        src: diagramImage(item.counts, 'energy'),
        alt: `${item.name}: checked schematic orbital energy ladder. ${notation(item.counts)}`,
      },
    ];
  }
  const rep =
    q.kind === 'bonus'
      ? 'matching'
      : data.representations.find((rep) => rep.id === q.representation)!.label;
  return {
    ref,
    title: `${title} · ${rep} · ${ref.questionId}`,
    context,
    layout: 'workspace',
    submission: 'all-required-parts',
    parts: [
      {
        id: 'configuration',
        kind: 'electron-configuration',
        prompt: [
          text(
            q.kind === 'bonus'
              ? 'Select all matching species.'
              : q.direction === 'identify'
                ? 'Enter an element name or symbol.'
                : q.representation === 'row' || q.representation === 'energy'
                  ? 'Set orbital occupancies and spins.'
                  : 'Enter electron counts; leave unused subshells blank or enter 0.',
          ),
        ],
        marks: 1,
        required: true,
        dependsOn: [],
        initial: blankState(),
        markingPolicyId: `electron:${q.kind === 'bonus' ? 'matching' : q.direction}:${ref.questionId}`,
      },
    ],
    scaffolds: [
      {
        id: 'orbital-conventions',
        level: ref.level,
        purpose: 'Original built-in configuration and spin conventions.',
        content: [
          text(
            'One orbital holds at most two electrons with opposite spins. Occupy orbitals in a subshell singly with parallel spins before pairing. Energy diagrams show a schematic Aufbau ladder through 4p, including empty subshells.',
          ),
        ],
      },
    ],
    hints: [
      {
        id: 'count-and-charge',
        content: [
          text(
            'Electron total = atomic number − signed ionic charge. For d-block ions, remove 4s electrons before 3d.',
          ),
        ],
      },
    ],
    workedAnswer: worked,
    sources: source,
  };
}
function select(selection: QuestionSelection): QuestionRef {
  validatePreviousQuestionIds(selection.activityId, selection.previousQuestionIds);
  if (
    selection.activityId !== 'alevel/electron-configurations' ||
    ![1, 2, 3].includes(selection.level) ||
    (selection.gemId && selection.gemId !== 'l6-t2-1-2')
  )
    throw Error('Invalid electron configuration target.');
  seedCheck(selection.seed);
  const history = selection.previousQuestionIds
    .map((id) => {
      try {
        return getVariant(id);
      } catch {
        return null;
      }
    })
    .filter((item) => item !== null);
  const groups =
    selection.level === 3
      ? ['matching', 'd-atoms', 'd-ions', 'main-atoms', 'main-ions']
      : selection.level === 2
        ? ['main-atoms', 'main-ions']
        : ['main-atoms'];
  const group = groups[history.length % groups.length]!;
  if (group === 'matching') {
    const n = (selection.seed % Math.floor(capacity / 16)) * 16 + 15;
    const id = format('ECB', n);
    matchingFromId(id);
    return { activityId: selection.activityId, questionId: id, seed: n, level: 3 };
  }
  let rng = selection.seed || 314159265;
  function random() {
    let n = rng >>> 0;
    n ^= n << 13;
    n ^= n >>> 17;
    n ^= n << 5;
    rng = n >>> 0;
    return rng / 4294967296;
  }
  function shuffle<T>(values: readonly T[]) {
    const result = values.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j]!, result[i]!];
    }
    return result;
  }
  const previous = history.at(-1),
    groupHistory = history.filter((item) => item.kind === 'main' && item.group === group);
  const pool = allowedVariants(selection.level).filter((item) => item.group === group);
  const representations = [...new Set(pool.map((item) => item.representation))],
    uses = representations.map(
      (rep) =>
        groupHistory.filter((item) => item.kind === 'main' && item.representation === rep).length,
    ),
    least = Math.min(...uses);
  const representation = shuffle(representations.filter((_rep, i) => uses[i] === least))[0]!;
  const builds = groupHistory.filter(
      (item) => item.kind === 'main' && item.direction === 'build',
    ).length,
    identifies = groupHistory.length - builds;
  const lastMain = [...history].reverse().find((item) => item.kind === 'main');
  const nextDirection =
    lastMain?.kind === 'main' && lastMain.direction === 'build' ? 'identify' : 'build';
  const direction =
    builds < identifies ? 'build' : identifies < builds ? 'identify' : nextDirection;
  const candidates = shuffle(
    pool.filter((item) => item.representation === representation && item.direction === direction),
  );
  const fresh = candidates.filter(
      (item) => previous?.kind !== 'main' || item.speciesId !== previous.speciesId,
    ),
    chosen = (fresh.length ? fresh : candidates)[0]!;
  return {
    activityId: selection.activityId,
    questionId: chosen.questionId,
    seed: selection.seed,
    level: selection.level,
  };
}
export const electronConfigurationsProvider: QuestionProvider = {
  coverage: [
    { kind: 'fixed', questionIds: variants.map((q) => q.questionId) },
    {
      kind: 'generated',
      families: matchingFamilies.map((f) => ({ templateId: f.templateId, levels: [3] })),
    },
  ],
  restore,
  select,
  resolveLink(code) {
    try {
      const id = code.trim().toUpperCase(),
        q = getVariant(id);
      return {
        activityId: 'alevel/electron-configurations',
        questionId: q.questionId,
        seed: q.kind === 'bonus' ? parseInt(q.questionId.slice(4), 36) : 0,
        level: q.kind === 'bonus' ? 3 : q.minimumLevel,
      };
    } catch {
      return null;
    }
  },
};
