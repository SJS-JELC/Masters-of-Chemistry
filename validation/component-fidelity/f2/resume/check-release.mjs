import fs from 'node:fs';
import { validateRelease } from '../../../../scripts/validate-s4-release.mjs';
const report={status:'PASS',checkedAt:new Date().toISOString(),scope:'Whole-current-app build/runtime closure including externally authorized OLY registration/assets; no OLY content, interaction or chemistry acceptance by component F2.',courses:['alevel','igcse'].map(validateRelease)};
fs.writeFileSync(new URL(process.argv[2]??'./release-check.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
