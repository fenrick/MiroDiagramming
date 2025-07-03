import React from 'react';
import { Button } from './Button';
import { Paragraph } from './Paragraph';

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
      <Paragraph>Welcome to Structured Diagram Tools</Paragraph>
      <Button
        variant='primary'
        onClick={onStart}
        data-testid='start-button'>
        Start
      </Button>
    </div>
  );
}
