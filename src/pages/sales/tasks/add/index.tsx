import styles from '@/styles/shared/add.module.scss';
import { Button } from 'primereact/button';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import moment from 'moment';
import { useRouter } from 'next/router';
import api, { setToken } from '@/services/api.service';
import TitleBar from '../../../../components/TitleBar';
import DynamicFields from '../../../../utils/DynamicComponents';
import { yupResolver } from '@hookform/resolvers/yup';
import TaskSchema from '../../../../validations/TaskSchema';
import { InputTextarea } from 'primereact/inputtextarea';
import { cleanData } from '@/utils/CleanData';
import { Task } from '@/services/types';

export const getServerSideProps = async ({ req, query: { id, parentTaskId } }) => {
    try {
        setToken(req);
        const accounts = await api.getOrgsByType('account-org');
        const assigneesResponse = await api.getAllUsers();
        let taskDetails = null;

        if (id) {
            taskDetails = await api.getTaskById(id);
        }

        return {
            props: {
                edit: id || false,
                parentTaskId: parentTaskId || null,
                accounts: accounts || [],
                assigneesList: Array.isArray(assigneesResponse) ? assigneesResponse : [],
                taskDetails: taskDetails || null,
            },
        };
    } catch (error) {
        console.error('Error in getServerSideProps:', error);
        return {
            props: {
                edit: false,
                parentTaskId: null,
                accounts: [],
                assigneesList: [],
                taskDetails: null,
                error: 'Failed to load data'
            },
        };
    }
};

const defaultValues = {
    title: '',
    summary: '',
    dueDate: null,
    location: '',
    org: '',
    spoc: '',
    assignees: [],
    priority: 'LOW',
    parentTask: ''
};

export default function CreateTask({ edit, parentTaskId, accounts, assigneesList, taskDetails }) {
    const router = useRouter();
    const [spocList, setSpocList] = useState(null);

    const priorityLevels = [
        { label: 'Low', value: 'LOW' },
        { label: 'Medium', value: 'MEDIUM' },
        { label: 'High', value: 'HIGH' },
    ];

    const { handleSubmit, control, watch, setValue, formState: { errors } } = useForm<Task>({
        resolver: yupResolver(TaskSchema), // Integrate Yup with useForm
        defaultValues
    });

    const handleProceed = async (data) => {
        try {
            const baseData = {
                ...defaultValues,
                ...data,
                dueDate: moment(data.dueDate).toISOString(),
                parentTask: parentTaskId ?? ''
            };
            // console.log(baseData)

            cleanData(baseData)

            if (parentTaskId) {
                await api.addSubTask(parentTaskId, baseData);
                toast.success('Sub-task Created');
            }
            else {
                if (edit) {
                    await api.updateTask(taskDetails._id, baseData);
                } else {
                    await api.addTask(baseData);
                }

                toast.success(`Task ${edit ? 'updated' : 'created'} successfully`);
            }
            setTimeout(() => {
                router.push('/sales/tasks');
            }, 2000);

        } catch {
            toast.error('An error occurred while creating the task.');
        }
    };

    useEffect(() => {
        if (edit && taskDetails) {
            const mergedValues = {
                ...defaultValues,
                ...taskDetails,
                assignees: taskDetails.assignees?.map(assignee => assignee._id) || [],
                org: taskDetails.org?._id ?? defaultValues.org,
                spoc: taskDetails.spoc?._id ?? defaultValues.spoc,
            }
            // Define unwanted fields to remove
            const unwantedFields = ['assignee', 'createdBy', 'createdAt', 'updatedAt', '__v'];
            unwantedFields.forEach(field => delete mergedValues[field]);

            Object.keys(mergedValues).forEach((key) => {
                setValue(key as keyof Task, mergedValues[key]);
            });
        }
    }, [edit, taskDetails]);

    useEffect(() => {
        const fetchAllContacts = async () => {
            try {
                const response = await api.getAllContacts();
                setSpocList(response);

                if (edit && taskDetails?.spoc?._id) {
                    setValue('spoc', taskDetails.spoc._id);
                }
            } catch {
                setSpocList([]);
                setValue('spoc', '');
            }
        };

        fetchAllContacts();
    }, [edit, taskDetails, setValue]);

    const fetchContacts = async (accountId: string) => {
        try {
            const response = await api.getContactsByAccountId(accountId, 1, 10);
            setSpocList(response);
            setValue('spoc', taskDetails?.spoc?._id ?? ''); // Set spoc only after list is updated
        } catch {
            setSpocList([]);
            setValue('spoc', '');
        }
    };

    useEffect(() => {
        const selectedAccountId = watch('org');

        if (selectedAccountId) {
            fetchContacts(selectedAccountId)
                .then(() => {
                    if (edit && taskDetails?.spoc?._id) {
                        setValue('spoc', taskDetails.spoc._id); // Ensure spoc is set after contacts are fetched
                    }
                });
        } else {
            setSpocList([]);
            setValue('spoc', '');
        }
    }, [watch('org'), edit, taskDetails, setValue]);

    const taskFields = [
        {
            title: "Subject",
            name: "title",
            type: 'text',
            placeholder: "Enter ...",
            maximumLength: 50,
            parentClassName: "col-12 md:col-4 lg:col-4",
            className: "w-full",
            isRequired: true
        },
        {
            title: "Due date",
            name: "dueDate",
            type: 'Calendar',
            parentClassName: "col-12 md:col-4 lg:col-4",
            className: "w-full",
            showTime: true,
            minDate: new Date(),
            maxDate: new Date(new Date().getFullYear() + 1, 11, 31),
            isRequired: true
        },
        {
            title: "Location",
            name: "location",
            type: 'text',
            placeholder: "Enter ...",
            maximumLength: 30,
            parentClassName: "col-12 md:col-4 lg:col-4",
            className: "w-full"
        },
        {
            title: "Accounts",
            name: "org",
            type: 'dropdown',
            options: accounts ? accounts.map(account => ({
                label: account.title,
                value: account._id
            })) : [],
            placeholder: "Select a account.",
            parentClassName: "col-12 md:col-4 lg:col-4",
            className: "w-full",
            dropDownFilter: true
        },
        {
            title: "Spoc",
            name: "spoc",
            type: 'dropdown',
            options: spocList ? spocList.map(state => ({
                label: state.firstName,
                value: state._id
            })) : [],
            placeholder: "Select a contact.",
            parentClassName: "col-12 md:col-4 lg:col-4",
            className: "w-full",
            dropDownFilter: true,
            isRequired: true
        },
        {
            title: "Assign To",
            name: "assignees",
            type: 'multiselect',
            options: assigneesList ? assigneesList
                .map(user => ({
                    label: user.firstName,
                    value: user._id
                }))
                : [],
            placeholder: "Select .",
            parentClassName: "col-12 md:col-4 lg:col-4",
            className: "w-full",
            dropDownFilter: true
        },
        {
            title: "Priority",
            name: "priority",
            type: 'dropdown',
            options: priorityLevels,
            placeholder: " Select a head count from the dropdown.",
            parentClassName: "col-12 md:col-4 lg:col-4",
            className: "w-full"
        },
    ]
    
    const handleGoBack = () => {
        router.push('/sales/tasks');
    };

    return (
        <>
           <div className={styles.goBackArrow} onClick={handleGoBack} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <i className="pi pi-arrow-left" style={{ fontSize: '1rem', marginRight: '0.5rem' }}></i>
                <span>Back</span>
            </div>
            <TitleBar title={edit ? 'Edit Task' : edit ? 'New Sub-Task' : 'New Task'} />
            <form onSubmit={handleSubmit(handleProceed)}>
                <div className={`grid ${styles.form}`}>
                    {taskFields.map((item, index) => (
                        <React.Fragment key={index}>
                            <DynamicFields
                                item={item}
                                control={control}
                                errors={errors}
                                disbaled={null}
                            />
                        </React.Fragment>
                    ))}
                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Summary</label>
                        <Controller
                            name="summary"
                            control={control}
                            render={({ field }) => (
                                <InputTextarea
                                    rows={5}
                                    maxLength={250} // Limit input to 150 characters
                                    {...field}
                                />
                            )}
                        />
                    </div>
                </div>
                <Button label="Cancel" type="button" className="mr-2" onClick={() => router.push('/sales/tasks')} />
                <Button label="Submit" type="submit" />
            </form>
            <ToastContainer />
        </>
    );
}