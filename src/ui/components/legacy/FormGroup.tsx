import React from 'react';

export type FormGroupProps = Readonly<React.HTMLAttributes<HTMLDivElement>>;

/** Wrapper for related form fields enforcing vertical rhythm. */
export function FormGroup({
  className = '',
  ...props
}: FormGroupProps): React.JSX.Element {
  return (
    <div
      className={`form-group ${className}`.trim()}
      {...props}
    />
  );
}
