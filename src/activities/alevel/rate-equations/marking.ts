import type { MarkingPolicy, NumericAcceptance } from '../../../contracts/question.ts';
import { checkQuestionInput, parseScientificNumber } from '../../../domain/attempt/index.ts';
import { equivalentRateLaw, equivalentRateUnits } from './input-syntax.ts';

function numericAccepted(value: number, rule: NumericAcceptance): boolean {
  if (!Number.isFinite(value)) return false;
  if (rule.kind === 'absolute') return Math.abs(value - rule.expected) <= rule.tolerance;
  if (rule.kind === 'relative') return Math.abs(value - rule.expected) <= Math.max(rule.absoluteFloor, Math.abs(rule.expected) * rule.relativeTolerance);
  const rounded = (n: number) => rule.mode === 'decimal-places' ? Number(n.toFixed(rule.digits)) : Number(n.toPrecision(rule.digits));
  return rounded(value) === rounded(rule.expected);
}
export const rateMarking: MarkingPolicy = {
  id: 'alevel/rate-equations/automatic',
  mark(question, responses) {
    const issues = checkQuestionInput(question, responses);
    if (issues.length) return { accepted: false, issues };
    const points = question.parts.map(part => {
      const response = responses[part.id];
      let correct = false;
      if (part.kind === 'numeric' && response?.kind === 'numeric') correct = response.unit === part.unit && numericAccepted(parseScientificNumber(response.raw), part.acceptance);
      if (part.kind === 'choice' && response?.kind === 'choice') correct = part.acceptedOptionSets.some(set => set.length === response.selected.length && set.every(id => response.selected.includes(id)));
      if (part.kind === 'text' && response?.kind === 'text') {
        const species = question.ref.questionId.startsWith('RATE-POC-orders-') ? ['A', 'B']
          : question.ref.questionId === 'RATE-POC-mechanisms-L1' ? ['NO2', 'CO']
          : question.ref.questionId === 'RATE-POC-mechanisms-L2' ? ['F2', 'NO2'] : [];
        correct = part.accepted.some(answer => part.id === 'rate-equation'
          ? species.length > 0 && equivalentRateLaw(response.value, answer, species)
          : part.id === 'k-units' ? equivalentRateUnits(response.value, answer) : answer === response.value.trim());
      }
      return { partId: part.id, pointId: part.id, earned: correct ? part.marks : 0, available: part.marks, message: correct ? 'Correct.' : 'Review the worked answer.' };
    });
    return { accepted: true, marks: { earned: points.reduce((n,p) => n+p.earned,0), available: points.reduce((n,p) => n+p.available,0), points } };
  },
  masteryScore: marks => marks.earned === marks.available ? 1 : marks.earned >= marks.available / 2 ? 0.5 : 0,
};
