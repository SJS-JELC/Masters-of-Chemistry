import{chromium}from '../../../../../node_modules/playwright/index.mjs';
const b=await chromium.launch({channel:'msedge'}),p=await b.newPage();
await p.goto('http://127.0.0.1:5183/validation/landing-restoration/design/harness.html?course=alevel');
for(const selector of ['#testModeTile','#l6-t2-topic-1 .test-topic-all','[data-leaf="l6-t1-1-1"]']){
 await p.locator(selector).click();console.log(selector,await p.locator('.original-landing').getAttribute('class'),await p.locator('#gemDetails').evaluate(e=>e.open));
}
await b.close();
