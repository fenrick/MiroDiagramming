import React from 'react';
import { Button } from './legacy';

export interface SegmentedOption {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  value: string;
  onChange: (v: string) => void;
  options: SegmentedOption[];
}

/**
 * Generic segmented control using Mirotone buttons.
 */
export function SegmentedControl({
  value,
  onChange,
  options,
}: SegmentedControlProps): React.JSX.Element {
  return (
    <div role='group' aria-label='Layout type' className='segmented-control'>
      {options.map(opt => (
        <Button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          variant={value === opt.value ? 'primary' : 'secondary'}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
