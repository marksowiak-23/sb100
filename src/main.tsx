import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { CodeProvider } from './context/CodeContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CodeProvider>
      <App />
    </CodeProvider>
  </StrictMode>,
);
