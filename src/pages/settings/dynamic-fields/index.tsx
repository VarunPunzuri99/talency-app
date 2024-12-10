import { NextApiRequest } from "next";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { createDynamicField, deleteDynamicField, getDynamicFields, setToken, updateDynamicField } from '@/services/api.service';
import styles from './index.module.scss';
import { Button } from "primereact/button";
import TitleBar from "@/components/TitleBar";
import { useRef, useState } from "react";
import moment from 'moment';
import { Menu } from 'primereact/menu';
import { Dialog } from 'primereact/dialog';
import intrnlStyles from './index.module.scss';
import DynamicFieldSchema from "@/validations/DynamicFields";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import React from "react";
import { toast, ToastContainer } from "react-toastify";
import DynamicFields from '@/utils/DynamicComponents';
import { useRouter } from "next/router";
import { startCase } from "lodash-es";

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
    try {
        setToken(req);

        const dynamicFields = await getDynamicFields()

        console.log(dynamicFields)

        return {
            props: {
                data: dynamicFields || [],

            },
        };
    } catch (error) {
        console.error('Error fetching org details', error.message);
        return {
            props: {
                data: [],
            },
        };
    }
}

const DynamicField = ({ data }) => {
    const router = useRouter();
    const [editDialog, setEditDialog] = useState(false);
    const [visible, setVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const menu = useRef(null);

    console.log('trackersData',data);
    

    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

    const openEditDialog = (rowData) => {
        reset({
            ...rowData,
            title: startCase(rowData.title)
        });
        setEditDialog(true);
        setVisible(true);
    };

    const handleDelete = async () => {
        try {
            await deleteDynamicField(selectedRow._id);
            toast.success("Dynamic field deleted successfully!");
            setTimeout(() => {
                router.reload();
            }, 1000);
        } catch {
            toast.error("Error deleting dynamic field");
        }
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
            command: () => openEditDialog(selectedRow),
        },
        {
            label: 'Delete',
            icon: <i className="pi pi-trash mr-2" />,
            command: () => setDeleteDialogVisible(true),
        }
    ];

    const defaultDynamicFieldValues = {
        title: '',
        type: '',
        placeholder: '',
        isRequired: false
    };

    const { handleSubmit, control, formState: { errors }, reset, getValues } = useForm({
        resolver: yupResolver(DynamicFieldSchema),
        mode: 'onChange',
        defaultValues: defaultDynamicFieldValues,
    });

    const fieldTypeOptions = [
        { label: 'Text', value: 'text' },
        { label: 'Number', value: 'number' },
        // { label: 'Dropdown', value: 'dropdown' },
    ];

    const fields = [
        {
            title: "Field Title",
            name: "title",
            type: 'text',
            className: "w-full",
            placeholder: "Enter field title",
            isRequired: true
        },
        {
            title: "Field Type",
            name: "type",
            type: 'dropdown',
            options: fieldTypeOptions,
            className: "w-full",
            isRequired: true
        },
        {
            title: "Placeholder",
            name: "placeholder",
            type: 'text',
            className: "w-full",
            placeholder: "Enter placeholder (optional)",
            isRequired: false
        },
        {
            title: "Required",
            name: "isRequired",
            type: 'checkbox',
            parentClassName: "col-12 md:col-4 lg:col-4",
            labelClassName: "mr-2",
            isRequired: false
        }
    ];

    const onSubmit = async (data) => {
        try {
            console.log(data);

            if (editDialog) {
                await updateDynamicField(selectedRow._id, {
                    ...data,
                    isJobApplicationField: true
                });
                toast.success("Dynamic field updated successfully!");
            } else {
                await createDynamicField({
                    ...data,
                    isJobApplicationField: true
                });
                toast.success("Dynamic field created successfully!");
            }

            setVisible(false);
            setEditDialog(false);
            setTimeout(() => {
                router.reload();
            }, 1000);

        } catch (error) {
            console.error('Error creating/updating dynamic field:', error);
            toast.error("Error creating/updating dynamic field");
        }
    };

    return (
        <>
            <ToastContainer />
            <TitleBar title="DynamicFields">
                <Button
                    label="Add Dynamic Field"
                    onClick={() => setVisible(true)}
                />
            </TitleBar>
            <div className={styles.dynamicFields}>
                <div className={styles.datatable}>
                    <DataTable value={data} emptyMessage="No DynamicFields found">
                        <Column field="updatedAt" body={(rowData) => moment(rowData.updatedAt).format('MMM DD, YYYY')} header="Date" sortable />
                        <Column
                            field="title"
                            header="Title"
                            body={(rowData) => startCase(rowData.title)}
                        />
                        <Column field="type" header="Type" />
                        <Column header="Action" body={(rowData) => rowData?.isDefault ? null : actionsTemplate(rowData)} />
                    </DataTable>
                </div>
                <Menu model={items} popup popupAlignment="right" ref={menu} />
            </div>

            <Dialog
                header={editDialog ? 'Edit dynamic field' : 'Create dynamic field'}
                visible={visible}
                onHide={() => {
                    reset(defaultDynamicFieldValues);
                    setVisible(false)
                    setEditDialog(false)
                }}
                className={intrnlStyles.dynamicDialog}
            >
                <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '20px' }}>

                    {fields?.map((item, index) => (
                        <React.Fragment key={index}>
                            <DynamicFields
                                item={item}
                                control={control}
                                errors={errors}
                                getValues={getValues}
                                disbaled={null}
                            />
                        </React.Fragment>
                    ))}

                    <div className="flex justify-content-end mt-2">
                        <Button
                            label={editDialog ? 'Update dynamic field' : 'Create dynamic field'}
                            severity="secondary"
                            type="submit"
                        />
                    </div>
                </form>
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
                <p className={styles["dialog-content"]}>Are you sure you want to delete this DynamicField {selectedRow?.name} ?</p>
            </Dialog>
        </>
    );
}

export default DynamicField;