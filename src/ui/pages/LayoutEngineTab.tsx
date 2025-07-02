import React from 'react';
import { Paragraph } from '../components';
import { tokens } from '../tokens';

/** Placeholder for future layout engine options. */
export const LayoutEngineTab: React.FC = () => (
  <div
    id='panel-layout'
    role='tabpanel'
    aria-labelledby='tab-layout'
    style={{ marginTop: tokens.space.small }}>
    <Paragraph>Layout engine coming soon.</Paragraph>
  </div>
);
