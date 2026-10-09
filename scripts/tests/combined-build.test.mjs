import assert from 'node:assert/strict';
import {test} from 'node:test';
import vm from 'node:vm';
import {runtimeAliasDefinitions,runtimeAliasHtml} from '../runtime-aliases.mjs';
import {createPreviewServer} from '../preview-server.mjs';
function redirected(route,query='',prefix='/school/chemistry/') {
  const definition=runtimeAliasDefinitions().find(alias=>alias.route===route);
  assert(definition);
  let result;
  vm.runInNewContext(runtimeAliasHtml(definition).match(/<script>([\s\S]*?)<\/script>/)[1],{
    URL,location:{href:'https://example.test'+prefix+route+query,replace:href=>{result=new URL(href);}},
  });
  return result;
}
test('flat historical aliases have deterministic course ownership and complete qualified routes',()=>{
  const aliases=runtimeAliasDefinitions();
  assert.equal(aliases.length,23);
  assert.equal(new Set(aliases.map(alias=>alias.route)).size,23);
  const common=aliases.find(alias=>alias.route==='activities/dot-and-cross/index.html');
  assert.deepEqual(common.candidates,{alevel:'alevel/dot-and-cross',igcse:'igcse/dot-and-cross'});
  assert.equal(redirected(common.route).searchParams.get('activity'),'alevel/dot-and-cross');
  assert.equal(redirected(common.route,'?course=igcse').searchParams.get('activity'),'igcse/dot-and-cross');
  for(const alias of aliases) for(const course of Object.keys(alias.candidates)) {
    const target=redirected(alias.route,'?course='+course);
    assert.equal(target.pathname,'/school/chemistry/index.html');
    assert.equal(target.searchParams.get('course'),course);
    assert.equal(target.searchParams.get('activity'),alias.candidates[course]);
  }
});
test('qualified alias wins a mismatched course and preserves teacher question/seed/hash parameters',()=>{
  const target=redirected('igcse/activities/dot-and-cross/index.html','?course=alevel&question=DC-I02&seed=7&level=2&mode=teacher&category=covalent&x=a%2Bb#lower-1-1');
  assert.equal(target.searchParams.get('course'),'igcse');
  assert.equal(target.searchParams.get('activity'),'igcse/dot-and-cross');
  assert.equal(target.searchParams.get('question'),'DC-I02');
  assert.equal(target.searchParams.get('seed'),'7');
  assert.equal(target.searchParams.get('level'),'2');
  assert.equal(target.searchParams.get('mode'),'teacher');
  assert.equal(target.searchParams.get('category'),'covalent');
  assert.equal(target.searchParams.get('x'),'a+b');
  assert.equal(target.hash,'#lower-1-1');
  assert.equal(target.searchParams.has('view'),false);
  assert.equal(redirected('activities/c3l6-organic-reactions/index.html').searchParams.get('view'),'olympiad');
  assert.equal(redirected('activities/calorimetry/index.html','','/').pathname,'/index.html');
});
test('combined static preview resolves real files at nested prefixes and safely rejects unknown/private paths',async()=>{
  const server=createPreviewServer({prefix:'/school/chemistry/'});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  try {
    for(const route of ['', 'index.html','activities/dot-and-cross/index.html','igcse/activities/dot-and-cross/index.html']) assert.equal((await fetch(origin+'/school/chemistry/'+route)).status,200,route);
    for(const route of ['not-real','.vite/manifest.json','%2e%2e%2fpackage.json','..%5cpackage.json']) assert.equal((await fetch(origin+'/school/chemistry/'+route)).status,404,route);
    assert.equal((await fetch(origin+'/index.html')).status,404);
    const response=await fetch(origin+'/school/chemistry?course=igcse',{redirect:'manual'});
    assert.equal(response.status,301);assert.equal(response.headers.get('location'),'/school/chemistry/?course=igcse');
  } finally {await new Promise(resolve=>server.close(resolve));}
});
