import test from 'node:test';import assert from 'node:assert/strict';
import {chemicalNotationRuns,normalizeChemicalEntry,chemicalSelectionOffset} from '../../src/ui/chemical-notation.ts';
const runs=value=>chemicalNotationRuns(value,'equation');
test('bracketed ionic complex has formula subscript and terminal superscript charge',()=>{
 const r=runs('Fe3+ + 2I- -> [FeI2]+');
 assert(r.some(v=>v.subscript&&v.text==='2'));
 assert(r.some(v=>v.superscript&&v.text==='3+'));
 assert(r.some(v=>v.superscript&&v.text==='+'));
 assert(r.some(v=>!v.subscript&&!v.superscript&&v.text.includes('2I')));
 assert.equal(r.map(v=>v.text).join(''),'Fe3+ + 2I- → [FeI2]+');
});
test('compact ionic separators keep charge superscripts and baseline coefficients',()=>{
 const r=runs('Fe3++2I-→[FeI2]+');
 assert(r.some(v=>v.superscript&&v.text==='3+'));
 assert(r.some(v=>v.superscript&&v.text==='-'));
 assert(r.some(v=>!v.subscript&&!v.superscript&&v.text==='+2I'));
 assert(!runs('NO2+CO→NO+CO2').some(v=>v.superscript));
});
test('formula and native editor value/caret semantics remain unchanged',()=>{
 assert.deepEqual(chemicalNotationRuns('2H2 + O2 → 2H2O','equation'),[
  {text:'2H',subscript:false},{text:'2',subscript:true},{text:' + O',subscript:false},{text:'2',subscript:true},{text:' → 2H',subscript:false},{text:'2',subscript:true},{text:'O',subscript:false},
 ]);
 assert.equal(normalizeChemicalEntry('Fe³⁺ + 2I⁻ -> [FeI₂]⁺','equation'),'Fe³⁺ + 2I⁻ → [FeI2]⁺');
 assert.equal(chemicalSelectionOffset('NO2 -> NO + O',8,'equation'),7);
});
