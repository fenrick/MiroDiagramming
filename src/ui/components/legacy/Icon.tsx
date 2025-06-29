import React from 'react';

export type IconProps = Readonly<
  React.HTMLAttributes<HTMLSpanElement> & { name: string }
>;

/** Renders a span with the Mirotone icon class. */
export function Icon({
  name,
  className = '',
  ...props
}: IconProps): React.JSX.Element {
  return (
    <span
      className={`icon-${name} ${className}`.trim()}
      {...props}
    />
  );
}
