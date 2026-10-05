import fs from 'node:fs';
const file='src/editors/titration-curve/TitrationCurveEditor.tsx';let s=fs.readFileSync(file,'utf8');
s=s.replace("import { useRef, useState } from 'react';", "import { useEffect, useId, useRef, useState } from 'react';");
const helper=`
/** Keep incomplete keyboard text local; the curve receives only completed valid anchors. */
function AnchorInput({label,value,min,max,step,readOnly,onCommit}:{
  readonly label:string; readonly value:number; readonly min:number; readonly max:number;
  readonly step:number; readonly readOnly:boolean; readonly onCommit:(value:number)=>number;
}) {
  const format=(number:number)=>String(Number(number.toFixed(1)));
  const [draft,setDraft]=useState(()=>format(value));
  const [error,setError]=useState('');
  const dirty=useRef(false);
  const descriptionId=useId();
  useEffect(()=>{setDraft(format(value));setError('');dirty.current=false;},[value,readOnly]);
  function finish(){
    if(readOnly||!dirty.current)return;
    dirty.current=false;
    const trimmed=draft.trim(),parsed=Number(trimmed);
    const valid=/^(?:\\d+(?:\\.\\d*)?|\\.\\d+)$/.test(trimmed)&&Number.isFinite(parsed)&&parsed>=min&&parsed<=max&&Math.abs(parsed/step-Math.round(parsed/step))<1e-7;
    if(!valid){setDraft(format(value));setError(\`Enter a value from \${min} to \${max} in steps of \${step}. The previous curve value, \${format(value)}, has been kept.\`);return;}
    const committed=onCommit(parsed);
    setDraft(format(committed));
    setError(Math.abs(committed-parsed)>1e-7?\`The selected curve section limits this anchor to \${format(committed)}.\`:'');
  }
  return <label>{label}<input aria-label={label} type="text" inputMode="decimal" value={draft} disabled={readOnly} aria-invalid={error?true:undefined} aria-describedby={descriptionId}
    onChange={event=>{dirty.current=true;setDraft(event.target.value);setError('');}}
    onBlur={finish}
    onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();finish();}else if(event.key==='Escape'){event.preventDefault();dirty.current=false;setDraft(format(value));setError('');}}}/>
    <small id={descriptionId} className="support-note" role={error?'status':undefined}>{error||'Type a value, then press Enter or leave the field to update the curve.'}</small>
  </label>;
}
`;
s=s.replace('export function TitrationCurveEditor',helper+'\nexport function TitrationCurveEditor');
s=s.replace("  const [history, setHistory] = useState<readonly TitrationCurveState[]>([]);", "  const [history, setHistory] = useState<readonly TitrationCurveState[]>([]);\n  useEffect(()=>{setHistory([]);setPreview(null);drag.current=null;},[q.id,readOnly]);");
const start=s.indexOf('          <label key={field}>'),end=s.indexOf('          </label>',start)+'          </label>'.length;
if(start<0)throw Error('numeric control not found');
s=s.slice(0,start)+`          <AnchorInput key={\`\${q.id}:\${field}\`} label={label} value={state[field]} min={field==='equivalenceVolume'?0.5:0} max={field==='equivalenceVolume'?q.maxVolume-0.5:14} step={field==='equivalenceVolume'?0.5:0.1} readOnly={readOnly} onCommit={value=>{const next=constrain(q,{...latest.current,[field]:value});commit({[field]:value});return next[field];}}/>`+s.slice(end);
fs.writeFileSync(file,s);
