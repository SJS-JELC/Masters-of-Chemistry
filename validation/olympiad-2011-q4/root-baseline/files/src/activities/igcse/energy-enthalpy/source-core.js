
function normalize(s){return String(s).normalize('NFKC').toLowerCase().replace(/δ\s*h/g,'delta h').replace(/−/g,'-').replace(/\s+/g,' ').trim().replace(/\.$/,'').trim();}
function markField(field,value,data){
 const s=normalize(value);if(!s)return 'empty';
 if(field.accept.some(a=>normalize(a)===s))return 'correct';
 if(field.options?.some(option=>normalize(option)===s))return 'incorrect';
 if(/\b(not|or|neither|both)\b/.test(s))return 'incorrect';
 const known=data.questions.flatMap(q=>(q.fields||[]).flatMap(f=>f.accept));
 if(known.some(a=>normalize(a)===s)||['maximum','average','heat','enthalpy','temperature','time','created','destroyed','lost','more bonds','yes','no','absorbs','releases','increase','decrease'].includes(s))return 'incorrect';
 return 'unknown';
}
function endY(m,end){return end.anchor?m[end.anchor]:end.y;}
function attached(anchor){return {anchor};}
function model(q){
 const e=q.editor||{},m={r:220,p:q.polarity==='endo'||e.type==='repair'?155:300,peak:85,left:e.formula?.[0]||'Reactants',right:e.formula?.[1]||'Products',vertical:'Energy',horizontal:'Progress of reaction',pathLabel:'Catalysed',arrows:{}};
 if(e.type==='catalyst')Object.assign(m,{r:220,p:300,peak:140});
 for(const a of e.arrows||[])m.arrows[a]={x:a==='ea'?(e.eaX||285):560,tail:attached('r'),head:attached(a==='ea'?'peak':'p')};
 return m;
}
function initial(q){const m=model(q),e=q.editor;
 if(!e.fixed)m.p=m.r;if(e.type==='profile')m.peak=m.r;
 if(e.type==='catalyst'){m.peak=85;m.pathLabel='';}
 if(e.formula)m.left=m.right='';if(e.axes)m.vertical=m.horizontal='';
 m.arrows={};
 if(e.type==='repair'){m.arrows={delta:{x:560,tail:attached('r'),head:attached('peak')},ea:{x:285,tail:attached('p'),head:attached('peak')}};}
 return m;
}
function check(q,m,data){
 const e=q.editor,expected=model(q);
 const arrow=a=>{const ar=m.arrows[a];return !!ar&&ar.tail.anchor==='r'&&ar.head.anchor===(a==='ea'?'peak':'p')&&(a==='ea'?m.peak<m.r:m.r!==m.p);};
 const accepts=(key,s)=>data.vocab[key].some(a=>normalize(a)===normalize(s));
 const checks={left:m.left===expected.left,right:m.right===expected.right,order:q.polarity==='endo'?m.p<m.r:m.p>m.r,peak:m.peak<Math.min(m.r,m.p),ea:arrow('ea'),delta:arrow('delta'),vertical:accepts('ENERGY_AXIS',m.vertical),horizontal:accepts('PROGRESS_AXIS',m.horizontal),ends:m.r===220&&m.p===300,barrier:m.peak>85&&m.peak<Math.min(m.r,m.p),pathLabel:['catalysed','catalyzed','catalysed pathway','catalyzed pathway'].includes(normalize(m.pathLabel))};
 return q.checks.map(c=>!!checks[c]);
}

export { model, initial, check, normalize, markField, endY };
