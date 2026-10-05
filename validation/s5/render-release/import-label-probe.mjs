import {chromium} from '../../../../../node_modules/playwright/index.mjs';
import fs from 'node:fs';import path from 'node:path';
const here=import.meta.dirname;process.env.TEMP=path.join(here,'tmp');process.env.TMP=process.env.TEMP;
const b=await chromium.launch({channel:'msedge',headless:true});
try {
 const p=await b.newPage(),raw=JSON.stringify({version:2,results:Array.from({length:150},(_,i)=>({id:'synthetic-'+i,leafId:'lower-10-1',grade:2,score:i%2,date:1720000000000+i}))},null,2),r={course:'igcse',source:'Synthetic 150 rows; no Preview or Import submission',sourceCharacters:raw.length};
 await p.goto('http://127.0.0.1:5203/nested/igcse/index.html?view=import');const textbox=p.getByRole('textbox',{name:'Source JSON',exact:true});await textbox.waitFor();
 r.beforeRoleExactNameCount=await textbox.count();r.beforeLabelExactCount=await p.getByLabel('Source JSON',{exact:true}).count();await textbox.fill(raw);
 r.afterRoleExactNameCount=await textbox.count();r.afterLabelExactCount=await p.getByLabel('Source JSON',{exact:true}).count();
 const cdp=await p.context().newCDPSession(p),doc=await cdp.send('DOM.getDocument'),node=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'.legacy-import textarea'}),ax=await cdp.send('Accessibility.getPartialAXTree',{nodeId:node.nodeId,fetchRelatives:false});
 r.axName=ax.nodes[0].name;r.axValueLength=ax.nodes[0].value?.value?.length;r.axRole=ax.nodes[0].role;r.axNameIncludesSource=r.axName.value.includes('synthetic-0');
 const tree=await textbox.ariaSnapshot();fs.writeFileSync(path.join(here,'import-label-after-source-aria.txt'),tree);r.ariaPrefix=tree.slice(0,180);r.labelTextPrefix=await textbox.evaluate(e=>e.labels?.[0]?.textContent?.slice(0,180));
 r.status=r.axName.value==='Source JSON'&&r.afterRoleExactNameCount===1?'PASS':'FAIL';r.limitation='Headless Edge AX tree; no native screen reader. getByLabel exact sees DOM label text including textarea child value; AX name and AX value measured separately.';
 await p.screenshot({path:path.join(here,'import-label-probe.png'),fullPage:true});fs.writeFileSync(path.join(here,'import-label-probe.json'),JSON.stringify(r,null,2));console.log(JSON.stringify(r));
} finally {await b.close();}
