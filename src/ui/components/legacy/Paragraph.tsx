import React from 'react';

export type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>;

/** Paragraph element styled using Mirotone classes. */
export function Paragraph({
  className = '',
  ...props
}: ParagraphProps): React.JSX.Element {
  return <p className='p-medium ${className}' {...props} />;
}
