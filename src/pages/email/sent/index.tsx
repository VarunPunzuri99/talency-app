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

interface SentProps {
    initialData: Email[];
}

export async function getServerSideProps({ req }: { req: any }) {
    try {
        setToken(req);

        const data = await api.getSentMessages();

        return {
            props: {
                initialData: data || [],
            },
        };
    } catch (error) {
        console.error('Error fetching sent emails', error.message);
        return {
            props: {
                initialData: [],
            },
        };
    }
}

export default function Sent({ initialData }: SentProps) {
    const router = useRouter();
    const [showEmail, setShowEmail] = useState(false);

    const handleEmailClick = (emailId: string) => {
        router.push(router.asPath + `/${emailId}`);
    };

    return (
        <EmailList
            data={initialData}
            title="Sent"
            isEmailRead={() => true}
            onEmailClick={handleEmailClick}
            showEmail={showEmail}
            setShowEmail={setShowEmail}
        />
    );
}

