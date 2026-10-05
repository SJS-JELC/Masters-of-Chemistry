import type { C3L6Progress, ChallengeCommand, MoleculeGraph, MoleculeState, IsomerProgress } from '../../../../src/contracts/index.ts';
import { chemicalChallenge as c3Challenge } from '../../../../src/activities/olympiad/c3l6/source-bank.ts';
import { c3Policy, blankC3Progress } from '../../../../src/activities/olympiad/c3l6/policy.ts';
import { c3KErratum } from '../../../../src/activities/olympiad/c3l6/source-bank.ts';
import { isomerChallenge } from '../../../../src/activities/olympiad/isomers2011/content.ts';
import { blankIsomerProgress, isomerPolicy } from '../../../../src/activities/olympiad/isomers2011/policy.ts';
export const drawing = (graph: MoleculeGraph): MoleculeState => ({kind:'molecule',graph:structuredClone(graph),history:[]});
export const applyC3 = (p: C3L6Progress, command: ChallengeCommand) => {
  const r = c3Policy.transition(c3Challenge,p,command); if(!r.accepted) throw Error(r.message); return r.progress;
};
export function c3Fixture(state: 'unstarted' | 'partial' | 'complete'): C3L6Progress {
  let p = blankC3Progress('local');
  if(state === 'unstarted') return p;
  for (const [index,item] of c3Challenge.classifications.entries()) p = applyC3(p,{kind:'classify',id:item.id,value: state === 'partial' && index > 0 ? item.answer === 'oxidation' ? 'reduction' : 'oxidation' : item.answer});
  p = applyC3(p,{kind:'check-a'});
  if(state === 'partial') return p;
  for (const unit of c3Challenge.hydrolysis) {
    for (const slot of unit.slots) p = applyC3(p,{kind:'draw-b',slotId:slot.id,drawing:drawing((slot.id === 'K' ? slot.alternatives.find(a => a.smiles === c3KErratum.acceptedSmiles) : slot.alternatives[0])!.graph)});
    p = applyC3(p,{kind:'check-b-unit',unitId:unit.unitId});
  }
  for(const slot of c3Challenge.network.slots) {p = applyC3(p,{kind:'draw-c',slotId:slot.id,drawing:drawing(slot.alternatives[0]!.graph)});p = applyC3(p,{kind:'check-c-slot',slotId:slot.id});}
  return p;
}
export function isomerFixture(state: 'unstarted' | 'partial' | 'complete'): IsomerProgress {
  let p = blankIsomerProgress('local');
  if(state === 'unstarted') return p;
  for(const answer of state === 'partial' ? isomerChallenge.answers.slice(0,1) : isomerChallenge.answers) p = isomerPolicy.transition(isomerChallenge,p,{kind:'draw',box:answer.id,drawing:drawing(answer.graph)}).progress;
  return isomerPolicy.transition(isomerChallenge,p,{kind:'check'}).progress;
}
