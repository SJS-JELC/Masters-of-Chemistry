import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {core} from '../../../src/chemistry/thermochemistry/bond-enthalpy-core.js';
const directory=import.meta.dirname,require=createRequire(resolve(directory,'../../../../../package.json')),{chromium}=require('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1800,height:1700},deviceScaleFactor:1});
// Contact sheet contains actual production-host screenshots, not new molecular depictions.
await page.setContent(`<style>body{margin:0;background:white;color:#17212b;font:18px Arial}main{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px}figure{margin:0;border:1px solid #aaa;padding:10px;min-height:180px}img{width:100%;height:150px;object-fit:contain}figcaption{font-weight:bold}</style><main>${core.reactions.map(r=>`<figure><figcaption>${r.name}: ${r.equation}</figcaption><img src="data:image/png;base64,${readFileSync(resolve(directory,`diagram-${r.id}.png`)).toString('base64')}"/></figure>`).join('')}</main>`);
await page.screenshot({path:resolve(directory,'all16-diagram-contact.png'),fullPage:true});await browser.close();
