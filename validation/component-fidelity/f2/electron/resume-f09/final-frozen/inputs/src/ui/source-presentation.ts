import type { Question, Responses } from '../contracts/question.ts';
import type { record as practicalRecord } from '../activities/igcse/energetics-practical/provider.ts';
import type { CalculationBlock } from '../chemistry/thermochemistry/types.ts';

import { sourceFamilies } from './source-family.ts';
export interface SourceField {
  label: string;
  model?: string;
  feedback?: string;
  symbol?: string;
  multiline?: boolean;
  count?: number;
}
export interface SourcePresentation {
  family: string;
  fields: Readonly<Record<string, SourceField>>;
  practical?: ReturnType<typeof practicalRecord>;
  calculations?: readonly (readonly CalculationBlock[])[];
  feedback?: string;
  modelResponses?: Responses;
}
async function loadSourcePresentation(question: Question): Promise<SourcePresentation> {
  const family = sourceFamilies[question.ref.activityId] ?? 'generic';
  const fields: Record<string, SourceField> = {};
  const base = { family, fields };
  if (family === 'practical') {
    const { record: practicalRecord } = await import(
      '../activities/igcse/energetics-practical/provider.ts'
    );
    const practical = practicalRecord(question.ref.questionId);
    for (const field of practical.fields)
      fields[field.id] = {
        label: field.label,
        model: field.model,
        ...(field.feedback ? { feedback: field.feedback } : {}),
        multiline: !!(field as typeof field & { multiline?: boolean }).multiline,
        count: field.multiselect ? (field.selectCount ?? field.answers.length) : 1,
      };
    if (practical.correction && practical.fields[0])
      fields.correction = fields[practical.fields[0].id]!;
    return { ...base, practical };
  }
  if (family === 'acid') {
    const { acidSourceQuestion, acidNotation } = await import(
      '../activities/alevel/acid-base-calculations/provider.ts'
    );
    const source = acidSourceQuestion(question.ref);
    for (const field of source.responses)
      fields[field.key] = { label: acidNotation(field.prompt), symbol: acidNotation(field.symbol) };
  }
  if (family === 'calorimetry' || family === 'bond') {
    const source =
      family === 'calorimetry'
        ? (await import('../activities/igcse/calorimetry/provider.ts')).calorimetrySource(
            question.ref.questionId,
          )
        : (await import('../activities/igcse/bond-enthalpy/provider.ts')).bondSource(
            question.ref.questionId,
          );
    for (const [i, field] of source.responses.entries())
      fields[field.key] = { label: source.parts[i] ?? field.accessibleLabel, symbol: field.symbol };
    return { ...base, calculations: source.answerParts };
  }
  if (family === 'energy') {
    const { record: energyRecord } = await import(
      '../activities/igcse/energy-enthalpy/provider.ts'
    );
    const source = energyRecord(question.ref.questionId);
    source.fields?.forEach((field, i) => {
      const part = question.parts[i];
      if (part)
        fields[part.id] = {
          label: field.label,
          model: field.accept[0] ?? '',
          feedback: source.points[i] ?? source.feedback,
        };
    });
    const modelResponses = source.editor
      ? { profile: (await import('../chemistry/energy-profile/index.ts')).modelProfile(source) }
      : undefined;
    return { ...base, feedback: source.feedback, ...(modelResponses ? { modelResponses } : {}) };
  }
  if (family === 'electron') {
    const { getVariant } = await import('../chemistry/electron-configuration/identity.ts');
    const { referenceState, blankState } = await import(
      '../chemistry/electron-configuration/engine.ts'
    );
    const { data } = await import('../chemistry/electron-configuration/data.js');
    const { same } = await import('../chemistry/electron-configuration/core.js');
    const variant = getVariant(question.ref.questionId);
    const model =
      variant.kind === 'main'
        ? referenceState(variant.speciesId, variant.representation)
        : {
            ...blankState(),
            selectedSpeciesIds: variant.options.filter((id) =>
              same(data.species.find((item) => item.id === id)!.counts, variant.counts),
            ),
          };
    return { ...base, modelResponses: { configuration: model } };
  }
  if (family === 'titration') {
    const { getRecord } = await import('../activities/alevel/ph-titration-curves/provider.ts');
    const { answer } = await import('../chemistry/titration-curve/core.js');
    return {
      ...base,
      modelResponses: {
        curve: { kind: 'titration-curve', ...answer(getRecord(question.ref.questionId)) },
      },
    };
  }
  if (family === 'bonding') {
    const { bondingRecord } = await import('../activities/alevel/electrons-bonding/provider.ts');
    const source = bondingRecord(question.ref.questionId);
    source.fields.forEach((field, i) => {
      const part = question.parts[i];
      if (part)
        fields[part.id] = {
          label: field.label,
          multiline: true,
          model: source.sourceAnswer,
          feedback: source.points[i] ?? source.feedback,
        };
    });
    return { ...base, feedback: source.feedback };
  }
  return base;
}
const presentations = new WeakMap<Question, Promise<SourcePresentation>>();
export function sourcePresentation(question: Question): Promise<SourcePresentation> {
  let value = presentations.get(question);
  if (!value) {
    value = loadSourcePresentation(question);
    presentations.set(question, value);
  }
  return value;
}
