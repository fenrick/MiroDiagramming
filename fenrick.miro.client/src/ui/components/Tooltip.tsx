import { Tooltip as DSTooltip } from "@mirohq/design-system";
import React from "react";

export interface TooltipProps {
  /** Text displayed inside the tooltip. */
  readonly content: React.ReactNode;
  /** Element triggering the tooltip on hover or focus. */
  readonly children: React.ReactElement;
  /** Preferred side of the trigger to render against. @default 'top' */
  readonly side?: "top" | "right" | "bottom" | "left";
  /** Alignment along the trigger axis. @default 'center' */
  readonly align?: "start" | "center" | "end";
}

/**
 * Simplified wrapper around the design-system Tooltip.
 *
 * Encapsulates the standard Trigger/Content structure so callers only
 * provide the trigger element and tooltip label.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
}: TooltipProps): React.JSX.Element {
  return (
    <DSTooltip.Provider
      delayDuration={0}
      skipDelayDuration={0}>
      <DSTooltip
        delayDuration={0}
        skipDelayDuration={0}>
        <DSTooltip.Trigger asChild>{children}</DSTooltip.Trigger>
        <DSTooltip.Portal>
          <DSTooltip.Content
            side={side}
            align={align}>
            {content}
          </DSTooltip.Content>
        </DSTooltip.Portal>
      </DSTooltip>
    </DSTooltip.Provider>
  );
}
