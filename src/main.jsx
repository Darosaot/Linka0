import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import useGameStore from './stores/gameStore.js'
import useCopaStore from './stores/copaStore.js'
import { parseSharedBuild, parseCopaInvite } from './utils/shareEncoder.js'

// If the URL carries a shared build (?build=...), load it and run the
// tournament straight away, then clean the query string so a later
// "Nueva Aventura" starts fresh.
const shared = parseSharedBuild(window.location.search)
const invite = parseCopaInvite(window.location.search)
if (shared) {
  useGameStore.getState().loadSharedBuild(shared.build, shared.dificultad)
  window.history.replaceState(null, '', window.location.pathname)
} else if (invite && !useCopaStore.getState().code) {
  // A "?copa=" invite link drops the guest into the cup join screen with
  // the code pre-filled (unless they're already inside a cup session).
  useCopaStore.getState().setPendingInvite(invite)
  useGameStore.getState().goToCopa()
  window.history.replaceState(null, '', window.location.pathname)
} else if (useCopaStore.getState().code) {
  // An ongoing cup session survives page refreshes
  useGameStore.getState().goToCopa()
  if (invite) window.history.replaceState(null, '', window.location.pathname)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
