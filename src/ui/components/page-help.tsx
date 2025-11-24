import React from 'react'

import { Tooltip } from './tooltip'

export interface PageHelpProperties {
  readonly content: React.ReactNode
  readonly ariaLabel?: string
}

/**
 * Displays a question mark icon with a tooltip describing the page.
 */
export function PageHelp({ content, ariaLabel = 'Help' }: PageHelpProperties): React.JSX.Element {
  return (
    <div>
      <Tooltip content={content}>
        <button aria-label={ariaLabel} className="button button-ghost button-medium">
          ?
        </button>
      </Tooltip>
    </div>
  )
}
