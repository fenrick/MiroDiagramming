import React from 'react';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4;
}

/** Simple heading element with configurable level. */
export function Heading({
  level = 1,
  className = '',
  ...props
}: HeadingProps): React.JSX.Element {
  if (level === 2) return <h2 className={className} {...props} />;
  if (level === 3) return <h3 className={className} {...props} />;
  if (level === 4) return <h4 className={className} {...props} />;
  return <h1 className={className} {...props} />;
}
