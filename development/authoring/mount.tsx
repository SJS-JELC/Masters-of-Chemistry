import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { DevelopmentCatalogue } from '../../src/development/catalogue/index.tsx';
import '../../src/styles/platform.css';
if (!import.meta.env.DEV) throw Error('Development proof must not be built for production');
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DevelopmentCatalogue />
  </StrictMode>,
);
