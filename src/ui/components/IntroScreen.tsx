import React from 'react';
import { Button } from './Button';
import { Markdown } from './Markdown';
import introText from '../intro.md?raw';

export interface IntroScreenProps {
  /** Called when the user chooses to start the app. */
  readonly onStart: () => void;
}

/**
 * Landing screen displayed before loading the main UI.
 *
 * Keeping the initial view lightweight avoids early Miro API calls until the
 * user opts into using the toolset.
 */
export function IntroScreen({ onStart }: IntroScreenProps): React.JSX.Element {
  return (
    <div
      className='intro-screen'
      data-testid='intro-screen'>
      <Markdown source={introText} />
      <span className='custom-visually-hidden'>Welcome to Quick Tools</span>
      <Button
        variant='primary'
        onClick={onStart}
        data-testid='start-button'>
        Start
      </Button>
    </div>
  );
}
