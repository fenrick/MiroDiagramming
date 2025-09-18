import { IconButton, IconQuestionMarkCircle, styled } from '@mirohq/design-system'
import React from 'react'

import { Tooltip } from './Tooltip'

export interface PageHelpProps {
  /** Descriptive text explaining the current page. */
  readonly content: React.ReactNode
  /** Accessible label for the help icon. @default 'Help' */
  readonly ariaLabel?: string
}

/**
 * Displays a question mark icon with a tooltip describing the page.
 *
 * Position this component inside a relatively positioned container so the icon
 * overlays the top-right corner.
 */
export function PageHelp({ content, ariaLabel = 'Help' }: PageHelpProps): React.JSX.Element {
  return (
    <Container>
      <Tooltip content={content} side="left" align="start">
        <IconButton aria-label={ariaLabel} size="small" variant="ghost">
          <IconQuestionMarkCircle />
        </IconButton>
      </Tooltip>
    </Container>
  )
}

const Container = styled('div', {
  position: 'absolute',
  top: 'var(--space-100)',
  right: 'var(--space-100)',
})
