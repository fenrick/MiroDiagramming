import React from 'react';

export type TextProps = Readonly<React.HTMLAttributes<HTMLSpanElement>>;

/** Span element used for button labels and inline text. */
export function Text({
  className = '',
  ...props
}: TextProps): React.JSX.Element {
  return (
    <span
      className={className}
      {...props}
    />
  );
}
