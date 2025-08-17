import React from 'react';
import { Drawer, DrawerProps } from './Drawer';

export interface JobDrawerProps extends Omit<DrawerProps, 'children'> {
  /** Status message announced to assistive tech. */
  readonly statusMessage: string;
}

export function JobDrawer({
  statusMessage,
  ...drawerProps
}: JobDrawerProps): React.JSX.Element | null {
  return (
    <Drawer {...drawerProps}>
      <div
        aria-live='polite'
        data-testid='job-status'>
        {statusMessage}
      </div>
    </Drawer>
  );
}
