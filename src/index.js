import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nextProvider } from 'react-i18next';
import i18n from './utils/i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
