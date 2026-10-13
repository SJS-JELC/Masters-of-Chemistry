import test from 'node:test';
import assert from 'node:assert/strict';
import { formatScientificNumber } from '../../src/ui/scientific-number-format.ts';
import { parseScientificNumber } from '../../src/domain/attempt/input-checks.ts';
import { parseNumeric } from '../../src/chemistry/thermochemistry/presentation.ts';
import { rateProvider } from '../../src/activities/alevel/rate-equations/provider.ts';
import { rateMarking } from '../../src/activities/alevel/rate-equations/marking.ts';

test('times-ten entries display superscript exponents and parse consistently', () => {
  for (const raw of ['1.23x10-4', '1.23 x 10-4', '1.23 × 10^-4', '1.23*10−4', '1.23 × 10⁻⁴']) {
    const formatted = formatScientificNumber(raw);
    assert.equal(formatted, '1.23 × 10⁻⁴');
    assert.equal(formatScientificNumber(formatted), formatted);
    assert.ok(Math.abs(parseScientificNumber(formatted) - 0.000123) < 1e-18);
    assert.equal(parseNumeric(formatted), parseScientificNumber(formatted));
  }
  assert.equal(formatScientificNumber('2x103'), '2 × 10³');
  assert.equal(formatScientificNumber('2x10+12'), '2 × 10⁺¹²');
  assert.equal(formatScientificNumber('2x100'), '2 × 10⁰');
  for (const raw of ['0.00123', '-12.5', '1.23e-4']) assert.equal(formatScientificNumber(raw), raw);
  for (const raw of ['2x10-', '2x10', '2x10a', '2x10-4junk']) assert.ok(Number.isNaN(parseScientificNumber(formatScientificNumber(raw))));
});

test('formatted standard form earns the same rate marks as decimal entry', () => {
  const ref = rateProvider.resolveLink('RE-RF2ITHW');
  const question = rateProvider.restore(ref);
  const part = question.parts[0];
  const raw = part.acceptance.expected.toExponential(2).replace('e', ' x 10');
  const result = rateMarking.mark(question, { [part.id]: { kind: 'numeric', raw: formatScientificNumber(raw), unit: part.unit } });
  assert.equal(result.accepted, true);
  assert.equal(result.marks.earned, result.marks.available);
});
