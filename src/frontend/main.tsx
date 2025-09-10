import React from 'react'
import { createRoot } from 'react-dom/client'
import { createTheme, themes } from '@mirohq/design-system'
import { MiroProvider } from '@mirohq/websdk-react-hooks'

import { App } from './app/App'

const lightThemeClassName = createTheme(themes.light)

const isInMiro =
  typeof window !== 'undefined' && Boolean((window as Window & { miro?: unknown }).miro)
if (!isInMiro) {
  // eslint-disable-next-line no-console -- Surface configuration issues during development
  console.warn('Miro SDK not found; open inside a Miro board.')
}

const container = document.getElementById('root')
if (container) {
  container.classList += lightThemeClassName
  const root = createRoot(container)
  const app = <App />
  root.render(isInMiro ? <MiroProvider>{app}</MiroProvider> : app)
}
