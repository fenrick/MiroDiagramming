import React from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { createTheme, themes } from '@mirohq/design-system'
import { MiroProvider } from '@mirohq/websdk-react-hooks'

import { App } from './app/App'

const lightThemeClassName = createTheme(themes.light)

const isInMiro =
  typeof window !== 'undefined' && Boolean((window as Window & { miro?: unknown }).miro)
if (!isInMiro) {
  console.warn('Miro SDK not found; open inside a Miro board.')
}

const container = document.getElementById('root')
if (container) {
  // Ensure theme class is appended correctly
  container.classList.add(lightThemeClassName)
  const root = createRoot(container)
  const app = <App />
  // Ensure markup is committed before tests assert on DOM
  flushSync(() => {
    root.render(isInMiro ? <MiroProvider>{app}</MiroProvider> : app)
  })
}
