import React from 'react';

export type HeadingProps = Readonly<
  React.HTMLAttributes<HTMLHeadingElement> & { level?: 1 | 2 | 3 | 4 }
>;

/** Simple heading element with configurable level. */
export function Heading({
  level = 1,
  className = '',
  style = {},
  children,
  ...props
}: HeadingProps): React.JSX.Element {
  const attrs = { className, ...props };
  if (level === 2)
    return (
      <h2
        style={{
          fontSize: 'var(--font-sizes-200)',
          ...(style as React.CSSProperties),
        }}
        {...attrs}>
        {children}
      </h2>
    );
  if (level === 3)
    return (
      <h3
        style={{
          fontSize: 'var(--font-sizes-175)',
          ...(style as React.CSSProperties),
        }}
        {...attrs}>
        {children}
      </h3>
    );
  if (level === 4)
    return (
      <h4
        style={{
          fontSize: 'var(--font-sizes-175)',
          ...(style as React.CSSProperties),
        }}
        {...attrs}>
        {children}
      </h4>
    );
  return <h1 {...attrs}>{children}</h1>;
}
