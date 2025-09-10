import { Form, styled } from '@mirohq/design-system'
import { space as dsSpace } from '@mirohq/design-tokens'
import React from 'react'

// Add semantic alias for spacing tokens until the design-tokens package
// exposes named slots. Small corresponds to 16 px.
const space = { ...dsSpace, small: dsSpace[200] } as const

export type FormGroupProps = Readonly<React.ComponentProps<typeof Form.Field>>

/**
 * Wrapper for grouping related form fields with consistent vertical spacing.
 */
const StyledFormField = styled(Form.Field, { marginBottom: space.small })

export function FormGroup({ children, ...props }: FormGroupProps): React.JSX.Element {
  return <StyledFormField {...props}>{children}</StyledFormField>
}
