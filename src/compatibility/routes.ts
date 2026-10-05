import type { Course } from '../contracts/identity.ts';
/** Released source entry filenames, checked against S0 inventory and actual pages. */
export const compatibilityRoutes: Readonly<Record<Course, readonly string[]>> = {
  alevel: [
    'acid-base-calculations',
    'electrons-bonding',
    'electron-configurations',
    'dot-and-cross',
    'ph-titration-curves',
    'c3l6-organic-reactions',
  ].map((slug) => `activities/${slug}/index.html`),
  igcse: [
    'calorimetry',
    'bond-enthalpy',
    'structure-and-bonding',
    'dot-and-cross',
    'energy-enthalpy',
    'energetics-practical',
  ].map((slug) => `activities/${slug}/index.html`),
};
// Course-local entry aliases transfer current canonical codes and activity identity.
// Redirect destination is ../../index.html relative to each above route, so prefixes survive.
