import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import useGameStore from './stores/gameStore.js'
import { parseSharedBuild } from './utils/shareEncoder.js'

// If the URL carries a shared build (?build=...), load it and run the
// tournament straight away, then clean the query string so a later
// "Nueva Aventura" starts fresh.
const sharedBuild = parseSharedBuild(window.location.search)
if (sharedBuild) {
  useGameStore.getState().loadSharedBuild(sharedBuild)
  window.history.replaceState(null, '', window.location.pathname)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
