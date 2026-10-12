import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  applyApprovedAmendments,
  amendmentAuthority,
  contentEvidenceDirectory,
} from './approved-amendments.mjs';
import { prepareMarkingFixtures } from './marking-fixtures.mjs';
const app = path.resolve(import.meta.dirname, '../..');
const audit = path.join(app, 'resources/recall/source-audit');
const source = 'development/igcse/activities/recall/data/igcse-recall-working.json';
const raw = await fs.readFile(path.join(audit, 'igcse-recall-working.json'));
const bank = JSON.parse(raw.toString('utf8'));
const sha256 = crypto.createHash('sha256').update(raw).digest('hex');
const provenance = JSON.parse(
  await fs.readFile(path.join(app, 'src/recall/provenance.json'), 'utf8'),
);
const catalogue = JSON.parse(
  await fs.readFile(path.join(app, 'src/landing/catalogue-data.json'), 'utf8'),
);
const ionIds = ['027', '028', '029', '030', '031', '032', '033'];
const ions = {
  '027': ['NO3^-', 'NO3-', 'NO₃⁻', 'NO3 -1'],
  '028': ['CO3^2-', 'CO32-', 'CO₃²⁻', 'CO3 -2'],
  '029': ['NH4^+', 'NH4+', 'NH₄⁺', 'NH4 +1'],
  '030': ['Zn^2+', 'Zn2+', 'Zn²⁺', 'Zn +2'],
  '031': ['Ag^+', 'Ag+', 'Ag⁺', 'Ag +1'],
  '032': ['OH^-', 'OH-', 'OH⁻', 'OH -1'],
  '033': ['SO4^2-', 'SO42-', 'SO₄²⁻', 'SO4 -2'],
};
const exclusions = {
  'igcse-recall-087':
    'Q087 quarantined by root accepted independent chemistry review; no replacement authorised.',
};
const baseFacts = bank.questions
  .filter((q) => !exclusions[q.id])
  .map((q) => {
    if (!q.teacherReview.decision.startsWith('approved')) throw Error('Unapproved source ' + q.id);
    const group = catalogue.igcse.groups.find((g) => g.topics.some((t) => t[0] === q.topic.number));
    const gem = group.key + '-' + q.subtopic.id.replace('.', '-');
    const fact = {
      id: q.id,
      course: 'igcse',
      prompt: q.question,
      answer: q.answer,
      gemIds: [gem],
      sources: [{ path: source, sha256, symbolOrSection: q.id + ' ' + q.teacherReview.decision }],
    };
    if (provenance.igcse.includes(q.id)) {
      const previous = provenance.originals.igcse.find((p) => p['Question ID'] === q.id);
      fact.prompt = previous.Question;
      fact.answer = previous['Allowed answer 1'];
      fact.accepted = [1, 2, 3, 4].map((n) => previous['Allowed answer ' + n]).filter(Boolean);
      return fact;
    }
    const short = q.id.slice(-3);
    const amendments = {
      107: {
        prompt: 'Define the term unsaturated when talking about organic molecules.',
        answer: 'A molecule containing at least one carbon–carbon double or triple bond.',
        accepted: [
          'A molecule with at least one C=C bond',
          'A molecule containing a carbon-carbon double bond',
          'A molecule containing at least one carbon-carbon double or triple bond',
          'A molecule containing at least one carbon-carbon triple bond',
          'C=C',
          'C≡C',
        ],
        context: [
          'At IGCSE the examples here are alkenes, which contain C=C. Carbon–carbon triple bonds also give unsaturation; this qualification does not add a new assessed alkyne topic.',
        ],
      },
      '046': {
        prompt:
          'At standard atmospheric pressure, how could you check if water is pure using its boiling point?',
        context: [
          'The quoted 100 °C is the classroom value at standard atmospheric pressure, not a pressure-independent or infinitely precise measurement.',
        ],
      },
      101: { prompt: 'Give the general formula for open-chain alkanes.' },
      105: {
        prompt:
          'Give the general formula for open-chain alkenes with one carbon–carbon double bond.',
      },
      113: {
        prompt:
          'Give a typical classroom temperature for producing ethanol by fermentation of sugars using yeast.',
        answer: 'About 30 °C',
      },
      109: {
        prompt:
          'Give two possible environmental problems associated with common synthetic plastics.',
      },
    };
    if (amendments[short]) Object.assign(fact, amendments[short]);
    if (short === '107') return fact;
    if (ionIds.includes(short)) {
      fact.answer = ions[short][2];
      fact.accepted = ions[short];
      fact.matching = { kind: 'chemical' };
      fact.context = [
        'Enter formula and signed charge together. Use a caret for a typed charge, for example CO3^2-.',
      ];
      return fact;
    }
    const parts = q.answerSets[0].parts;
    const clean = (a) => (a === 'Agcl' ? 'AgCl' : a);
    function field(p) {
      return {
        id: p.id,
        label: p.label,
        answer: clean(p.accepted[0]),
        accepted: p.accepted.map(clean),
        ...(q.answerMatching === 'contains'
          ? { matching: { kind: 'concepts', all: [p.accepted.map(clean)] } }
          : {}),
      };
    }
    if (parts.length === 1) {
      fact.answer = clean(parts[0].accepted[0]);
      fact.accepted = parts[0].accepted.map(clean);
      if (q.response.numeric) {
        const n = q.response.numeric;
        fact.matching = {
          kind: 'numeric',
          values: n.acceptedValues ?? [],
          ...(n.minimum !== undefined ? { minimum: n.minimum, maximum: n.maximum } : {}),
          ...(n.unit ? { unit: n.unit } : {}),
        };
      } else if (q.response.chemicalNotation) fact.matching = { kind: 'chemical' };
      else if (q.answerMatching === 'contains')
        fact.matching = { kind: 'concepts', all: [fact.accepted] };
      if (q.questionType === 'mcq')
        fact.accepted = fact.accepted.flatMap((a) => [a, a.replace(/&/g, 'and')]);
    } else {
      const groups = parts.map(field),
        any = q.answerSets[0].mode === 'any';
      fact.fields = groups.slice(0, any ? q.answerSets[0].required : groups.length);
      fact.answerGroups = groups;
      fact.fieldOrder = q.response.conditionalFields
        ? 'exceptions'
        : q.response.fieldAssignment === 'test-result-pairs-in-either-order'
          ? 'pairs'
          : q.answerSets[0].mode === 'ordered'
            ? 'labelled'
            : q.id === 'igcse-recall-064' ||
                any ||
                ['038', '089', '103', '104', '108', '109', '118'].includes(short)
              ? 'any'
              : 'labelled';
      fact.answer = fact.fields.map((f) => f.label + ': ' + f.answer).join('\n');
      if (any) fact.fields = fact.fields.map((f, i) => ({ ...f, label: 'Answer ' + (i + 1) }));
    }
    const context = {
      unused046:
        'Assume standard atmospheric pressure. A sharp boiling point supports this school-level purity check.',
      101: 'For the open-chain alkane homologous series.',
      105: 'For open-chain alkenes containing one carbon–carbon double bond.',
      unused113: 'Give the typical classroom fermentation temperature.',
      109: 'Consider common synthetic plastics; properties vary between polymers.',
      '085':
        'Calcium sulphate is sparingly soluble; barium and lead sulphates are insoluble in this classroom rule.',
    };
    if (context[short]) fact.context = [context[short]];
    if (short === '046') {
      fact.fields[0].answer = 'Measure boiling point';
      fact.fields[0].accepted.push('Measure the boiling point');
      fact.fields[1].answer = 'A sharp boiling point of 100 °C';
      fact.fields[1].accepted.push(
        'Boils at 100 °C',
        'Boils at 100 degrees Celsius',
        'A sharp boiling point of 100 °C',
      );
      fact.answer =
        'Measure the boiling point; a sharp boiling point of 100 °C (the classroom value).';
    }
    if (short === '113') fact.answer = 'About 30 °C';
    if (short === '109') {
      const aliases = [
        ['Many do not biodegrade', 'Many plastics do not biodegrade'],
        ['Burning some can release toxic gases', 'Some release toxic gases when burned'],
        [
          'Many are made from non-renewable crude oil',
          'Many plastics are made from non-renewable crude oil',
        ],
      ];
      fact.answerGroups.forEach((g, i) => {
        g.accepted.push(...aliases[i]);
      });
      fact.answer =
        'Any two: many do not biodegrade; burning some can release toxic gases; many are made from non-renewable crude oil.';
    }
    return fact;
  });
const authorizedBytes = await fs.readFile(path.join(app, amendmentAuthority.path));
const authorizedHash = crypto.createHash('sha256').update(authorizedBytes).digest('hex');
const amendmentBytes = await fs.readFile(path.join(app, 'src/recall/approved-amendments.mjs'));
const amendmentHash = crypto.createHash('sha256').update(amendmentBytes).digest('hex');
const facts = applyApprovedAmendments(baseFacts, (section) => ({
  path: amendmentAuthority.path,
  sha256: authorizedHash,
  symbolOrSection: amendmentAuthority.section + ': ' + section,
}));
// Current user follow-up authority supplements the preserved original amendment provenance.
const followupPath = 'resources/recall/authority/recall-codes-authorized-plan.json';
const followupHash = crypto.createHash('sha256').update(await fs.readFile(path.join(app, followupPath))).digest('hex');
for (const f of facts) if (['igcse-recall-037', 'igcse-recall-039', 'igcse-recall-046'].includes(f.id))
  f.sources.push({path: followupPath, sha256: followupHash, symbolOrSection: '11 October 2026 approved content/presentation follow-up ' + f.id});
const dispositionPath = contentEvidenceDirectory() + '/latest-source-disposition.json';
await fs.mkdir(path.dirname(path.join(app, dispositionPath)), { recursive: true });
await fs.writeFile(
  path.join(app, 'src/recall/approved-igcse-facts.json'),
  JSON.stringify(facts, null, 2) + '\n',
);
await fs.writeFile(
  path.join(app, dispositionPath),
  JSON.stringify(
    {
      source,
      sha256,
      activeApproved: bank.questions.length,
      imported: facts.length,
      numberedBeforeAmendments: baseFacts.length,
      retired: ['igcse-recall-061', 'igcse-recall-025'],
      replacements: ['igcse-recall-025a', 'igcse-recall-025b'],
      added: ['119', '120', '121', '122', '123', '124'].map((n) => 'igcse-recall-' + n),
      amendments: {
        ...amendmentAuthority,
        sha256: authorizedHash,
        generatorPath: 'src/recall/approved-amendments.mjs',
        generatorSha256: amendmentHash,
      },
      generatedAdditionsActive: 0,
      followupAuthority: {path: followupPath, sha256: followupHash},
      authoringAssumptions: {'igcse-recall-046': 'Standard atmospheric pressure; conventional school-level 100°C boiling and 0°C melting/freezing checks. Pressure assumption is authoring-only; paired alternatives remain accepted.'},
      preservedHistoricalDefinitionCount: 150,
      removed: bank.removedQuestions.map((q) => q.id),
      exclusions,
      preservedCurrent: provenance.igcse,
      adaptations: [
        'Authorized 10 October amendments supersede earlier typed-only MCQ presentation while preserving original review evidence.',
        'Retire061; replace025 with025a/b; add six explicitly authorized acid facts; remove29 generated additions from active export only.',
        'Stable choice IDs, independent text fields, distinct dynamic exception groups, coherent method/result tuples and explicit chemical/numeric notation follow the frozen recall contract.',
        'Combined ion formula and signed charge uses source-approved atomic notation rather than separate fields.',
        'Chemical aliases preserve case; source Agcl corrected to AgCl.',
        'Source-approved any/ordered/paired/conditional groups retain distinct-answer and dependency requirements.',
        'Stated context supplies pressure and conventional homologous-series/fermentation/plastics qualifications.',
      ],
      access:
        'Node direct access initially EPERM; exact escalated shell reads succeeded. Latest receipt and authoring bank reviewed; original source bytes unchanged.',
    },
    null,
    2,
  ) + '\n',
);
console.log(
  JSON.stringify({ approved: bank.questions.length, imported: facts.length, exclusions }),
);

await import('./prepare-typed-provenance.mjs');
await prepareMarkingFixtures(facts, app);
