import type { C3L6Progress } from '../../../../src/contracts/olympiad.ts';
type Historical = NonNullable<C3L6Progress['historicalOutcome']>;
type Raw = Historical['raw'];
declare const raw: Raw;
const accepted: Historical = {
  policyVersion: 'c3l6-source-bank-23',
  reason: 'K-orthoacid-erratum',
  raw,
};
// @ts-expect-error A historical snapshot cannot contain another historical snapshot.
const nested: Raw = { ...raw, historicalOutcome: accepted };
// @ts-expect-error Historical policy identifiers are closed, not arbitrary strings.
const unknown: Historical = { policyVersion: 'unknown', reason: 'K-orthoacid-erratum', raw };
void nested;
void unknown;
