import React from 'react';

export type ButtonProps = Readonly<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
    /**
     * Optional size override. When omitted, primary buttons default to
     * `medium` and all others use `small`.
     */
    size?: 'small' | 'medium';
  }
>;

/** Basic button styled with Mirotone utility classes. */
export function Button({
  variant = 'primary',
  size,
  className = '',
  ...props
}: ButtonProps): React.JSX.Element {
  const finalSize = size ?? (variant === 'primary' ? 'medium' : 'small');
  const classes =
    `button button-${variant} button-${finalSize} ${className}`.trim();
  return (
    <button
      className={classes}
      {...props}
    />
  );
}
