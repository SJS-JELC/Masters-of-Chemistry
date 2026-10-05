import {createRoot} from 'react-dom/client';
import {DotCrossEditor} from '../../../../src/editors/dot-and-cross/DotCrossEditor.tsx';
import {dotCrossProvider} from '../../../../src/activities/alevel/dot-and-cross/provider.ts';
import type {DotCrossState} from '../../../../src/contracts/index.ts';
const part=dotCrossProvider.restore({activityId:'alevel/dot-and-cross',questionId:'h2',seed:0,level:1}).parts[0];
const response:DotCrossState={kind:'dot-and-cross',atoms:[{id:'a1',element:'H',x:400,y:325}],electrons:[],groups:[{id:'g1',atomIds:['a1'],charge:-1,bracket:true}]};
const fixture={response,commands:0};Object.assign(window,{__a15Readonly:fixture});
createRoot(document.getElementById('root')!).render(<DotCrossEditor part={part!} response={response} readOnly={true} onResponse={()=>{fixture.commands++;}}/>);
