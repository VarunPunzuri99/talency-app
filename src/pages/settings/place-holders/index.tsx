import { NextApiRequest } from "next";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import api, { getEmailTemplates, setToken } from '@/services/api.service';
import styles from './index.module.scss';
import { Button } from "primereact/button";
import TitleBar from "@/components/TitleBar";
import { useRef, useState } from "react";
import moment from 'moment';
import { Menu } from 'primereact/menu';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dropdown } from "primereact/dropdown";

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
    try {
        setToken(req);

        const placeHolders = await api.getPlaceholders();

        const emailTemplates = await getEmailTemplates({limit: 100});

        // console.log(placeHolders, 'placeHolders')

        return {
            props: {
                initialPlaceHolders: placeHolders || [],
                emailTemplates: emailTemplates || []
            },
        };
    } catch (error) {
        console.error('Error fetching org details', error.message);
        return {
            props: {
                initialPlaceHolders: [],
                emailTemplates: []
            },
        };
    }
}

const PlaceHolders = ({ initialPlaceHolders, emailTemplates }) => {
    // console.log(emailTemplates)

    const [placeholders, setPlaceholders] = useState(initialPlaceHolders || []);
    const [visible, setVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const menu = useRef(null);
    const toast = useRef(null);

    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    const [formData, setFormData] = useState({ name: '', description: '', jsonPath: '', emailTemplate: '' });

    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [, setPlaceholderToDelete] = useState(null);

    // { console.log('placeholders', placeholders) }

    const handleAdd = async () => {
        try {
            console.log('formData', formData)
            const newFormData = { ...formData, isDefault: false }
            console.log('newFormData', newFormData)
            const newData = await api.addPlaceholder(newFormData);
            setPlaceholders((prevPlaceholders) => [...prevPlaceholders, newData]);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Placeholder added' });
            setVisible(false);
        } catch (error) {
            console.log(error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to add placeholder' });
        }
    };

    const handleEdit = async () => {
        try {
            await api.editPlaceholder(selectedRow._id, formData);
            const newData = await api.getPlaceholders();
            setPlaceholders(newData);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Placeholder updated' });
            setVisible(false);
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: `Failed to edit placeholder. ${error?.message}` });
        }
    };

    const handleDelete = async () => {
        try {
            await api.deletePlaceholder(selectedRow._id);
            const newData = await api.getPlaceholders();
            setPlaceholders(newData);
            setVisible(true);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Placeholder deleted' });
        } catch (error) {
            console.log(error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: `Failed to delete placeholder. ${error?.message}` });
        }
    };

    const openCreateDialog = () => {
        setFormData({ name: '', description: '', jsonPath: '', emailTemplate: '' });
        setDialogMode('create');
        setVisible(true);
    };

    const openEditDialog = (rowData) => {
        setFormData({ name: rowData.name, description: rowData.description, jsonPath: rowData.jsonPath, emailTemplate: rowData.emailTemplate });
        setSelectedRow(rowData);
        setDialogMode('edit');
        setVisible(true);
    };

    const confirmDelete = (placeholder) => {
        setPlaceholderToDelete(placeholder);
        setDeleteDialogVisible(true);
    };

    const actionsTemplate = (item) => {
        return (
            <span
                className={styles.pointer}
                onClick={(event) => {
                    menu.current.toggle(event);
                    setSelectedRow(item);
                    console.log('selectedRow', selectedRow)
                }}
            >
                <i className="pi pi-ellipsis-v" style={{ fontSize: '1rem', color: 'black' }}></i>
            </span>
        );
    };

    const items = [
        {
            label: 'Edit',
            icon: <i className="pi pi-pencil mr-2" />,
            //   command: (event) => handleActionClick('edit')
            command: () => openEditDialog(selectedRow),
        },
        {
            label: 'Delete',
            icon: <i className="pi pi-trash mr-2" />,
            //   command: (event) => handleActionClick('view')
            command: () => confirmDelete(selectedRow),
        }
    ];

    return (
        <>
            <Toast ref={toast} />
            <TitleBar title="Placeholders">
                <Button
                    label="Add PlaceHolder"
                    // onClick={() => setVisible(true)}
                    onClick={openCreateDialog}
                />
            </TitleBar>
            <div className={styles.placeholders}>
                <div className={styles.datatable}>
                    <DataTable value={placeholders}>
                        <Column field="updatedAt" body={(rowData) => moment(rowData.updatedAt).format('MMM DD, YYYY')} header="Date" sortable />
                        <Column field="name" header="Name" />
                        <Column field="description" header="Description" />
                        <Column field="emailTemplate.templateName" header="Email template" />
                        <Column header="Action" body={(rowData) => rowData?.isDefault ? null : actionsTemplate(rowData)} />
                    </DataTable>
                </div>
                <Menu model={items} popup popupAlignment="right" ref={menu} />
            </div>

            <Dialog
                header={dialogMode === 'create' ? 'Create Placeholder' : 'Edit Placeholder'}
                visible={visible} onHide={() => setVisible(false)}
                // className={styles.dialog}
                className={styles["dialog-container"]}
            >
                <div
                    // className={styles.p_fluid}
                    className={styles["dialog-content"]}
                >
                    <div
                        // className={styles.p_field}
                        className={styles["field"]}
                    >
                        <label htmlFor="name">Name <span style={{ color: "red" }}> *</span></label>
                        <InputText id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div
                        // className={styles.p_field}
                        className={styles["field"]}
                    >
                        <label htmlFor="description" className={styles["field_label"]}>Description</label>
                        <InputText id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div
                        // className={styles.p_field}
                        className={styles["field"]}
                    >
                        <label htmlFor="jsonPath">JSON Path<span style={{ color: "red" }}> *</span></label>
                        <InputText id="jsonPath" value={formData.jsonPath} maxLength={100} onChange={(e) => setFormData({ ...formData, jsonPath: e.target.value })} />
                    </div>
                    <div
                        className={styles["field"]}
                    >
                        <label htmlFor="emailTemplate">Email Template<span style={{ color: "red" }}> *</span></label>
                        <Dropdown
                            id="emailTemplate"
                            value={formData.emailTemplate}
                            onChange={(e) => setFormData({ ...formData, emailTemplate: e.target.value })}
                            options={emailTemplates.map(template => ({
                                label: template.templateName,
                                value: template._id
                            }))}
                            optionLabel="label"
                            optionValue="value"
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>
                <div className={styles["dialog-footer"]}>
                    <Button label={dialogMode === 'create' ? 'Create' : 'Save'} onClick={dialogMode === 'create' ? handleAdd : handleEdit} />
                </div>
            </Dialog>

            <Dialog
                visible={deleteDialogVisible}
                onHide={() => setDeleteDialogVisible(false)}
                header="Confirm Delete"
                footer={
                    <div>
                        <Button label="Proceed" icon="pi pi-check" onClick={handleDelete} className="p-button-danger" />
                    </div>
                }
                className={styles["dialog-container"]}
            >
                <p className={styles["dialog-content"]}>Are you sure you want to delete this placeholder {selectedRow?.name} ?</p>
            </Dialog>


        </>
    );
}

export default PlaceHolders;