import membership from './identity-membership.json' with { type: 'json' };

/** Source-generated closed membership. No chemistry banks are loaded by shell guards. */
export const formulaIdentities = membership.formulae;
export const equationIdentities = membership.equations;
export function validateIdentitySeed(seed: number): void {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw Error('Seed must be uint32');
}
export function formulaIdentity(code: string, requestedSeed?: number) {
  const canonical = formulaIdentities.find((row) => row.code === code);
  if (canonical) {
    const seed = requestedSeed ?? 0;
    validateIdentitySeed(seed);
    return { ...canonical, seed };
  }
  const legacy = code.match(/^RF1:([a-z0-9-]+):(0|[1-9]\d*)$/);
  if (!legacy) throw Error('Unknown formula code');
  const seed = Number(legacy[2]);
  validateIdentitySeed(seed);
  if (requestedSeed !== undefined && requestedSeed !== seed) throw Error('Seed disagrees with legacy code');
  const row = formulaIdentities.find((item) => item.sourceId === legacy[1]);
  if (!row) throw Error('Unknown formula pair');
  return { ...row, seed };
}
export function equationIdentity(code: string) {
  const row = equationIdentities.find((item) => item.code === code || item.sourceId === code);
  if (!row) throw Error('Unknown equation code');
  return row;
}
/** Display only: aliases remain untouched in saved refs, attempts and evidence. */
export function canonicalFormulaEquationDisplayCode(id: string): string {
  try {
    if (id.startsWith('FO-') || id.startsWith('RF1:')) return formulaIdentity(id).code;
    if (id.startsWith('EQ-')) return equationIdentity(id).code;
  } catch {}
  return id;
}
