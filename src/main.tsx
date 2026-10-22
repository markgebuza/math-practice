import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import { logDevelopmentError } from './utils/logError';
import './index.css';

createRoot(document.getElementById('root')!, {
  onCaughtError: (error, errorInfo) => logDevelopmentError(error, errorInfo.componentStack),
  onUncaughtError: (error, errorInfo) => logDevelopmentError(error, errorInfo.componentStack),
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
