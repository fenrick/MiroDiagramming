import React from 'react';
import { Select as DSSelect } from '@mirohq/design-system';

export type SelectProps = Readonly<{
  /** Currently selected value. */
  value?: string;
  /** Called when the selection changes. */
  onChange?: (value: string) => void;
  /** Optional placeholder shown when no value selected. */
  placeholder?: React.ReactNode;
  /** Whether the control is disabled. */
  disabled?: boolean;
  /** Select size token. Defaults to medium. */
  size?: 'medium' | 'large' | 'x-large';
  /** Additional children, typically `<SelectOption>` elements. */
  children?: React.ReactNode;
}>;

/**
 * Wrapper around the design-system `Select` component.
 *
 * It exposes a simplified API compatible with the old Mirotone-based select.
 */
export function Select({
  value,
  onChange,
  placeholder,
  size = 'medium',
  disabled,
  children,
  // className intentionally omitted
}: SelectProps): React.JSX.Element {
  return (
    <DSSelect
      value={value}
      onValueChange={onChange}
      disabled={disabled}>
      <DSSelect.Trigger
        size={size}
        aria-label='Select option'>
        <DSSelect.Value placeholder={placeholder} />
      </DSSelect.Trigger>
      <DSSelect.Portal>
        <DSSelect.Content>{children}</DSSelect.Content>
      </DSSelect.Portal>
    </DSSelect>
  );
}

export type SelectOptionProps = Readonly<
  React.ComponentProps<typeof DSSelect.Item>
>;

/** Option element for `Select`. */
export function SelectOption({
  children,
  ...props
}: SelectOptionProps): React.JSX.Element {
  return <DSSelect.Item {...props}>{children}</DSSelect.Item>;
}
