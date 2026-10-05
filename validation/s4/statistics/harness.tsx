import {createRoot} from 'react-dom/client';
import {FoundationApp} from '../../../src/foundation/ActivityHost.tsx';
import {StatisticsView} from '../../../src/statistics/index.ts';
import {productionRegistry} from '../../../src/foundation/registry.ts';
import '../../../src/styles/platform.css';
const query=new URLSearchParams(location.search),course=query.get('course')==='igcse'?'igcse':'alevel';
const databaseName=query.get('database')??`masters-of-chemistry-${course}-${query.get('run')??'local'}`;
createRoot(document.getElementById('root')!).render(query.get('panel')==='statistics'?<StatisticsView course={course} namespace={{course,profileId:query.get('profile')??'local'}} databaseName={databaseName} registry={productionRegistry}/>:<FoundationApp course={course}/>);
