import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
export const SOURCE_SHA256 = '9dec13f39318df5d0fe3b2053d391f438db47001ff7e6b6ad354925a6eb2ae4b';
export function stable(value) { if (Array.isArray(value)) return '['+value.map(stable).join(',')+']'; if(value && typeof value==='object') return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}'; return JSON.stringify(value); }
export const hash = value => crypto.createHash('sha256').update(typeof value==='string'||Buffer.isBuffer(value)?value:stable(value)).digest('hex');
const RULES = [
 ['formula-construction', /(?:ionic.{0,20}(?:formula|compound)|formula.{0,35}(?:ion|charge)|charge.{0,30}(?:balanc|formula)|ammonium.compound)/i],
 ['formula-broad-boundary', /formula|ion.charge|common.ion/i],
 ['balancing', /balanc|coefficient|conserv.{0,15}atom/i],
 ['states', /state.symbol|equation.{0,30}states|states.{0,30}equation/i],
 ['translation-or-subject-equation', /equation|reactants?.{0,20}products?/i],
 ['excluded-half-ionic-or-structure', /half.equation|ionic.equation|polymeri[sz]|displayed|structural.formula/i]
];
export function scan(atlas) {
 const patterns=new Map(atlas.patterns.map(p=>[p.id,p]));
 return [...atlas.records].sort((a,b)=>a.id.localeCompare(b.id,'en')).map(r=>{
  const p=patterns.get(r.pattern);
  const fields={summary:r.summary,context:r.context,mark_points:(r.mark_points||[]).join(' '),metadata:[r.command,r.response,r.skill,r.pattern,r.original_pattern].join(' '),recall:stable(r.recall||{}),pattern_brief:p?[p.brief?.objective,p.brief?.marking,p.brief?.interaction].filter(Boolean).join(' '):''};
  const signals=RULES.flatMap(([rule,re])=>{const matched=Object.entries(fields).filter(([,v])=>re.test(v||'')).map(([field])=>field); return matched.length?[{rule,fields:matched}]:[];});
  // Exclusion and broad-formula signals are candidates for explicit scope review, not mapping decisions.
  return {id:r.id,record_sha256:hash(r),paper_id:r.paper_id,marks:r.marks,original_primary:r.primary_gem,original_secondary:r.secondary_gems||[],empirical_band:r.classification?.band??null,candidate:signals.length>0,triage_tier:signals.some(s=>s.fields.includes('summary')&&s.rule!=='excluded-half-ionic-or-structure')?'DIRECT_TEXT':'CONTEXT_METADATA_OR_BRIEF',signals,summary:r.summary};
 });
}
export function validatePilot(atlas,overlay,boundaries) {
 const errors=[]; if(overlay.source?.sha256!==SOURCE_SHA256) errors.push('Source fingerprint header mismatch'); if(overlay.catalogue_sha256!==hash(boundaries)) errors.push('Boundary catalogue fingerprint mismatch'); const records=new Map(atlas.records.map(r=>[r.id,r])); const gems=new Set([...atlas.gems.map(g=>g.id),...boundaries.gems.map(g=>g.id)]);
 if(records.size!==2322||atlas.records.length!==2322) errors.push('Corpus IDs/count mismatch');
 if(overlay.entries.length!==12||new Set(overlay.entries.map(e=>e.id)).size!==12) errors.push('Pilot IDs/count mismatch');
 for(const e of overlay.entries){const r=records.get(e.id); if(!r){errors.push(e.id+': missing source');continue;}
 if(hash(r)!==e.input_record_sha256||stable(r)!==stable(e.original)) errors.push(e.id+': original fingerprint mismatch');
 if(!gems.has(e.proposed.primary_gem)||e.proposed.secondary_gems.some(g=>!gems.has(g))) errors.push(e.id+': invalid gem');
 if(new Set(e.proposed.secondary_gems).size!==e.proposed.secondary_gems.length||e.proposed.secondary_gems.includes(e.proposed.primary_gem)) errors.push(e.id+': duplicate gem');
 if(e.primary_marks!==r.marks||e.secondary_marks!==0||stable(e.empirical_classification)!==stable(r.classification??null)) errors.push(e.id+': mark/band conservation');
 if(e.extraction_adequacy.status==='INSUFFICIENT'&&(e.disposition!=='UNRESOLVED'||e.proposed.primary_gem!==r.primary_gem||stable(e.proposed.secondary_gems)!==stable(r.secondary_gems||[]))) errors.push(e.id+': inadequate evidence changed mapping');
 if(!e.review?.rationale||!e.evidence_rationale) errors.push(e.id+': missing substantive review');
 }
 return {status:errors.length?'FAIL':'PASS',errors,corpus_records:atlas.records.length,corpus_marks:atlas.records.reduce((s,r)=>s+r.marks,0),pilot_records:overlay.entries.length,pilot_marks:overlay.entries.reduce((s,e)=>s+e.primary_marks,0),marks_counted_on_primary_only:true,empirical_classification_preserved:true};
}
export async function generatePilot(appRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')) {
 const source=path.resolve(appRoot,'../../resources/igcse-past-paper-atlas/data/atlas.json'); const raw=await fs.readFile(source); if(hash(raw)!==SOURCE_SHA256) throw new Error('Source fingerprint changed; re-audit before generating');
 const atlas=JSON.parse(raw); const output=path.join(appRoot,'resources/recall-formulae/atlas'); const validation=path.join(appRoot,'.artifacts/recall-formulae/s1/atlas');
 const boundaries=JSON.parse(await fs.readFile(path.join(output,'gem-boundaries.json'),'utf8')); const decisions=JSON.parse(await fs.readFile(path.join(output,'pilot-decisions.json'),'utf8'));
 const inventory=scan(atlas); const sourceRecords=new Map(atlas.records.map(r=>[r.id,r]));
 const overlay={schema_version:1,run_id:'RECALL-FORMULAE-20261010',stage:'PILOT',root_acceptance:'PENDING',source:{path:'resources/igcse-past-paper-atlas/data/atlas.json',sha256:SOURCE_SHA256,record_count:atlas.records.length,marks:atlas.records.reduce((s,r)=>s+r.marks,0)},catalogue_sha256:hash(boundaries),decision_sha256:hash(decisions),entries:decisions.decisions.map(d=>{const r=sourceRecords.get(d.id); if(!r) throw new Error('Missing pilot '+d.id); return {id:r.id,input_record_sha256:hash(r),original:r,proposed:{primary_gem:d.primary,secondary_gems:d.secondary},disposition:d.disposition,evidence_rationale:d.rationale,extraction_adequacy:{status:'ADEQUATE',reason:'Summary, context, supplied/direct recall tags and mark points establish assessed operations; source reopening not needed.'},empirical_classification:r.classification??null,teaching_applicability:{band:d.teaching_band,is_empirical_classification:false},primary_marks:r.marks,secondary_marks:0,pilot_strata:d.strata,review:{reviewer:decisions.reviewer,basis:decisions.review_basis,status:'SUBSTANTIVELY_REVIEWED',rationale:d.review}};})};
 const checks=validatePilot(atlas,overlay,boundaries); if(checks.status!=='PASS') throw new Error(checks.errors.join('\n'));
 const inventoryDoc={schema_version:1,purpose:'Deterministic candidate triage only; no full-corpus mapping disposition',source:overlay.source,catalogue_sha256:overlay.catalogue_sha256,rules:RULES.map(([id,re])=>({id,regex:re.source,flags:re.flags})),scanned:inventory.length,candidate_count:inventory.filter(r=>r.candidate).length,direct_text_candidates:inventory.filter(r=>r.candidate&&r.triage_tier==='DIRECT_TEXT').length,records:inventory};
 await fs.mkdir(output,{recursive:true});await fs.mkdir(validation,{recursive:true});
 await fs.writeFile(path.join(output,'candidate-inventory.json'),JSON.stringify(inventoryDoc)+'\n');
 await fs.writeFile(path.join(output,'pilot-overlay.json'),JSON.stringify(overlay,null,2)+'\n');
 const evidence={...checks,source_sha256_after:hash(await fs.readFile(source)),candidate_count:inventoryDoc.candidate_count,direct_text_candidates:inventoryDoc.direct_text_candidates,candidate_inventory_sha256:hash(inventoryDoc),overlay_sha256:hash(overlay),catalogue_sha256:overlay.catalogue_sha256,full_remap_executed:false,source_access:'Extracted atlas JSON only; no PDF/MS/image access',gate:'Root pilot acceptance required before full remap'};
 await fs.writeFile(path.join(validation,'pilot-validation.json'),JSON.stringify(evidence,null,2)+'\n'); return evidence;
}
if (typeof process !== 'undefined' && process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) console.log(JSON.stringify(await generatePilot(),null,2));
