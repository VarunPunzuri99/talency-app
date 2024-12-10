import React, { useRef, useState } from 'react';
import styles from './index.module.scss';
import Image from 'next/image';
import { Button } from 'primereact/button';
import { useRouter } from 'next/router';
import { Menu } from 'primereact/menu';
import api, { getTaskActivity, setToken, uploadFile } from '@/services/api.service';
import ChangeStatusModal from '@/components/Modals/ChangeStatus';
import MoveToModal from '@/components/Modals/MoveTo';
import { FileUpload } from 'primereact/fileupload';
import { Dialog } from 'primereact/dialog';
import ApiCall from '@/services/api.service';
import { Checkbox } from 'primereact/checkbox';
import { InputTextarea } from 'primereact/inputtextarea';
import { Timeline } from 'primereact/timeline';
import MailAccordion from '@/components/MailAccordion';
import moment from 'moment';
import { toast, ToastContainer } from 'react-toastify';

export const getServerSideProps = async ({ req, params }) => {
    const results = {
        task: { data: null, error: null },
        subTasks: { data: null, error: null },
        comments: { data: null, error: null },
        activity: { data: null, error: null }
    };

    setToken(req);

    // Define your API calls
    const apiCalls = [
        api.getTaskById(params.view).then(data => {
            results.task.data = data;
            // console.log(data)
        }).catch(error => {
            results.task.error = error.message;
        }),

        api.getSubTaskById(params.view).then(data => {
            results.subTasks.data = data;
            // console.log(results.subTasks.data)
        }).catch(error => {
            results.subTasks.error = error.message;
        }),

        api.getTaskComments(params.view).then(data => {
            results.comments.data = data;
            // console.log(results.comments.data)
        }).catch(error => {
            console.error('Error fetching comments:', error.message);
            results.comments.error = error.message;
        }),
        getTaskActivity(params.view).then(data => {
            results.activity.data = data;
            // console.log(results.activity.data)
        }).catch(error => {
            console.error('Error fetching comments:', error.message);
            results.comments.error = error.message;
        }),
    ];

    // Wait for all API calls to complete
    await Promise.all(apiCalls);

    // Check for errors
    if (results.task.error || results.subTasks.error || results.comments.error) {
        console.error('Error fetching task data:', results.task.error || results.subTasks.error || results.comments.error);
    }

    return {
        props: {
            task: results.task.data || null,
            subTasks: results.subTasks.data || null,
            comments: results.comments.data || null,
            activity: results.activity.data || []
        },
    };
};



export default function View({ task, subTasks, comments: initialComments, activity }) {
    const router = useRouter();
    const menuRight = useRef(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [moveToVisible, setMoveToVisible] = useState(false);
    const [changeStatusVisible, setChangeStatusVisible] = useState(false);
    const [comment, setComment] = useState<string>('');
    const [uploadedFileIds, setUploadedFileIds] = useState([]);
    const [comments,] = useState(initialComments || []);
    const fileUploadRef = useRef(null); // Ref to access FileUpload component
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [visibleResolveTask, setVisibleResolveTask] = useState<boolean>(false);

    const taskActivity = activity.map(activity => ({
        status: activity.title,
        date: new Date(activity.updatedAt).toLocaleString(),
        icon: 'pi pi-calendar',
        color: '#9C27B0',
    }));

    const resolveTaskModal = () => {
        return (
            <Dialog
                header="Resolve Task"
                position={'bottom-right'}
                style={{ width: '40vw' }}
                visible={visibleResolveTask}
                onHide={() => setVisibleResolveTask(false)}
                draggable={false}
                className={styles.resolve_task_dialog}
            >
                <div className={styles.body}>
                    <label>Comments</label>
                    <InputTextarea
                        autoResize
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Comment here..."
                        rows={5}
                        cols={30}
                    />
                    <span>
                        {/* <Image height={20} width={20} src="/assets/icons/Attach.svg" alt="icon" /> */}

                        <FileUpload
                            mode="basic"
                            name="demo[]"
                            accept=".pdf,.doc,.docx"
                            maxFileSize={1000000}
                            customUpload
                            onSelect={onFileSelect} // Trigger auto upload on file select
                            chooseOptions={customChooseOptions}
                            ref={fileUploadRef} // Attach ref
                        />
                        Attachment Upload
                    </span>
                </div>{' '}
                <div className={styles.footer}>
                    <div className={styles.left_section}>
                        <Checkbox
                            checked={false}
                        ></Checkbox>
                        Create a task to follow up
                    </div>

                    <Button
                        label="Resolve"
                        onClick={handleResolve}
                    />
                </div>
            </Dialog>
        );
    };


    const handleSubmit = async () => {
        if (!comment.trim()) return; // Ignore if comment is empty

        const body = {
            contents: comment,
            attachments: uploadedFileIds // Add the file IDs to the attachments array
        };
      

        try {
            // Replace with your actual API call
            await api.addTaskComments(task._id, body);
            setComment('');  // Clear the comment after successful submission
            setUploadedFileIds([]); // Clear uploaded file IDs after submission

            // Reset the file input
            if (fileUploadRef.current) {
                fileUploadRef.current.clear(); // Clear the file upload input
            }
            router.reload()
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const handleResolve = async () => {
        if (!comment.trim()) return; // Ignore if comment is empty

        const body = {
            contents: comment,
            attachments: uploadedFileIds // Add the file IDs to the attachments array
        };

        try {
            // Replace with your actual API call
            await api.updateTaskStatus(task._id, {
                status: 'COMPLETED',
                comment: {
                    contents: comment,
                    attachments: uploadedFileIds,
                    taskId: selectedTask._id
                }
            })
            await api.addTaskComments(task._id, body);

            setComment('');  // Clear the comment after successful submission
            setUploadedFileIds([]); // Clear uploaded file IDs after submission

            // Reset the file input
            if (fileUploadRef.current) {
                fileUploadRef.current.clear(); // Clear the file upload input
            }
            setTimeout(() => {
                setVisibleResolveTask(false)
                router.reload()
            }, 1500);
        } catch (error) {
            const errorMessage = error?.response?.data?.message;
            toast.error(errorMessage);
            setTimeout(() => {
                setVisibleResolveTask(false)
                setComment('');
                setUploadedFileIds([]);
            }, 1000);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await uploadFile(formData,);
            if (response._id) {
                console.log(response._id)
                setUploadedFileIds((prevIds) => [...prevIds, response._id]); // Update with new file ID
            } else {
                console.error('File ID not found in response');
            }
            toast.success('File Uploaded');
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('File Upload Failed');
        }
    };
    const onFileSelect = (e) => {
        handleFileUpload(e);
    };

    const customChooseOptions = {
        icon: 'pi pi-upload', // Use PrimeIcons for the upload icon
        iconOnly: true,       // Show icon with text
        className: 'text-sm p-2 border-none' // Tailwind CSS classes for styling
    };

    const handleHardDelete = async (taskId: string) => {
        try {
            await ApiCall.hardDeleteTask(taskId);
            toast.success('Task deleted successfully!');

            setTimeout(() => {
                router.push('/sales/tasks/');
            }, 3000);

        } catch (error) {
            console.error('Error while deleting task:', error?.message);
            toast.error('Failed to delete the job. Please try again later.');
        }
    };

    const cancel = () => {
        setShowDeleteDialog(false);
    };

    const handleDelete = () => {
        if (selectedTask) {
            handleHardDelete(selectedTask._id);
        }
        setShowDeleteDialog(false);
    };

    const taskStatus = [
        { label: 'To Do', value: 'TO-DO' },
        { label: 'In Progress', value: 'IN-PROGRESS' },
        { label: 'Completed', value: 'COMPLETED' }
    ];

    const items = [
        {
            label: 'Edit',
            command: () => {
                router.push(`add?id=${selectedTask?._id}`);
            },
        },
        {
            label: 'Move To',
            command: () => setMoveToVisible(true),
        },
        {
            label: 'Change Status',
            command: () => setChangeStatusVisible(true),
        },
        {
            label: 'Delete',
            command: () => setShowDeleteDialog(true),
        },
    ];
    if (!task) {
        return <div>No task data available</div>;
    }
    const isActive = new Date(task.dueDate) < new Date();


    const handleGoBack = () => {
        router.push('/sales/tasks');
    };

    return (
        <>
            <ToastContainer />
            <div className={styles.goBackArrow} onClick={handleGoBack} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <i className="pi pi-arrow-left" style={{ fontSize: '1rem', marginRight: '0.5rem' }}></i>
                <span>Back</span>
            </div>
            <div className={`grid ${styles.wrapper}`}>
                <div className="col-12 md:col-8 lg:col-8">
                    <div className={styles.left_section}>
                        <div className={styles.top_bar}>
                            <div className={styles.top_bar_left_section}>
                                <Button
                                    label="Resolve"
                                    size="small"
                                    className="secondary"
                                    onClick={() => {
                                        setSelectedTask(task)
                                        setVisibleResolveTask(true)
                                    }}
                                />
                                <Button className="secondary" size="small" label="Assign" onClick={() => {
                                    setSelectedTask(task);
                                    setMoveToVisible(true);
                                }} />
                                <Button className="secondary" size="small" label="Create Sub-tasks" onClick={() => {
                                    router.push(`add?parentTaskId=${task?._id}`);
                                }} />
                            </div>
                            <i
                                className={`pi pi-ellipsis-v ${styles.options_button}`}
                                onClick={(event) => {
                                    setSelectedTask(task);
                                    menuRight.current.toggle(event);
                                }}
                            />
                            <Menu
                                model={items}
                                popup
                                ref={menuRight}
                                id="popup_menu_right"
                                popupAlignment="right"
                            />
                        </div>
                        <div className={styles.task_details}>
                            <div className={styles.task_details_header}>
                                <div className={styles.details}>
                                    {task.title}
                                </div>
                                <div className={styles.details}>
                                    <div className={`tag ${isActive ? 'closed' : 'active'}`}>
                                        {task.status}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.task_assigned}>
                                <div className={styles.task_assigned_left_section}>
                                    <label className={styles.task_assigned_lable}>
                                        Assigned To
                                    </label>
                                    <div className={styles.task_assigned_avatar}>
                                        <div className={styles.task_assigned_avatar_box}>
                                            {task.assignee.firstName.charAt(0)}
                                        </div>
                                        <div className={styles.name}>{task.assignee.firstName}</div>
                                    </div>
                                </div>
                                <div className={styles.task_assigned_right_section}>
                                    <label className={styles.task_assigned_lable}> Due Date</label>
                                    <div className={styles.task_assigned_date}>
                                        <i className="pi pi-calendar"></i>
                                        <div className={styles.date}>{moment(task.createdAt).format('MMM DD YYYY, h:mm A')}</div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.task_also_assigned}>
                                <label>Also Assigned</label>
                                <div className={styles.account_section}>
                                    <div className={styles.account_and_assigned}>
                                        {task.assignees.map((assignee) => (
                                            <div key={assignee._id} className={styles.round_box}>
                                                {assignee.firstName}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col mt-4">
                            <div className="flex flex-col">
                                <div className="flex items-center">
                                    <i className="pi pi-map-marker text-gray-500 pr-2"></i>
                                    <label className="text-gray-700 font-medium">
                                        Location -
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <div className="ml-2 text-gray-900">
                                        {task.location ? task.location : 'Location not specified'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.task_content}>
                            <div className={styles.sub_tasks_title}>Description</div>
                            {task.summary}
                        </div>
                        <div className={styles.sub_tasks}>
                            <div className={styles.sub_tasks_title}>Checklists/Sub-tasks</div>
                            <ul>
                                {subTasks ? subTasks.map(subTask => (
                                    <li key={subTask._id} onClick={() => router.push(`${subTask._id}`)}>
                                        {subTask.createdBy.firstName} set a task &quot;{subTask.title}&quot;due on {moment(subTask.dueDate).format('MMM DD YYYY, h:mm A')}
                                    </li>
                                )) : 'No sub tasks created'}
                            </ul>
                        </div>
                        <div className={styles.task_resolve}>
                            <div className={styles.data}>Task activity</div>
                            <div className={styles.data}>

                                {taskActivity.length > 0 ? (
                                    <>
                                        <style>{`.p-timeline-event-opposite {
                                                    flex: 0 !important;
                                                    padding: 0 !important;
                                                }
                                            `}</style>
                                        <Timeline
                                            value={taskActivity}
                                            content={(data) => <MailAccordion data={data} />}
                                        />
                                    </>
                                ) : (
                                    <p>No task activity.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-4 lg:col-4">
                    <div className={styles.right_section}>
                        <div className={styles.title}>Comments</div>
                        {comments.length > 0 ? (
                            comments.map(comment => (
                                <div key={comment._id} className={styles.comment_box}>
                                    <div className={styles.avatar}>
                                        {comment.user.firstName.charAt(0)}
                                    </div>

                                    <div className={styles.details}>
                                        <div className={styles.nameAndDate}>
                                            {comment.user.firstName}
                                            <span className={styles.time}>{new Date(comment.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                        <div className={styles.desc}>
                                            {comment.contents}
                                            <div className={styles.attachment}>
                                                <div className={styles.attachment_wrapper}>
                                                    {comment.attachments && comment.attachments.length > 0 && (
                                                        <div className={styles.attachment_box}>
                                                            {comment.attachments.map(attachment => (
                                                                <div key={attachment._id} className={styles.attachment_item}>
                                                                    {/* <div className={styles.attachment_icons}>
                                                                        <Image
                                                                            src="/assets/icons/pdf.svg"
                                                                            height={20}
                                                                            width={20}
                                                                            alt="Attachment Icon"
                                                                        />
                                                                    </div> */}
                                                                    <div className={styles.attachment_text_details}>
                                                                        <div className={styles.attachment_text_title}>
                                                                            {attachment.originalName.split('/').pop()}
                                                                        </div>
                                                                        <div className={styles.attachment_size}>
                                                                            {Math.ceil(attachment.fileSize / 1024)} KB
                                                                            <a
                                                                                href={attachment.locationUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                            >
                                                                                <Image
                                                                                    src="/assets/icons/Download.svg"
                                                                                    height={20}
                                                                                    width={20}
                                                                                    alt="Download Icon"
                                                                                />
                                                                            </a>
                                                                        </div>
                                                                    </div>

                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            'No comments available'
                        )}
                        <FileUpload
                            mode="basic"
                            name="demo[]"
                            accept=".pdf,.doc,.docx"
                            maxFileSize={1000000}
                            customUpload
                            onSelect={onFileSelect} // Trigger auto upload on file select
                            chooseOptions={customChooseOptions}
                            ref={fileUploadRef} // Attach ref
                        />
                        <div className={styles.footer}>

                            <div className={styles.footer_left_part}>
                                {/* <Image
                                    src="/assets/icons/atSign.svg"
                                    height={25}
                                    width={25}
                                    alt="icon"
                                /> */}
                            </div>
                            <textarea
                                className="border-none bg-transparent focus:outline-none focus:ring-0 focus:border-transparent w-full mx-2"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Comment here..."
                            />
                            <Button
                                iconPos={'right'}
                                icon={
                                    <Image
                                        src="/assets/icons/sent.svg"
                                        height={20}
                                        width={20}
                                        alt="icon"
                                    />
                                }
                                label="Send"
                                className="px-4"
                                onClick={handleSubmit}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {changeStatusVisible && (
                <ChangeStatusModal
                    statusEnum={taskStatus}
                    task={selectedTask}
                    visible={changeStatusVisible}
                    setVisible={setChangeStatusVisible}
                />
            )}
            {moveToVisible && (
                <MoveToModal
                    task={selectedTask}
                    visible={moveToVisible}
                    setVisible={setMoveToVisible}
                />
            )}
            {showDeleteDialog && (
                <Dialog
                    header="Confirm Deletion"
                    visible={showDeleteDialog}
                    onHide={() => setShowDeleteDialog(false)}
                >
                    <p>Are you sure you want to delete this task?</p>
                    <div className={styles.dialog_buttons}>
                        <Button label="Cancel" onClick={cancel} className="p-button-text mr-2" />
                        <Button
                            label="Delete"
                            onClick={handleDelete}
                            className="p-button-danger"
                        />
                    </div>
                </Dialog>
            )}
            {resolveTaskModal()}
        </>
    );
}
