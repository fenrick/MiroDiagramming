import React from 'react';
import { Form, styled } from '@mirohq/design-system';
import { tokens } from '../tokens';

export type FormGroupProps = Readonly<React.ComponentProps<typeof Form.Field>>;

/**
 * Wrapper for grouping related form fields with consistent vertical spacing.
 */
const StyledFormField = styled(Form.Field, {
  marginBottom: tokens.space.small,
});

export function FormGroup({
  children,
  ...props
}: FormGroupProps): React.JSX.Element {
  return <StyledFormField {...props}>{children}</StyledFormField>;
}
