import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { SITE } from './lib/site'
import './styles/global.css'
import './styles/secret.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// For the curious ones with DevTools open.
console.log(
  '%c●%c  Hello, you found the console.\n\nIf you read source for fun, we should talk: %s\nThe whole site is open: %s\n\nPsst: try the Konami code on the page.',
  'color:#ff3b26;font-size:22px',
  'color:inherit;font-size:13px',
  SITE.email,
  SITE.repo,
)
