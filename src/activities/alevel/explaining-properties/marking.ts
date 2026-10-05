import type { MarkingPolicy, MarkPointResult } from '../../../contracts/index.ts';
import { propertiesRecord, correctionSegments, correctedSentence } from './provider.ts';
/** Typography normalization only. No substring, keyword or fuzzy matching. */
export function normalizeProperties(text: string): string {
  const superscripts: Record<string, string> = {
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
    '⁺': '+',
    '⁻': '-',
  };
  return text
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/g, (char) => superscripts[char]!)
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/\s*([+-])\s*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!]$/, '');
}
const equivalent = (answer: string, accepted: readonly string[]) =>
  accepted.some((value) => normalizeProperties(value) === normalizeProperties(answer));
export const propertiesMarking: MarkingPolicy = {
  id: 'properties-curated',
  mark(question, responses) {
    const record = propertiesRecord(question.ref.questionId),
      points: MarkPointResult[] = [];
    const message = 'Correct explanation: ' + correctedSentence(record);
    for (const part of question.parts) {
      const response = responses[part.id];
      if (part.kind === 'text') {
        if (
          response?.kind !== 'text' ||
          typeof response.value !== 'string' ||
          !response.value.trim()
        )
          return {
            accepted: false,
            issues: [{ partId: part.id, message: 'Complete every gap before checking.' }],
          };
        points.push({
          partId: part.id,
          pointId: part.id,
          earned: equivalent(response.value, part.accepted) ? 1 : 0,
          available: 1,
          message:
            part === question.parts.at(-1)
              ? message
              : `${part.prompt[0]?.kind === 'text' ? part.prompt[0].text : part.id}: ${part.accepted[0]}.`,
        });
      } else if (part.kind === 'correction') {
        if (
          response?.kind !== 'correction' ||
          typeof response.replacement !== 'string' ||
          !response.replacement.trim() ||
          !Array.isArray(response.selections) ||
          response.selections.length !== 1
        )
          return {
            accepted: false,
            issues: [
              {
                partId: part.id,
                message: 'Select one displayed phrase and enter its replacement.',
              },
            ],
          };
        const range = response.selections[0]!,
          segments = correctionSegments(record);
        if (!range || typeof range !== 'object')
          return {
            accepted: false,
            issues: [{ partId: part.id, message: 'Select one displayed phrase.' }],
          };
        const valid = segments.some(
          (segment) =>
            range.start === segment.start &&
            range.end === segment.end &&
            range.text === segment.text,
        );
        if (!valid)
          return {
            accepted: false,
            issues: [
              { partId: part.id, message: 'Select a displayed phrase using the phrase controls.' },
            ],
          };
        const target = segments[record.errorIndex!]!;
        const selected = range.start === target.start && range.end === target.end;
        points.push({
          partId: part.id,
          pointId: 'selection',
          earned: selected ? 1 : 0,
          available: 1,
          message: 'The incorrect phrase is “' + target.text + '”.',
        });
        points.push({
          partId: part.id,
          pointId: 'replacement',
          earned: selected && equivalent(response.replacement, record.answers[0]!) ? 1 : 0,
          available: 1,
          message,
        });
      } else throw Error('Unsupported properties response part.');
    }
    return {
      accepted: true,
      marks: {
        earned: points.reduce((sum, p) => sum + p.earned, 0),
        available: points.reduce((sum, p) => sum + p.available, 0),
        points,
      },
    };
  },
  masteryScore: (marks) => (marks.earned === marks.available ? 1 : marks.earned > 0 ? 0.5 : 0),
};
