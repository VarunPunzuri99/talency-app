import { useState } from 'react';
import { useRouter } from 'next/router';
import { setToken } from '@/services/api.service';
import api from '@/services/api.service';
import EmailList from '@/components/Email/EmailList';

interface Email {
    _id: string;
    sender: { fullName: string };
    subject: string;
    contents?: string;
    createdAt?: Date;
    updatedAt?: Date;
    readStatus: { [key: string]: boolean };
}

interface InboxProps {
    initialData: Email[];
    currentUser: { _id: string };
}

export async function getServerSideProps({ req }: { req: any }) {
    try {
        setToken(req);

        const [data, currentUser] = await Promise.all([
            api.getInboxMessages(),
            api.getCurrentUser(),
        ]);

        return {
            props: {
                initialData: data || [],
                currentUser: currentUser || null,
            },
        };
    } catch (error) {
        console.error('Error fetching inbox emails', error.message);
        return {
            props: {
                initialData: [],
                currentUser: null,
            },
        };
    }
}

export default function Inbox({ initialData, currentUser }: InboxProps) {
    const router = useRouter();
    const [showEmail, setShowEmail] = useState(false);
    const [data, setData] = useState<Email[]>(initialData || []);

    const handleEmailClick = async (emailId: string) => {
        try {
            await api.markMessageAsRead(emailId, currentUser._id);
            const updatedData = data.map((email) =>
                email._id === emailId
                    ? { ...email, readStatus: { ...email.readStatus, [currentUser._id]: true } }
                    : email
            );
            setData(updatedData);
            router.push(router.asPath + `/${emailId}`);
        } catch (error) {
            console.error('Error marking email as read', error.message);
        }
    };

    const isEmailRead = (email: Email) => {
        return email.readStatus[currentUser._id] || false;
    };

    return (
        <EmailList
            data={data}
            title="Inbox"
            isEmailRead={isEmailRead}
            onEmailClick={handleEmailClick}
            showEmail={showEmail}
            setShowEmail={setShowEmail}
        />
    );
}
