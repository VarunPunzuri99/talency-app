import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './index.module.scss';
import { Dialog } from 'primereact/dialog';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { Chips } from 'primereact/chips';
import { Editor } from 'primereact/editor';
import api from '@/services/api.service';
import { MultiSelect } from 'primereact/multiselect';
import { FileUpload } from 'primereact/fileupload';
import { BasicUser } from '@/services/types';

export default function EmailModal({ visible, setVisible }) {
    const [checked, setChecked] = useState(false);
    const [toList, setToList] = useState([]);
    const [ccList, setCcList] = useState([]);
    const [bccList, setBccList] = useState([]);
    const [cc, setCc] = useState(false);
    const [bcc, setBcc] = useState(false);
    const [mailBody, setMailBody] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templates, ] = useState([
        {
            name: 'First',
        },
    ]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [hasMore, ] = useState(true);
    // const [subject, setSubject] = useState('');
    const subjectRef = useRef<HTMLInputElement>(null);
    const [fileIds, setFileIds] = useState([]);
    const [, setFilesStatus] = useState({});
    const fileUploadRef = useRef(null);
    const [subjectError, setSubjectError] = useState('');
    const [, setToListError] = useState('');

    useEffect(() => {
        if (visible) {
            fetchInitialData();
        }
    }, [visible]);

    const validateForm = () => {
        let isValid = true;

        if (subjectRef.current) {
            const subject = subjectRef.current.value.trim();
            if (!subject) {
                setSubjectError('Subject cannot be empty');
                isValid = false;
            } else {
                setSubjectError('');
            }
        }

        if (toList.length === 0) {
            setToListError('At least one recipient is required');
            isValid = false;
        } else {
            setToListError('');
        }

        return isValid;
    };


    const fetchInitialData = async () => {
        try {
            const currentUserResponse = await api.getCurrentUser();
            setCurrentUser(currentUserResponse);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    }

    const fetchActiveUsers = async () => {
        try {
            const response = await api.getActiveUsers();
            setActiveUsers(response as unknown as BasicUser[]);
        } catch (error) {
            console.error('Error fetching active users:', error);
        }
    }

    const handleScroll = useCallback(
        (e) => {
            const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
            if (bottom && hasMore) {
                fetchActiveUsers();
            }
        },
        [fetchActiveUsers, hasMore]
    );


    const handleToFocus = async () => {
        if (!dropdownVisible) {
            setDropdownVisible(true);
            await fetchActiveUsers();
        }
    };

    const handleUserSelect = (selectedUsers) => {
        setToList(selectedUsers);
    };


    const handleSend = async () => {
        if (!validateForm()) return;
        const emailData = {
            subject: subjectRef.current?.value || '',
            recipients: toList.map(user => user._id),
            contents: mailBody,
            attachments: fileIds,
        };

        try {
            await api.sendMessage(emailData);
            setVisible(false);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };


    const customUploadHandler = async ({ files }) => {
        const fileStatus = {};
        try {
            const response = await api.uploadFiles(files);
            const uploadedFiles = response.map(file => {
                fileStatus[file.uniqueName] = 'Uploaded';
                return {
                    ...file,
                    name: file.originalName,
                    size: file.fileSize,
                    status: 'Uploaded'
                };
            });
            const uploadedFileIds = response.map(file => file._id);
            setFileIds(uploadedFileIds);
            setFilesStatus(fileStatus);

            if (fileUploadRef.current) {
                fileUploadRef.current.clear();
                fileUploadRef.current.setUploadedFiles(uploadedFiles);
            }

        } catch (error) {
            console.error('Error during file upload:', error);

            files.forEach(file => {
                fileStatus[file.uniqueName] = 'Failed';
            });
            setFilesStatus(fileStatus);
        }
    };


    const userTemplate = (option) => {
        return (
            <div className="flex items-center">
                <span className="font-semibold">{option.fullName}</span>
                <span className="ml-2 text-gray-600">({option.email})</span>
            </div>
        );
    };


    const panelFooterTemplate = () => {
        const length = toList.length || 0;
        return (
            <div className="py-2 px-3">
                <b>{length}</b> user{length > 1 ? 's' : ''} selected.
            </div>
        );
    };


    return (
        <>
            <Dialog
                header="Create email"
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
                    <div className={styles.user_info}>
                        <div className={styles.left_section}>
                            <div className={styles.box}></div>
                            {currentUser?.email || 'Loading...'}
                        </div>
                        <Dropdown
                            value={selectedTemplate}
                            options={templates}
                            optionLabel="name"
                            onChange={(e) => setSelectedTemplate(e.value)}
                            placeholder="Insert Template"
                            className="w-full md:w-14rem"
                        />
                    </div>
                    <div className={styles.mail_to}>
                        <div className={styles.left_section}>
                            To
                            <MultiSelect
                                value={toList}
                                options={activeUsers}
                                onFocus={handleToFocus}
                                onChange={(e) => handleUserSelect(e.value)}
                                optionLabel="fullName"
                                placeholder="Select Users"
                                panelFooterTemplate={panelFooterTemplate}
                                itemTemplate={userTemplate}
                                className="w-full md:w-20rem"
                                display="chip"
                                onScroll={handleScroll}
                            />
                        </div>
                        <div className={styles.right_section}>
                            {!cc && <span onClick={() => setCc(true)}>Cc</span>}
                            {!bcc && (
                                <span onClick={() => setBcc(true)}>Bcc</span>
                            )}
                        </div>
                    </div>
                    {cc && (
                        <div className={styles.mail_to}>
                            <div className={styles.left_section}>
                                Cc
                                <Chips
                                    value={ccList}
                                    onChange={(e) => setCcList(e.value)}
                                    separator=","
                                />
                            </div>
                        </div>
                    )}
                    {bcc && (
                        <div className={styles.mail_to}>
                            <div className={styles.left_section}>
                                Bcc
                                <Chips
                                    value={bccList}
                                    onChange={(e) => setBccList(e.value)}
                                    separator=","
                                />
                            </div>
                        </div>
                    )}
                    <div className={styles.subject}>
                        <input
                            type="text"
                            placeholder="Type subject..."
                            ref={subjectRef}
                            className={subjectError ? styles.error : ''}
                        />
                        {subjectError && <div className={styles.error_message}>{subjectError}</div>}
                    </div>
                    <div className={styles.quill}>
                        <Editor
                            value={mailBody}
                            onTextChange={(e) => setMailBody(e.htmlValue)}
                            style={{ height: '200px' }}
                        />
                    </div>
                    <div className="card">
                        <FileUpload
                            ref={fileUploadRef}
                            name="files"
                            customUpload
                            uploadHandler={customUploadHandler}
                            multiple
                            accept="image/*,application/pdf,.msword,.vnd.openxmlformats-officedocument.wordprocessingml.document,.vnd.ms-excel,.vnd.openxmlformats-officedocument.spreadsheetml.sheet,.plain,.json,.webp,.webm,.wmv,.mp4,.avi,.mov,.mkv,.ppt,.pptx,.csv"
                            maxFileSize={10000000}
                            emptyTemplate={<p className="m-0">Drag and drop files here to upload.</p>}
                        />
                    </div>
                </div>
                <div className={styles.follow_up}>
                    <div className={styles.check_box_section}>
                        <Checkbox
                            onChange={(e) => setChecked(e.checked)}
                            checked={checked}
                        ></Checkbox>
                        Create a task to follow up
                    </div>
                    <button onClick={handleSend}>Send</button>
                </div>
            </Dialog>
        </>
    );
}
