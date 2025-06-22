import React from 'react';
import { Heading, Paragraph } from 'mirotone-react';

/** Placeholder UI for the Export tab. */
export const ExportTab: React.FC = () => (
  <div className='custom-centered'>
    <Heading level={2}>Export</Heading>
    <Paragraph>Export the current diagram to PNG or SVG.</Paragraph>
  </div>
);
