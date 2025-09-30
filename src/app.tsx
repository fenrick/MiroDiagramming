import './assets/style.css'

import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { createTheme, themes } from '@mirohq/design-system'

import { App as QuickToolsApp } from './app/app'

const container = document.querySelector<HTMLElement>('#root')
if (container) {
  const themeClass = String(createTheme(themes.light))
  container.classList.add(themeClass)
  const root = createRoot(container)
  root.render(React.createElement(QuickToolsApp))
}
