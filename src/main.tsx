import React from 'react'
import ReactDOM from 'react-dom/client'
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
    <App />
  </React.StrictMode>,
)
