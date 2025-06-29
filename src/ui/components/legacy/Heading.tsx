import React from 'react';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4;
}

/** Simple heading element with configurable level. */
export function Heading({
  level = 1,
  className = '',
  children,
  ...props
}: HeadingProps): React.JSX.Element {
  const attrs = { className, ...props };
  if (level === 2) return <h2 {...attrs}>{children}</h2>;
  if (level === 3) return <h3 {...attrs}>{children}</h3>;
  if (level === 4) return <h4 {...attrs}>{children}</h4>;
  return <h1 {...attrs}>{children}</h1>;
}
