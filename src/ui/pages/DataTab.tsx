import React from 'react';
import { Heading, Paragraph } from 'mirotone-react';

/** Placeholder UI for the Data tab. */
export const DataTab: React.FC = () => (
  <div className='custom-centered'>
    <Heading level={2}>Data</Heading>
    <Paragraph>Configure live data bindings.</Paragraph>
  </div>
);
