import type { ChemicalPresentation } from '../contracts/question.ts';

/** One title policy shared by both player presentations. */
export function chemicalQuestionTitle(presentation: ChemicalPresentation): string {
  switch (presentation.kind) {
    case 'formula':
      return `What is the formula of ${presentation.compoundName}?`;
    case 'equation-writing':
      return 'Give a balanced equation.';
    case 'equation-rows':
      return 'Complete each equation below.';
    case 'equation-row':
      return presentation.task === 'states'
        ? 'Add state symbols.'
        : presentation.task === 'balance-and-states'
          ? 'Balance the equation and add state symbols.'
          : 'Balance the equation.';
  }
}
