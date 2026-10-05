import type {ActivityRegistry,CurriculumRegistration} from '../../../../src/contracts/index.ts';
import {activityDefinitions} from '../../../../src/catalogue/definitions.ts';
import {activityId,gemId,proofProvider,proofMarking} from './family.ts';
import {authoringSources} from './provenance.ts';
const base=activityDefinitions.find(a=>a.id===activityId)!;
const gem=base.gems.find(g=>g.id===gemId)!;
/** Only this DEV registry supplies the new content. No production registration changes. */
const registration:CurriculumRegistration={id:activityId,course:'alevel',strand:'curriculum',release:'included',title:'DEV starter dev-reviewed-starter',source:authoringSources,renderer:'question-player',revision:true,
 gems:[gem],
 provider:async()=>proofProvider,marking:async()=>proofMarking,idleAllowance:()=>180000,
 idleRationale:'Three minutes for conservation-of-moles dilution, logarithm evaluation and concentration reasoning; level1 built-in scaffold is independent support.'};
export const proofRegistry:ActivityRegistry={activities:[registration],get:id=>id===activityId?registration:undefined,curriculumFor:course=>course==='alevel'?[registration]:[]};
