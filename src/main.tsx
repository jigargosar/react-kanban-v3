import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '../docs/spikes/live-blocks/src/App'

createRoot(document.getElementById('app')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
