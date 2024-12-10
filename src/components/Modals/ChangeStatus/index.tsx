import { Dispatch, SetStateAction, useState } from 'react';
import styles from '@/styles/shared/Modals/modal.module.scss';
import { Dialog } from 'primereact/dialog';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { toast, ToastContainer } from 'react-toastify';
import { tryCatch } from '@/hooks/tryCatch';
import { Contact } from '@/services/types';
import ApiCall, { uploadFile } from '@/services/api.service';
import { useRouter } from 'next/router';
import { FileUpload } from 'primereact/fileupload';
import React from 'react';

interface StatusOption {
    label: string;
    value: string;
}
interface ChangeStatusModalProps {
    account?: any;
    statusEnum?: StatusOption[];
    task?: any;
    job?: any;
    bulkJobs?: string[],
    contact?: Contact;
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
    onConfirm?: (status: any, fileIds?: string[], comment?: string) => Promise<void>;
}

export default function ChangeStatusModal({ statusEnum, task, job,bulkJobs, visible, contact, account, setVisible, onConfirm }: ChangeStatusModalProps) {
    const router = useRouter();
    const [checked, setChecked] = useState(false);
    const [comment, setComment] = useState(null);
    const status = Array.isArray(statusEnum) ? statusEnum : [];
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);

    const handleFileUpload = async (event) => {
        const file = event.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await uploadFile(formData,);
            if (response._id) {
                setUploadedFileIds((prevIds) => [...prevIds, response._id]); // Update with new file ID
            } else {
                toast.error('File ID not found in response');
            }
            // Handle success (e.g., show a success message or update the UI)
        } catch (error) {
            toast.error('Error uploading file:', error);
        }
    };
    const onFileSelect = (e) => {
        handleFileUpload(e);
    };

    const handleConfirm = () => {
        if (selectedStatus) {
            onConfirm(selectedStatus, uploadedFileIds, comment);
        } else {
            console.log('No onConfirm function provided.');
        }
    };


    const sendButtonClicked = async () => {
        tryCatch(async () => {
            const body = {
                "status": selectedStatus,
                "comment": {
                    "contents": comment,
                    "attachments": uploadedFileIds
                }
            }

            if (task) {
                try {
                    const res = await ApiCall.updateTaskStatus(task._id, body);
                    if (res) {
                        toast.success(`Successfully updated task status to: ${selectedStatus}`);
                        setTimeout(() => {
                            setVisible(false);
                            router.reload(); // Refresh the page
                        }, 2000);
                    }
                } catch (error) {
                    const errorMessage = error?.response?.data?.message;
                    toast.error(errorMessage);
                    setTimeout(() => {
                        setVisible(false);
                    }, 2500);
                }
            }

            if (job) {
                const payload = {
                    isOpen: selectedStatus === 'Open' ? true : false,
                    isDraft: selectedStatus === 'Draft' ? true : false,
                };

                try {
                    const res = await ApiCall.updateJobStatus(job, payload);
                    if (res) {
                        toast.success('Successfully updated job status');
                        setTimeout(() => {
                            setVisible(false);
                            router.reload(); // Refresh the page
                        }, 1700);
                    }
                } catch (error) {
                    toast.error('Failed to update job status');
                    console.error('Error updating job status:', error);
                }
            }

            if (bulkJobs && bulkJobs.length > 0) {
                const payload = {
                    isOpen: selectedStatus === 'Open' ? true : false,
                    isDraft: selectedStatus === 'Draft' ? true : false,
                    jobIds: bulkJobs // Array of job IDs for bulk update
                };

                try {
                    const res = await ApiCall.bulkUpdateJobStatus(payload);
                    if (res) {
                        toast.success(`Successfully updated status for ${bulkJobs.length} jobs`);
                        setTimeout(() => {
                            setVisible(false);
                            router.reload(); // Refresh the page
                        }, 1700);
                    }
                } catch (error) {
                    toast.error('Failed to update job status in bulk');
                    console.error('Error updating bulk job status:', error);
                }
            }

            if (contact) {
                const res = await ApiCall.updateContactStatus(contact._id, body)
                if (res) {
                    toast.success(`Succesfully updated status to: ${selectedStatus}`)
                    console.log(res)
                    setTimeout(() => { setVisible(false) }, 1700)
                }
            }
            if (account) {
                const res = await ApiCall.updateAccountStatus(account._id, body)
                if (res) {
                    toast.success(`Succesfully updated status to: ${selectedStatus}`)
                    console.log(res)
                    setTimeout(() => { setVisible(false) }, 2000)
                }
            }
            if (onConfirm) {
                handleConfirm();
            }
        })
    };

    return (
        <>
            <ToastContainer />
            <Dialog
                header="Change Status"
                visible={visible}
                position={'bottom-right'}
                style={{ width: '40vw' }}
                onHide={() => setVisible(false)}
                draggable={false}
                resizable={false}
                maximizable
                className={styles.email_module}
            >
                <div className={styles.body}>
                    <label>Status</label>
                    <Dropdown
                        value={selectedStatus}
                        onChange={(e) => {
                            setSelectedStatus(e.value);
                            console.log(e.value);
                        }}
                        options={status}
                        placeholder="Select Status"
                    />
                    {selectedStatus === 'client' && (
                        <div className="flex justify-content-center align-items-center gap-8">
                            <div className="flex align-items-center gap-2">
                                <label>Upload File</label>
                                <FileUpload
                                    mode="basic"
                                    accept=".pdf,.doc,.docx"
                                    customUpload
                                    onSelect={onFileSelect}
                                    maxFileSize={1000000}
                                    chooseLabel="Upload"

                                />
                            </div>
                        </div>
                    )}
                    <label>Comments</label>
                    <InputTextarea
                        autoResize
                        value={comment || ''}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        cols={30}
                    />

                </div>
                <div className={styles.follow_up}>
                    <div className={styles.check_box_section}>
                        <Checkbox
                            onChange={(e) => setChecked(e.checked)}
                            checked={checked}
                        ></Checkbox>
                        Create a task to follow up
                    </div>
                    <Button label="Submit" onClick={() => sendButtonClicked()} />
                </div>
            </Dialog>
        </>
    );
}
