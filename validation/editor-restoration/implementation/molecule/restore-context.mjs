import fs from 'node:fs/promises';
const file='apps/Masters-of-Chemistry/src/activities/olympiad/c3l6/C3L6View.tsx';let text=await fs.readFile(file,'utf8');
const start=text.indexOf('                {challenge.hydrolysis.map((unit, i) => {'),end=text.indexOf('                {!readOnly && progress.completed.b',start);
if(start<0||end<0)throw Error('Expected current B map boundary absent');
text=text.slice(0,start)+`                <div className="digitised-b">
                  <article className="digitised-reaction"><h3>(i)</h3><div className="b-scheme-scroll" tabIndex={0} role="region" aria-label="Reaction i"><div className="b-reaction-row">{renderStart('b-i','An alarm pheromone in the honey bee',102)}{equilibrium()}{renderBUnit('b-i')}</div></div></article>
                  <article className="digitised-reaction"><h3>(ii)</h3><div className="b-scheme-scroll" tabIndex={0} role="region" aria-label="Reaction ii"><div className="b-reaction-row">{renderStart('b-ii','A sex pheromone of the olive fly',156)}{equilibrium()}{renderBUnit('b-ii')}</div></div></article>
                  <article className="digitised-reaction"><h3>(iii)</h3><div className="b-scheme-scroll" tabIndex={0} role="region" aria-label="Reaction iii"><div className="b-reaction-row">{renderStart('b-iii',qualification.student.label,114)}{equilibrium()}{renderBUnit('b-iii')}</div></div></article>
                  <article className="digitised-reaction"><h3>(iv)</h3><div className="b-scheme-scroll" tabIndex={0} role="region" aria-label="Allantoin reaction sequence"><div className="b-connected-chain">{renderStart('b-iv-1','Allantoin – an excretory product found in the urine of most mammals except higher primates',158)}{equilibrium()}{renderBUnit('b-iv-1')}{equilibrium()}{renderBUnit('b-iv-2')}</div></div>
                    <div className="b-scheme-scroll" tabIndex={0} role="region" aria-label="Hydrolysis of H"><div className="b-reaction-row b-followup">{repeated('H')}{equilibrium()}{renderBUnit('b-iv-3')}</div></div>
                    <div className="b-scheme-scroll" tabIndex={0} role="region" aria-label="Hydrolysis of J"><div className="b-reaction-row b-followup">{repeated('J')}{equilibrium()}{renderBUnit('b-iv-4')}</div></div>
                  </article>
                </div>
`+text.slice(end);
await fs.writeFile(file,text);
