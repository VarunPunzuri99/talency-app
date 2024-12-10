import { useState, useEffect, useRef } from 'react';
import styles from './index.module.scss';
import { Dialog } from 'primereact/dialog';
import { Chips } from 'primereact/chips';
import api, { sendEmail } from '@/services/api.service';
import TiptapEditor from '@/utils/TiptapEditor';
import { Button } from '@/primereact';
import Loader from '@/components/Loader';
import { toast, ToastContainer } from 'react-toastify';
import ApiCall from '@/services/api.service';

export default function ComposeModal({ visible, setVisible, emailContent, applicantData, getStageId, fetchJobData, setOfferVisible, jobApplicationEmail, technicalPanelEmails = [] }) {
    const [toList, setToList] = useState([]);
    const [ccList, setCcList] = useState([]);
    const [bccList, setBccList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cc, setCc] = useState(false);
    const [bcc, setBcc] = useState(false);
    const [mailBody, setMailBody] = useState(emailContent);
    const [currentUser, setCurrentUser] = useState(null);
    const subjectRef = useRef<HTMLInputElement>(null);
    const [subjectError, setSubjectError] = useState('');
    const [toListError, setToListError] = useState('');

    useEffect(() => {
        if (visible) {
            fetchInitialData();

            const emails = [];
            if (jobApplicationEmail) emails.push(jobApplicationEmail);
            if (technicalPanelEmails.length > 0) emails.push(...technicalPanelEmails);

            setToList(emails);
        }
    }, [visible, jobApplicationEmail]);

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
    };

    useEffect(() => {
        setMailBody(emailContent);
    }, [emailContent]);

    const updateJobApplicationStage = async (jobApplicationId, newStageId) => {
        try {
            await ApiCall.updateStageOfJobApplication(jobApplicationId, newStageId);
        } catch (error) {
            toast.error('Error updating job application stage:', error);
        }
    };

    const handleSend = async () => {
        if (!validateForm()) return;

        const emailData = {
            // userInboxConfigId: "67022e32902b7af70f596bcf",
            // fromEmail: "shaik.tahaseen@codinglimits.com",
            // fromName: "tahaseen",
            to: toList,
            cc: ccList,
            bcc: bccList,
            subject: subjectRef.current?.value || '',
            body: mailBody
        };

        try {
            setLoading(true);
            await sendEmail(emailData);
            await updateJobApplicationStage(applicantData._id, getStageId);
            toast.success("Email sent successfully!", {
                autoClose: 2000,
            });
            // try {
            //     await ApiCall.updateStageOfJobApplication(applicantData._id, getStageId);
            // } catch (error) {
            //     toast.error('Error updating job application stage:', error);
            // }
            setToList([]);  // Clear "To" list
            setCcList([]);  // Clear "Cc" list
            setBccList([]); // Clear "Bcc" list
            setTimeout(() => {
                setVisible(false);
                setOfferVisible(false)
                fetchJobData()
            }, 3000);

        } catch (error) {
            console.error('Error sending email:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog
                header="Send email"
                visible={visible}
                position={'bottom-right'}
                onHide={() => {
                    setToList([]);
                    setCcList([]);
                    setBccList([]);
                    setVisible(false)
                }}
                maximizable
                style={{ width: '60vw', minHeight: '500px' }}
                blockScroll={true}
                className={styles.email_module}
            >
                {loading ? (
                    <div className={styles.loadingOverlay}>
                        <Loader />
                    </div>
                ) : (
                    <>
                        <ToastContainer />
                        <div className={styles.body}>
                            <div className={styles.user_info}>
                                <div className={styles.left_section}>
                                    <div className={styles.box}></div>
                                    {currentUser?.email || 'Loading...'}
                                </div>
                            </div>
                            <div className={styles.mail_to}>
                                <div className={styles.left_section}>
                                    To
                                    <Chips
                                        value={toList}
                                        onChange={(e) => setToList(e.value)}
                                        separator=","
                                    />
                                    {toListError && <div className={styles.error_message}>{toListError}</div>}
                                </div>
                                <div className={styles.right_section}>
                                    {!cc && <span onClick={() => setCc(true)}>Cc</span>}
                                    {!bcc && <span onClick={() => setBcc(true)}>Bcc</span>}
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
                                <TiptapEditor id="Tiptap-editor" onContentChange={setMailBody} name="Tiptap-editor" content={emailContent} />
                            </div>
                        </div>
                        <div className="flex justify-content-end mr-3">
                            <Button
                                label="Send"
                                onClick={handleSend}
                                type="button"
                                disabled={loading}
                            />
                        </div>
                    </>
                )}

            </Dialog>
        </>
    );
}
