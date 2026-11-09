import { Suspense, lazy } from 'react';
import { Explainer } from './components/Explainer';
import { ModeToggle } from './components/ModeToggle';
import { ParameterPanel } from './components/ParameterPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { useMonteCarlo } from './hooks/useMonteCarlo';

const GalaxyScene = lazy(() => import('./components/GalaxyScene'));

export default function App() {
  useMonteCarlo();
  return (
    <>
      <div className="nebula" aria-hidden="true" />
      <Suspense fallback={null}>
        <GalaxyScene />
      </Suspense>
      <div className="app">
        <header className="site-header">
          <div>
            <p className="eyebrow">The Fermi Paradox Explorer</p>
            <h1>Are we alone?</h1>
            <p className="subtitle">
              Adjust the Drake equation and see the odds that someone else is out there, based on{' '}
              <a href="https://arxiv.org/abs/1806.02404" target="_blank" rel="noreferrer">
                Dissolving the Fermi Paradox
              </a>{' '}
              (Sandberg, Drexler &amp; Ord, 2018).
            </p>
          </div>
          <ModeToggle />
        </header>
        <main className="layout">
          <ParameterPanel />
          <ResultsPanel />
        </main>
        <Explainer />
        <footer className="site-footer">
          The galaxy behind this page lights one beacon per expected civilization (median N in paper
          mode), up to 600. The green dot is us.
        </footer>
      </div>
    </>
  );
}
