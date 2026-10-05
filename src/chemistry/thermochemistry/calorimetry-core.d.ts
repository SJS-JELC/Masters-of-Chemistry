import type {CalorimetryExample,CalorimetryConfig,CalorimetryResult} from './types.ts';
export const core:{examples:readonly CalorimetryExample[];generate:(config:CalorimetryConfig,seed:number)=>CalorimetryResult;structureOptions:(target:string,amount:string,level:number)=>readonly {value:string;label:string}[]};
