import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { CodeProvider } from './context/CodeContext.tsx';
import { PanelProvider } from './context/PanelContext.tsx';
import { CoachMarkProvider, CoachMarkOverlay } from './features/coachMarks';
import { StorybookEasterEgg } from './components/StorybookEasterEgg.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// Apply persisted reading text size preference before first paint
try {
  const savedFontScale =
    sessionStorage.getItem('sb_font_scale') ||
    localStorage.getItem('sb_font_scale');
  if (savedFontScale === 'standard' || savedFontScale === 'large' || savedFontScale === 'xlarge') {
    document.documentElement.setAttribute('data-font-scale', savedFontScale);
  }
} catch {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary sectionName="BackStory">
      <CodeProvider>
        <PanelProvider>
          <CoachMarkProvider>
            <App />
            <CoachMarkOverlay />
            <StorybookEasterEgg />
          </CoachMarkProvider>
        </PanelProvider>
      </CodeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
