import React from 'react';
import { useExcelData } from '../hooks/excel-data-context';
import { useExcelSync } from '../hooks/use-excel-sync';
import { Modal } from './Modal';
import { RowInspector } from './RowInspector';

export interface EditMetadataModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

/** Modal wrapper displaying RowInspector for the current selection. */
export function EditMetadataModal({
  isOpen,
  onClose,
}: EditMetadataModalProps): React.JSX.Element | null {
  const data = useExcelData();
  const update = useExcelSync();
  if (!data) {
    return null;
  }
  return (
    <Modal
      title='Edit Metadata'
      isOpen={isOpen}
      onClose={onClose}>
      <RowInspector
        rows={data.rows}
        idColumn={data.idColumn}
        onUpdate={update}
      />
    </Modal>
  );
}
