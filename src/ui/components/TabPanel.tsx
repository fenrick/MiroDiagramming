import React from 'react';
import type { TabId } from '../pages/tab-definitions';

/**
 * Wraps tab content with appropriate ARIA attributes.
 */
export const TabPanel: React.FC<{
  /** Identifier of the tab controlling this panel. */
  tabId: TabId;
  /** Panel content. */
  children: React.ReactNode;
}> = ({ tabId, children }) => (
  <div
    id={`panel-${tabId}`}
    role='tabpanel'
    aria-labelledby={`tab-${tabId}`}>
    {children}
  </div>
);
