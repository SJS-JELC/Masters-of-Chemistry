import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {DevelopmentCatalogue} from './Catalogue.tsx';
import '../../../../src/styles/platform.css';
if(!import.meta.env.DEV)throw Error('DEV starter must not be built for production');
createRoot(document.getElementById('root')!).render(<StrictMode><DevelopmentCatalogue/></StrictMode>);
