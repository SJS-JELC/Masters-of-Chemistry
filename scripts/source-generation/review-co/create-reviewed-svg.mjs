import '../check-output.mjs';
import {data} from '../../../src/chemistry/thermochemistry/bond-enthalpy-data.js';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const here=import.meta.dirname,project=resolve(here,'../../..');
const hash=content=>createHash('sha256').update(content).digest('hex');
const originalPath=resolve(project,'../Masters-of-IGCSE-Chemistry/src/activities/bond-enthalpy/data.js');
const originalFile=readFileSync(originalPath,'utf8');assert.equal(hash(originalFile),'7d12bd91a5565e6bb42ef9c3b297e4b64e76889c6a86315ea686051202b49c59');
const copiedFilePath=resolve(project,'src/chemistry/thermochemistry/bond-enthalpy-data.js'),copiedFileHash=hash(readFileSync(copiedFilePath));
const sandbox={};sandbox.window=sandbox;sandbox.globalThis=sandbox;vm.runInNewContext(originalFile,sandbox);
const source=sandbox.BondEnthalpyData.reactions.find(r=>r.id==='methanol-synthesis');
const copied=data.reactions.find(r=>r.id==='methanol-synthesis');assert.equal(source.svg,copied.svg);
const original=source.svg;assert.equal(hash(original),'8290640db0821f819075df57ea3d85f2828fdb9139aa8721ef3e85a0802d4da7');
const carbonFragment=original.slice(original.indexOf('<g transform="translate(15 13)">'),original.indexOf('</g>'));
assert.equal((carbonFragment.match(/class='bond-0 atom-0 atom-1'/g)||[]).length,3);
assert.equal((carbonFragment.match(/class='atom-0'/g)||[]).length,1);
assert.equal((carbonFragment.match(/class='atom-1'/g)||[]).length,2);
// Oxygen's existing positive glyph has a rounded horizontal bar extending
// x64.1..74.7, y73.2..75.5. Carbon and oxygen glyph right edges are187.0
// and59.8; their difference127.2 preserves the existing4.3-unit charge gap.
// Copy that horizontal bar, omit the vertical arm and translate x by127.2.
const plusHorizontal='M 65.3 75.5 Q 64.8 75.5, 64.4 75.2 Q 64.1 74.8, 64.1 74.3 Q 64.1 73.8, 64.4 73.5 Q 64.8 73.2, 65.3 73.2 L 73.6 73.2 Q 74.0 73.2, 74.4 73.5 Q 74.7 73.9, 74.7 74.4 Q 74.7 74.8, 74.4 75.2 Q 74.0 75.5, 73.6 75.5 Z';
const carbonMinus=`\n<path class='atom-0' data-reviewed-charge='carbon-minus' transform='translate(127.2 0)' d='${plusHorizontal}' fill='currentColor'/>`;
assert.equal(original.includes('data-reviewed-charge'),false);
const insertion=original.indexOf('</g>');assert(insertion>0);
const corrected=original.slice(0,insertion)+carbonMinus+original.slice(insertion);
assert.equal(corrected.replace(carbonMinus,''),original,'Every inherited byte except the inserted charge is preserved');
const artifacts=resolve(project,'.artifacts/source-generation/review-co');
mkdirSync(artifacts,{recursive:true});
writeFileSync(resolve(artifacts,'original-reaction.svg'),original);
writeFileSync(resolve(artifacts,'reviewed-reaction.svg'),corrected);
const output=resolve(project,'src/chemistry/thermochemistry/reviewed-co-svg.ts');
writeFileSync(output,`/**\n * A07 S3-REVIEW-CO independently reviewed depiction correction.\n * Intended source species [C-]#[O+] is neutral CO. The inherited SVG omitted\n * only the carbon formal-minus mark. Preserve all existing RDKit2026.03.5\n * paths, font metrics, geometry, bonds, atoms and coefficients; add the rounded\n * horizontal arm of its existing O+ glyph beside C. No new RDKit rendering.\n * Original SVG SHA256: ${hash(original)}\n * Reviewed SVG SHA256: ${hash(corrected)}\n * Evidence/regeneration: scripts/source-generation/review-co/\n */\nexport const reviewedMethanolSynthesisSVG = ${JSON.stringify(corrected)};\n`);
assert.equal(hash(readFileSync(copiedFilePath)),copiedFileHash,'Copied source data unchanged');
assert.equal(hash(readFileSync(originalPath)),hash(originalFile),'Protected source data unchanged');
const provenance={jobId:'S3-REVIEW-CO',agentId:'A07',runId:'MASTERS-REACT-20261002',createdAt:new Date().toISOString(),status:'AWAITING_RENDER_AND_CHEMICAL_REVIEW',source:{file:'apps/Masters-of-IGCSE-Chemistry/src/activities/bond-enthalpy/data.js',fileSha256:hash(originalFile),originalSvgSha256:hash(original),copiedSvgIdentical:true,historicalRenderingRdkit:'2026.03.5',intendedSmiles:'[C-]#[O+]',equation:source.equation},correction:{kind:'missing-formal-charge-vector',newSvgSha256:hash(corrected),output:'src/chemistry/thermochemistry/reviewed-co-svg.ts',outputSha256:hash(readFileSync(output)),existingSvgBytePreservation:true,insertedElement:carbonMinus,horizontalChargeBounds:{xMin:191.3,xMax:201.9,yMin:73.2,yMax:75.5},localMoleculeBox:{width:220,height:165},fontChanged:false,fullRegeneration:false},bondCalculation:{broken:source.broken,made:source.made,brokenTotal:source.brokenTotal,madeTotal:source.madeTotal,deltaH:source.deltaH},notes:['This is an independently reviewed deterministic vector correction, not regeneration with the unavailable managed exact chemistry profile.','Copied original data and protected sibling remain unchanged.','Question ID/species/mark scheme/equation/bond energy data are unchanged.']};
writeFileSync(resolve(artifacts,'provenance.json'),JSON.stringify(provenance,null,2)+'\n');
console.log(JSON.stringify({originalSvgSha256:hash(original),reviewedSvgSha256:hash(corrected),output}));
