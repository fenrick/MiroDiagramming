import React from 'react';
import { Icon } from './legacy/Icon';
import { tokens } from '../tokens';

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
    /** Optional padding override, defaults to tokens.space.small. */
    padding?: string;
  }
>;

/**
 * Basic design-system button composed from Mirotone utility classes.
 * Supports optional start or end icons.
 * Padding defaults to `tokens.space.small`. Supply `style` overrides to
 * customise colour, font or border.
 */
export function Button({
  variant = 'primary',
  size,
  icon,
  iconPosition = 'start',
  padding = tokens.space.small,
  className = '',
  style,
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
      style={{ padding, ...style }}
      {...props}>
      {icons.start}
      {children}
      {icons.end}
    </button>
  );
}
