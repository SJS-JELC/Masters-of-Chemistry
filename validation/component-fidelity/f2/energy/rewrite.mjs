import fs from 'node:fs';
const file='apps/Masters-of-Chemistry/src/editors/energy-profile/index.tsx';
let old=fs.readFileSync(file,'utf8');
const prefix=old.slice(old.indexOf('/** Editing text'),old.indexOf('export function EnergyProfileEditor'));
const endpoints=old.slice(old.indexOf('  const arrowChange ='),old.indexOf('  return (\n    <div className="energy-profile-editor">'));
let controls=old.slice(old.indexOf('      <fieldset disabled={readOnly}>'),old.lastIndexOf('    </div>'));
controls=controls.replace(/        \{e\.axes &&[\s\S]*?        \{e\.arrows\.map\(/,'        {e.arrows.map(');
fs.writeFileSync(file,`import { useEffect, useId, useRef, useState } from 'react';
import type { PointerEvent, KeyboardEvent } from 'react';
import type { EditorSurfaceProps } from '../../ui/EditorFrame.tsx';
import type { EnergyProfileState, EnergyAnchor, EnergyArrowEnd } from '../../contracts/editors.ts';
import { record } from '../../activities/igcse/energy-enthalpy/provider.ts';
import { endY, initialProfile } from '../../chemistry/energy-profile/index.ts';
import { profileSVG } from '../../chemistry/energy-profile/svg.ts';
import './styles.css';
const clone = (m: EnergyProfileState): EnergyProfileState => structuredClone(m);
const clamp = (v: number, lo=55, hi=340) => Math.max(lo, Math.min(hi, v));
${prefix}
export function EnergyProfileEditor({ part, response, readOnly, onResponse, workspaceAside }: EditorSurfaceProps) {
 const q = record(part.markingPolicyId.split(':')[1] ?? ''), e = q.editor!;
 const initial = part.kind === 'energy-profile' ? part.initial : initialProfile(q);
 const m = response?.kind === 'energy-profile' ? response : initial;
 const [draft,setDraft] = useState<EnergyProfileState|null>(null), [history,setHistory] = useState<EnergyProfileState[]>([]), [coordinateReset,setCoordinateReset] = useState(0), [status,setStatus] = useState(''), [selected,setSelected] = useState(''), [ghost,setGhost] = useState<{x:number;y:number;text:string}|undefined>();
 const canvas = useRef<HTMLDivElement>(null), drag = useRef<{action:string;base:EnergyProfileState;x:number;y:number;moved:boolean}|null>(null), live = useRef<EnergyProfileState|null>(null), pendingFocus=useRef(''), id=useId();
 const shown=draft??m, coordinateResetKey=part.markingPolicyId+':'+coordinateReset;
 useEffect(()=>{setDraft(null);setHistory([]);setStatus('');setSelected('');setGhost(undefined);drag.current=null;live.current=null;},[part.markingPolicyId,readOnly]);
 useEffect(()=>{if(pendingFocus.current){canvas.current?.querySelector<SVGElement>('[data-act="'+pendingFocus.current+'"]')?.focus({preventScroll:true});pendingFocus.current='';}});
 const save=(next:EnergyProfileState,focus='')=>{if(readOnly)return;pendingFocus.current=focus;setHistory(h=>[...h.slice(-79),clone(m)]);onResponse(next);};
 const movable=(k:EnergyAnchor)=>!e.fixed&&!(k==='r'&&e.fixedR);
 const levels:EnergyAnchor[]=e.type==='levels'?['r','p']:['r','p','peak'];
 const point=(event:{clientX:number;clientY:number})=>{const rect=canvas.current!.querySelector('svg')!.getBoundingClientRect();return{x:(event.clientX-rect.left)*640/rect.width,y:(event.clientY-rect.top)*415/rect.height};};
 const snap=(base:EnergyProfileState,end:EnergyArrowEnd,x:number):EnergyArrowEnd=>{
  if('anchor' in end)return end;
  const tolerance=18*640/(canvas.current?.querySelector('svg')?.getBoundingClientRect().width??640);
  const near=[...levels].sort((a,b)=>Math.abs(base[a]-end.y)-Math.abs(base[b]-end.y)||Math.abs((a==='r'?150:a==='p'?470:320)-x)-Math.abs((b==='r'?150:b==='p'?470:320)-x))[0]!;
  return Math.abs(base[near]-end.y)<=tolerance?{anchor:near}:end;
 };
 const putLabel=(base:EnergyProfileState,index:number,target?:EnergyAnchor)=>{const next=clone(base),f=e.formula?.[index]??'';for(const side of ['left','right'] as const)if(next[side]===f)next[side]='';if(target&&target!=='peak')next[target==='r'?'left':'right']=f;return next;};
 const attach=(level:EnergyAnchor)=>{const [kind,name]=selected.split(':');if(kind==='label'&&level!=='peak'){save(putLabel(m,Number(name),level));setSelected('');setStatus('Formula placed.');return true;}if((kind==='head'||kind==='tail')&&m.arrows[name as 'ea'|'delta']){const next=clone(m);next.arrows[name as 'ea'|'delta']![kind]={anchor:level};save(next);setSelected('');setStatus('Endpoint attached.');return true;}return false;};
 const newArrow=(name:'ea'|'delta')=>{const next=clone(m);next.arrows[name]={x:name==='ea'?(e.eaX??280):560,tail:{y:255},head:{y:165}};save(next,'head:'+name);setSelected('head:'+name);setStatus('Position the arrow ends.');return next;};
 const down=(event:PointerEvent<HTMLDivElement>)=>{
  if(readOnly||event.button>0)return;const item=(event.target as Element).closest<SVGElement>('[data-act],[data-new]');if(!item)return;
  const action=item.dataset.act??'new:'+item.dataset.new,[kind,name]=action.split(':');
  if(kind==='level'&&selected&&attach(name as EnergyAnchor)){event.preventDefault();return;}
  if(kind==='level'&&!movable(name as EnergyAnchor)){setStatus('This level is supplied and fixed.');return;}
  event.preventDefault();const base=kind==='new'?newArrow(name as 'ea'|'delta'):clone(m),p=point(event);
  setSelected(action);drag.current={action,base,...p,moved:false};live.current=base;event.currentTarget.setPointerCapture(event.pointerId);
  setStatus(kind==='label'?'Choose a line.':kind==='head'||kind==='tail'?'Choose a level.':'');
 };
 const move=(event:PointerEvent<HTMLDivElement>)=>{
  const d=drag.current;if(!d||readOnly)return;const p=point(event),dx=p.x-d.x,dy=p.y-d.y;if(Math.abs(dx)+Math.abs(dy)>2)d.moved=true;if(!d.moved)return;
  event.preventDefault();const next=clone(d.base),[kind,name]=d.action.split(':'),level=name as EnergyAnchor,arrow=name as 'ea'|'delta';
  if(kind==='level'&&movable(level)){next[level]=clamp(d.base[level]+dy,70,330);if(e.type==='catalyst'&&level!=='peak'&&Math.abs(next[level]-(level==='r'?220:300))<14)next[level]=level==='r'?220:300;}
  if(kind==='label')setGhost({...p,text:e.formula?.[Number(name)]??''});
  if(kind==='head'||kind==='tail'){const a=next.arrows[arrow]!;a.x=clamp(d.base.arrows[arrow]!.x+dx,85,590);a[kind]=snap(next,{y:clamp(endY(d.base,d.base.arrows[arrow]![kind])+dy)},a.x);if('anchor' in a[kind]&&a[kind].anchor==='peak'&&Math.abs(a.x-320)<24)a.x=320;}
  if(kind==='shaft'){const a=next.arrows[arrow]!;a.x=clamp(a.x+dx,85,590);for(const end of ['tail','head'] as const)a[end]={y:clamp(endY(d.base,d.base.arrows[arrow]![end])+dy)};}
  if(kind==='new')next.arrows[arrow]={x:clamp(p.x,85,590),tail:{y:clamp(p.y+40)},head:{y:clamp(p.y-40)}};
  live.current=next;setDraft(next);
 };
 const up=(event:PointerEvent<HTMLDivElement>)=>{
  const d=drag.current;if(!d)return;let next=live.current??d.base;const [kind,name]=d.action.split(':'),p=point(event);
  if(d.moved){if(kind==='label'){const target=p.x<320?'r':'p';next=putLabel(next,Number(name),Math.abs(p.y-next[target])<=50?target:undefined);}if(kind==='shaft'||kind==='new'){const a=next.arrows[name as 'ea'|'delta']!;for(const end of ['tail','head'] as const)a[end]=snap(next,a[end],a.x);}save(next);setSelected('');setStatus('');}else pendingFocus.current=kind==='new'?'head:'+name:d.action;
  drag.current=null;live.current=null;setDraft(null);setGhost(undefined);if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
 };
 const key=(event:KeyboardEvent<HTMLDivElement>)=>{
  if(readOnly)return;const item=(event.target as Element).closest<SVGElement>('[data-act],[data-new]');if(!item)return;const action=item.dataset.act??'new:'+item.dataset.new,[kind,name]=action.split(':'),arrow=name as 'ea'|'delta',level=name as EnergyAnchor;
  if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();if(kind==='new'){newArrow(arrow);return;}if(kind==='level'&&selected&&attach(level))return;setSelected(action);setStatus('Selected. Focus a target line or peak and press Enter to attach, or use arrow keys to move.');return;}
  if(event.key==='Escape'){event.preventDefault();setSelected('');setStatus('Selection cleared.');return;}
  if(event.key==='Delete'||event.key==='Backspace'){event.preventDefault();if(kind==='label')save(putLabel(m,Number(name)));if(['head','tail','shaft'].includes(kind)){const next=clone(m);delete next.arrows[arrow];save(next);}return;}
  if(!event.key.startsWith('Arrow'))return;event.preventDefault();event.stopPropagation();const next=clone(m),dx=event.key==='ArrowLeft'?-10:event.key==='ArrowRight'?10:0,dy=event.key==='ArrowUp'?-20:event.key==='ArrowDown'?20:0;
  if(kind==='level'&&movable(level))next[level]=clamp(m[level]+dy,70,330);
  if(kind==='head'||kind==='tail'){const a=next.arrows[arrow]!;a.x=clamp(a.x+dx,85,590);if(dy){const y=endY(m,a[kind]),targets=levels.filter(k=>dy<0?m[k]<y:m[k]>y).sort((a,b)=>Math.abs(m[a]-y)-Math.abs(m[b]-y));a[kind]=targets.length?{anchor:targets[0]!}:{y:clamp(y+dy)};}}
  if(kind==='shaft'){const a=next.arrows[arrow]!;a.x=clamp(a.x+dx,85,590);if(dy)for(const end of ['tail','head'] as const)a[end]=snap(next,{y:clamp(endY(m,a[end])+dy)},a.x);}
  save(next,action);
 };
${endpoints}
 return <div className="energy-profile-editor source-energy-profile">
  <div className="editor-tray" aria-label="Diagram pieces" onPointerDown={down} onPointerMove={move} onPointerUp={up} onKeyDown={key}>
   {e.arrows.filter(name=>!shown.arrows[name]).map(name=><button type="button" className="piece" key={name} data-new={name} disabled={readOnly} onClick={event=>{if(event.detail===0&&!event.defaultPrevented&&!m.arrows[name])newArrow(name);}}>{name==='ea'?'Eₐ · Activation energy':'ΔH · Enthalpy change'}</button>)}
   {e.formula?.map((f,index)=>![shown.left,shown.right].includes(f)&&<button type="button" className="piece" key={f} data-act={'label:'+index} disabled={readOnly}>{f}</button>)}
  </div>
  <div ref={canvas} className="diagram-card edit-canvas" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={()=>{drag.current=null;live.current=null;setDraft(null);setGhost(undefined);}} onKeyDown={key} dangerouslySetInnerHTML={{__html:profileSVG(shown,e,!readOnly,!!draft,ghost)}} />
  <p className="editor-status small" role="status">{status}</p>
  <div className="editor-fields controls">
   {e.axes&&(['vertical','horizontal'] as const).map(axis=><div className="control" key={axis}><label htmlFor={id+'-'+axis}>{axis==='vertical'?'Vertical':'Horizontal'} axis</label><input id={id+'-'+axis} aria-label={(axis==='vertical'?'Vertical':'Horizontal')+' axis label'} disabled={readOnly} value={m[axis]} onChange={event=>save({...m,[axis]:event.target.value})} autoComplete="off" /></div>)}
   {e.pathLabel&&<div className="control"><label htmlFor={id+'-path'}>Label the new pathway</label><input id={id+'-path'} aria-label="New pathway label" disabled={readOnly} value={m.pathLabel} onChange={event=>save({...m,pathLabel:event.target.value})} autoComplete="off" /></div>}
  </div>
  <div className="energy-actions"><span className="diagram-tools"><button type="button" className="quiet" disabled={readOnly||!history.length} onClick={()=>{const previous=history.at(-1);if(previous){setCoordinateReset(v=>v+1);setHistory(h=>h.slice(0,-1));setSelected('');onResponse(previous);}}}>Undo</button><button type="button" className="quiet" disabled={readOnly} onClick={()=>{setCoordinateReset(v=>v+1);setSelected('');save(initial);}}>Reset</button></span>{workspaceAside}</div>
  <details className="editor-help coordinate-alternatives"><summary>Keyboard and non-drag profile controls</summary>
${controls}
  </details>
 </div>;
}
`);
