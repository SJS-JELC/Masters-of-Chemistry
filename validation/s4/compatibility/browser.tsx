import React from 'react';
import {createRoot} from 'react-dom/client';
import {LegacyImportView} from '../../../src/compatibility/LegacyImportView.tsx';
import {productionRegistry} from '../../../src/foundation/registry.ts';
const search=new URLSearchParams(location.search),course=search.get('course')==='igcse'?'igcse':'alevel';
const namespace={course,profileId:search.get('profile')??'synthetic-s4'},databaseName=search.get('db')??'masters-of-chemistry-s4-compatibility';
createRoot(document.getElementById('root')!).render(<LegacyImportView course={course} namespace={namespace} databaseName={databaseName} registry={productionRegistry}/>);
