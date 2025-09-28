import React from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import introText from '../intro.md?raw'
import { ScrollArea } from '../ScrollArea'

import { Button } from './button'
import { Markdown } from './markdown'

export interface IntroScreenProperties {
  /** Called when the user chooses to start the app. */
  readonly onStart: () => void
}

/**
 * Landing screen displayed before loading the main UI.
 *
 * Keeping the initial view lightweight avoids early Miro API calls until the
 * user opts into using the toolset.
 */
export function IntroScreen({ onStart }: IntroScreenProperties): React.JSX.Element {
  return (
    <ScrollArea>
      <div className="intro-screen" data-testid="intro-screen">
        <Markdown source={introText} />
        <VisuallyHidden>Welcome to Quick Tools</VisuallyHidden>
        <Button variant="primary" onClick={onStart} data-testid="start-button">
          Start
        </Button>
      </div>
    </ScrollArea>
  )
}
