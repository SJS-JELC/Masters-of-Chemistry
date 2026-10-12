import type {
  RecallFact,
  RecallField,
  RecallMatching,
  RecallFieldOutcome,
  RecallFactOutcome,
} from '../contracts/recall.ts';
import type { MarkingPolicy, Responses, RawMarks } from '../contracts/question.ts';
import type { LearningReviewPolicy } from '../contracts/attempt.ts';
import { decodeRecallExceptionEntries, recallAlternativeEligible } from './compatibility.ts';
import {
  createHistoricalRecallMarkingPolicy,
  markHistoricalRecallFact,
} from './historical-marking.ts';

/** Normalise notation, preserving element case, grouping, counts and signed charge. */
export function normalizeRecallChemical(value: string): string {
  const normalized = value.normalize('NFKC').replace(/[−–]/g, '-').replace(/[\s^]/g, '');
  return /^CnH/.test(normalized)
    ? normalized
    : normalized
        .replace(/([+-])1$/, '$1')
        .replace(/([+-])([2-9])$/, '$2$1')
        .replace(/(?<!\d)1([+-])$/, '$1');
}
export function normalizeRecallText(value: string, caseSensitive = false): string {
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
  const fraction = s.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*\/\s*((?:\d+(?:\.\d*)?|\.\d+))$/);
  return fraction && Number(fraction[2]) !== 0 ? Number(fraction[1]) / Number(fraction[2]) : null;
}
function containsPhrase(response: string, phrase: string): boolean {
  const tokens = (s: string) => s.replace(/[^a-z0-9+-]+/g, ' ');
  return (' ' + tokens(response) + ' ').includes(' ' + tokens(normalizeRecallText(phrase)) + ' ');
}
export function matchesRecall(
  value: string,
  answer: string,
  accepted: readonly string[] = [],
  matching?: RecallMatching,
): boolean {
  const alternatives = [answer, ...accepted];
  if (matching?.kind === 'chemical') {
    const response = normalizeRecallChemical(value);
    return !!response && alternatives.some((a) => normalizeRecallChemical(a) === response);
  }
  const response = normalizeRecallText(
    value,
    matching?.kind === 'text' && matching.caseSensitive === true,
  );
  if (!response) return false;
  if (matching?.kind === 'numeric') {
    const unitPattern =
      matching.unit === '°C'
        ? /(?:°\s*C|degrees?\s+celsius)$/i
        : matching.unit === 'atm'
          ? /(?:atm|atmospheres)$/i
          : matching.unit === '%'
            ? /%$/
            : null;
    const input = unitPattern ? value.trim().replace(unitPattern, '').trim() : value;
    if (alternatives.some((a) => normalizeRecallText(a) === response)) return true;
    const n = numberValue(input);
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
      normalizeRecallText(a, matching?.kind === 'text' && matching.caseSensitive === true) ===
        response
    );
  };
  if (matching?.kind !== 'concepts') return alternatives.some(exact);
  if (alternatives.some(exact)) return true;
  if (matching.reject?.some((p) => containsPhrase(response, p))) return false;
  const expectedNegative = matching.all.flat().some((p) => /\bnot\b/.test(normalizeRecallText(p)));
  if (
    /\b(?:never|isn't|aren't|doesn't|cannot|can't|rather than|same spins)\b/.test(response) ||
    (!expectedNegative && /\b(?:not|no)\b/.test(response))
  )
    return false;
  if (
    !matching.all.every((group) =>
      group.some((p) =>
        containsPhrase(response.replace(/positively charged nuclei/g, 'positive nuclei'), p),
      ),
    )
  )
    return false;
  // Complete approved grammar carries its own permitted linking words. Do not apply a word bag to it.
  if (matching.patterns)
    return matching.patterns.some((pattern) => new RegExp(pattern, 'i').test(response));
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
export function recallFields(fact: RecallFact): readonly RecallField[] {
  return (
    fact.fields ?? [
      {
        id: 'answer',
        label: 'Answer',
        answer: fact.answer,
        accepted: fact.accepted ?? [],
        ...(fact.matching ? { matching: fact.matching } : {}),
        ...(fact.entry ? { entry: fact.entry } : {}),
        ...(fact.alternative ? { alternative: fact.alternative } : {}),
      },
    ]
  );
}
function raw(responses: Responses, id: string): string {
  const r = responses[id];
  return r?.kind === 'text' ? r.value : '';
}
function matchField(value: string, field: RecallField): boolean {
  if (field.entry?.kind === 'choice') {
    const option = field.entry.options.find((o) => o.id === value);
    return !!option && matchesRecall(option.label, field.answer, field.accepted, field.matching);
  }
  if (field.entry?.kind === 'signed-charge' && field.entry.requireSign && !/[+−-]/.test(value))
    return false;
  return matchesRecall(value, field.answer, field.accepted, field.matching);
}
/** Maximum distinct assignment, with stable first-entry tie breaking. */
function assignment<T>(
  items: readonly T[],
  groupCount: number,
  score: (item: T, group: number) => number,
): number[] {
  if (groupCount > 30) throw Error('Recall distinct assignment exceeds the supported group bound.');
  const memo = new Map<string, { total: number; picks: number[] }>();
  function solve(i: number, used: number): { total: number; picks: number[] } {
    if (i === items.length) return { total: 0, picks: [] };
    const key = i + ':' + used,
      cached = memo.get(key);
    if (cached) return cached;
    let best = { total: -1, picks: [] as number[] };
    for (let g = 0; g < groupCount; g++)
      if (!(used & (1 << g))) {
        const n = score(items[i]!, g);
        if (n <= 0) continue;
        const tail = solve(i + 1, used | (1 << g));
        if (n + tail.total > best.total)
          best = { total: n + tail.total, picks: [g, ...tail.picks] };
      }
    const tail = solve(i + 1, used);
    if (tail.total > best.total) best = { total: tail.total, picks: [-1, ...tail.picks] };
    memo.set(key, best);
    return best;
  }
  return solve(0, 0).picks;
}
/** Review is for a supported positive assertion, not a second judgement of additional claims. */
function supportedReviewWording(field: RecallField, text: string): boolean {
  const prose = text.replace(/[\u2018\u2019]/g, "'");
  // Eligible models state positive observations/definitions. A negated or qualified denial is
  // not an ambiguous paraphrase, even if it repeats every required concept elsewhere.
  if (
    /\b(?:without|lack|lacks|lacking|absence|absent|neither|nor|nothing|except|unless|unable|cannot|never|not|no)\b|\b(?:do|does|did|is|are|was|were|ca|could|wo|would|should|has|have|had)n'?t\b/.test(
      prose,
    )
  )
    return false;
  // Contrast/condition clauses need substantive marking, which this student override cannot supply.
  if (
    /\b(?:although|though|despite|however|but|whereas|instead|otherwise|if)\b|\beven though\b|\brather than\b/.test(
      prose,
    )
  )
    return false;
  if (
    /[;,]|\band\s+(?:(?:a|an|the)\s+)?(?:it|they|electrons?|nuclei|ions?|attraction|metal|solid|bead|ball)\b.*\b(?:is|are|has|have|remains?|stays?|becomes?)\b/.test(
      prose,
    )
  )
    return false;
  const source = normalizeRecallText(field.answer);
  if (/lit splint/.test(source)) {
    // One test action at the gas opening; this does not grant review to a glowing/unlit splint.
    return /^(?:(?:carefully |gently )?(?:hold|bring|put|place|position|introduce|insert) (?:a |the )?)(?:lit|lighted|burning) splint (?:at|to|into|just inside|close to|near) (?:the |a )?(?:mouth|opening) of (?:the |a )?test tube$/.test(prose);
  }
  if (/squeaky pop/.test(source)) {
    if (/^(?:(?:a |an |the )?(?:short |audible |distinct )?squeaky pop (?:is |can be )?(?:heard|produced)|(?:you )?hear (?:a |an |the )?(?:short |audible |distinct )?squeaky pop)$/.test(prose)) return true;
  }
  // Relationship reviews must contain exactly one supported assertion. A concept/word
  // inventory cannot distinguish another "between" clause or like-charge relationship.
  if (/electrostatic/.test(source) && field.matching?.kind === 'concepts') {
    const assertion = prose.replace(/^(?:there is|it is|this is|that is)\s+/, '');
    if (!field.matching.patterns?.some((pattern) => new RegExp(pattern).test(assertion)))
      return false;
  }
  // The whole melting observation must be a single predicate with its resulting shape.
  // Repeating melt/solid words in a second clause cannot establish equivalent wording.
  if (/melts|molten/.test(source)) {
    const assertion = prose.replace(/^(?:there is|it is|this is|that is)\s+/, '');
    if (
      !/^(?:(?:the )?(?:solid|sodium|metal) )?(?:(?:melts?|liquefies) (?:into|to form) (?:a )?(?:spherical |round )?(?:ball|bead)|forms? (?:a )?molten (?:spherical |round )?(?:ball|bead))$/.test(
        assertion,
      )
    )
      return false;
  }
  if (
    /melts|molten/.test(source) &&
    /\b(?:is|are|stays?|remains?|still)\s+(?:a\s+)?solid\b/.test(prose)
  )
    return false;
  const documented = [
    source,
    ...field.accepted,
    ...(field.matching?.kind === 'concepts'
      ? [...field.matching.all.flat(), ...(field.matching.patterns ?? [])]
      : []),
  ].join(' ');
  const grammar =
    'a an the and of in on at to with between from into as by for is are be being it its they their this that these those there has have which that';
  // Only bounded, chemically compatible paraphrase vocabulary is added to the documented concepts.
  // Arbitrary new technical terms or assertions cannot be made eligible by sharing one model noun.
  const paraphrase = /melts|molten/.test(source)
    ? 'liquefies liquid spherical round bead becomes'
    : /fizz/.test(source)
      ? 'tiny small released release appear appears'
      : /moves/.test(source)
        ? 'moving movement'
        : /shrinks/.test(source)
          ? 'shrinking disappearing smaller gradually'
          : /cloudy/.test(source)
            ? 'cloudiness milkiness opaque opacity becomes develops'
            : /pop/.test(source)
              ? 'popping heard audible makes emits'
              : /bleaches/.test(source)
                ? 'bleached bleaching whitened becomes'
                : /flame/.test(source)
                  ? 'coloured colored colour color'
                  : /giant (?:ionic|metallic)/.test(source)
                    ? 'arrangement arranged array crystal crystalline consisting consists'
                    : /petrol/.test(source)
                      ? 'used use fuels powering powers powered'
                      : /microbes/.test(source)
                        ? 'converts convert converting oxidise oxidize oxidation atmospheric'
                        : '';
  const vocabulary = new Set(
    normalizeRecallText(documented + ' ' + grammar + ' ' + paraphrase).match(/[a-z0-9]+/g) ?? [],
  );
  return (prose.match(/[a-z0-9]+/g) ?? []).every((word) => vocabulary.has(word));
}
function relevantUnrecognized(field: RecallField, value: string): boolean {
  const text = normalizeRecallText(value),
    source = normalizeRecallText(field.answer);
  if (
    !/[a-z]/.test(text) ||
    text.length < 8 ||
    text.length > 600 ||
    !supportedReviewWording(field, text) ||
    /\b(?:not|no|never|cannot|can't|doesn't|isn't|incorrect|wrong|repulsion|repel|neutrons|similarly|same|glowing|unlit|yeast|explodes|burns|fire|catches|anaerobic)\b/.test(
      text,
    )
  )
    return false;
  if (/\bburning\b/.test(text) && !/lit splint/.test(source)) return false;
  // Known additional chemistry claims are excluded from a wording-only review.
  const scientificTerms = [
    'ionic',
    'ions',
    'covalent',
    'metallic',
    'molecular',
    'intermolecular',
    'intramolecular',
    'nuclei',
    'electrons',
    'protons',
    'neutrons',
    'shared',
    'delocalised',
    'delocalized',
    'positive',
    'negative',
    'single',
    'double',
    'triple',
    'bonds',
    'charged',
    'melts',
    'molten',
    'flame',
    'precipitate',
    'cloudy',
    'clear',
    'hydrogen',
    'oxygen',
    'carbon',
    'nitrogen',
    'sodium',
    'lithium',
    'lead',
    'silver',
    'barium',
    'calcium',
    'limewater',
    'litmus',
    'acid',
    'alkali',
    'heat',
    'freezes',
    'boils',
  ];
  const documented = [
    source,
    ...field.accepted,
    ...(field.matching?.kind === 'concepts'
      ? [...field.matching.all.flat(), ...(field.matching.patterns ?? [])]
      : []),
  ]
    .join(' ')
    .toLowerCase();
  if (scientificTerms.some((term) => containsPhrase(text, term) && !documented.includes(term)))
    return false;
  const allowedColors = new Set(
    [source, ...field.accepted.map((a) => normalizeRecallText(a))]
      .join(' ')
      .match(/\b(?:red|orange|yellow|green|blue|purple|lilac|white|black|colourless|colorless)\b/g),
  );
  if (
    [
      'red',
      'orange',
      'yellow',
      'green',
      'blue',
      'purple',
      'lilac',
      'white',
      'black',
      'colourless',
      'colorless',
    ].some((c) => containsPhrase(text, c) && !allowedColors.has(c))
  )
    return false;
  if (/melts|molten/.test(source))
    return (
      /\b(?:melts?|molten|liquefies)\b/.test(text) && /\b(?:ball|spherical|round|bead)\b/.test(text)
    );
  if (/simple molecular/.test(source) && /\b(?:giant|ionic|metallic|lattice)\b/.test(text))
    return false;
  if (
    /intermolecular/.test(source) &&
    /\b(?:intramolecular|ionic|covalent|metallic|atoms)\b/.test(text)
  )
    return false;
  if (field.matching?.kind === 'concepts') {
    if (field.matching.reject?.some((p) => containsPhrase(text, p))) return false;
    // Every required concept is necessary; complete-grammar matching stays stricter than review.
    return field.matching.all.every((g) => g.some((p) => containsPhrase(text, p)));
  }
  // Explicit semantic anchors for opted-in ordinary prose; generic nouns cannot enable review.
  const colorWords = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'purple',
    'lilac',
    'white',
    'black',
    'colourless',
    'colorless',
  ];
  if (colorWords.some((c) => containsPhrase(text, c) && !allowedColors.has(c))) return false;
  if (/fizz/.test(source)) return /\b(?:fizz\w*|bubbles?|bubbling|effervescence)\b/.test(text);
  if (/moves/.test(source))
    return /\bmov\w*\b/.test(text) && /\bwater\b/.test(text) && /\bsurface\b/.test(text);
  if (/shrinks/.test(source)) return /\b(?:shrink\w*|disappear\w*|smaller)\b/.test(text);
  if (/cloudy/.test(source))
    return (
      /\b(?:cloudy|milky|white precipitate)\b/.test(text) &&
      !/\b(?:clear|transparent|dissolves)\b/.test(text)
    );
  if (/pop/.test(source)) return /\bpop\w*\b/.test(text);
  if (/bleaches/.test(source)) return /\b(?:bleach\w*|white)\b/.test(text);
  if (/flame/.test(source))
    return [...allowedColors].some((c) => containsPhrase(text, c)) && /\bflame\b/.test(text);
  if (/giant ionic/.test(source))
    return (
      /\bgiant\b/.test(text) &&
      /\bionic\b/.test(text) &&
      /\blattice\b/.test(text) &&
      !/\b(?:metallic|molecular|covalent)\b/.test(text)
    );
  if (/giant metallic/.test(source))
    return (
      /\bgiant\b/.test(text) &&
      /\bmetallic\b/.test(text) &&
      /\blattice\b/.test(text) &&
      !/\b(?:ionic|molecular|covalent)\b/.test(text)
    );
  if (/petrol/.test(source)) return /\b(?:petrol|fuel)\b/.test(text) && /\bcars?\b/.test(text);
  if (/microbes/.test(source))
    return /\b(?:microbes?|bacteria|microorganisms?)\b/.test(text) && /\bair\b/.test(text);
  return false;
}
function outcome(
  field: RecallField,
  value: string,
  correct: boolean,
  reject = false,
): RecallFieldOutcome {
  const classification = correct
    ? 'accepted'
    : !value.trim()
      ? 'empty'
      : reject ||
          (field.entry?.kind !== 'text' && field.entry !== undefined) ||
          !relevantUnrecognized(field, value)
        ? 'rejected'
        : 'unrecognized';
  const alternativeEligible = recallAlternativeEligible(
    field,
    value,
    'assessed',
    correct,
    classification === 'unrecognized' ? 'unrecognized' : 'rejected',
  );
  return {
    fieldId: field.id,
    partId: field.id,
    correct,
    classification,
    alternativeEligible,
    message: correct
      ? 'Correct.'
      : classification === 'empty'
        ? 'Enter an answer.'
        : alternativeEligible
          ? 'Wording not recognised. Compare it with the model.'
          : 'Check your response against the model.',
  };
}
export function markRecallFactFields(fact: RecallFact, responses: Responses): RecallFactOutcome {
  const fields = recallFields(fact),
    groups = fact.answerGroups ?? fields;
  if (fact.course === 'alevel') {
    const correct = markHistoricalRecallFact(fact, responses);
    return {
      correct,
      fields: fields.map((f) => outcome(f, raw(responses, f.id), correct, true)),
      missingGroupIds: [],
    };
  }
  let results: RecallFieldOutcome[] = [];
  if (fact.fieldOrder === 'any') {
    const picks = assignment(fields, groups.length, (f, g) =>
      matchField(raw(responses, f.id), groups[g]!) ? 1 : 0,
    );
    results = fields.map((f, i) => {
      const g = picks[i]!;
      const result = outcome(
        f,
        raw(responses, f.id),
        g >= 0,
        groups.some((x) => matchField(raw(responses, f.id), x)),
      );
      return g >= 0 ? { ...result, matchedGroupId: groups[g]!.id } : result;
    });
  } else if (fact.fieldOrder === 'pairs' && fact.responsePairs && fact.answerPairs) {
    const pairs = fact.answerPairs;
    // Matching a method anchors its result; crossed columns never form a successful tuple.
    const picks = assignment(fact.responsePairs, pairs.length, (p, g) => {
      const fs = pairs[g]!.fields;
      return matchField(raw(responses, p.fieldIds[0]!), fs[0]!)
        ? fs.length +
            fs.slice(1).filter((f, i) => matchField(raw(responses, p.fieldIds[i + 1]!), f)).length
        : 0;
    });
    fact.responsePairs.forEach((p, i) =>
      p.fieldIds.forEach((id, j) => {
        const f = fields.find((f) => f.id === id)!;
        const g = picks[i]!;
        const correct = g >= 0 && matchField(raw(responses, id), pairs[g]!.fields[j]!);
        results.push({
          ...outcome(f, raw(responses, id), correct, true),
          ...(g >= 0 ? { matchedPairId: pairs[g]!.id } : {}),
        });
      }),
    );
  } else
    results = fields.map((f) =>
      outcome(f, raw(responses, f.id), matchField(raw(responses, f.id), f)),
    );
  const missingGroupIds: string[] = [];
  const collection = fact.exceptionCollection;
  if (collection) {
    let entries: readonly { id: string; value: string }[] = [];
    let malformed = false;
    try {
      entries = decodeRecallExceptionEntries(raw(responses, collection.id));
    } catch {
      malformed = true;
    }
    const picks = assignment(entries, collection.groups.length, (e, g) =>
      matchField(e.value, collection.groups[g]!) ? 1 : 0,
    );
    entries.forEach((e, i) => {
      const g = picks[i]!;
      results.push({
        ...outcome(
          { id: e.id, label: e.id, answer: '', accepted: [], entry: { kind: 'text' } },
          e.value,
          g >= 0,
          true,
        ),
        partId: collection.id,
        ...(g >= 0 ? { matchedGroupId: collection.groups[g]!.id } : {}),
      });
    });
    collection.groups.forEach((g, i) => {
      if (!picks.includes(i)) missingGroupIds.push(g.id);
    });
    if (malformed || missingGroupIds.length || (!entries.length && !collection.groups.length))
      results.push({
        fieldId: collection.id,
        partId: collection.id,
        correct: !malformed && !missingGroupIds.length,
        classification: !malformed && !missingGroupIds.length ? 'accepted' : 'rejected',
        alternativeEligible: false,
        message: malformed
          ? 'Enter exceptions using the collection controls.'
          : missingGroupIds.length
            ? 'One or more required exceptions are missing.'
            : 'Correct: no exceptions.',
      });
  }
  return {
    correct: results.length > 0 && results.every((f) => f.correct) && !missingGroupIds.length,
    fields: results,
    missingGroupIds,
  };
}
export function markRecallFact(fact: RecallFact, responses: Responses): boolean {
  return markRecallFactFields(fact, responses).correct;
}
function marksFor(fact: RecallFact, responses: Responses): RawMarks {
  const fields = recallFields(fact),
    result = markRecallFactFields(fact, responses);
  const points = result.fields.map((r) => {
    const f = fields.find((f) => f.id === r.fieldId);
    return {
      partId: r.partId,
      pointId: r.fieldId,
      earned: r.correct ? 1 : 0,
      available: 1,
      message: r.message,
      ...(r.classification === 'unrecognized'
        ? { textClassification: 'unrecognized' as const }
        : {}),
      ...(r.alternativeEligible && f
        ? {
            learningReview: {
              kind: 'valid-alternative' as const,
              modelAnswer: f.answer,
              rubric: [
                {
                  kind: 'text' as const,
                  text: f.alternative?.kind === 'valid-alternative' ? f.alternative.guidance : '',
                },
              ],
              eligible: true,
            },
          }
        : {}),
    };
  });
  return { earned: points.reduce((s, p) => s + p.earned, 0), available: points.length, points };
}
export function createRecallMarkingPolicy(facts: readonly RecallFact[]): MarkingPolicy {
  const byId = new Map(facts.map((f) => [f.course + ':' + f.id, f]));
  const historical = createHistoricalRecallMarkingPolicy(facts);
  return {
    id: 'typed-recall-reviewed-v1',
    mark(question, responses) {
      const fact = byId.get(question.ref.activityId.split('/')[0] + ':' + question.ref.questionId);
      if (!fact)
        return {
          accepted: false,
          issues: [{ partId: 'answer', message: 'This approved recall fact is unavailable.' }],
        };
      if (fact.course === 'alevel') return historical.mark(question, responses);
      const missing = recallFields(fact)
        .filter((f) => !raw(responses, f.id).trim())
        .map((f) => ({ partId: f.id, message: 'Enter each required answer before checking.' }));
      if (fact.exceptionCollection) {
        try {
          const entries = decodeRecallExceptionEntries(raw(responses, fact.exceptionCollection.id));
          if (entries.some((e) => !e.value.trim()))
            missing.push({
              partId: fact.exceptionCollection.id,
              message: 'Complete or remove each added exception before checking.',
            });
        } catch {
          missing.push({
            partId: fact.exceptionCollection.id,
            message: 'Use Add exception or check with no exceptions.',
          });
        }
      }
      return missing.length
        ? { accepted: false, issues: missing }
        : { accepted: true, marks: marksFor(fact, responses) };
    },
    masteryScore: (marks) => (marks.earned === marks.available ? 1 : 0),
  };
}
export function createRecallLearningReviewPolicy(
  facts: readonly RecallFact[],
): LearningReviewPolicy {
  const byId = new Map(facts.map((f) => [f.course + ':' + f.id, f]));
  return {
    review(question, firstResponse, assessment, currentResponses, decisions) {
      const fact = byId.get(question.ref.activityId.split('/')[0] + ':' + question.ref.questionId);
      if (!fact || fact.course !== 'igcse' || assessment.kind !== 'marked')
        throw Error('Recall review is unavailable.');
      const eligible = new Map(
        markRecallFactFields(fact, firstResponse.responses)
          .fields.filter((f) => !f.correct && f.alternativeEligible)
          .map((f) => [f.fieldId, f]),
      );
      const keys = new Set<string>();
      for (const d of decisions) {
        const key = d.partId + ':' + d.pointId;
        const f = eligible.get(d.pointId);
        if (
          !f ||
          f.partId !== d.partId ||
          keys.has(key) ||
          !['student', 'teacher'].includes(d.reviewer) ||
          !['equivalent', 'not-equivalent'].includes(d.judgement)
        )
          throw Error('This recall field is not eligible for wording review.');
        if (raw(currentResponses, d.partId) !== raw(firstResponse.responses, d.partId))
          throw Error('Review the originally submitted wording.');
        keys.add(key);
      }
      const points = assessment.marks.points.map((p) =>
        decisions.some(
          (d) => d.partId === p.partId && d.pointId === p.pointId && d.judgement === 'equivalent',
        )
          ? {
              ...p,
              earned: p.available,
              message: 'Marked as correct for learning; original automatic result is unchanged.',
            }
          : p,
      );
      return {
        kind: 'post-assessment-learning',
        decisions: [...decisions],
        reviewedMarks: {
          earned: points.reduce((s, p) => s + p.earned, 0),
          available: assessment.marks.available,
          points,
        },
      };
    },
  };
}
