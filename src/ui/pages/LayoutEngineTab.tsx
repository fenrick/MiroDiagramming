import React from 'react';
import { Paragraph } from '../components/legacy/Paragraph';
import { tokens } from '../tokens';
import { Panel } from '../components/legacy';

/** Placeholder for future layout engine options. */
export const LayoutEngineTab: React.FC = () => (
  <div
    id='panel-layout'
    role='tabpanel'
    aria-labelledby='tab-layout'>
    <Panel
      padding='small'
      style={{ marginTop: tokens.space.small }}>
      <Paragraph>Layout engine coming soon.</Paragraph>
    </Panel>
  </div>
);
