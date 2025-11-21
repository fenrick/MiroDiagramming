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
    <div style={{ position: 'absolute', top: 'var(--space-100)', right: 'var(--space-100)' }}>
      <Tooltip content={content}>
        <button
          aria-label={ariaLabel}
          style={{
            border: '1px solid var(--indigo400)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            background: 'var(--white)',
            cursor: 'pointer',
          }}
        >
          ?
        </button>
      </Tooltip>
    </div>
  )
}
