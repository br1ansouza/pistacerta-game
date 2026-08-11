import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '../styles/globals.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Elemento #root não encontrado no documento.');
}

if ('serviceWorker' in navigator && import.meta.env?.MODE === 'production') {
  globalThis.addEventListener('load', () => {
    void navigator.serviceWorker.register('/service-worker.js');
  });
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
