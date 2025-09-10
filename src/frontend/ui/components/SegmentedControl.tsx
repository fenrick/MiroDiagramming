import React from 'react'
import { Flex } from '@mirohq/design-system'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Button } from './Button'

export interface SegmentedOption {
  readonly label: string
  readonly value: string
}

export type SegmentedControlProps = Readonly<{
  value: string
  onChange: (v: string) => void
  options: SegmentedOption[]
}>

/**
 * Generic segmented control built with design-system buttons.
 */
export function SegmentedControl({
  value,
  onChange,
  options,
}: SegmentedControlProps): React.JSX.Element {
  return (
    <Flex as="fieldset" gap={50}>
      <VisuallyHidden asChild>
        <legend>Layout type</legend>
      </VisuallyHidden>
      {options.map((opt) => (
        <Button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          variant={value === opt.value ? 'primary' : 'secondary'}
        >
          {opt.label}
        </Button>
      ))}
    </Flex>
  )
}
