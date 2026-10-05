/** Incompatible alpha identity boundary; previous browser stores remain untouched. */
export const ALPHA_NAMESPACE = 'masters-of-chemistry-alpha-v2';
export function alphaDatabaseName(course: string, run = 'local'): string {
  return `${ALPHA_NAMESPACE}-${course}-${run}`;
}
export const ALPHA_COURSE_PREFERENCE_KEY = `${ALPHA_NAMESPACE}:landing:course`;
export const ALPHA_LANDING_PREFERENCE_PREFIX = `${ALPHA_NAMESPACE}:landing:`;

/** DEV registry overrides cannot share production attempts, sessions or evidence. */
export function activityDatabaseName(course: string, run: string, development: boolean, registryOverride: boolean, developmentScope = ''): string {
  if (!development || !registryOverride) return alphaDatabaseName(course, run);
  // Source-owned family route token fits the existing database-name guard without truncation.
  const family = /^\/development\/authoring\/families\/(dev-[a-z0-9-]{1,44})\/preview\.html$/.exec(developmentScope)?.[1];
  const root = ['/development/authoring/index.html', '/alevel.html', '/igcse.html'].includes(developmentScope);
  if (!family && !root) throw Error('Unavailable development authoring route scope.');
  return alphaDatabaseName(course, 'dev-authoring-' + (family ?? 'authoring-proof') + '-' + run);
}
