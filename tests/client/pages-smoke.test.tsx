// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'

import { ArrangeTab } from '../../src/ui/pages/ArrangeTab'
import { CardsTab } from '../../src/ui/pages/CardsTab'
import { DiagramsTab } from '../../src/ui/pages/DiagramsTab'
import { ExcelTab } from '../../src/ui/pages/ExcelTab'
import { FramesTab } from '../../src/ui/pages/FramesTab'
import { HelpTab } from '../../src/ui/pages/HelpTab'
import { LayoutEngineTab } from '../../src/ui/pages/LayoutEngineTab'
import { ResizeTab } from '../../src/ui/pages/ResizeTab'
import { SearchTab } from '../../src/ui/pages/SearchTab'
import { StructuredTab } from '../../src/ui/pages/StructuredTab'
import { StyleTab } from '../../src/ui/pages/StyleTab'
import { ToolsTab } from '../../src/ui/pages/ToolsTab'

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
