/** Frozen pre-amendment marker, captured 2026-10-10 for immutable historical evidence.
 * Do not apply amended bank semantics or fix historical scoring here.
 */
import type { RecallFact, RecallField, RecallMatching } from '../contracts/recall.ts';
import type { MarkingPolicy, Responses } from '../contracts/question.ts';
/** Normalise notation, preserving element case, grouping, counts and signed charge. */
export function normalizeHistoricalRecallChemical(value: string): string {
  const normalized = value.normalize('NFKC').replace(/[−–]/g, '-').replace(/[\s^]/g, '');
  return /^CnH/.test(normalized)
    ? normalized
    : normalized.replace(/([+-])1$/, '$1').replace(/([+-])([2-9])$/, '$2$1');
}
export function normalizeHistoricalRecallText(value: string, caseSensitive = false): string {
  const normalized = value
    .normalize('NFKC')
    .replace(/[−–]/g, '-')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.;]+$/, '')
    .replace(/sulphur/gi, 'sulfur')
    .replace(/sulphate/gi, 'sulfate');
  return caseSensitive ? normalized : normalized.toLocaleLowerCase('en-GB');
}
function numberValue(value: string): number | null {
  const s = value.trim();
  if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(s)) return Number(s);
  const fraction = s.match(/^([+-]?\d+)\s*\/\s*(\d+)$/);
  return fraction && Number(fraction[2]) !== 0 ? Number(fraction[1]) / Number(fraction[2]) : null;
}
/** Conservative approved phrase matching: negated/contradictory prose is never success. */
export function matchesHistoricalRecall(
  value: string,
  answer: string,
  accepted: readonly string[] = [],
  matching?: RecallMatching,
): boolean {
  const alternatives = [answer, ...accepted];
  if (matching?.kind === 'chemical') {
    const response = normalizeHistoricalRecallChemical(value);
    return !!response && alternatives.some((a) => normalizeHistoricalRecallChemical(a) === response);
  }
  const response = normalizeHistoricalRecallText(
    value,
    matching?.kind === 'text' && matching.caseSensitive === true,
  );
  if (!response) return false;
  if (matching?.kind === 'numeric') {
    const unit = matching.unit;
    const unitPattern =
      unit === '°C'
        ? /(?:°\s*C|degrees?\s+celsius)$/i
        : unit === 'atm'
          ? /(?:atm|atmospheres)$/i
          : unit === '%'
            ? /%$/
            : null;
    const numericInput = unitPattern ? value.trim().replace(unitPattern, '').trim() : value;
    if (alternatives.some((a) => normalizeHistoricalRecallText(a) === response)) return true;
    const n = numberValue(numericInput);
    return (
      n !== null &&
      Number.isFinite(n) &&
      (matching.values.some((v) => Math.abs(v - n) <= Math.max(1e-12, Math.abs(v) * 1e-9)) ||
        (matching.minimum !== undefined &&
          matching.maximum !== undefined &&
          n >= matching.minimum &&
          n <= matching.maximum))
    );
  }
  const exact = (a: string) => {
    const chemicalTokens = a.match(/\b(?:[A-Z][a-z]?)(?:[A-Z][a-z]?|\d+)+(?:\([^)]*\))?/g) ?? [];
    return (
      chemicalTokens.every((token) => value.normalize('NFKC').includes(token.normalize('NFKC'))) &&
      normalizeHistoricalRecallText(a, matching?.kind === 'text' && matching.caseSensitive === true) ===
        response
    );
  };
  if (matching?.kind === 'concepts') {
    if (alternatives.some(exact)) return true;
    const phrase = (p: string) => {
      const normalized = normalizeHistoricalRecallText(p);
      return (' ' + response.replace(/[^a-z0-9+-]+/g, ' ') + ' ').includes(
        ' ' + normalized.replace(/[^a-z0-9+-]+/g, ' ') + ' ',
      );
    };
    if (matching.reject?.some(phrase) || !matching.all.every((group) => group.some(phrase)))
      return false;
    const expectedNegative = matching.all
      .flat()
      .some((p) => /\bnot\b/.test(normalizeHistoricalRecallText(p)));
    if (
      /\b(?:never|isn't|aren't|doesn't|cannot|can't|rather than|same spins)\b/.test(response) ||
      (!expectedNegative && /\b(?:not|no)\b/.test(response))
    )
      return false;
    // Approved concepts plus grammatical linking words only: unexplained additional claims are rejected.
    const permitted = new Set(
      (
        alternatives.join(' ') +
        ' ' +
        matching.all.flat().join(' ') +
        ' the a an it is are be to of in on with and then that this each electrons electron orbitals orbital molecule molecules polymers atoms atom holds hold must first before'
      )
        .toLowerCase()
        .match(/[a-z0-9+-]+/g),
    );
    return (response.match(/[a-z0-9+-]+/g) ?? []).every((word) => permitted.has(word));
  }
  return alternatives.some(exact);
}
export function historicalRecallFields(fact: RecallFact): readonly RecallField[] {
  return (
    fact.fields ?? [
      {
        id: 'answer',
        label: 'Answer',
        answer: fact.answer,
        accepted: fact.accepted ?? [],
        ...(fact.matching ? { matching: fact.matching } : {}),
      },
    ]
  );
}
export function markHistoricalRecallFact(fact: RecallFact, responses: Responses): boolean {
  const fields = historicalRecallFields(fact),
    groups = fact.answerGroups ?? fields;
  const values = fields.map((f) =>
    responses[f.id]?.kind === 'text' ? (responses[f.id] as { value: string }).value : '',
  );
  const match = (value: string, f: RecallField) =>
    matchesHistoricalRecall(value, f.answer, f.accepted, f.matching);
  function assign(
    v: readonly string[],
    g: readonly RecallField[],
    index = 0,
    used = new Set<number>(),
  ): boolean {
    if (index === v.length) return true;
    return g.some(
      (f, i) =>
        !used.has(i) && match(v[index]!, f) && assign(v, g, index + 1, new Set([...used, i])),
    );
  }
  if (fact.fieldOrder === 'any') return assign(values, groups);
  if (fact.fieldOrder === 'exceptions')
    return match(values[0]!, groups[0]!) && assign(values.slice(1), groups.slice(1));
  if (fact.fieldOrder === 'pairs')
    return (
      values.every((v, i) => match(v, groups[i]!)) ||
      values.every((v, i) => match(v, groups[(i + 2) % 4]!))
    );
  return fields.every((f, i) => match(values[i]!, f));
}

export function createHistoricalRecallMarkingPolicy(facts: readonly RecallFact[]): MarkingPolicy {
  const byId = new Map(facts.map((f) => [f.course + ':' + f.id, f]));
  return {
    id: 'typed-recall-reviewed-v1',
    mark(question, responses) {
      const fact = byId.get(question.ref.activityId.split('/')[0] + ':' + question.ref.questionId);
      if (!fact)
        return {
          accepted: false,
          issues: [{ partId: 'answer', message: 'This approved recall fact is unavailable.' }],
        };
      const fields = historicalRecallFields(fact);
      const missing = fields.filter(
        (f) =>
          responses[f.id]?.kind !== 'text' || !(responses[f.id] as { value: string }).value.trim(),
      );
      if (missing.length)
        return {
          accepted: false,
          issues: missing.map((f) => ({
            partId: f.id,
            message: 'Enter each required answer before checking.',
          })),
        };
      const correct = markHistoricalRecallFact(fact, responses);
      const points = fields.map((f) => ({
        partId: f.id,
        pointId: f.id,
        earned: correct ? 1 : 0,
        available: 1,
        message: correct ? 'Correct.' : 'Compare all required facts with the ideal answer.',
      }));
      return {
        accepted: true,
        marks: { earned: correct ? fields.length : 0, available: fields.length, points },
      };
    },
    masteryScore: (marks) => (marks.earned === marks.available ? 1 : 0),
  };
}
