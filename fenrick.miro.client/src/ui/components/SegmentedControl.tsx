import React from "react";
import { Button } from "./Button";

export interface SegmentedOption {
  readonly label: string;
  readonly value: string;
}

export type SegmentedControlProps = Readonly<{
  value: string;
  onChange: (v: string) => void;
  options: SegmentedOption[];
}>;

/**
 * Generic segmented control built with design-system buttons.
 */
export function SegmentedControl({
  value,
  onChange,
  options,
}: SegmentedControlProps): React.JSX.Element {
  return (
    <fieldset className='custom-segment'>
      <legend className='custom-visually-hidden'>Layout type</legend>
      {options.map(opt => (
        <Button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          variant={value === opt.value ? "primary" : "secondary"}>
          {opt.label}
        </Button>
      ))}
    </fieldset>
  );
}
