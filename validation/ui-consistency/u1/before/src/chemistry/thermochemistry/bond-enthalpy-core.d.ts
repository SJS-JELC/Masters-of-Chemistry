import type {BondReaction,BondResult} from './types.ts';
export const core:{reactions:readonly BondReaction[];generate:(config:{reaction:string;difficulty:number},seed:number)=>BondResult;eligibleReactions:(level:number)=>readonly BondReaction[]};
