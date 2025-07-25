import React from "react";

/**
 * Wraps tab content with appropriate ARIA attributes.
 */
export interface TabPanelProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Identifier of the tab controlling this panel. */
  readonly tabId: string;
  /** Panel content. */
  readonly children: React.ReactNode;
}

/**
 * Wraps tab content with appropriate ARIA attributes while forwarding
 * remaining props to the underlying container.
 */
export const TabPanel: React.FC<TabPanelProps> = ({
  tabId,
  children,
  style,
  ...props
}) => (
  <div
    id={`panel-${tabId}`}
    role='tabpanel'
    aria-labelledby={`tab-${tabId}`}
    style={{ position: "relative", ...style }}
    {...props}>
    {children}
  </div>
);
