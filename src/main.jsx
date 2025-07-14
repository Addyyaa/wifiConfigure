import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { AppProvider } from './components/AppContext.jsx';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </AppProvider>
  </React.StrictMode>
); 