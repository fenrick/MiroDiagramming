// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'

import { ArrangeTab } from '../../src/ui/pages/arrange-tab'
import { CardsTab } from '../../src/ui/pages/cards-tab'
import { DiagramsTab } from '../../src/ui/pages/diagrams-tab'
import { FramesTab } from '../../src/ui/pages/frames-tab'
import { HelpTab } from '../../src/ui/pages/help-tab'
import { LayoutEngineTab } from '../../src/ui/pages/layout-engine-tab'
import { ResizeTab } from '../../src/ui/pages/resize-tab'
import { SearchTab } from '../../src/ui/pages/search-tab'
import { StructuredTab } from '../../src/ui/pages/structured-tab'
import { StyleTab } from '../../src/ui/pages/style-tab'
import { ToolsTab } from '../../src/ui/pages/tools-tab'

describe('UI pages smoke render', () => {
  // Limit to pages that render safely under jsdom; after ResizeObserver polyfill, StyleTab works
  const cases = [
    ArrangeTab,
    FramesTab,
    HelpTab,
    LayoutEngineTab,
    ResizeTab,
    SearchTab,
    StyleTab,
    ToolsTab,
  ]
  for (const Component of cases) {
    it(`renders ${Component.name}`, () => {
      const { container } = render(<Component />)
      expect(container).toBeTruthy()
    })
  }
})
