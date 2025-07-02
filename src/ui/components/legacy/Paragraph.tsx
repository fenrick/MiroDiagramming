import React from 'react';

export type ParagraphProps = Readonly<
  React.HTMLAttributes<HTMLParagraphElement>
>;

/** Paragraph element styled using Mirotone classes. */
export function Paragraph({
  className = '',
  style = {},
  ...props
}: ParagraphProps): React.JSX.Element {
  return (
    <p
      className={`p-medium ${className}`.trim()}
      style={{
        fontSize: 'var(--font-sizes-175)',
        ...(style as React.CSSProperties),
      }}
      {...props}
    />
  );
}
