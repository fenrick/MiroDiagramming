import React from 'react';
import { Heading, Paragraph } from 'mirotone-react';

/** Placeholder UI for the Templates tab. */
export const TemplatesTab: React.FC = () => (
  <div className='custom-centered'>
    <Heading level={2}>Templates</Heading>
    <Paragraph>Select a diagram template to insert.</Paragraph>
  </div>
);
