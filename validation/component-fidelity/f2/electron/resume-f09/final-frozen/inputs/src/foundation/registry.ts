import { createRegistry } from '../catalogue/registry.ts';
import { activityDefinitions } from '../catalogue/definitions.ts';
import { c3Dependencies } from '../activities/olympiad/c3l6/dependencies.ts';
import { acidAdapter } from '../activities/alevel/acid-base-calculations/index.ts';
import { structureAdapter } from '../activities/igcse/structure-and-bonding/index.ts';
import { dotCrossAdapter } from '../activities/alevel/dot-and-cross/index.ts';
import { igcseDotCrossAdapter } from '../activities/igcse/dot-and-cross/index.ts';
import { titrationAdapter } from '../activities/alevel/ph-titration-curves/index.ts';
import { calorimetryAdapter } from '../activities/igcse/calorimetry/index.ts';
import { bondEnthalpyAdapter } from '../activities/igcse/bond-enthalpy/index.ts';
import { electronsBondingAdapter } from '../activities/alevel/electrons-bonding/index.ts';
import { electronConfigurationsAdapter } from '../activities/alevel/electron-configurations/index.ts';
import { energyEnthalpyAdapter } from '../activities/igcse/energy-enthalpy/index.ts';
import { energeticsPracticalAdapter } from '../activities/igcse/energetics-practical/index.ts';
const olympiadDefinition = activityDefinitions.find(
  (item) => item.id === 'alevel/c3l6-organic-reactions',
);
if (!olympiadDefinition) throw Error('Missing source Olympiad definition');
export const productionRegistry = createRegistry(
  [
    acidAdapter,
    structureAdapter,
    dotCrossAdapter,
    igcseDotCrossAdapter,
    titrationAdapter,
    calorimetryAdapter,
    bondEnthalpyAdapter,
    electronsBondingAdapter,
    electronConfigurationsAdapter,
    energyEnthalpyAdapter,
    energeticsPracticalAdapter,
  ],
  [{
    id: 'alevel/c3l6-organic-reactions',
    course: 'alevel',
    strand: 'olympiad',
    renderer: 'staged-molecule-challenge',
    revision: false,
    title: olympiadDefinition.title,
    release: 'included',
    source: olympiadDefinition.source,
    dependencies: c3Dependencies,
    provider: async () => (await import('../activities/olympiad/c3l6/index.ts')).c3Challenge,
    marking: async () => (await import('../activities/olympiad/c3l6/index.ts')).c3Policy,
  }, {
    id: 'alevel/olympiad-2011-q4', course: 'alevel', strand: 'olympiad', renderer: 'seven-isomer-challenge', revision: false,
    title: activityDefinitions.find(item => item.id === 'alevel/olympiad-2011-q4')!.title,
    release: 'included', source: activityDefinitions.find(item => item.id === 'alevel/olympiad-2011-q4')!.source,
    provider: async () => (await import('../activities/olympiad/isomers2011/index.ts')).isomerChallenge,
    marking: async () => (await import('../activities/olympiad/isomers2011/index.ts')).isomerPolicy,
  }],
);
