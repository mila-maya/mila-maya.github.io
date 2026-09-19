import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'

// scripts/prerender.mjs writes this route's head tags into the static HTML so
// crawlers that do not run JavaScript still get them. React hoists its own and
// appends rather than replaces, so remove them before it does - otherwise every
// page ships two titles and two canonicals that disagree.
document.head.querySelectorAll('[data-prerendered]').forEach((tag) => tag.remove())

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
