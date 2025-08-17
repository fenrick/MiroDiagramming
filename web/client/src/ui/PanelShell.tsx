import React from 'react';

/**
 * Constrains its children to the Miro panel dimensions.
 * Applies a 320&nbsp;dp max width with 24&nbsp;dp side padding.
 * Use at the top level of any screen rendered in a panel.
 */
export function PanelShell({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        maxWidth: 320,
        paddingLeft: 24,
        paddingRight: 24,
        margin: '0 auto',
      }}>
      {children}
    </div>
  );
}
