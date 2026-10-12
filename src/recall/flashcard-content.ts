import type { RecallEntry, RecallFact, RecallField } from '../contracts/recall.ts';
export interface FlashcardModelRow {
  readonly label: string;
  readonly value: string;
  readonly entry?: RecallEntry;
}
export interface FlashcardModel {
  readonly summary: string | null;
  readonly rows: readonly FlashcardModelRow[];
}
export function flashcardAnswerValue(field: Pick<RecallField, 'answer' | 'entry'>): string {
  return field.entry?.kind === 'choice'
    ? (field.entry.options.find((option) => option.id === field.answer)?.label ?? field.answer)
    : field.answer;
}
/** Display authored models, never matching payloads or response option IDs. */
export function flashcardModel(fact: RecallFact): FlashcardModel {
  const fields = fact.fields ?? [];
  const modelPairs = fact.modelAnswerPairId ? fact.answerPairs?.filter(pair => pair.id === fact.modelAnswerPairId) : fact.answerPairs;
  if (fact.modelAnswerPairId && !modelPairs?.length) throw Error('Unknown authored model pair');
  const rows: FlashcardModelRow[] = modelPairs?.length
    ? modelPairs.flatMap((pair, i) =>
        pair.fields.map((field) => ({
          label: (fact.pairCoverage === 'one' && !fact.modelAnswerPairId ? 'Option ' + (i + 1) + ' · ' : '') + field.label,
          value: flashcardAnswerValue(field),
          ...(field.entry ? { entry: field.entry } : {}),
        })),
      )
    : fields.map((field) => ({
        label: field.label,
        value: flashcardAnswerValue(field),
        ...(field.entry ? { entry: field.entry } : {}),
      }));
  if (fact.exceptionCollection)
    rows.push({
      label: 'Exceptions',
      value: fact.exceptionCollection.groups.length
        ? fact.exceptionCollection.groups.map((f) => flashcardAnswerValue(f)).join('; ')
        : 'None in this classroom rule',
    });
  const generated = fields.map((f) => f.label + ': ' + f.answer).join('\n');
  return {
    summary: !rows.length
      ? flashcardAnswerValue(fact)
      : fact.answer === generated && !fact.exceptionCollection
        ? null
        : fact.answer,
    rows,
  };
}
