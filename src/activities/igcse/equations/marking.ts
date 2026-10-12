import type { MarkingPolicy, MarkPointResult } from '../../../contracts/index.ts';
import { equationsQuestion } from './provider.ts';
import {
  parseChemicalEquation,
  type EquationSpecies,
} from '../../../chemistry/formulae-equations/notation.ts';
import {
  parseResponseEquation,
  type ResponseEquationSpecies,
} from '../../../chemistry/formulae-equations/response-equation.ts';
import {
  parsePositiveCoefficient,
  parseParenthesizedState,
  rationalEquals,
  proportionalCoefficientVectors,
  type Rational,
} from '../../../chemistry/formulae-equations/answer-syntax.ts';
export const equationsMarking: MarkingPolicy = {
  id: 'equations-fixed-formulae-and-translation',
  mark(question, responses) {
    const q = equationsQuestion(question.ref);
    const missing = q.parts.filter((p) => {
      const r = responses[p.id];
      if (p.kind === 'numeric' && p.coefficientEntry && !r) return false;
      return (
        !r ||
        r.kind !== p.kind ||
        (r.kind === 'text' && !r.value.trim()) ||
        (p.kind === 'numeric' && r.kind === 'numeric' && !p.coefficientEntry && !r.raw.trim()) ||
        (r.kind === 'choice' && !r.selected.length)
      );
    });
    if (missing.length)
      return {
        accepted: false,
        issues: missing.map((p) => ({
          partId: p.id,
          message: 'Complete every required response before checking.',
        })),
      };
    const coefficients = q.parts.filter((p) => p.kind === 'numeric' && p.coefficientEntry);
    const actualCoefficients = coefficients.map((p) => {
      const r = responses[p.id];
      return parsePositiveCoefficient(r?.kind === 'numeric' ? r.raw : '', { blankIsOne: true });
    });
    const invalid = coefficients.filter((_p, i) => !actualCoefficients[i]);
    if (invalid.length)
      return {
        accepted: false,
        issues: invalid.map((p) => ({
          partId: p.id,
          message: 'Use a positive coefficient, such as 2, 0.5, 1/2 or ½. A blank means 1.',
        })),
      };
    const expectedCoefficients = coefficients.map((p) => {
      if (p.kind !== 'numeric' || p.acceptance.kind !== 'absolute')
        throw Error('Invalid coefficient model');
      return parsePositiveCoefficient(String(p.acceptance.expected))!;
    });
    const balancedVector = proportionalCoefficientVectors(
      actualCoefficients as Rational[],
      expectedCoefficients,
    );
    const points: MarkPointResult[] = [];
    for (const p of q.parts) {
      const r = responses[p.id];
      if (p.kind === 'text' && r?.kind === 'text') {
        const expected = parseChemicalEquation(p.accepted[0]!)!,
          actual = parseResponseEquation(r.value);
        const key = (
          side: readonly (EquationSpecies | ResponseEquationSpecies)[],
          states: boolean,
        ) =>
          side
            .map((s) => s.formula + (states ? '(' + s.state + ')' : ''))
            .sort()
            .join('+');
        const match = (states: boolean) =>
          !!actual &&
          (['reactants', 'products'] as const).every(
            (side) => key(actual[side], states) === key(expected[side], states),
          );
        const orderedActual: (Rational | null)[] = [],
          orderedExpected: Rational[] = [];
        if (actual && match(false))
          for (const side of ['reactants', 'products'] as const)
            for (const species of expected[side]) {
              orderedActual.push(
                actual[side].find((s) => s.formula === species.formula)!.coefficient,
              );
              orderedExpected.push(parsePositiveCoefficient(String(species.coefficient))!);
            }
        const balanced =
          orderedActual.length > 0 &&
          orderedActual.every((c) => c !== null) &&
          proportionalCoefficientVectors(orderedActual as Rational[], orderedExpected);
        const checks = [
          ['formulae', match(false), 'Formulae'],
          ['coefficients', balanced, 'Balancing'],
          ...(p.marks === 3 ? [['states', match(true), 'State Symbols'] as const] : []),
        ] as const;
        for (const [id, correct, message] of checks)
          points.push({
            partId: p.id,
            pointId: String(id),
            earned: correct ? 1 : 0,
            available: 1,
            message: message + (correct ? ': correct.' : ': needs correction.'),
          });
      } else {
        let correct = false;
        if (p.kind === 'numeric' && p.coefficientEntry && p.acceptance.kind === 'absolute') {
          const actual = parsePositiveCoefficient(r?.kind === 'numeric' ? r.raw : '', {
            blankIsOne: true,
          })!;
          correct =
            balancedVector ||
            rationalEquals(actual, parsePositiveCoefficient(String(p.acceptance.expected))!);
        }
        if (p.kind === 'choice' && r?.kind === 'choice')
          correct =
            r.selected.length === 1 &&
            parseParenthesizedState(r.selected[0]!) === p.acceptedOptionSets[0]?.[0];
        points.push({
          partId: p.id,
          pointId: p.kind,
          earned: correct ? 1 : 0,
          available: 1,
          message: correct ? 'Correct.' : 'Compare this response with the worked equation.',
        });
      }
    }
    return {
      accepted: true,
      marks: {
        earned: points.reduce((n, p) => n + p.earned, 0),
        available: points.reduce((n, p) => n + p.available, 0),
        points,
      },
    };
  },
  masteryScore(marks) {
    return marks.available > 0 && marks.earned === marks.available ? 1 : marks.earned > 0 ? 0.5 : 0;
  },
};
