import type { Question } from '../contracts/question.ts';
import type { ComponentType } from 'react';
import type { EditorSurfaceProps } from '../ui/EditorFrame.tsx';
import type { BankRecord } from '../chemistry/dot-and-cross/types.ts';
import type { SourcePresentation } from '../ui/source-presentation.ts';
import { sourceFamilies } from '../ui/source-family.ts';

export interface PreparedQuestionTools {
  readonly standard?: boolean;
  readonly SourcePlayer?: typeof import('../ui/SourceQuestionPlayer.tsx').SourceQuestionPlayer;
  readonly sourcePresentation?: SourcePresentation;
  readonly DotPlayer?: typeof import('../ui/DotCrossPlayer.tsx').DotCrossPlayer;
  readonly dotRecord?: BankRecord;
  readonly ChemicalBody?: typeof import('../ui/ChemicalQuestionBody.tsx').ChemicalQuestionBody;
  readonly ChemicalAnswer?: typeof import('../ui/ChemicalQuestionBody.tsx').ChemicalWorkedAnswer;
  readonly ElectronReference?: typeof import('../editors/electron-configuration/index.tsx').ElectronConfigurationReference;
  readonly editors?: Partial<
    Record<
      'dot-and-cross' | 'titration-curve' | 'electron-configuration' | 'energy-profile',
      ComponentType<EditorSurfaceProps>
    >
  >;
  readonly rate?: {
    readonly ResponseControl: typeof import('../activities/alevel/rate-equations/RateResponseControl.tsx').RateResponseControl;
    readonly GraphWorkspace: typeof import('../activities/alevel/rate-equations/RateGraphWorkspace.tsx').RateGraphWorkspace;
  };
}

/** Imports only: no editor mounting, attempt identity, clocks or repository writes. */
export async function prepareQuestionTools(
  question: Question,
  options: { standard?: boolean } = {},
): Promise<PreparedQuestionTools> {
  const tools: { -readonly [K in keyof PreparedQuestionTools]: PreparedQuestionTools[K] } = {};
  if (options.standard) tools.standard = true;
  const pending: Promise<unknown>[] = [];
  if (!options.standard && question.ref.activityId === 'alevel/rate-equations')
    pending.push(
      Promise.all([
        import('../activities/alevel/rate-equations/RateResponseControl.tsx'),
        import('../activities/alevel/rate-equations/RateGraphWorkspace.tsx'),
      ]).then(([responses, graphs]) => {
        tools.rate = {
          ResponseControl: responses.RateResponseControl,
          GraphWorkspace: graphs.RateGraphWorkspace,
        };
      }),
    );
  if (!options.standard && sourceFamilies[question.ref.activityId])
    pending.push(
      Promise.all([
        import('../ui/SourceQuestionPlayer.tsx'),
        import('../ui/source-presentation.ts'),
      ]).then(async ([player, source]) => {
        tools.SourcePlayer = player.SourceQuestionPlayer;
        tools.sourcePresentation = await source.sourcePresentation(question);
      }),
    );
  if (question.chemicalPresentation)
    pending.push(
      import('../ui/ChemicalQuestionBody.tsx').then((module) => {
        tools.ChemicalBody = module.ChemicalQuestionBody;
        tools.ChemicalAnswer = module.ChemicalWorkedAnswer;
      }),
    );
  const kinds = new Set(question.parts.map((part) => part.kind));
  const editors: NonNullable<PreparedQuestionTools['editors']> = {};
  tools.editors = editors;
  if (kinds.has('dot-and-cross'))
    pending.push(
      import('../editors/dot-and-cross/index.ts').then(async (editor) => {
        editors['dot-and-cross'] = editor.DotCrossEditor;
        if (options.standard) return;
        tools.DotPlayer = (await import('../ui/DotCrossPlayer.tsx')).DotCrossPlayer;
        tools.dotRecord =
          question.ref.activityId === 'alevel/dot-and-cross'
            ? (await import('../activities/alevel/dot-and-cross/provider.ts')).getRecord(
                question.ref.questionId,
              )
            : (await import('../activities/igcse/dot-and-cross/types.ts')).referenceRecord(
                (await import('../activities/igcse/dot-and-cross/provider.ts')).getRecord(
                  question.ref.questionId,
                ),
              );
      }),
    );
  if (
    kinds.has('electron-configuration') ||
    (!options.standard && sourceFamilies[question.ref.activityId] === 'electron')
  )
    pending.push(
      import('../editors/electron-configuration/index.tsx').then((module) => {
        editors['electron-configuration'] = module.ElectronConfigurationEditor;
        tools.ElectronReference = module.ElectronConfigurationReference;
      }),
    );
  if (kinds.has('titration-curve'))
    pending.push(
      import('../editors/titration-curve/index.ts').then((module) => {
        editors['titration-curve'] = module.TitrationCurveEditor;
      }),
    );
  if (kinds.has('energy-profile'))
    pending.push(
      import('../editors/energy-profile/index.tsx').then((module) => {
        editors['energy-profile'] = module.EnergyProfileEditor;
      }),
    );
  pending.push(prepareQuestionAssets(question));
  await Promise.all(pending);
  return tools;
}

const assets = new Map<string, Promise<void>>();
/** Decode actual external question/answer images before their first visible use. */
export async function prepareQuestionAssets(question: Question): Promise<void> {
  if (typeof Image === 'undefined') return;
  const sources = new Set<string>();
  const visit = (value: unknown): void => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    const record = value as Record<string, unknown>;
    if (
      record.kind === 'image' &&
      typeof record.src === 'string' &&
      !record.src.startsWith('data:')
    )
      sources.add(record.src);
    Object.values(record).forEach(visit);
  };
  visit(question);
  await Promise.all(
    [...sources].map((src) => {
      let loading = assets.get(src);
      if (!loading) {
        loading = new Promise<void>((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            void image.decode().then(resolve, reject);
          };
          image.onerror = () => reject(Error('A required question image could not load.'));
          image.src = src;
        }).catch((error) => {
          assets.delete(src);
          throw error;
        });
        assets.set(src, loading);
      }
      return loading;
    }),
  );
}
