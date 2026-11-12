import React from 'react';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import { HashRouter } from 'react-router-dom';
import { FlightFlowProvider } from './state/FlightFlowContext';
import { App } from './App';
import { LanguageProvider } from './i18n/LanguageContext';
import '@fontsource-variable/plus-jakarta-sans';
import './styles/main.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <LanguageProvider>
      <MotionConfig reducedMotion="user">
        <FlightFlowProvider>
          <App />
        </FlightFlowProvider>
      </MotionConfig>
      </LanguageProvider>
    </HashRouter>
  </React.StrictMode>
);
