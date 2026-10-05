import {bank,reviewCode} from '../../../../src/activities/igcse/energy-enthalpy/provider.ts';
import {modelProfile,initialProfile} from '../../../../src/chemistry/energy-profile/index.ts';
console.log(JSON.stringify(bank.questions.filter(q=>q.editor).map(q=>({id:q.id,code:reviewCode(q.id),grade:q.grade,polarity:q.polarity,editor:q.editor,model:modelProfile(q),initial:initialProfile(q)})),null,2));
