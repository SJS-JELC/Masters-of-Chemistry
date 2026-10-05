import type {EnergyBank,EnergyRecord,EnergyField} from './types.ts';
import type {EnergyProfileState,EnergyArrowEnd} from '../../../contracts/editors.ts';
export function normalize(s:string):string;
export function markField(field:EnergyField,value:string,data:EnergyBank):'correct'|'incorrect'|'empty'|'unknown';
export function model(q:EnergyRecord):Omit<EnergyProfileState,'kind'>;
export function initial(q:EnergyRecord):Omit<EnergyProfileState,'kind'>;
export function check(q:EnergyRecord,m:EnergyProfileState,data:EnergyBank):boolean[];
export function endY(m:EnergyProfileState,end:EnergyArrowEnd):number;
