import React from 'react';
import { Paragraph } from '../components/Paragraph';
import { tokens } from '../tokens';
import { Panel } from '../components';

/** Placeholder for future layout engine options. */
export const LayoutEngineTab: React.FC = () => (
  <div
    id='panel-layout'
    role='tabpanel'
    aria-labelledby='tab-layout'
    style={{ marginTop: tokens.space.small }}>
    <Panel padding='small'>
      <Paragraph>Layout engine coming soon.</Paragraph>
    </Panel>
  </div>
);
