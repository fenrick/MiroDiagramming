import React from 'react';
import { Icon } from './legacy/Icon';

export type ButtonProps = Readonly<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Visual style variant. */
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
 * Basic design-system button composed from Mirotone utility classes.
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

  const icons: Record<'start' | 'end', React.ReactNode> = {
    start: null,
    end: null,
  };
  if (icon) {
    icons[iconPosition] = <Icon name={icon} />;
  }

  return (
    <button
      className={classes}
      {...props}>
      {icons.start}
      {children}
      {icons.end}
    </button>
  );
}
