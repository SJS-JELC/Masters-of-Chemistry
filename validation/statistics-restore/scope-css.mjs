import fs from 'node:fs';
const css=fs.readFileSync('../Masters-of-A-Level-Chemistry/src/assets/alevel-stats.css','utf8');
// Prefix every selector, including those nested in media queries. Original file has no keyframes.
const scoped=css.replace(/([^{}]+)\{/g,(all,selectors)=>selectors.trim().startsWith('@')?all:selectors.split(',').map(s=>'.statistics '+s.trim()).join(',')+'{');
fs.writeFileSync('src/statistics/statistics.css','/* Adapted from original alevel-stats.css; all selectors scoped to this view. */\n'+scoped+`
.statistics{max-width:1180px;width:calc(100% - 64px);margin:auto;padding:32px 0 48px;--ink:#eef0ff;--muted:#b7c1dc;color:var(--ink)}
.statistics-screen{min-height:100vh;background:transparent}
.statistics .stats-brand{display:flex;align-items:center;gap:20px}
.statistics .stats-brand-title{flex:1;min-width:0}.statistics .stats-brand h1{font-size:clamp(1.8rem,4vw,2.6rem)}.statistics .stats-brand h1 span{color:#81e6df}
.statistics .stats-brand .question-brand-mark{flex-shrink:0}.statistics .stats-brand .question-back{flex-shrink:0}
.statistics .stats-period button{font-family:inherit}.statistics .stats-chart-bar{min-height:0}.statistics .stats-recent button{min-height:34px}
.statistics .stats-chart-bar[aria-pressed=true]{background:#ffffff12;outline:1px solid #81e6df}
.statistics .stats-meter{position:relative;height:12px;min-height:12px;margin:9px 0;border:1px solid #65708b;border-radius:4px;background:#11182d;overflow:visible}
.statistics .stats-meter[data-level="1"]{--mastery-colour:#ffde59}.statistics .stats-meter[data-level="2"]{--mastery-colour:#54f5b5}.statistics .stats-meter[data-level="3"]{--mastery-colour:#c59aff}
.statistics .stats-meter>span{display:block;height:100%;width:var(--score);border-radius:3px;background:var(--mastery-colour)}
.statistics .stats-meter>i{position:absolute;left:var(--threshold);top:-4px;bottom:-4px;width:2px;border:0;transform:translateX(-50%);background:#fff;box-shadow:0 0 0 1px #11182d}
.statistics .stats-result-detail{overflow-wrap:anywhere}.statistics .stats-history summary{padding:0}.statistics .stats-chart-stack{pointer-events:none}
@media(max-width:760px){.statistics{width:calc(100% - 40px)}.statistics .stats-brand{gap:12px}.statistics .stats-brand .eyebrow{font-size:.6rem}}
@media(max-width:450px){.statistics{width:calc(100% - 28px);padding-top:18px}.statistics .stats-brand{gap:10px}.statistics .stats-brand h1{font-size:1.8rem}}
`);
