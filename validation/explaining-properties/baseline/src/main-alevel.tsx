import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
const root = document.getElementById('root');
if (!root) throw Error('Missing application root');
const harness = import.meta.env.DEV ? new URLSearchParams(location.search).get('harness') : null;
if (import.meta.env.DEV && harness === 'authoring') {
  const { DevelopmentCatalogue } = await import('./development/catalogue/index.tsx');
  createRoot(root).render(
    <StrictMode>
      <DevelopmentCatalogue />
    </StrictMode>,
  );
} else {
  const { FoundationApp } =
    import.meta.env.DEV && harness === 's1'
      ? await import('./development/FoundationApp.tsx')
      : await import('./foundation/ProductionFoundation.tsx');
  createRoot(root).render(
    <StrictMode>
      <FoundationApp course="alevel" />
    </StrictMode>,
  );
}
