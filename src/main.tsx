import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LoadingProvider, LoadingErrorBoundary } from './loading/LoadingProvider.tsx';
const root = document.getElementById('root');
if (!root) throw Error('Missing application root');
const harness = import.meta.env.DEV ? new URLSearchParams(location.search).get('harness') : null;
try {
  if (import.meta.env.DEV && harness === 'rate-equations') {
    const { RateEquationsPreview } = await import(
      './development/rate-equations/RateEquationsPreview.tsx'
    );
    createRoot(root).render(
      <StrictMode>
        <RateEquationsPreview />
      </StrictMode>,
    );
  } else if (import.meta.env.DEV && harness === 'authoring') {
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
        <LoadingProvider>
          <LoadingErrorBoundary>
            <FoundationApp course="alevel" />
          </LoadingErrorBoundary>
        </LoadingProvider>
      </StrictMode>,
    );
  }
} catch {
  // No destination has mounted, so there is no new attempt or pending application write.
  document.getElementById('loading-bootstrap')?.remove();
  const message = document.createElement('p');
  message.setAttribute('role', 'alert');
  message.textContent = 'The app could not load. Reload the app to try again.';
  const reload = document.createElement('button');
  reload.textContent = 'Reload app';
  reload.dataset.testid = 'loading-reload';
  reload.addEventListener('click', () => location.reload());
  const initial = root.querySelector('.loading-initial') ?? root;
  initial.append(message, reload);
}
