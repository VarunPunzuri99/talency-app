import React, { useRef, useState } from 'react';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { DataTable } from 'primereact/datatable';
import styles from './index.module.scss';
import { useRouter } from 'next/router';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ToastContainer, toast } from 'react-toastify';
import { softDeleteEmailTemplate } from '@/services/api.service';
import { Menu } from 'primereact/menu';

const EmailTemplateBuilder = ({ data, selectedIds, setSelectedIds, setTemplateId, setEditDialog, setView }) => {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const menuRef = useRef(null);

    const toggleSelect = (id) => {
        setSelectedIds((prevSelectedIds) =>
            prevSelectedIds.includes(id)
                ? prevSelectedIds.filter((selectedId) => selectedId !== id) // Remove if exists
                : [...prevSelectedIds, id] // Add if not exists
        );
    };

    const handleSoftDelete = async () => {
        try {
            await softDeleteEmailTemplate(selectedId);
            toast.success('Email template deleted successfully!');
            setShowDeleteDialog(false);

            setTimeout(() => {
                router.reload();
            }, 1000);
        } catch (error) {
            console.error('Error while deleting email template:', error?.message);
            toast.error('Failed to delete the email template. Please try again later.');
        }
    };


    const handleMenuClick = (event, templateId, menu) => {
        setSelectedId(templateId)
        menu.current.toggle(event);
    };

    const items = [
        {
            label: 'Edit',
            command: () => {
                setTemplateId(selectedId);
                setEditDialog(true)
            }
        },
        {
            label: 'View',
            command: () => {
                setTemplateId(selectedId)
                setView(true)
            }
        },
        {
            label: 'Delete',
            command: () => {
                setSelectedId(selectedId);
                setShowDeleteDialog(true);
            }
        }
    ];

    return (
        <>
            <ToastContainer />
            <Menu
                model={items}
                popup
                ref={menuRef}
                id="popup_menu_right"
                popupAlignment="right"
            />
            <div className={styles.tableWrapper}>
                <DataTable value={data}>
                    <Column
                        body={(rowData) => (
                            <Checkbox
                                checked={selectedIds.includes(rowData._id)}
                                onChange={() => toggleSelect(rowData._id)}
                            />
                        )}
                    />
                    <Column field="templateName" header="Template Name" />
                    <Column field="eventName" header="Event name" />
                    <Column
                        header="Actions"
                        body={(rowData) => (
                            <i className="pi pi-ellipsis-v" onClick={(e) => handleMenuClick(e, rowData._id, menuRef)} />
                        )}
                    />
                </DataTable>
            </div>

            <Dialog
                header="Confirm Deletion"
                visible={showDeleteDialog}
                onHide={() => setShowDeleteDialog(false)}
            >
                <p>Are you sure you want to delete this email template?</p>
                <div className={styles.dialog_buttons}>
                    <Button label="Cancel" onClick={() => setShowDeleteDialog(false)} className="p-button-text mr-2" />
                    <Button
                        label="Delete"
                        onClick={handleSoftDelete}
                        className="p-button-danger"
                    />
                </div>
            </Dialog>
        </>
    );
};

export default EmailTemplateBuilder;