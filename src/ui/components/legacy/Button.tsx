import React from 'react';
import { Icon } from './Icon';

export type ButtonProps = Readonly<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
    /**
     * Optional size override. When omitted, primary buttons default to
     * `medium` and all others use `small`.
     */
    size?: 'small' | 'medium';
    /** Optional icon displayed inside the button. */
    icon?: string;
    /**
     * Position of the icon relative to children.
     * Defaults to `start`.
     */
    iconPosition?: 'start' | 'end';
  }
>;

/**
 * Basic button styled with Mirotone utility classes.
 * Supports optional start or end icons.
 */
export function Button({
  variant = 'primary',
  size,
  icon,
  iconPosition = 'start',
  className = '',
  children,
  ...props
}: ButtonProps): React.JSX.Element {
  const finalSize = size ?? (variant === 'primary' ? 'medium' : 'small');
  const classes =
    `button button-${variant} button-${finalSize} ${className}`.trim();

  let startIcon: React.JSX.Element | null = null;
  let endIcon: React.JSX.Element | null = null;
  if (icon) {
    if (iconPosition === 'start') {
      startIcon = <Icon name={icon} />;
    } else {
      endIcon = <Icon name={icon} />;
    }
  }

  return (
    <button
      className={classes}
      {...props}>
      {startIcon}
      {children}
      {endIcon}
    </button>
  );
}
