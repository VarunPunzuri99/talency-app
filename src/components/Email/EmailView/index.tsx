import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Editor } from 'primereact/editor';
import { Chips } from 'primereact/chips';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog'
import styles from '@/styles/shared/Email/view_page.module.scss';
import moment from 'moment';
import { useRouter } from 'next/router';
import DOMPurify from 'dompurify';
import api from '@/services/api.service';
import Email from '../../Modals/Email';
import TitleBar from '../../TitleBar';

const EmailView = ({ email, emailList, emailIndex, currentUser }) => {

    const router = useRouter();
    const [showEmail, setShowEmail] = useState(false);
    const [isStarred, setIsStarred] = useState(email?.starredBy.includes(currentUser._id));
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const totalEmails = emailList?.length;
    const sanitizedContent = DOMPurify.sanitize(email?.contents);

    if (!email) {
        return <div>No email found</div>;
    }

    useEffect(() => {
        if (email) {
            setIsStarred(email.starredBy.includes(currentUser?._id ?? ''));
        }
    }, [email, currentUser]);

    const handleStar = async () => {
        try {
            if (isStarred) {
                await api.unstarMessage(email._id, currentUser._id);
            } else {
                await api.starMessage(email._id, currentUser._id);
            }
            setIsStarred(!isStarred);
        } catch (error) {
            console.error('Error starring/un-starring the message:', error.message);
        }
    };

    const handleSoftDeleteMe = async () => {
        try {
            await api.deleteMessageForme(email._id, currentUser._id);
            router.push('/email/inbox');
        } catch (error) {
            console.error('Error soft-deleting the message for current user:', error.message);
        }
    };

    const handleNavigation = async (direction: 'previous' | 'next') => {
        if (emailIndex !== null) {
            const newIndex = direction === 'next' ? emailIndex : emailIndex - 2;
            if (newIndex >= 0 && newIndex < totalEmails) {
                const newEmail = emailList[newIndex];
                const currentPath = router.pathname;
                const basePath = currentPath.replace(/\/[^/]*$/, '');
                router.push(`${basePath}/${newEmail._id}`);
            }
        }
    };

    return (
        <>
            <div>
                <TitleBar title={'Email'}>
                    <Button label="Compose" onClick={() => setShowEmail(true)} />
                </TitleBar>
                <div className={styles.top_bar}>
                    <i
                        className={`pi pi-arrow-left ${styles.back_button}`}
                        onClick={() => router.back()}
                    />
                    <div className={styles.pagination}>
                        <i className={`pi pi-angle-left`} onClick={() => handleNavigation('previous')} />
                        {emailIndex} of {totalEmails}
                        <i className={`pi pi-angle-right`} onClick={() => handleNavigation('next')} />
                    </div>
                    <div className={styles.forward_and_more}>
                        <Image src="/assets/icons/forward.svg" height={20} width={20} alt="icon" />
                        <i className={`pi pi-ellipsis-v`} />
                    </div>
                </div>
                <div className={styles.mail_body}>
                    <div className={styles.mail_header}>
                        <div className={styles.user_details}>
                            <div className={styles.avatar}></div>
                            <div className={styles.userNameAndEmail}>
                                <div className={styles.name}>{email.sender?.fullName}</div>
                                <div className={styles.email}>{typeof email.sender === 'string' ? email.sender : email.sender?.email}</div>
                            </div>
                        </div>
                        <div className={styles.dateAndTime}>
                            {email.createdAt ? moment(email.createdAt).format('hh:mm A (MMMM Do YYYY)') : ''}
                        </div>
                    </div>
                    <div className={styles.subject}>{email.subject}</div>
                    <div className={styles.mail_info}>
                        <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                    </div>
                    <div className={styles.attachment}>
                        <div className={styles.title}>{email.attachments?.length || 0} Attachments</div>
                        <div className={styles.attachment_wrapper}>
                            {email.attachments?.map((attachment, i) => (
                                <div key={i} className={styles.attachment_box}>
                                    <div className={styles.attachment_icons}>
                                        <Image
                                            src="/assets/icons/pdf.svg"
                                            height={20}
                                            width={20}
                                            alt="icon"
                                        />
                                        {attachment.locationUrl && (
                                            <a href={attachment.locationUrl} download>
                                                Download
                                            </a>
                                        )}
                                    </div>
                                    <div className={styles.attachment_text_details}>
                                        <div className={styles.attachment_text_title}>
                                            {attachment.originalName.split('/').pop()}
                                        </div>
                                        <div className={styles.attachment_size}>{Math.ceil(attachment.fileSize / 1024 / 1024)} MB</div>
                                    </div>
                                    <div className={styles.attachmentdownload}>
                                        <Image
                                            src="/assets/icons/Download.svg"
                                            height={20}
                                            width={20}
                                            alt="icon"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.reply_to}>
                        <div className={styles.reply_to_header}>
                            <div className={styles.reply_left_section}>
                                <span>
                                    <Image
                                        src="/assets/icons/reply.svg"
                                        height={20}
                                        width={20}
                                        alt="icon"
                                    />
                                    Reply
                                </span>
                                <label>To :</label>
                                <Chips value={email.recipients.map((recipient) => typeof recipient === 'string' ? recipient : recipient.email)} />
                            </div>
                            <div className={styles.reply_right_section}>
                                <span>CC</span>
                                <span>Bcc</span>
                            </div>
                        </div>
                        <div className={styles.editor}>
                            <Editor
                                value={''}
                                onTextChange={() => {
                                }}
                                style={{ height: '150px' }}
                            />
                        </div>
                    </div>
                    <div className={styles.mail_footer}>
                        <div className={styles.mail_footer_left_section}>
                            <span>
                                <Image
                                    src="/assets/icons/reply.svg"
                                    height={20}
                                    width={20}
                                    alt="icon"
                                />
                                Reply
                            </span>
                            <span>
                                <Image
                                    src="/assets/icons/forward_arrow.svg"
                                    height={20}
                                    width={20}
                                    alt="icon"
                                />
                                Forward
                            </span>
                            <span>
                                <Image
                                    src="/assets/icons/print.svg"
                                    height={20}
                                    width={20}
                                    alt="icon"
                                />
                                Print
                            </span>
                        </div>
                        <div className={styles.mail_footer_right_section}>
                            <span onClick={handleStar}>
                                <Image src={isStarred ? "/assets/icons/coloredstar.svg" : "/assets/icons/star.svg"} height={20} width={20} alt="icon" />
                                {isStarred ? 'Unstar' : 'Star'}
                            </span>
                            <span onClick={() => setShowDeleteDialog(true)}>
                                <Image
                                    src="/assets/icons/trash.svg"
                                    height={20}
                                    width={20}
                                    alt="icon"
                                />
                                Delete
                            </span>
                        </div>
                    </div>
                </div>
                <Dialog header="Confirm Deletion" visible={showDeleteDialog} onHide={() => setShowDeleteDialog(false)}>
                    <p>Are you sure you want to delete this email?</p>
                    <div className={styles.dialog_buttons}>
                        <Button label="Delete for Me" onClick={handleSoftDeleteMe} className="p-button-danger" />
                        <Button label="Cancel" onClick={() => setShowDeleteDialog(false)} className="p-button-secondary" />
                    </div>
                </Dialog>
                {showEmail && <Email visible={showEmail} setVisible={setShowEmail} />}
            </div>
        </>
    );
};

export default EmailView;
