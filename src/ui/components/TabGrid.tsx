import React from 'react';

export interface TabGridProps {
  /** Number of equal-width columns in the grid. Defaults to two. */
  columns?: number;
  /** Optional CSS class name */
  className?: string;
  /** Grid contents. */
  children: React.ReactNode;
}

/**
 * Layout wrapper rendering children in a 12-column Mirotone grid. Each child
 * automatically receives column start/end classes to distribute them evenly.
 */
export function TabGrid({
  columns = 2,
  className = '',
  children,
}: Readonly<TabGridProps>): React.JSX.Element {
  const span = Math.floor(12 / columns);
  return (
    <div className={`grid ${className}`.trim()}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        const element = child as React.ReactElement<{ className?: string }>;
        const start = 1 + (index % columns) * span;
        const endLine = start + span;
        const gridClass = `cs${start} ce${Math.min(endLine - 1, 12)}`;
        if (Object.prototype.hasOwnProperty.call(element.props, 'className')) {
          const wrapped =
            `${element.props.className ?? ''} ${gridClass}`.trim();
          return React.cloneElement(element, { className: wrapped });
        }
        return <div className={gridClass}>{element}</div>;
      })}
    </div>
  );
}
