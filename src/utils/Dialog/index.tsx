import React from 'react';
import { Button, Dialog } from '@/primereact';
import styles from './Dialog.module.scss';

export default function CustomDialog({ visible, onHide, header = 'Confirmation', content, onConfirm, onCancel, confirmLabel = 'Yes', cancelLabel = 'No' }) {
  const footerContent = (
    <div>
      <Button className="p-button-secondary" label={cancelLabel} icon="pi pi-times" onClick={onCancel || onHide}/>
      <Button className="p-button-primary" label={confirmLabel} icon="pi pi-check" onClick={onConfirm} autoFocus />
    </div>
  );

  return (
    <Dialog 
      header={header} 
      visible={visible} 
      style={{ width: '30vw' }} 
      footer={footerContent} 
      onHide={onHide}
      className={styles.customDialog}
    >
      <div className={styles.dialogContent}>
        {content}
      </div>
    </Dialog>
  );
}
