import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/montserrat'
import '@fontsource-variable/newsreader/wght.css'
import '@fontsource-variable/newsreader/wght-italic.css'
import '@fontsource-variable/figtree'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
