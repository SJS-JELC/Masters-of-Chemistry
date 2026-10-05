/** Actual browser render/inspection artefacts for every retained reference. */
import {chromium} from '../../../../../node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {bank} from '../../../src/activities/igcse/dot-and-cross/bank.js';
import {referenceRecord} from '../../../src/activities/igcse/dot-and-cross/types.ts';
import {modelSVG} from '../../../src/chemistry/dot-and-cross/model.ts';
const here=import.meta.dirname,folder=path.join(here,'rendered-bank');fs.mkdirSync(folder,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1500,height:1450}});const report=[];
try{for(let index=0;index<bank.length;index+=9){const records=bank.slice(index,index+9),svgs=records.map(record=>modelSVG(referenceRecord(record)));
 const valid=await page.evaluate(values=>values.map(value=>new DOMParser().parseFromString(value,'image/svg+xml').getElementsByTagName('parsererror').length===0),svgs);assert(valid.every(Boolean),'every SVG parses as XML');
 const html=`<!doctype html><meta charset="utf-8"><title>Checked bank ${index+1}–${index+records.length}</title><style>body{margin:0;font:16px Arial;background:#eef2f7}.grid{display:grid;grid-template-columns:repeat(3,1fr)}article{height:450px;margin:8px;padding:10px;border:1px solid #94a3b8;border-radius:8px;background:white;box-sizing:border-box}h2{font-size:18px;margin:4px}p{font-size:14px;margin:4px}img{width:100%;height:350px;object-fit:contain}</style><main class="grid">${records.map((record,offset)=>`<article><h2>${record.id}</h2><p>${record.formula} · ${record.reference.electrons.length} electrons · total charge ${0}</p><img alt="${record.id}" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgs[offset])}"></article>`).join('')}</main>`;
 const filename=`bank-${String(index+1).padStart(2,'0')}-${String(index+records.length).padStart(2,'0')}`;fs.writeFileSync(path.join(folder,filename+'.html'),html);await page.setContent(html);await page.locator('img').evaluateAll(async images=>{await Promise.all(images.map(image=>image.decode()));});await page.screenshot({path:path.join(folder,filename+'.png'),fullPage:true});report.push({records:records.map(record=>record.id),xmlValid:true,decoded:true,screenshot:`rendered-bank/${filename}.png`,visualReview:'PENDING'});
 }}finally{await browser.close();}fs.writeFileSync(path.join(here,'rendered-bank.json'),JSON.stringify(report,null,2));console.log(`Rendered and XML-checked ${bank.length} models in ${report.length} contact sheets. Substantive visual review remains required.`);
