import React from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { Button } from './button'

export interface SegmentedOption {
  readonly label: string
  readonly value: string
}

export type SegmentedControlProperties = Readonly<{
  value: string
  onChange: (v: string) => void
  options: SegmentedOption[]
  legend?: string
}>

/** Generic segmented control built with our Button component. */
export function SegmentedControl({
  value,
  onChange,
  options,
  legend = 'Options',
}: SegmentedControlProperties): React.JSX.Element {
  return (
    <fieldset style={{ display: 'flex', gap: 'var(--space-50)', border: 'none', padding: 0 }}>
      <VisuallyHidden asChild>
        <legend>{legend}</legend>
      </VisuallyHidden>
      {options.map((opt) => (
        <Button
          key={opt.value}
          onClick={() => {
            onChange(opt.value)
          }}
          variant={value === opt.value ? 'primary' : 'secondary'}
        >
          {opt.label}
        </Button>
      ))}
    </fieldset>
  )
}
