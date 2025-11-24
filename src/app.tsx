import './assets/style.css'

import * as React from 'react'
import { createRoot } from 'react-dom/client'

import { App as QuickToolsApp } from './app/app'

const container = document.querySelector<HTMLElement>('#root')
if (container) {
  const root = createRoot(container)
  root.render(React.createElement(QuickToolsApp))
}
