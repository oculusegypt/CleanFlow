import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('React mount point #root was not found')
}

// Hide any prerendered SEO copy as early as possible. The inline head script
// handles the first paint; this keeps direct SPA loads and route transitions
// consistent as well.
document.documentElement.classList.add('js-enabled')

// SEO pages may arrive with a loading shell from a previous static build.
// Start React from a clean mount point so React never reconciles against
// stale server HTML that could be changed by the browser while mounting.
rootElement.replaceChildren()

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)