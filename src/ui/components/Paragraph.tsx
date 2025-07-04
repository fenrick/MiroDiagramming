import React from 'react';
import { Paragraph as DSParagraph, styled } from '@mirohq/design-system';
import { tokens } from '../tokens';

export type ParagraphProps = Readonly<
  React.HTMLAttributes<HTMLParagraphElement>
>;

/** Paragraph element styled using Mirotone classes. */
const StyledParagraph = styled(DSParagraph, {
  marginTop: 0,
  marginBottom: tokens.space.small,
  position: 'relative',
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
