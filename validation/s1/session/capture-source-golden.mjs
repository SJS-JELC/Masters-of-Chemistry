import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';

const workspace = process.cwd();
const out = path.join(workspace, 'apps/Masters-of-Chemistry/validation/s1/session');
const NOW = 1791064800000;
const sources = [];
const digest = text => crypto.createHash('sha256').update(text).digest('hex');
function read(relative) { const data = fs.readFileSync(path.join(workspace, relative), 'utf8'); sources.push({ path: relative, sha256: digest(data), bytes: Buffer.byteLength(data) }); return data; }
function legacy(course) {
  const root = `apps/Masters-of-${course === 'alevel' ? 'A-Level' : 'IGCSE'}-Chemistry/src`;
  const store = new Map();
  const context = vm.createContext({ Date: class extends Date { static now() { return NOW; } }, localStorage: { getItem: key => store.get(key) ?? null } });
  if (course === 'igcse') vm.runInContext(read(root + '/assets/igcse-mastery-config.js'), context);
  const runtime = read(root + (course === 'alevel' ? '/assets/alevel-mastery.js' : '/landing/progress.js'));
  vm.runInContext(runtime, context);
  vm.runInContext(read(root + '/assets/test-mode-core.js'), context);
  const api = course === 'alevel' ? context.ALevelMastery : context.MastersProgress;
  const settings = course === 'alevel' ? Object.entries(api.config).map(([gemId, c]) => ({ gemId, supportedLevels: c.availableGrades.map(level => ({ level, halfLife: c.halfLives[level], label: c.levelLabels[level] })), threshold: api.threshold, comparison: 'strictly-greater', historicalAliases: gemId === 'l6-t2-1-3' ? ['l6-t2-1-4'] : [], legacySourceKeys: c.progressionVersion === 2 ? [api.acidKey] : [api.key], activeProgressionVersion: c.progressionVersion }))
    : Object.values(context.IGCSEMasteryConfig.activities).map(c => ({ gemId: c.leafId, supportedLevels: (c.availableGrades || [1, 2, 3]).map(level => ({ level, halfLife: c.halfLives[level], label: api.bands[level] })), threshold: context.IGCSEMasteryConfig.threshold, comparison: 'strictly-greater', historicalAliases: [], legacySourceKeys: [api.key], activeProgressionVersion: 1 }));
  return { store, api, settings, core: context.TestModeCore, summary(setting, level, records) {
    let value;
    if (course === 'alevel') { store.set(api.key, JSON.stringify(records.filter(r => r.progressionVersion !== 2))); store.set(api.acidKey, JSON.stringify(records.filter(r => r.progressionVersion === 2))); vm.runInContext(runtime, context); value = context.ALevelMastery.summary(setting.gemId, level); }
    else value = api.summarise(records, setting.gemId, level, NOW);
    const filtered = course === 'alevel' ? api.read(undefined, NOW).filter(r => r.leafId === setting.gemId && r.level === level && (r.progressionVersion === setting.activeProgressionVersion || setting.activeProgressionVersion === 1 && r.progressionVersion === undefined)) : api.clean(records, NOW).filter(r => r.leafId === setting.gemId && r.grade === level);
    return { gemId: setting.gemId, level, score: value.score, count: value.count, mastered: value.mastered, lastCompletedAt: filtered.at(-1)?.completedAt ?? null };
  } };
}
const cases = [], settings = {}, engines = {};
for (const course of ['alevel', 'igcse']) {
  const source = legacy(course); settings[course] = source.settings; engines[course] = source;
  for (const setting of source.settings) for (const { level } of setting.supportedLevels) {
    const patterns = { empty: [], correct: Array(40).fill(1), incorrect: Array(12).fill(0), partial: Array(10).fill(0.5), mixed: [1, 0, 0.5, 1, 1, 0, 1, 0.5] };
    for (const [name, scores] of Object.entries(patterns)) {
      const records = scores.map((score, index) => ({ id: `${course}-${setting.gemId}-${level}-${index}`, leafId: setting.gemId, ...(course === 'alevel' ? { level, progressionVersion: setting.activeProgressionVersion } : { grade: level }), score, completedAt: NOW - (scores.length - index) * 1000 }));
      const expected = source.summary(setting, level, records);
      cases.push({ course, name, setting, level, records, expected });
    }
    const original = { id: 'duplicate', leafId: setting.gemId, ...(course === 'alevel' ? { level, progressionVersion: setting.activeProgressionVersion } : { grade: level }), score: 0.5, completedAt: NOW - 8000 };
    const records = [{ ...original, id: 'later', score: 1, completedAt: NOW - 1000 }, original, { ...original, score: 1 }, { ...original, id: 'future', completedAt: NOW + 1 }];
    cases.push({ course, name: 'ordering-dedup-future', setting, level, records, expected: source.summary(setting, level, records) });
    if (course === 'alevel') {
      const versionRecords = [ { ...original, id: 'missing-version', progressionVersion: undefined, score: 1 }, { ...original, id: 'old-version', progressionVersion: 1, score: 1 }, { ...original, id: 'new-version', progressionVersion: 2, score: 0.5 } ];
      cases.push({ course, name: 'progression-separation', setting, level, records: versionRecords, expected: source.summary(setting, level, versionRecords) });
      if (setting.historicalAliases.length) {
        const records = [{ ...original, leafId: setting.historicalAliases[0] }];
        cases.push({ course, name: 'dot-cross-alias', setting, level, records, expected: source.summary(setting, level, records) });
      }
    }
  }
}
// Retained scheduler sequence uses one level per source-backed key for an isolated model comparison.
const summary = { A: { 1: { score: 0.9, mastered: true, days: 9 }, 2: { score: 0, mastered: false, days: 0 }, 3: { score: 0, mastered: false, days: 0 } }, B: { 1: { score: 0.3, mastered: false, days: 0 } } };
const old = engines.alevel.core.create(['A', 'B'], { A: { levels: [1,2,3] }, B: { levels: [1] } }, (gem, level) => summary[gem][level], NOW, 'scheduler-golden');
const transitions = [];
for (const [index, result] of [{ score: 1, independent: true }, { score: 0.5, independent: true }, { score: 1, independent: false }, { score: 1, independent: true }, { score: 1, independent: true }, { score: 1, independent: true }].entries()) {
  const current = engines.alevel.core.next(old, (gem, level) => summary[gem][level], NOW + index, `attempt-${index}`);
  engines.alevel.core.accept(old, { ...result, completedAt: NOW + index, evidence: { score: result.score } }, (gem, level) => summary[gem][level], NOW + index);
  transitions.push({ target: current.leafId, level: current.level, round: [...old.round], last: old.lastLeaf, gems: JSON.parse(JSON.stringify(old.gems)) });
}
const result = { schemaVersion: 1, capturedAt: new Date().toISOString(), now: NOW, sources, settings, cases, scheduler: { initialSummary: summary, transitions } };
fs.mkdirSync(out, { recursive: true }); fs.writeFileSync(path.join(out, 'source-golden.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ status: 'PASS', masteryCases: cases.length, settings: Object.values(settings).flat().length, schedulerTransitions: transitions.length, sourceFiles: sources.length }));
