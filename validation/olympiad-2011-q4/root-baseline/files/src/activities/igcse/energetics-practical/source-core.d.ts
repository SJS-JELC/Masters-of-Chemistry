import type {PracticalRecord,PracticalResponse,PracticalPoint} from './types.ts';
export function normalise(value:string):string;
export function answerMatches(value:string,answers:string[]):boolean;
export function gradeQuestion(question:PracticalRecord,response:PracticalResponse):{points:PracticalPoint[];correctCount:number;total:number};
