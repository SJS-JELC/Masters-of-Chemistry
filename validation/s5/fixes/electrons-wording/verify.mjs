import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { data } from '../../../../src/activities/alevel/electrons-bonding/data.js';
import { electronsBondingProvider as provider } from '../../../../src/activities/alevel/electrons-bonding/provider.ts';
import { electronsBondingMarking as policy } from '../../../../src/activities/alevel/electrons-bonding/marking.ts';

const directory = import.meta.dirname;
const project = path.resolve(directory, '../../../..');
const providerPath = 'src/activities/alevel/electrons-bonding/provider.ts';
const qualified = {
  EB07: 'How many orbitals are there in one p subshell?',
  EB08: 'How many orbitals are there in one d subshell?',
  EB09: 'What type of structure do solid ionic compounds have?',
};
const protectedPaths = [
  'src/activities/alevel/electrons-bonding/data.js',
  'src/activities/alevel/electrons-bonding/core.js',
  'src/activities/alevel/electrons-bonding/marking.ts',
  'src/activities/alevel/electrons-bonding/index.ts',
  '../Masters-of-A-Level-Chemistry/src/activities/electrons-bonding/data.js',
  '../Masters-of-A-Level-Chemistry/src/activities/electrons-bonding/core.js',
];
const hash = relative => crypto.createHash('sha256').update(fs.readFileSync(path.resolve(project, relative))).digest('hex');
const write = (name, value) => fs.writeFileSync(path.join(directory, name), JSON.stringify(value, null, 2) + '\n');
const ref = (id, seed = 0) => ({ activityId: 'alevel/electrons-bonding', questionId: id, level: 1, seed });
const selection = seed => ({ activityId: 'alevel/electrons-bonding', gemId: 'l6-t2-1-1', level: 1, seed, previousQuestionIds: ['EB07'] });
const cases = record => [...record.fields[0].accept, ...record.fields[0].reject, '', 'unrelated content', 'not ' + record.sourceAnswer];

if (process.argv[2] === 'prepare') {
  assert(!fs.existsSync(path.join(directory, 'before.json')), 'Before evidence already exists; do not overwrite.');
  fs.copyFileSync(path.resolve(project, providerPath), path.join(directory, 'provider-before.ts'));
  write('before.json', {
    capturedAt: new Date().toISOString(),
    providerSha256: hash(providerPath),
    protectedFiles: protectedPaths.map(relative => ({ path: relative, sha256: hash(relative) })),
    questions: data.questions.map(record => provider.restore(ref(record.id))),
    selections: Array.from({ length: 256 }, (_, seed) => provider.select(selection(seed))),
    markings: data.questions.map(record => ({ id: record.id, cases: cases(record).map(value => ({ value, result: policy.mark(provider.restore(ref(record.id)), { 'answer-0': { kind: 'text', value } }) })) })),
  });
  console.log('Before provider, all14 questions/marking cases, 256 seeded selections and protected source fingerprints retained.');
} else {
  const before = JSON.parse(fs.readFileSync(path.join(directory, 'before.json'), 'utf8'));
  for (const file of before.protectedFiles) assert.equal(hash(file.path), file.sha256, file.path);
  const source = vm.createContext({});
  for (const filename of ['data.js', 'core.js']) vm.runInContext(fs.readFileSync(path.resolve(project, '../Masters-of-A-Level-Chemistry/src/activities/electrons-bonding', filename), 'utf8'), source);
  assert.deepEqual(data, JSON.parse(JSON.stringify(source.BondingData)), 'The entire extracted original bank must remain exact.');
  const prompts = [];
  let markingCases = 0;
  for (const [index, record] of data.questions.entries()) {
    const current = provider.restore(ref(record.id));
    const expected = structuredClone(before.questions[index]);
    expected.context[0].text = qualified[record.id] ?? record.prompt;
    assert.deepEqual(current, expected, `${record.id}: only the authorised pupil prompt may change`);
    assert.equal(current.context[0].text, qualified[record.id] ?? record.prompt);
    for (const seed of [1, 7919, 0xffffffff]) {
      const seeded = provider.restore(ref(record.id, seed));
      assert.deepEqual(seeded, { ...current, ref: ref(record.id, seed) });
    }
    assert.deepEqual(provider.resolveLink(record.id), ref(record.id));
    assert.deepEqual(provider.resolveLink(' ' + record.id.toLowerCase() + ' '), ref(record.id));
    for (const { value, result } of before.markings[index].cases) {
      const assessed = policy.mark(current, { 'answer-0': { kind: 'text', value } });
      assert.deepEqual(assessed, result, `${record.id}: unchanged assessment for ${JSON.stringify(value)}`);
      const original = source.BondingCore.mark(source.BondingData.questions[index], [value], source.BondingData);
      assert.equal(assessed.accepted, original.ready);
      if (assessed.accepted) {
        assert.equal(assessed.marks.earned, original.marks.filter(Boolean).length);
        assert.equal(assessed.marks.available, original.marks.length);
        assert.equal(policy.masteryScore(assessed.marks), source.BondingCore.score(original.marks));
      }
      markingCases++;
    }
    prompts.push({ id: record.id, sourcePrompt: record.prompt, pupilPrompt: current.context[0].text, changed: current.context[0].text !== record.prompt, sourceFeedback: record.feedback, spec: record.spec, sourceAnswer: record.sourceAnswer });
  }
  assert.deepEqual(prompts.filter(item => item.changed).map(item => item.id), ['EB07', 'EB08', 'EB09']);
  assert.deepEqual(Array.from({ length: 256 }, (_, seed) => provider.select(selection(seed))), before.selections);
  assert.equal(new Set(data.questions.map(record => record.id)).size, 14);
  assert.deepEqual(provider.coverage, [{ kind: 'fixed', questionIds: data.questions.map(record => record.id) }]);
  fs.copyFileSync(path.resolve(project, providerPath), path.join(directory, 'provider-after.ts'));
  const diff = spawnSync('git', ['diff', '--no-index', '--', path.join(directory, 'provider-before.ts'), path.join(directory, 'provider-after.ts')], { encoding: 'utf8' });
  assert.equal(diff.status, 1, 'Expected a bounded before/after diff.');
  fs.writeFileSync(path.join(directory, 'provider.diff'), diff.stdout);
  const commands = [];
  for (const [id, args] of [['typecheck', ['node_modules/typescript/bin/tsc', '--noEmit']], ['prettier-check', ['node_modules/prettier/bin/prettier.cjs', '--check', providerPath]]]) {
    const result = spawnSync(process.execPath, args, { cwd: project, encoding: 'utf8' });
    fs.writeFileSync(path.join(directory, id + '.log'), result.stdout + '\n' + result.stderr);
    assert.equal(result.status, 0, `${id} must pass; retained log contains failure if any.`);
    commands.push({ id, command: 'node ' + args.join(' '), exitCode: result.status });
  }
  assert.equal(JSON.parse(fs.readFileSync(path.join(project, 'node_modules/prettier/package.json'), 'utf8')).version, '3.6.2');
  write('verification.json', { stableId: 'S5-FIX-ELECTRONS-WORDING', status: 'PASS', checkedAt: new Date().toISOString(), changedQuestionIds: ['EB07', 'EB08', 'EB09'], exactUnchangedPrompts: 11, fixedBankQuestions: 14, markingCases, seededSelections: 256, seedsCheckedPerQuestion: [0, 1, 7919, 0xffffffff], questionsOtherwiseExact: true, sourceDataExactlyEqual: true, idsAnswersHintsFeedbackMarksUnchanged: true, providerBeforeSha256: before.providerSha256, providerAfterSha256: hash(providerPath), protectedFiles: before.protectedFiles, commands, prompts, independentReview: 'A22 owns final chemistry/build review; A01 owns build/manifests and stage acceptance.' });
  console.log(`PASS all14 prompts: exactly3 qualifications,11 source-exact; ${markingCases} unchanged marking cases;256 unchanged seeded selections; typecheck and pinned Prettier3.6.2 PASS.`);
}
