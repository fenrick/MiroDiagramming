import React from 'react';
import { Paragraph } from '../components';
import { space } from '@mirohq/design-tokens';

/** Placeholder for future layout engine options. */
export const LayoutEngineTab: React.FC = () => (
  <div
    id='panel-layout'
    role='tabpanel'
    aria-labelledby='tab-layout'
    style={{ marginTop: space[200] }}>
    <Paragraph>Layout engine coming soon.</Paragraph>
  </div>
);
