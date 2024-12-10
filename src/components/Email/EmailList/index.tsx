import { Dispatch, SetStateAction } from 'react';
import moment from 'moment';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import styles from '@/styles/shared/Email/list_page.module.scss';
import TitleBar from '../../TitleBar';
import Emails from '../../Modals/Email';

interface Email {
    _id: string;
    sender: { fullName: string };
    subject: string;
    contents?: string;
    createdAt?: Date;
    updatedAt?: Date;
    readStatus: { [key: string]: boolean };
}

interface EmailListProps {
    data: Email[];
    title: string;
    isEmailRead: (email: Email) => boolean;
    onEmailClick: (emailId: string) => void;
    showEmail: boolean;
    setShowEmail: Dispatch<SetStateAction<boolean>>;
}

export default function EmailList({
    data,
    title,
    isEmailRead,
    onEmailClick,
    showEmail,
    setShowEmail,
}: EmailListProps) {
    return (
        <>
            <TitleBar title={title}>
                <Button label="Compose" onClick={() => setShowEmail(true)} />
            </TitleBar>
            <div className={styles.email}>
                <div className={styles.inbox}>
                    <div className={styles.mails}>
                        {data.length ? (
                            data.map((email) => (
                                <div
                                    key={email._id}
                                    className={`${styles.mail_box} ${isEmailRead(email) ? styles.read : ''}`}
                                    onClick={() => onEmailClick(email._id)}
                                >
                                    <div className={styles.left_section}>
                                        <div className={styles.check_box}>
                                            <Checkbox checked={false} />
                                        </div>
                                        <div className={styles.name}>{email.sender.fullName}</div>
                                        <div className={styles.title}>{email.subject}</div>
                                    </div>
                                    <div className={styles.left_section}>
                                        {moment(email.createdAt).format('MMM DD YYYY, h:mm A')}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.noEmails}>No emails available.</div>
                        )}
                    </div>
                </div>
            </div>
            <Emails visible={showEmail} setVisible={setShowEmail} />
        </>
    );
}
