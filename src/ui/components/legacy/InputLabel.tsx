/* eslint-disable react/prop-types */
import React from 'react';

export type InputLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

/** Label element for form controls. */
export function InputLabel({
  className = '',
  ...props
}: InputLabelProps): React.JSX.Element {
  return <label className={className} {...props} />;
}
