/** Explicit refresh from the current canonical DEV proof, never historical evidence. */
import fs from 'node:fs';import path from 'node:path';
const families=path.resolve(import.meta.dirname,'../families/dev-s5-independent');
fs.copyFileSync(path.join(families,'family.test.mjs'),path.join(import.meta.dirname,'family.test.mjs'));
fs.writeFileSync(path.join(import.meta.dirname,'browser.mjs'),fs.readFileSync(path.join(families,'browser.mjs'),'utf8').replaceAll('dev-s5-independent','__SCAFFOLD_SLUG__'));
