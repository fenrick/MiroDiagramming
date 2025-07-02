import React from 'react';
import { Primitive } from '@mirohq/design-system';
import { tokens } from '../tokens';

export interface PanelProps
  extends Omit<
    React.ComponentProps<typeof Primitive.section>,
    'className' | 'style'
  > {
  /** Padding token defining the inner spacing. */
  padding?: keyof typeof tokens.space;
}

/**
 * Generic container used by tabs and modals.
 *
 * The component sets consistent padding using design-system tokens and
 * forwards standard HTML attributes. Custom class names and inline styles are
 * intentionally ignored so that spacing stays consistent across tabs.
 */
export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  function Panel({ padding = 'medium', ...props }, ref) {
    // Remove style and className so callers cannot override layout
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      style: _style,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      className: _className,
      ...rest
    } = props as {
      style?: React.CSSProperties;
      className?: string;
      [key: string]: unknown;
    };
    return (
      <Primitive.section
        ref={ref}
        style={{ padding: tokens.space[padding] }}
        {...rest}
      />
    );
  },
);
