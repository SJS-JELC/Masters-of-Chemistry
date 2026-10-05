import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import prettier from 'prettier';

const project = path.resolve(import.meta.dirname, '..');
const source = 'apps/Masters-of-A-Level-Chemistry/src/activities/flashcards/cards.js';
const raw = fs.readFileSync(path.resolve(project, '../..', source), 'utf8');
// This source is a generated data assignment: parse its JSON without executing it.
const marker = 'globalThis.FLASHCARDS = ';
assert(raw.includes(marker));
const cards = JSON.parse(raw.slice(raw.indexOf(marker) + marker.length).trim().replace(/;$/, ''));
assert.equal(cards.length, 6, 'Changed bank scope needs review before replacing the approved sample');
assert.equal(new Set(cards.map((card) => card.id)).size, cards.length);
for (const card of cards) {
  assert(card.id && card.prompt && card.answer && card.spec);
  assert(!card.diagram, 'A newly introduced diagram needs an explicit content adapter and review');
}
const data = cards.map((card) => ({ id: card.id, prompt: [{ kind: 'text', text: card.prompt }], answer: [{ kind: 'text', text: card.answer }] }));
const directory = path.join(project, 'src/development/flashcards');
const config = JSON.parse(fs.readFileSync(path.join(project, '.prettierrc.json')));
const text = `import type { Flashcard } from '../../recall/FlashcardTable.tsx';\n\n// Verbatim teacher-reviewed sample. See provenance.json.\nexport const reviewedCards: readonly Flashcard[] = ${JSON.stringify(data, null, 2)};\n`;
const formatted = await prettier.format(text, { ...config, parser: 'typescript' });
const provenance = JSON.stringify({
  source, sha256: crypto.createHash('sha256').update(raw).digest('hex'),
  bankRevision: raw.match(/FLASHCARD_BANK_REVISION = "([^"]+)"/)[1],
  review: 'development/alevel/validation/reviewed-flashcards/VALIDATION.md',
  curriculum: 'resources/curriculum/ocr-a-level/a-level-specification-map.md',
  cards: cards.map((card) => ({ id: card.id, spec: card.spec })),
  diagrams: 'No diagram fields in the six approved source records.',
}, null, 2) + '\n';
for (const [name, content] of [['data.ts', formatted], ['provenance.json', provenance]]) {
  const file = path.join(directory, name);
  if (process.argv.includes('--write')) fs.writeFileSync(file, content);
  else assert.equal(fs.readFileSync(file, 'utf8'), content, `${name} differs; inspect the source before regenerating with --write`);
}
console.log(process.argv.includes('--write') ? 'Regenerated six reviewed sample cards and provenance.' : 'PASS: sample data and provenance reproduce exactly.');
