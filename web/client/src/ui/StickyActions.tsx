import React from 'react';

/**
 * Anchors action elements to the bottom of a panel while allowing
 * surrounding content to scroll beneath.
 *
 * Place this inside {@link PanelShell} so primary controls remain visible in
 * narrow panels.
 *
 * @param children React nodes to render inside the sticky container.
 * @returns A container that keeps its children fixed to the panel bottom.
 */
export function StickyActions({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        background: 'var(--mds-surface, #fff)',
        paddingTop: 12,
        paddingBottom: 12,
      }}>
      {children}
    </div>
  );
}
