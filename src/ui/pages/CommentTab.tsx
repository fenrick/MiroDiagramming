import React from 'react';
import { Heading, Paragraph } from 'mirotone-react';

/** Placeholder UI for the Comment tab. */
export const CommentTab: React.FC = () => (
  <div className='custom-centered'>
    <Heading level={2}>Comments</Heading>
    <Paragraph>Review and add board comments.</Paragraph>
  </div>
);
