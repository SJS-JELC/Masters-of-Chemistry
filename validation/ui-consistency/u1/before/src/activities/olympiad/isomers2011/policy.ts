import type { IsomerChallenge, IsomerProgress, IsomerPolicy, IsomerCommand, MoleculeState } from '../../../contracts/index.ts';
import { assertMoleculeState, core } from '../../../chemistry/molecule/engine.ts';
import { isomerBoxes } from './content.ts';
export function isomerFingerprint(p: IsomerProgress): string {
  let h = 2166136261;
  // Stable box order, including absent drawings. Undo history/selection is not assessment content.
  for (const c of JSON.stringify(isomerBoxes.map(id => p.drawings[id]?.graph ?? null))) {
    h ^= c.charCodeAt(0); h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
export const blankIsomerProgress = (profileId: string): IsomerProgress => ({ kind: 'olympiad-completion', course: 'alevel', profileId, activityId: 'alevel/olympiad-2011-q4', drawings: {}, selected: '1', check: null, completed: false });
function matches(drawing: MoleculeState | undefined, graph: IsomerChallenge['answers'][number]['graph']): boolean {
  if (!drawing) return false;
  try { assertMoleculeState(drawing); return core.check(drawing.graph, graph).kind === 'correct'; }
  catch { return false; }
}
/** Reserve exact placements first, then consume each remaining isomer at most once. */
export function countIsomers(challenge: IsomerChallenge, p: IsomerProgress) {
  const remaining = new Set(challenge.answers.map(a => a.id)), exact = new Set<string>();
  for (const answer of challenge.answers) {
    if (matches(p.drawings[answer.id], answer.graph)) { remaining.delete(answer.id); exact.add(answer.id); }
  }
  let wrongPlace = 0;
  for (const box of isomerBoxes) {
    if (exact.has(box)) continue;
    const answer = challenge.answers.find(a => remaining.has(a.id) && matches(p.drawings[box], a.graph));
    if (answer) { remaining.delete(answer.id); wrongPlace++; }
  }
  return { fullyCorrect: exact.size, wrongPlace };
}
function validateCompletion(challenge: IsomerChallenge, p: IsomerProgress): IsomerProgress {
  Object.values(p.drawings).forEach(assertMoleculeState);
  const counts = countIsomers(challenge, p), fingerprint = isomerFingerprint(p);
  const check = p.check && p.check.drawingFingerprint === fingerprint && p.check.fullyCorrect === counts.fullyCorrect && p.check.wrongPlace === counts.wrongPlace
    ? { ...counts, drawingFingerprint: fingerprint } : null;
  return { ...p, check, completed: check?.fullyCorrect === 7 };
}
function transition(challenge: IsomerChallenge, original: IsomerProgress, command: IsomerCommand) {
  const p = validateCompletion(challenge, original);
  const reject = () => ({ accepted: false, progress: p, message: '' });
  switch (command.kind) {
    case 'restart': return { accepted: true, progress: blankIsomerProgress(p.profileId), message: '' };
    case 'select-box': return isomerBoxes.includes(command.box) ? { accepted: true, progress: { ...p, selected: command.box }, message: '' } : reject();
    case 'draw': {
      if (p.completed || !isomerBoxes.includes(command.box)) return reject();
      try { assertMoleculeState(command.drawing); } catch { return reject(); }
      return { accepted: true, progress: { ...p, drawings: { ...p.drawings, [command.box]: structuredClone(command.drawing) }, check: null, completed: false }, message: '' };
    }
    case 'check': {
      if (p.completed || !Object.values(p.drawings).some(d => d.graph.atoms.length)) return reject();
      const check = { ...countIsomers(challenge, p), drawingFingerprint: isomerFingerprint(p) };
      return { accepted: true, progress: { ...p, check, completed: check.fullyCorrect === 7 }, message: '' };
    }
  }
}
export const isomerPolicy: IsomerPolicy = { transition, validateCompletion };
