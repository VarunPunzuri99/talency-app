import api, { setToken } from '@/services/api.service';
import { BasicUser, Message } from '@/services/types';
import EmailView from '@/components/Email/EmailView';

export async function getServerSideProps({ req, params }) {
    const { slug } = params as { slug: string };

    setToken(req);
    try {
        const [emailList, email, currentUser] = await Promise.all([
            api.getSentMessages() as unknown as Promise<Message[]>,
            api.getMessageById(slug) as unknown as Promise<Message>,
            api.getCurrentUser() as unknown as Promise<BasicUser>
        ]);
        const emailIndex = (emailList as Message[]).findIndex(msg => msg._id === email._id);

        return {
            props: {
                email: email || null,
                currentUser: currentUser || null,
                emailIndex: emailIndex >= 0 ? emailIndex + 1 : null,
                emailList: emailList || null,
            }
        };
    } catch (error) {
        console.error('Error fetching data:', error.message);
        return {
            props: {
                email: null,
                currentUser: null,
                emailIndex: null,
                emailList: null,
            }
        };
    }
}



export default function EmailPage({ email, emailList, emailIndex, currentUser }) {

    if (!email || !emailList || !currentUser) {
        return <div>No email found or data is missing.</div>;
    }

    return (
        <div>
            <EmailView
                email={email}
                emailList={emailList}
                emailIndex={emailIndex}
                currentUser={currentUser}
            />
        </div>
    );
}