import api from '@/services/api.service';
import styles from './index.module.scss';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { tryCatch, Toast } from '@/hooks/tryCatch';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FilterMatchMode, FilterOperator } from 'primereact/api';

export default function Department() {
    const [data, setData] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [visible, setVisible] = useState(false);
    const [filters, setFilters] = useState(null);
    const [loading, setLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const {
        control,
        formState: { errors },
        handleSubmit,
        getValues,
        reset,
    } = useForm();

    const clearFilter = () => {
        initFilters();
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        const _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        });
        setGlobalFilterValue('');
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <div className="flex gap-3">
                    <Button
                        type="button"
                        // icon="pi pi-add"
                        label="Add Department"
                        onClick={() => {
                            reset({});
                            setIsEdit(false);
                            setVisible(true);
                        }}
                    />
                    <Button
                        type="button"
                        icon="pi pi-filter-slash"
                        label="Clear"
                        outlined
                        onClick={clearFilter}
                    />
                </div>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={globalFilterValue}
                        onChange={onGlobalFilterChange}
                        placeholder="Keyword Search"
                    />
                </span>
            </div>
        );
    };

    const header = renderHeader();

    const onSubmit = async (data) => {
        tryCatch(async (toast) => {
            if (!isEdit) {
                // await api.addDepartment(data);
                toast('Department Added');
            } else {
                const { name } = data;
                // await api.updateDepartment({ name }, data.id);
                toast('Department Updated');
            }
            reset({});
        });
    };

    const getActionsItem = (row) => {
        return (
            <div className={'actionsItems'}>
                <i
                    className={`pi pi-pencil`}
                    onClick={() => {
                        reset(row);
                        setIsEdit(true);
                        setVisible(true);
                    }}
                />
                <i
                    className={`pi pi-trash`}
                    onClick={() => handelDeleteDepartment(row)}
                />
            </div>
        );
    };

    const handelDeleteDepartment = async (item) => {
        tryCatch(async (toast) => {
            // await api.deleteDepartment(item.id);
            toast('Department Deleted');
        });
    };

    useEffect(() => {
        tryCatch(
            async () => {
                // let { content } = await api.getDepartments();
                // setData(content || []);
            },
            (toast) => {
                setLoading(false);
            },
        );
        initFilters();
    }, []);

    return (
        <>
            <Toast />
            <div className="card">
                <DataTable
                    value={data}
                    paginator
                    showGridlines
                    rows={10}
                    loading={loading}
                    dataKey="id"
                    filters={filters}
                    globalFilterFields={[
                        'name',
                        // base on fields
                    ]}
                    header={header}
                    emptyMessage="No Department found."
                >
                    <Column
                        field="name"
                        header="Name"
                        // filter
                        // filterPlaceholder="Search by name"
                        // style={{ minWidth: "12rem" }}
                    />
                    <Column header="Date" field="date" />
                    <Column field="status" header="Status" />
                    <Column
                        // field="verified"
                        header="Actions"
                        body={(row) => getActionsItem(row)}
                    />
                </DataTable>
            </div>
            {visible && (
                <Dialog
                    header={isEdit ? 'Edit Department' : 'Add Department'}
                    visible={visible}
                    style={{ width: '25vw' }}
                    onHide={() => {
                        reset({});
                        setVisible(false);
                    }}
                >
                    <div className={styles.dialog}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: 'Department is required.' }}
                                render={({ field, fieldState }) => (
                                    <>
                                        <span className="p-float-label">
                                            <InputText
                                                value={field.value}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <label>Department Name</label>
                                        </span>
                                    </>
                                )}
                            />

                            <Button
                                type="submit"
                                // icon="pi pi-add"
                                label={
                                    isEdit
                                        ? 'Update Department'
                                        : 'Add Department'
                                }
                                // onClick={() => setVisible(true)}
                            />
                        </form>
                    </div>
                </Dialog>
            )}
        </>
    );
}
