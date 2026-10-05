import type {BondingRecord,data} from './data.js';
export function normalize(value:unknown):string;
export function markField(field:BondingRecord['fields'][number],value:unknown,bank:typeof data):'empty'|'correct'|'incorrect'|'unknown';
export function mark(question:BondingRecord,answers:readonly string[],bank:typeof data):{states:readonly string[];marks:readonly boolean[];ready:boolean};
export function score(marks:readonly boolean[]):0|0.5|1;
