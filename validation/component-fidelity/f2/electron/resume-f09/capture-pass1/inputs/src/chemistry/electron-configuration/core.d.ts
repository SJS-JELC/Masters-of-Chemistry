import type {Species} from './data.js';
export interface SourceResponse {counts:readonly string[];core:string;boxes:readonly (readonly number[])[];identity:string;selected:readonly string[]}
export type SourceQuestion={kind:'main';speciesId:string;direction:'build'|'identify';representation:string}|{kind:'bonus';counts:readonly number[];options:readonly string[]};
export interface SourceResult {accepted:boolean;correct?:boolean;issues?:readonly string[];message?:string;expected?:readonly string[]}
export function sum(values:readonly number[]):number;
export function same(a:readonly unknown[],b:readonly unknown[]):boolean;
export function species(id:string):Species|undefined;
export function coreOptions(item:Species):string[];
export function abbreviation(item:Species):{core:string;counts:number[]};
export function boxes(counts:readonly number[]):(0|1|2|3)[][];
export function energyOrder():number[];
export function blankResponse():SourceResponse;
export function mark(question:SourceQuestion,response:SourceResponse):SourceResult;
export function explanation(item:Species):string[];
export function validateBank():true;
