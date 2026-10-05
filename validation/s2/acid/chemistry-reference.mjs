// Independent pupil-visible-data reconstruction from scripts/test_acid_progression_chemistry.js.
// Original SHA256: 5daa2ea8f64e867cf01ffc94ca2aae32db403e1d7fbc68077ef0ea544d5fdcf2
// Only loader changed; all independent assertions below retained unchanged.
import assert from 'node:assert/strict';
import {acidEngine as model} from '../../../src/activities/alevel/acid-base-calculations/engine.js';
import {acidData as data} from '../../../src/activities/alevel/acid-base-calculations/data.js';
let checks = 0;
function check(condition, message) { checks += 1; assert(condition, message); }
function log10(x) { return Math.log(x) / Math.LN10; }
function ph(h) { return -log10(h); }
function hFromPh(value) { return 10 ** -value; }
function number(text) {
  const normal = String(text).trim().replace(/,/g, '').replace(/[−–—]/g, '-');
  const sci = normal.match(/([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:×|x|\*)\s*10\s*\^?\s*([+-]?\d+)/i);
  if (sci) return Number(sci[1]) * 10 ** Number(sci[2]);
  const plain = normal.match(/[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i);
  assert(plain, `No number in displayed text: ${text}`);
  return Number(plain[0]);
}
function capture(text, expression, description) {
  const match = String(text).match(expression);
  assert(match, `Could not parse ${description} from: ${text}`);
  return number(match[1]);
}
function chemistryText(text) { return String(text).replace(/pK_a/g, 'pKₐ').replace(/K_a/g, 'Kₐ').replace(/K_w/g, 'K_w').replace(/M_r/g, 'Mᵣ'); }
function row(q, fragment) {
  const found = q.rows.find((item) => chemistryText(item.label).includes(chemistryText(fragment)));
  assert(found, `${q.templateId}: missing displayed row containing ${fragment}`);
  return number(found.value);
}
function weakKa(q) {
  const kaRow = q.rows.find((item) => chemistryText(item.label).includes('Kₐ') && !chemistryText(item.label).includes('pKₐ'));
  if (kaRow) return number(kaRow.value);
  const pkaRow = q.rows.find((item) => chemistryText(item.label).includes('pKₐ'));
  assert(pkaRow, `${q.templateId}: neither Kₐ nor pKₐ is displayed.`);
  return 10 ** -number(pkaRow.value);
}
function mr(q) { return row(q, 'Mᵣ'); }
function result(key, value) { return { key, value }; }
function compare(q, reconstructed) {
  check(q.allResponses.length === reconstructed.length, `${q.templateId}: expected ${reconstructed.length} numerical stages, found ${q.allResponses.length}.`);
  for (let index = 0; index < reconstructed.length; index += 1) {
    const actual = q.allResponses[index];
    const independent = reconstructed[index];
    check(actual.key === independent.key, `${q.templateId}: stage ${index + 1} should be ${independent.key}, found ${actual.key}.`);
    const allowance = Math.max(actual.tolerance * 1.05, Math.abs(independent.value) * 2e-3, 1e-12);
    check(Math.abs(actual.expected - independent.value) <= allowance,
      `${q.templateId}: ${actual.key} expected ${actual.expected}, reconstructed ${independent.value} from displayed data.`);
  }
}

const acidByName = new Map(data.strongAcids.map((item) => [item.name, item]));
const baseByName = new Map(data.strongBases.map((item) => [item.name, item]));
const formulaChecks = {
  strongAcids: { hcl: ['HCl', 36.5, 1], hno3: ['HNO₃', 63.0, 1], h2so4: ['H₂SO₄', 98.1, 2] },
  strongBases: { naoh: ['NaOH', 40.0, 1], koh: ['KOH', 56.1, 1], baoh2: ['Ba(OH)₂', 171.3, 2], sroh2: ['Sr(OH)₂', 121.6, 2] },
  weakAcids: {
    ethanoic: ['CH₃COOH', 'CH₃COO⁻', 'CH₃COONa', 60.0, 82.0],
    propanoic: ['CH₃CH₂COOH', 'CH₃CH₂COO⁻', 'CH₃CH₂COONa', 74.0, 96.0],
    butanoic: ['CH₃CH₂CH₂COOH', 'CH₃CH₂CH₂COO⁻', 'CH₃CH₂CH₂COONa', 88.0, 110.0],
    glycolic: ['HOCH₂COOH', 'HOCH₂COO⁻', 'HOCH₂COONa', 76.0, 98.0]
  }
};
for (const item of data.strongAcids) check(JSON.stringify([item.formula, item.mr, item.protons]) === JSON.stringify(formulaChecks.strongAcids[item.id]), `${item.id}: strong-acid formula/Mr/basicity data changed.`);
for (const item of data.strongBases) check(JSON.stringify([item.formula, item.mr, item.hydroxides]) === JSON.stringify(formulaChecks.strongBases[item.id]), `${item.id}: strong-base formula/Mr/stoichiometry data changed.`);
for (const item of data.weakAcids) check(JSON.stringify([item.formula, item.conjugate, item.sodiumSaltFormula, item.mr, item.saltMr]) === JSON.stringify(formulaChecks.weakAcids[item.id]), `${item.id}: weak-acid/salt formula or Mr data changed.`);
const seeds = [0, 1, 7, 19, 2718, 4294967295];
const instances = [];
const templateLevels = new Map();
for (const scope of model.scopes) for (const level of [1, 2, 3]) {
  for (const templateId of model.templatesFor(scope.id, level)) {
    if (!templateLevels.has(templateId)) templateLevels.set(templateId, level);
  }
}
check(templateLevels.size === 38, `Expected 38 active v2 templates, found ${templateLevels.size}.`);

for (const [templateId, level] of templateLevels) for (const seed of seeds) {
  const q = model.generate(templateId, level, seed);
  instances.push(q);
  check(q.templateId === templateId, `${templateId}: generated metadata identifies ${q.templateId}.`);
  check(q.working.length > 0 && q.working.every((line) => String(line).trim()), `${templateId}: worked answer has a blank or missing line.`);
  const intro = q.intro;
  let rebuilt;
  let weakConcentration = null;

  switch (templateId) {
    case 'h-to-ph': { const h = row(q, '[H⁺]'); rebuilt = [result('ph', ph(h))]; break; }
    case 'ph-to-h': { const given = row(q, 'pH'); rebuilt = [result('h', hFromPh(given))]; break; }
    case 'strong-acid-direct': {
      const item = [...acidByName].find(([name]) => intro.includes(name))?.[1];
      check(item && item.protons === 1, `${templateId}: displayed acid must be monobasic.`);
      const c = row(q, `[${item.formula}]`); rebuilt = [result('h', c), result('ph', ph(c))]; break;
    }
    case 'strong-acid-dilution': {
      const item = [...acidByName].find(([name]) => intro.includes(name))?.[1];
      check(item && item.protons === 1, `${templateId}: displayed acid must be monobasic.`);
      const initialV = capture(intro, /^([\d.]+) cm³/, 'initial volume');
      const finalV = capture(intro, /diluted (?:with water )?to ([\d.]+) cm³/, 'final volume');
      const c1 = row(q, 'Initial ['); const n = c1 * initialV / 1000; const c2 = n / (finalV / 1000);
      rebuilt = [result('amount', n), result('concentration', c2), result('ph', ph(c2))]; break;
    }
    case 'strong-acid-preparation': {
      const item = [...acidByName].find(([name]) => intro.includes(name))?.[1];
      check(item && item.protons === 1, `${templateId}: target-pH route must use a monobasic acid.`);
      const finalV = capture(intro, /Prepare ([\d.]+) cm³/, 'final volume');
      const target = capture(intro, /at pH ([\d.]+)/, 'target pH');
      const stock = capture(intro, /from a ([\d.]+) mol dm⁻³/, 'stock concentration');
      rebuilt = [result('volume', hFromPh(target) * finalV / stock)]; break;
    }
    case 'strong-acid-neutralisation': {
      const ca = row(q, '[HCl]'); const va = row(q, 'HCl volume'); const cb = row(q, '[NaOH]'); const vb = row(q, 'NaOH volume');
      const excess = ca * va / 1000 - cb * vb / 1000;
      check(excess > 0, `${templateId}: acid is not in excess.`);
      rebuilt = [result('ph', ph(excess / ((va + vb) / 1000)))]; break;
    }
    case 'strong-base-direct':
    case 'temperature-base': {
      const item = [...baseByName].find(([name]) => intro.includes(name))?.[1];
      check(item && item.hydroxides === 1, `${templateId}: displayed base must be monohydroxide.`);
      const oh = row(q, `[${item.formula}]`); const kw = row(q, 'K_w');
      rebuilt = [result('oh', oh), result('h', kw / oh), result('ph', ph(kw / oh))]; break;
    }
    case 'water-ph-from-kw': { const h = Math.sqrt(row(q, 'K_w')); rebuilt = [result('h', h), result('ph', ph(h))]; break; }
    case 'dihydroxide-direct': {
      const item = [...baseByName].find(([name]) => intro.includes(name))?.[1];
      check(item && item.hydroxides === 2, `${templateId}: displayed base must be dihydroxide.`);
      const oh = 2 * row(q, `[${item.formula}]`); const kw = row(q, 'K_w');
      rebuilt = [result('oh', oh), result('h', kw / oh), result('ph', ph(kw / oh))]; break;
    }
    case 'strong-base-mass': {
      const item = [...baseByName].find(([name]) => intro.includes(name))?.[1];
      check(item && item.hydroxides === 1, `${templateId}: mass route must use a monohydroxide.`);
      const mass = capture(intro, /^([\d.]+) g/, 'sample mass'); const volume = capture(intro, /make ([\d.]+) cm³/, 'final volume');
      const n = mass / mr(q); const oh = n / (volume / 1000); const h = row(q, 'K_w') / oh;
      rebuilt = [result('amount', n), result('oh', oh), result('h', h), result('ph', ph(h))]; break;
    }
    case 'base-mass-concentration-dilution': {
      const item = [...baseByName].find(([name]) => intro.includes(name))?.[1];
      check(item && item.hydroxides === 1, `${templateId}: dilution route must use a monohydroxide.`);
      const massC = capture(intro, /(?:contains |mass concentration )([\d.]+) g dm⁻³/, 'mass concentration');
      const v1 = /^([\d.]+) cm³/.test(intro) ? capture(intro, /^([\d.]+) cm³/, 'stock volume') : capture(intro, /dm⁻³\. ([\d.]+) cm³/, 'stock volume');
      const v2 = capture(intro, /diluted (?:with water )?to ([\d.]+) cm³/, 'final volume');
      const oh = massC / mr(q) * v1 / v2; rebuilt = [result('ph', ph(row(q, 'K_w') / oh))]; break;
    }
    case 'base-purity': {
      check(/25\s*°C/.test(intro), `${templateId}: temperature for the supplied K_w is not stated.`);
      check(/inert|does not (?:react|affect)/i.test(intro), `${templateId}: the impurity's non-reacting assumption is not stated.`);
      const mass = capture(intro, /^(?:A )?([\d.]+) g/, 'sample mass'); const volume = capture(intro, /to ([\d.]+) cm³/, 'final volume');
      const measured = capture(intro, /pH is ([\d.]+)/, 'measured pH'); const pureMass = row(q, 'K_w') / hFromPh(measured) * volume / 1000 * mr(q);
      const percentage = 100 * pureMass / mass; check(percentage > 0 && percentage <= 100, `${templateId}: reconstructed purity ${percentage}% is invalid.`);
      rebuilt = [result('purity', percentage)]; break;
    }
    case 'excess-strong-base': {
      const cb = row(q, '[NaOH]'); const vb = row(q, 'NaOH volume'); const ca = row(q, '[HCl]'); const va = row(q, 'HCl volume');
      const excess = cb * vb / 1000 - ca * va / 1000; check(excess > 0, `${templateId}: hydroxide is not in excess.`);
      const oh = excess / ((va + vb) / 1000); rebuilt = [result('ph', ph(row(q, 'K_w') / oh))]; break;
    }
    case 'weak-acid-concentration-ph': {
      const ka = weakKa(q), c = q.rows.find((x) => x.label.startsWith('[') && !x.label.includes('K')) ? number(q.rows.find((x) => x.label.startsWith('[')).value) : NaN;
      weakConcentration = c; const h = Math.sqrt(ka * c); rebuilt = [result('h', h), result('ph', ph(h))]; break;
    }
    case 'weak-acid-pka-ph': { const ka = weakKa(q), c = q.rows.find((x) => x.label.startsWith('[')) ? number(q.rows.find((x) => x.label.startsWith('[')).value) : row(q, '[HA]'); weakConcentration = c; const h = Math.sqrt(ka * c); rebuilt = [result('ka', ka), result('h', h), result('ph', ph(h))]; break; }
    case 'weak-acid-amount': {
      const volume = capture(intro, /make ([\d.]+) cm³/, 'final volume');
      const modernMass = intro.match(/^([\d.]+) g/); const n = modernMass ? number(modernMass[1]) / mr(q) : capture(intro, /^(.+?) mol of/, 'acid amount');
      const c = n / (volume / 1000); const h = Math.sqrt(weakKa(q) * c); weakConcentration = c;
      rebuilt = modernMass ? [result('amount', n), result('concentration', c), result('h', h), result('ph', ph(h))] : [result('concentration', c), result('h', h), result('ph', ph(h))]; break;
    }
    case 'weak-acid-reverse-concentration': {
      const given = q.rows.some((x) => x.label === 'pH') ? row(q, 'pH') : capture(intro, /pH ([\d.]+)/, 'pH'); const h = hFromPh(given); weakConcentration = h * h / weakKa(q); rebuilt = [result('h', h), result('concentration', weakConcentration)]; break;
    }
    case 'weak-acid-pka-concentration': {
      const given = row(q, 'pH'); const ka = weakKa(q); const h = hFromPh(given); weakConcentration = h * h / ka; rebuilt = [result('ka', ka), result('h', h), result('concentration', weakConcentration)]; break;
    }
    case 'weak-acid-ph-ka':
    case 'weak-acid-ph-pka': {
      const concentrationRow = q.rows.find((x) => x.label.startsWith('[')); assert(concentrationRow, `${templateId}: acid concentration row missing.`);
      const c = number(concentrationRow.value); weakConcentration = c; const given = row(q, 'pH'); const h = hFromPh(given); const ka = h * h / c;
      rebuilt = [result('h', h), result('ka', ka)]; if (templateId.endsWith('pka')) rebuilt.push(result('pka', -log10(ka))); break;
    }
    case 'weak-acid-percent': { const concentrationRow = q.rows.find((x) => x.label.startsWith('[')); assert(concentrationRow, `${templateId}: concentration row missing.`); const c = number(concentrationRow.value); weakConcentration = c; const h = hFromPh(row(q, 'pH')); rebuilt = [result('h', h), result('percent', 100 * h / c)]; break; }
    case 'weak-acid-target-mass': {
      const volume = capture(intro, /Prepare ([\d.]+) cm³/, 'final volume'); const target = capture(intro, /at pH ([\d.]+)/, 'target pH'); const c = hFromPh(target) ** 2 / weakKa(q);
      weakConcentration = c; rebuilt = [result('mass', c * volume / 1000 * mr(q))]; break;
    }
    case 'weak-acid-purity': {
      check(/inert|does not (?:react|affect)/i.test(intro), `${templateId}: the impurity's non-reacting assumption is not stated.`);
      const mass = capture(intro, /^(?:A )?([\d.]+) g/, 'sample mass'); const volume = capture(intro, /to ([\d.]+) cm³/, 'final volume'); const measured = capture(intro, /pH is ([\d.]+)/, 'pH');
      const percentage = 100 * (hFromPh(measured) ** 2 / weakKa(q)) * volume / 1000 * mr(q) / mass;
      weakConcentration = hFromPh(measured) ** 2 / weakKa(q); check(percentage > 0 && percentage <= 100, `${templateId}: reconstructed purity ${percentage}% is invalid.`); rebuilt = [result('purity', percentage)]; break;
    }
    case 'weak-acid-preparation-ka': {
      const mass = capture(intro, /^([\d.]+) g/, 'sample mass'); const volume = capture(intro, /(?:to make|to) ([\d.]+) cm³/, 'final volume'); const given = capture(intro, /pH is ([\d.]+)/, 'pH');
      const purity = intro.includes('% pure') ? capture(intro, /a ([\d.]+)% pure/, 'known purity') / 100 : 1;
      weakConcentration = mass * purity / mr(q) / (volume / 1000); rebuilt = [result('ka', hFromPh(given) ** 2 / weakConcentration)]; break;
    }
    case 'buffer-component-ratio': {
      const target = q.rows.some((x) => x.label.includes('Target pH')) ? row(q, 'Target pH') : capture(intro, /pH ([\d.]+)/, 'target pH'); const h = hFromPh(target); rebuilt = [result('h', h), result('ratio', weakKa(q) / h)]; break;
    }
    case 'buffer-salt-amount':
    case 'buffer-salt-mass':
    case 'buffer-salt-stock-volume': {
      const modern = q.rows.some((x) => x.label.includes('Target pH'));
      const acidAmount = modern ? row(q, 'Amount of') : capture(intro, /contain (.+?) mol/, 'acid amount'); const target = modern ? row(q, 'Target pH') : capture(intro, /at pH ([\d.]+)/, 'target pH'); const h = hFromPh(target); const ratio = weakKa(q) / h; const salt = ratio * acidAmount;
      rebuilt = modern ? [result('h', h), result('ratio', ratio), result('saltAmount', salt)] : [result('ratio', ratio), result('amount', salt)];
      if (templateId === 'buffer-salt-mass') rebuilt.push(result('mass', salt * mr(q)));
      if (templateId === 'buffer-salt-stock-volume') rebuilt.push(result('volume', salt / capture(intro, /(?:A|a) ([\d.]+) mol dm⁻³.*stock/, 'stock concentration') * 1000));
      break;
    }
    case 'buffer-partial-target-alkali': {
      const modern = /([\d.]+) cm³ of ([\d.]+) mol dm⁻³/.exec(intro);
      const initial = modern ? number(modern[2]) * number(modern[1]) / 1000 : capture(intro, /contains (.+?) mol/, 'initial acid amount');
      const stock = modern ? capture(intro, /with ([\d.]+) mol dm⁻³ sodium hydroxide/, 'alkali concentration') : capture(intro, /Add ([\d.]+) mol dm⁻³/, 'alkali concentration');
      const target = capture(intro, /pH ([\d.]+)/, 'target pH');
      const ratio = weakKa(q) / hFromPh(target); const added = initial * ratio / (1 + ratio);
      check(added > 0 && initial - added > 0, `${templateId}: target recipe does not retain both buffer components.`);
      check(Math.abs(ph(weakKa(q) * (initial - added) / added) - target) < 1e-9, `${templateId}: partial-neutralisation recipe misses target pH.`);
      if (modern) {
        const finalV = capture(intro, /diluted to ([\d.]+) cm³/, 'final volume');
        check(number(modern[1]) + added / stock * 1000 <= finalV + 1e-9, `${templateId}: acid and alkali volumes exceed the stated final volume.`);
      }
      rebuilt = [result('volume', added / stock * 1000)]; break;
    }
    case 'buffer-target-volume-stocks': {
      const modern = intro.startsWith('Prepare');
      const finalV = modern ? capture(intro, /Prepare ([\d.]+) cm³/, 'final volume') : capture(intro, /Mix ([\d.]+) cm³ total/, 'final volume'); const acidStock = modern ? capture(intro, /using ([\d.]+) mol dm⁻³/, 'acid stock') : capture(intro, /from ([\d.]+) mol dm⁻³/, 'acid stock'); const saltStock = capture(intro, /and ([\d.]+) mol dm⁻³/, 'salt stock'); const target = modern ? capture(intro, /of a pH ([\d.]+) buffer/, 'target pH') : capture(intro, /pH is ([\d.]+)/, 'target pH');
      const ratio = weakKa(q) / hFromPh(target); const acidV = finalV / (1 + ratio * acidStock / saltStock); const saltV = finalV - acidV;
      check(acidV > 0 && saltV > 0 && Math.abs(acidV + saltV - finalV) < 1e-9, `${templateId}: invalid stock recipe volumes.`);
      check(Math.abs(ph(weakKa(q) * acidStock * acidV / (saltStock * saltV)) - target) < 1e-9, `${templateId}: stock recipe misses target pH.`);
      rebuilt = [result('volume', saltV)]; break;
    }
    case 'buffer-direct': { const ka = weakKa(q), concentrationRows = q.rows.filter((x) => x.label.startsWith('[')); assert.equal(concentrationRows.length, 2, `${templateId}: expected acid and conjugate-base concentrations.`);
      const acidC = number(concentrationRows[0].value); const baseC = number(concentrationRows[1].value); const h = ka * acidC / baseC; rebuilt = [result('h', h), result('ph', ph(h))]; break; }
    case 'buffer-mixed-volumes': {
      const concentrations = q.rows.filter((x) => x.label.startsWith('[')).map((x) => number(x.value)); const volumes = q.rows.filter((x) => /volume/i.test(x.label)).map((x) => number(x.value));
      const nHA = concentrations[0] * volumes[0] / 1000, nA = concentrations[1] * volumes[1] / 1000, h = weakKa(q) * nHA / nA;
      rebuilt = [result('nHA', nHA), result('nA', nA), result('h', h), result('ph', ph(h))]; break;
    }
    case 'partial-buffer-moles': {
      const initial = capture(intro, /^(.+?) mol/, 'initial acid amount'); const added = capture(intro, /by (.+?) mol hydroxide/, 'hydroxide amount'); const remaining = initial - added;
      check(remaining > 0 && added > 0, `${templateId}: non-positive post-neutralisation component.`); const h = weakKa(q) * remaining / added;
      rebuilt = [result('remaining', remaining), result('formed', added), result('h', h), result('ph', ph(h))]; break;
    }
    case 'partial-buffer-solutions': {
      const va = capture(intro, /^(?:Mix )?([\d.]+) cm³/, 'acid volume'); const ca = capture(intro, /of ([\d.]+) mol dm⁻³/, 'acid concentration'); const vb = capture(intro, /with ([\d.]+) cm³/, 'alkali volume'); const cb = capture(intro, /with [\d.]+ cm³ of ([\d.]+) mol dm⁻³/, 'alkali concentration');
      const initial = ca * va / 1000, added = cb * vb / 1000, remaining = initial - added;
      check(remaining > 0 && added > 0, `${templateId}: non-positive post-neutralisation component.`); const h = weakKa(q) * remaining / added;
      rebuilt = [result('initial', initial), result('added', added), result('remaining', remaining), result('formed', added), result('h', h), result('ph', ph(h))]; break;
    }
    case 'buffer-after-addition': {
      const initialHA = capture(intro, /contains (.+?) mol acid/, 'acid amount'); const initialA = capture(intro, /and (.+?) mol conjugate/, 'conjugate-base amount'); const added = capture(intro, /\. (.+?) mol (?:strong |hydrochloric|sodium)/, 'strong reagent amount'); const acidAddition = intro.includes('strong acid') || intro.includes('hydrochloric acid');
      const nHA = acidAddition ? initialHA + added : initialHA - added; const nA = acidAddition ? initialA - added : initialA + added;
      check(nHA > 0 && nA > 0, `${templateId}: ${acidAddition ? 'acid' : 'alkali'} addition exhausts a buffer component.`);
      rebuilt = [result('ph', ph(weakKa(q) * nHA / nA))]; break;
    }
    case 'buffer-recipe-deviation': {
      if (intro.includes('weighing error')) {
        const targetAcidMass = capture(intro, /specifies ([\d.]+) g acid/, 'intended acid mass'); const targetSaltMass = capture(intro, /and ([\d.]+) g salt/, 'intended salt mass');
        const acidError = capture(intro, /acid weighing error is ([+\-\d.]+) g/, 'acid error'); const saltError = capture(intro, /salt weighing error is ([+\-\d.]+) g/, 'salt error');
        const mrRows = q.rows.filter((x) => chemistryText(x.label).includes('Mᵣ')).map((x) => number(x.value)); const intendedHA = targetAcidMass / mrRows[0], intendedA = targetSaltMass / mrRows[1]; const actualHA = (targetAcidMass + acidError) / mrRows[0], actualA = (targetSaltMass + saltError) / mrRows[1];
        check(actualHA > 0 && actualA > 0, `${templateId}: weighing errors give a non-positive component.`); rebuilt = [result('difference', Math.abs(ph(weakKa(q) * actualHA / actualA) - ph(weakKa(q) * intendedHA / intendedA)))];
      } else {
        const target = capture(intro, /pH ([\d.]+)/, 'target pH'); const nHA = capture(intro, /are (.+?) mol acid/, 'acid amount'); const nA = capture(intro, /and (.+?) mol conjugate/, 'conjugate-base amount'); rebuilt = [result('difference', Math.abs(ph(weakKa(q) * nHA / nA) - target))];
      }
      break;
    }
    case 'partial-buffer-ka': {
      const modern = q.rows.length === 0; const initial = modern ? capture(intro, /^([\d.]+) cm³/, 'acid volume') * capture(intro, /of ([\d.]+) mol dm⁻³/, 'acid concentration') / 1000 : row(q, 'Initial acid amount');
      const added = modern ? capture(intro, /by ([\d.]+) cm³/, 'alkali volume') * capture(intro, /by [\d.]+ cm³ of ([\d.]+) mol dm⁻³/, 'alkali concentration') / 1000 : row(q, 'Hydroxide added'); const given = modern ? capture(intro, /pH is ([\d.]+)/, 'final pH') : row(q, 'Final pH');
      check(initial - added > 0 && added > 0, `${templateId}: non-positive reconstructed buffer component.`);
      rebuilt = [result('ka', hFromPh(given) * added / (initial - added))]; break;
    }
    default: throw new Error(`No independent reconstruction for ${templateId}.`);
  }
  compare(q, rebuilt);

  if (templateId.includes('buffer')) {
    for (const item of rebuilt.filter((entry) => entry.key !== 'difference')) {
      check(item.value > 0 && Number.isFinite(item.value), `${templateId}: reconstructed ${item.key} is not positive and finite.`);
    }
  }

  if (templateId.startsWith('weak-acid-') && weakConcentration) {
    let ka;
    try { ka = weakKa(q); } catch (_) { ka = rebuilt.find((answer) => answer.key === 'ka')?.value; }
    if (ka) {
      const approximate = Math.sqrt(ka * weakConcentration); const exact = (-ka + Math.sqrt(ka * ka + 4 * ka * weakConcentration)) / 2;
      check(100 * approximate / weakConcentration < 5, `${templateId}: weak-acid approximation exceeds 5% dissociation.`);
      check(Math.abs(approximate - exact) / exact < 0.03, `${templateId}: approximation differs excessively from exact equilibrium.`);
    }
  }
}

const additions = instances.filter((q) => q.templateId === 'buffer-after-addition');
check(additions.some((q) => q.intro.includes('strong acid') || q.intro.includes('hydrochloric acid')), 'Buffer-addition samples did not include strong acid.');
check(additions.some((q) => q.intro.includes('strong alkali') || q.intro.includes('sodium hydroxide')), 'Buffer-addition samples did not include strong alkali.');

// Worked-answer chemistry: these checks guard errors that a numerical answer
// comparison cannot see. Equations and substitutions are revealed only after
// submission, so their labels and units must still be chemically meaningful.
for (const q of instances) {
  const working = q.working.join(' ');
  check(!/pH\s*=\s*Kₐ\s*ratio/i.test(working), `${q.templateId}: [H⁺] is mislabeled as pH in the worked answer.`);
  for (let index = 0; index < q.allResponses.length; index += 1) {
    const answer = q.allResponses[index];
    const exponent = answer.expected === 0 ? 0 : Math.floor(log10(Math.abs(answer.expected)));
    const scientific = answer.expected === 0 ? '0' : `${(answer.expected / 10 ** exponent).toFixed(2)} × 10^${exponent}`;
    const representations = [answer.expected.toFixed(2), answer.expected.toPrecision(3), scientific];
    const relevantWorking = q.level === 1 ? (q.answerParts[index] || []).join(' ') : working;
    check(representations.some((value) => relevantWorking.includes(value)),
      `${q.templateId}: worked answer part ${index + 1} does not show the reconstructed ${answer.key} result.`);
  }
}

console.log(`Acid progression chemistry passed: ${templateLevels.size} templates, ${instances.length} generated questions, ${checks} checks.`);
