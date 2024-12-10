import { Button } from 'primereact/button';
import { useEffect, useRef, useState } from 'react';
import TitleBar from '@/components/TitleBar';
import api, { getMembersByOrg, setToken } from '@/services/api.service';
import styles from './index.module.scss';
import moment from 'moment';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Menu } from 'primereact/menu';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { ToastContainer, toast } from 'react-toastify';
import { AddMemberDialog } from '@/components/Modals/AddMember';
import { Checkbox } from 'primereact/checkbox';
import { useDebounce } from 'primereact/hooks';
import { tryCatch } from '@/hooks/tryCatch';
import { InputText } from 'primereact/inputtext';
import router from 'next/router';
import { Tooltip } from 'primereact/tooltip';

export const getServerSideProps = async ({ req, params }) => {
    setToken(req);
    let department = null;
    let members = null
    try {
        if (params.view) {
            department = await api.getDepartment(params.view);
            console.log(department);
            members = await api.getMembers(department.org._id, params.view);
        }
    } catch (error) {
        console.error('Error fetching job:', error);
    }
    return {
        props: {
            department: department || {},
            initialMembers: members || [],
        }
    };
};

export default function Department({ department, initialMembers }) {
    console.log('department', department)
    console.log('members', initialMembers)

    const [members, setMembers] = useState(initialMembers);
    const [visible, setVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const menu = useRef(null);
    const [deptMembers, setDeptMembers] = useState([])

    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [, setMemberToDelete] = useState(null);

    const [includeSubDepartments, setIncludeSubDepartments] = useState(false);

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [inputValue, debouncedValue, setInputValue] = useDebounce('', 500);

    // const [filterRole, setFilterRole] = useState(null);


    // const roleFilterOptions = [
    //     { label: 'All', value: null },
    //     { label: 'Organization Admin', value: 'org-admin' },
    //     { label: 'Organization User', value: 'org-user' },
    //     { label: 'Business Unit Head', value: 'bu-head' },
    //     { label: 'Account Manager', value: 'account-manager' },
    //     { label: 'Resource Manager', value: 'resource-manager' },
    //     { label: 'Delivery Manager', value: 'delivery-manager' },
    //     { label: 'Team Lead', value: 'team-lead' },
    //     { label: 'Team Member', value: 'team-member' }
    // ];

    // const roleFilterTemplate = (options) => {
    //     return (
    //         <Dropdown
    //             value={options.value}
    //             options={roleFilterOptions}
    //             onChange={(e) => options.filterCallback(e.value)}
    //             placeholder="Select a Role"
    //             showClear
    //             optionLabel="label"
    //             className="w-full"
    //         />
    //     );
    // };

    const onPageChange = (event) => {
        setPage(event.page + 1);
        setRowsPerPage(event.rows);
    };

    const addMember = async () => {
        setSelectedRow(null);
        setVisible(true);
        setDialogMode('create');
        try {
            // fetchMembers();
            const fetchedMembers: any = await api.getDepartmentMembers(department.org._id, department._id); // Assuming node.key is the department ID
            setDeptMembers(fetchedMembers);
        } catch (error) {
            console.error("Failed to fetch members:", error);
        }
    };


    

    const editMember = async (node) => {
        console.log('node', node);
        setSelectedRow(node);
        setVisible(true);
        setDialogMode('edit');
        try {
            const fetchedMembers: any = await api.getDepartmentMembers(department.org._id, department._id); // Assuming node.key is the department ID
            setDeptMembers(fetchedMembers);
            // fetchMembers();
        } catch (error) {
            console.error("Failed to fetch members:", error);
        }
    };

    const handleSaveMember = async (memberData) => {
        console.log('memberData', memberData);
        if (memberData.reportingTo === "")
            delete memberData.reportingTo
        try {
            if (dialogMode === 'create') {
                // Add new member
                memberData = { ...memberData, businessUnit: department._id };
                await api.addMember(department.org._id,memberData)
                toast.success(`Member added successfully to: ${department.label}`);
            } else {
                // Update existing member
                await api.updateMember(department.org._id, selectedRow._id, memberData);
                toast.success(`Member updated successfully: ${selectedRow.firstName}`);
            }
            fetchMembers();
            setVisible(false);
        } catch (error) {
            console.log(error);
            toast.error(`${error?.response?.data?.message}`);
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
                <i className="pi pi-ellipsis-v" style={{ fontSize: '1rem', color: 'black', cursor: 'pointer' }}></i>
            </span>
        );
    };

    const items = [
        {
            label: 'Edit',
            icon: <i className="pi pi-pencil mr-2" />,
            command: () => editMember(selectedRow),
        },
        {
            label: 'Delete',
            icon: <i className="pi pi-trash mr-2" />,
            command: () => confirmDelete(selectedRow),
        }
    ];

    const title = `${department.label} Department`

    const handleDelete = async () => {
        try {
            await api.deleteMember(department.org._id, selectedRow._id);
            setDeleteDialogVisible(false);
            fetchMembers();
            toast.success(`Member deleted successfully: ${selectedRow.name}`);
        } catch (error) {
            console.log(error);
            toast.error(`An error occurred while deleting the member. ${error?.message}`);
        }
    };

    const confirmDelete = (member) => {
        setMemberToDelete(member);
        setDeleteDialogVisible(true);
    };

    const fetchMembers = async () => {
        try {
            const response: any = includeSubDepartments
                ? await getMembersByOrg(department.org._id, 1, 100, '', department._id)// Fetch entire tree
                : await api.getMembers(department.org._id, department._id); // Fetch only this level
            const fetchedMembers = includeSubDepartments ? response.members : response;
            console.log('fetchedMembers', fetchedMembers)
            setMembers(fetchedMembers);
        } catch (error) {
            console.error('Failed to fetch members:', error);
        }
    };

    // Trigger fetch whenever the checkbox is toggled
    useEffect(() => {
        fetchMembers();
    }, [includeSubDepartments]);

    useEffect(() => {
        console.log('Debounced value:', debouncedValue);
        const fetch = async () => {
            if (inputValue && inputValue.trim() !== '') {
                tryCatch(async () => {
                    let res;
                    if (includeSubDepartments) {
                        res = await getMembersByOrg(department.org._id, page, rowsPerPage, debouncedValue, department._id)
                        setMembers(res.members || []);
                    } else {
                        res = await api.getMembers(department.org._id, department._id, debouncedValue);
                        setMembers(res);
                    }

                });
            } else {
                fetchMembers();
            }
        };
        if (inputValue != null) {
            fetch();
        }
    }, [debouncedValue, inputValue, initialMembers, includeSubDepartments]);

    const header = () => {
        return (
            <div className="flex align-content-center justify-content-between">
                <span className="p-input-icon-right">
                    <InputText
                        value={inputValue}
                        placeholder="Search Members ..."
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                </span>
                <div className={styles.checkboxContainer}>
                    <Checkbox
                        inputId="includeSubDepartments"
                        checked={includeSubDepartments}
                        onChange={(e) => {
                            setIncludeSubDepartments(e.checked);
                            setInputValue('');
                        }}
                    />
                    <label htmlFor="includeSubDepartments">Include Sub-departments</label>
                </div>
            </div>
        );
    };



    return (
        <>
            <ToastContainer />
            <Tooltip target=".breadcrumb" />
            <div className={styles.goBackArrow} onClick={() => router.back()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <i className="pi pi-arrow-left" style={{ fontSize: '1rem', marginRight: '0.5rem' }}></i>
                <span>Back</span>
            </div>
            <TitleBar title={title}>
                <div className={styles.titleBarContainer}>

                    <Button
                        label="Add Member"
                        onClick={() => addMember()}
                        className={styles.addButton}
                    />
                </div>
            </TitleBar>

            <div className={styles.departments}>
                <div className={styles.datatable}>
                    <DataTable
                        value={members}
                        totalRecords={members.length}
                        paginator
                        first={(page - 1) * rowsPerPage}
                        scrollable
                        rows={rowsPerPage}
                        onPage={onPageChange}
                        header={header}
                        emptyMessage="No members found."
                        rowsPerPageOptions={[5, 10, 25, 50]}
                    >
                        <Column field="updatedAt" body={(rowData) => moment(rowData.updatedAt).format('MMM DD, YYYY')} header="Date" sortable />
                        <Column field="email" header="E-mail" sortable />
                        <Column field="firstName" header="First Name" sortable />
                        <Column field="lastName" header="Last Name" sortable />
                        <Column field="reportingTo?.firstName" header="Reporting To" body={(rowData) => rowData.reportingTo?.firstName ?? 'None'} />
                        <Column
                            field="businessUnit.breadcrumb"
                            header="Department"
                            body={(rowData) => (
                                <div
                                    style={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        width: '8rem',
                                    }}
                                    data-pr-tooltip={rowData?.businessUnit?.breadcrumb}
                                    className='breadcrumb'
                                    data-pr-position="top"

                                >
                                    {rowData.businessUnit?.breadcrumb}
                                </div>
                            )}
                        />
                        <Column
                            field="roles"
                            header="Roles"
                            body={(rowData) => (
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {rowData.roles.map((role, index) => (
                                        
                                        <Tag key={index} value={role} style={{ margin: '2px' }} />
                                    ))}
                                </div>
                            )}
                            sortable
                        />
                        <Column header="Action" body={actionsTemplate} />
                    </DataTable>
                </div>
                <Menu model={items} popup popupAlignment="right" ref={menu} />
            </div>

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
                <p className={styles["dialog-content"]}>Are you sure you want to delete this member {selectedRow?.name} ?</p>
            </Dialog>

            <AddMemberDialog
                visible={visible}
                onHide={() => setVisible(false)}
                onSave={handleSaveMember}
                initialOrgUsers={deptMembers}
                initialData={dialogMode === 'edit' ? selectedRow : null}
            />

        </>
    )


}