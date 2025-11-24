// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'

import { ArrangeTabV2 as ArrangeTab } from '../../src/ui/pages/arrange-tab.v2'
import { DiagramsTab } from '../../src/ui/pages/diagrams-tab'
import { FramesTabV2 as FramesTab } from '../../src/ui/pages/frames-tab.v2'
import { HelpTab } from '../../src/ui/pages/help-tab'
import { LayoutEngineTabV2 as LayoutEngineTab } from '../../src/ui/pages/layout-engine-tab.v2'
import { ResizeTabV2 as ResizeTab } from '../../src/ui/pages/resize-tab.v2'
import { SearchTab } from '../../src/ui/pages/search-tab'
import { StyleTabV2 as StyleTab } from '../../src/ui/pages/style-tab.v2'
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
