import {acidData} from '../activities/alevel/acid-base-calculations/data.js';
import {legacyCore} from '../activities/alevel/acid-base-calculations/legacy-core.js';
import {historicalLevels} from '../activities/alevel/acid-base-calculations/historical-levels.js';
import {acidEngine} from '../activities/alevel/acid-base-calculations/engine.js';
export function historicalAcidCatalogue(){
 const rows=new Map();
 const add=(code,label)=>{const q=acidEngine.generateFromReview(code),ref={activityId:'alevel/acid-base-calculations',questionId:q.reviewId,seed:q.seed,level:q.level};rows.set(code,{key:code,label:`Historical · ${label} · ${code} · Level ${q.level}`,group:'Historical acid calculations (review only)',ref});};
 for(const template of acidData.templates)for(const level of template.levels)for(const structure of ['staged','single'])add(legacyCore.formatQuestionId(legacyCore.encodeQuestionId(template.id,level,structure,1)),`${template.label} · ${structure}`);
 for(const scope of historicalLevels.scopes)for(const level of [1,2,3])for(const template of scope.levels[level]){const q=historicalLevels.generate(template,level,1);add(q.reviewId,`${q.templateLabel} · ${scope.label}`);}
 return [...rows.values()];
}
