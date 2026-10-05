import fs from 'node:fs';
import {validateRelease} from '../../scripts/validate-s4-release.mjs';
const result=['alevel','igcse'].map(validateRelease);
fs.writeFileSync(new URL('./release-checks.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
