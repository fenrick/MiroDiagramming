import React from 'react';
import { Paragraph as DSParagraph } from '@mirohq/design-system';

export type ParagraphProps = Readonly<
  React.HTMLAttributes<HTMLParagraphElement>
>;

/** Paragraph element styled using Mirotone classes. */
export function Paragraph({
  children,
  ...props
}: ParagraphProps & { children?: React.ReactNode }): React.JSX.Element {
  return (
    <DSParagraph
      size='small'
      {...props}>
      {children}
    </DSParagraph>
  );
}
