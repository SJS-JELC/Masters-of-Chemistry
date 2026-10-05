import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import ts from 'typescript';
import prettier from 'prettier';

const project = path.resolve(import.meta.dirname, '..');
const evidence = path.join(project, '.artifacts/formatting');
const write = process.argv.includes('--write');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const generatedNames = new Set(['data.ts', 'bank.ts', 'sources.ts', 'provenance.ts', 'periodic-data.ts', 'reviewed-co-svg.ts']);
const config = JSON.parse(fs.readFileSync(path.join(project, '.prettierrc.json'), 'utf8'));
function files(directory) {
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return files(file);
    return /\.tsx?$/.test(entry.name) ? [file] : [];
  });
}
const candidates = [...files(path.join(project, 'src')), ...files(path.join(project, 'development/authoring'))];
const excluded = candidates.filter(file => {
  const relative = path.relative(project, file).replaceAll('\\', '/');
  return file.endsWith('.d.ts') || generatedNames.has(path.basename(file)) ||
    relative === 'src/catalogue/definitions.ts' || relative.startsWith('development/authoring/families/');
});
const selected = candidates.filter(file => !excluded.includes(file)).sort();

// Compare syntax without trivia or redundant parentheses. JSX is separately
// checked after the TypeScript JSX transform, which applies React whitespace rules.
// Type nodes nested inside JSX are also retained in a separate type fingerprint.
function syntax(node, skipJsx) {
  if (ts.isParenthesizedExpression(node) || ts.isParenthesizedTypeNode(node)) return syntax(node.expression ?? node.type, skipJsx);
  if (skipJsx && (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node))) return ['JSX-runtime-checked'];
  const values = [ts.SyntaxKind[node.kind]];
  if (ts.isIdentifier(node) || ts.isLiteralExpression(node) || ts.isTemplateLiteralToken(node)) values.push(node.text);
  if (ts.isVariableDeclarationList(node)) values.push(node.flags & (ts.NodeFlags.Const | ts.NodeFlags.Let));
  if ('isTypeOnly' in node) values.push(node.isTypeOnly);
  ts.forEachChild(node, child => {
    if (ts.isPropertyAssignment(node) && node.name.getText() === 'children' && child === node.initializer && ts.isArrayLiteralExpression(child)) {
      // Prettier may split one JSX text child into adjacent text and {' '}.
      // Merge only generated React children text; ordinary arrays stay exact.
      const children = [];
      for (const element of child.elements) {
        if (ts.isStringLiteral(element)) {
          const last = children.at(-1);
          if (last?.[0] === 'ReactText') last[1] += element.text;
          else children.push(['ReactText', element.text]);
        } else children.push(syntax(element, skipJsx));
      }
      values.push(['ReactChildren', ...children]);
    } else if (child === node.name && (ts.isIdentifier(child) || ts.isStringLiteral(child) || ts.isNumericLiteral(child))) {
      values.push(['Name', child.text]);
    } else values.push(syntax(child, skipJsx));
  });
  return values;
}
function fingerprints(text, file) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  assert.equal(source.parseDiagnostics.length, 0, `Parse diagnostics: ${file}`);
  const typeNodes = [];
  function types(node) {
    if (ts.isTypeNode(node) && !ts.isParenthesizedTypeNode(node)) typeNodes.push(syntax(node, false));
    ts.forEachChild(node, types);
  }
  types(source);
  const emitted = ts.transpileModule(text, {fileName: file, compilerOptions: {
    target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX,
    removeComments: true, verbatimModuleSyntax: true,
  }}).outputText;
  const executable = ts.createSourceFile('output.js', emitted, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  return {source: hash(JSON.stringify(syntax(source, true))), types: hash(JSON.stringify(typeNodes)), runtime: hash(JSON.stringify(syntax(executable, false)))};
}

if (process.argv.includes('--self-test')) {
  const same = (before, after) => assert.deepEqual(fingerprints(before, 'check.tsx'), fingerprints(after, 'check.tsx'));
  const different = (before, after) => assert.notDeepEqual(fingerprints(before, 'check.tsx'), fingerprints(after, 'check.tsx'));
  same('const value={"answer":2};', "const value = { answer: 2 };\n");
  same('const view=<p>Hello <b>world</b></p>;', "const view = <p>Hello{' '}<b>world</b></p>;");
  different('const answer=2.70;', 'const answer=2.71;');
  different('const answer=a+b;', 'const answer=a-b;');
  different('type Answer=string;', 'type Answer=number;');
  different('const view=<p>Correct</p>;', 'const view=<p>Incorrect</p>;');
  different('const data=["one two"];', 'const data=["one"," two"];');
  fs.mkdirSync(evidence, {recursive: true});
  const report = {status: 'PASS', checkedAt: new Date().toISOString(), equivalentCases: 2, changedCasesRejected: 5};
  fs.writeFileSync(path.join(evidence, 'semantic-checker-tests.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
  process.exit(0);
}

fs.mkdirSync(evidence, {recursive: true});
const excludedBefore = Object.fromEntries(excluded.map(file => [path.relative(project, file).replaceAll('\\', '/'), hash(fs.readFileSync(file))]));
const results = [];
for (const file of selected) {
  const relative = path.relative(project, file).replaceAll('\\', '/');
  const before = fs.readFileSync(file, 'utf8');
  const after = await prettier.format(before, {...config, filepath: file});
  const beforeSemantic = fingerprints(before, file), afterSemantic = fingerprints(after, file);
  assert.deepEqual(afterSemantic, beforeSemantic, `Formatter semantic change: ${relative}`);
  if (write && before !== after) {
    const archive = path.join(evidence, 'before', relative + '.txt');
    fs.mkdirSync(path.dirname(archive), {recursive: true});
    if (!fs.existsSync(archive)) fs.writeFileSync(archive, before);
    fs.writeFileSync(file, after);
  }
  results.push({path: relative, changed: before !== after, beforeSha256: hash(before), afterSha256: hash(after), semantic: beforeSemantic,
    beforeLines: before.split('\n').length, afterLines: after.split('\n').length});
}
for (const [relative, expected] of Object.entries(excludedBefore)) assert.equal(hash(fs.readFileSync(path.join(project, relative))), expected);
const report = {status: write || results.every(row => !row.changed) ? 'PASS' : 'FAIL', checkedAt: new Date().toISOString(),
  mode: write ? 'write' : 'check', formatter: `prettier@${prettier.version}`, files: results.length, changed: results.filter(row => row.changed).length,
  semanticChecks: ['source syntax ignoring trivia and JSX layout', 'all type nodes including nested JSX assertions', 'transformed executable JSX syntax'],
  exclusions: 'Extracted/source data, fingerprints, generated definitions, declaration files and retained generated CLI instances are byte-preserved.',
  excludedHashes: excludedBefore, results};
fs.writeFileSync(path.join(evidence, write ? 'write-report.json' : 'check-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({status: report.status, files: report.files, changed: report.changed, mode: report.mode}));
if (report.status !== 'PASS') process.exitCode = 1;
