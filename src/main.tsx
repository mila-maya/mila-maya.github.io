import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx'
import './styles/global.css'

// Handle SPA routing redirect from 404.html (for GitHub Pages)
const redirect = sessionStorage.getItem('redirect');
if (redirect && redirect !== location.href) {
  sessionStorage.removeItem('redirect');
  history.replaceState(null, '', redirect);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
)
