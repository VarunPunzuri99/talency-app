import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './index.module.scss';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import api, { searchTasks, setToken, uploadFile } from '@/services/api.service';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { useDebounce } from 'primereact/hooks';
import TitleBar from '@/components/TitleBar';
import { formatDueDate } from '@/utils/constant';
import moment from 'moment';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';

export const getServerSideProps = async ({ req }) => {
    try {
        setToken(req);
        const todayTasks = await api.getTodayTasks('today', 1, 10)
        const upcomingTasks = await api.getUpcomingTasks('upcoming', 1, 10)
        return {
            props: {
                today: todayTasks || [],
                upcoming: upcomingTasks || []
            }
        };
    } catch (error) {
        console.error('Error fetching task data:', error.message);
        return {
            props: {
                today: [],
                upcoming: []
            }
        }
    }
};

export default function Tasks({ today, upcoming }) {
    const router = useRouter();
    // const [today, setToday] = useState(today || null);
    const [visibleResolveTask, setVisibleResolveTask] = useState<boolean>(false);
    const [data, setData] = useState(null);
    const [comment, setComment] = useState<string>('');
    const [uploadedFileIds, setUploadedFileIds] = useState([]);
    const fileUploadRef = useRef(null); // Ref to access FileUpload component
    const toast = useRef(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [inputValue, debouncedValue, setInputValue] = useDebounce(
        '',
        2000,
    );

    useEffect(() => {
        const fetch = async () => {
            if (inputValue && inputValue.trim() !== "") {
                try {
                    const res = await searchTasks(debouncedValue);
                    setData(res || null);
                } catch (error) {
                    console.error('Error fetching tasks:', error);
                }
            } else {
                setData(null);
            }
        };
        if (inputValue != null) {
            fetch();
        }
    }, [debouncedValue, inputValue]);


    const handleSubmit = async () => {
        if (!comment.trim()) return; // Ignore if comment is empty

        const body = {
            contents: comment,
            attachments: uploadedFileIds // Add the file IDs to the attachments array
        };

        try {
            // Replace with your actual API call
            await api.addTaskComments(selectedTask._id, body);
            await api.updateTaskStatus(selectedTask._id, {
                status: "COMPLETED",
                comment: {
                    contents: comment,
                    attachments: uploadedFileIds,
                    taskId: selectedTask._id
                }
            }
            )
            setComment('');  // Clear the comment after successful submission
            setUploadedFileIds([]); // Clear uploaded file IDs after submission

            // Reset the file input
            if (fileUploadRef.current) {
                fileUploadRef.current.clear(); // Clear the file upload input
            }
            setVisibleResolveTask(false)

        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };


    const handleFileUpload = async (event) => {
        const file = event.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await uploadFile(formData,);
            if (response._id) {
                setUploadedFileIds((prevIds) => [...prevIds, response._id]); // Update with new file ID
            } else {
                console.error('File ID not found in response');
            }
            toast.current.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
            // Handle success (e.g., show a success message or update the UI)
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'File Upload Failed' });
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
                        maxLength={100}
                    />
                    <span>
                        {/* <Image height={20} width={20} src="/assets/icons/Attach.svg" alt="icon" /> */}

                        <FileUpload
                            mode="basic"
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
                            onChange={() => {
                                // setChecked(e.checked)
                            }}
                            checked={false}
                        ></Checkbox>
                        Create a task to follow up
                    </div>

                    <Button
                        label="Resolve"
                        onClick={handleSubmit}
                    />
                </div>
            </Dialog>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <TitleBar title={'Tasks'}>
                <div className={styles.title_actions}>
                    <span className="p-input-icon-left">
                        {/* <i className="pi pi-search" /> */}
                        <InputText
                            type="text"
                            value={inputValue}
                            placeholder="Search by task title"
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </span>
                    <Button label="New Task" onClick={() => router.push(router.asPath + '/add')} />
                </div>
            </TitleBar>

            <div className={styles.wrapper}>
                {data?.map((item, i2) => {
                    const isPastDue = new Date(item.dueDate) < new Date();
                    return (
                        <div className={styles.box} key={i2}>
                            <div className={styles.icon_section}>
                                <Image
                                    src="/assets/icons/spottedPatterns.svg"
                                    fill={true}
                                    alt="icon"
                                />
                            </div>
                            <div className={styles.account_section}>
                                <div className={styles.title}>{item.title}</div>
                                <div className={styles.account_and_assigned}>
                                    <div className={styles.round_box}>
                                        {item.createdBy.firstName[0]
                                        }
                                    </div>
                                    <div className={styles.name}>{item.createdBy.firstName}</div>
                                    <div className={styles.assigned_to}>
                                        Assigned To
                                        <div className={styles.round_box}>
                                            {item.assignee.firstName[0]
                                            }
                                        </div>
                                        <div className={styles.name}>{item.assignee.firstName}</div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.right_section}>
                                <div className={styles.time_section}>
                                    <div className={styles.date}>{moment(item.createdAt).format('MMM DD YYYY, h:mm A')}</div>
                                    <div className={`tag ${isPastDue ? 'closed' : 'active'}`}>
                                        {isPastDue ? 'closed' : 'active'}
                                    </div>
                                </div>
                                <div className={styles.buttons_section}>
                                    <Button
                                        label="Resolve"
                                        size="small"
                                        className="secondary"
                                        onClick={() => {
                                            setSelectedTask(item)
                                            setVisibleResolveTask(true)
                                        }}
                                    />
                                    <Button
                                        className="secondary"
                                        label="View Task"
                                        size="small"
                                        onClick={() => router.push(`${router.asPath}/${item._id}`)}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
                <Accordion activeIndex={0}>
                    <AccordionTab header="Today">
                        {today.length > 0 ? (
                            today?.map((item, i2) => {
                                const isPastDue = new Date(item.dueDate) < new Date();
                                return (
                                    <div className={styles.box} key={i2}>
                                        <div className={styles.icon_section}>
                                            <Image
                                                src="/assets/icons/spottedPatterns.svg"
                                                fill={true}
                                                alt="icon"
                                            />
                                        </div>
                                        <div className={styles.account_section}>
                                            <div className={styles.title}>{item.title}</div>
                                            <div className={styles.account_and_assigned}>
                                                <div className={styles.round_box}>
                                                    {item.createdBy.firstName[0]
                                                    }
                                                </div>
                                                <div className={styles.name}>{item.createdBy.firstName}</div>
                                                <div className={styles.assigned_to}>
                                                    Assigned To
                                                    <div className={styles.round_box}>
                                                        {item.assignee.firstName[0]
                                                        }
                                                    </div>
                                                    <div className={styles.name}>{item.assignee.firstName}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.right_section}>
                                            <div className={styles.time_section}>
                                                <div className={styles.date}>{moment(item.createdAt).format('MMM DD YYYY, h:mm A')}</div>
                                                <div className={`tag ${isPastDue ? 'closed' : 'active'}`}>
                                                    {isPastDue ? 'closed' : 'active'}
                                                </div>
                                            </div>
                                            <div className={styles.buttons_section}>
                                                <Button
                                                    label="Resolve"
                                                    size="small"
                                                    className="secondary"
                                                    onClick={() => {
                                                        setSelectedTask(item)
                                                        setVisibleResolveTask(true)
                                                    }}
                                                />
                                                <Button
                                                    className="secondary"
                                                    label="View Task"
                                                    size="small"
                                                    onClick={() => router.push(`${router.asPath}/${item._id}`)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className={styles.noTaskMessage}>No Task Available Today.</div>
                        )}
                    </AccordionTab>

                    <AccordionTab header="Upcoming">
                        {upcoming.length > 0 ? (
                            upcoming?.map((item, i2) => {
                                const isUpcoming = new Date(item.dueDate) > new Date();
                                return (
                                    <div className={styles.box} key={i2}>
                                        <div className={styles.icon_section}>
                                            <Image
                                                src="/assets/icons/spottedPatterns.svg"
                                                fill={true}
                                                alt="icon"
                                            />
                                        </div>
                                        <div className={styles.account_section}>
                                            <div className={styles.title}>{item.title}</div>
                                            <div className={styles.account_and_assigned}>
                                                <div className={styles.round_box}>
                                                    {item.createdBy.firstName[0]}
                                                </div>
                                                <div className={styles.name}>{item.createdBy.firstName}</div>
                                                <div className={styles.assigned_to}>
                                                    Assigned To
                                                    <div className={styles.round_box}>
                                                        {item?.assignee?.firstName?.[0]
                                                        }
                                                    </div>
                                                    <div className={styles.name}>{item.assignee?.firstName}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.right_section}>
                                            <div className={styles.time_section}>
                                                <div className={styles.date}>{formatDueDate(item.dueDate)}</div>
                                                <div className={`tag ${isUpcoming ? 'active' : 'closed'}`}>
                                                    {isUpcoming ? 'upcoming' : 'closed'}
                                                </div>
                                            </div>
                                            <div className={styles.buttons_section}>
                                                <Button
                                                    label="Resolve"
                                                    size="small"
                                                    className="secondary"
                                                    onClick={() => {
                                                        setSelectedTask(item)
                                                        setVisibleResolveTask(true)
                                                    }}
                                                />
                                                <Button
                                                    className="secondary"
                                                    label="View Task"
                                                    size="small"
                                                    onClick={() => router.push(`${router.asPath}/${item._id}`)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className={styles.noTaskMessage}>No Upcoming Task.</div>
                        )}
                    </AccordionTab>
                </Accordion>
            </div>
            {resolveTaskModal()}
        </>
    );
}
