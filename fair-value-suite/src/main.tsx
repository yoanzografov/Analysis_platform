import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { FairValueSuiteApp } from './FairValueSuiteApp';

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <FairValueSuiteApp initialTab="dcf10" />
    </React.StrictMode>
  );
}
