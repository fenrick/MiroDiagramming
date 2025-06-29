import React from 'react';

export type ButtonProps = Readonly<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
  }
>;

/** Basic button styled with Mirotone utility classes. */
export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps): React.JSX.Element {
  const classes = `button button-${variant} ${className}`.trim();
  return (
    <button
      className={classes}
      {...props}
    />
  );
}
