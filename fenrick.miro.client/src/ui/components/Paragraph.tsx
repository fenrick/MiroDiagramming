import { styled } from "@mirohq/design-system";
import { space } from "@mirohq/design-tokens";
import React from "react";

export type ParagraphProps = Readonly<
  Omit<React.HTMLAttributes<HTMLParagraphElement>, "className" | "style">
>;

/**
 * Paragraph element styled using design-system classes.
 *
 * Custom class names and inline styles are intentionally excluded so
 * typography remains consistent across the app.
 */
const StyledParagraph = styled(DSParagraph,
  {
    marginTop: 0,
    marginBottom: space[200],
    position: "relative",
  });

export function Paragraph({
  children,
  ...props
}: ParagraphProps & { children?: React.ReactNode }): React.JSX.Element {
  return (
    <StyledParagraph
      size='small'
      {...props}>
      {children}
    </StyledParagraph>
  );
}
