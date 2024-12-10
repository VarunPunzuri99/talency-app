import { useEffect, useState } from 'react';
import EmailModal from './EmailModal'; // Import the EmailModal component
import EmailList from './EmailList';
import Sidebar from './Sidebar';
import EmailDetail from './EmailDetail';
import styles from './EmailClient.module.scss';


const EmailClient = () => {
  const [selectedFolder, setSelectedFolder] = useState('INBOX');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emails, setEmails] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [emailModalData, setEmailModalData] = useState({
    to: [],
    subject: '',
    body: '',
    userInboxConfigId: '67022e32902b7af70f596bcf',
  }); // Pre-filled data for modal (if needed)

  useEffect(() => {
    // Fetch emails from the backend when the component mounts
    const fetchEmails = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/user-inbox-config/67022e32902b7af70f596bcf/fetch-emails-by-folder');
        const data = await response.json();
        console.log("testing data:",data)
        
        
        // Update state with the fetched emails
        setEmails({
          INBOX: data.INBOX.emails || [],
          Sent: data.Sent.emails || [],
          Spam: data.Spam.emails || [],
          Trash: data.Trash.emails || [],
        });
        
      } catch (error) {
        console.error('Error fetching emails:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  const handleSelectFolder = (folder) => {
    setSelectedFolder(folder);
    setSelectedEmail(null); // Reset selected email when changing folder
  };

  const handleSelectEmail = (email) => {
    setSelectedEmail({ ...email, folder: selectedFolder });

    // Automatically mark as read if it was unread
    if (!email.isRead) {
      const updatedEmails = { ...emails };
      updatedEmails[selectedFolder] = updatedEmails[selectedFolder].map((item) =>
        item.uid === email.uid ? { ...item, isRead: true } : item
      );
      setEmails(updatedEmails);
    }
  };

  // Handle Compose button click
  const handleComposeClick = () => {
    setEmailModalData({ to: [], subject: '', body: '', userInboxConfigId: '67022e32902b7af70f596bcf'});  // Reset data for new email
    setShowModal(true); // Show modal
  };

  const handleSendReply = async (replyData) => {
    try {
      const response = await fetch('http://localhost:3002/api/user-inbox-config/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(replyData),
      });
  
      const result = await response.json();
      if (response.ok) {
        console.log('Reply sent successfully:', result);
      } else {
        console.error('Error sending reply:', result);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const handleSendForward = async (forwardData) => {
    // Call the API endpoint to forward the email
    try {
      const response = await fetch('http://localhost:3002/api/user-inbox-config/forward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(forwardData),
      });
  
      const result = await response.json();
      console.log('Email forwarded:', result);
    } catch (error) {
      console.error('Error forwarding email:', error);
    }
  };
  


  if (loading) {
    return <div>Loading emails...</div>; // Show loading indicator while fetching
  }

  return (
    <div className={styles.emailClient}>
      <Sidebar  folders={Object.keys(emails)} onSelectFolder={handleSelectFolder} />
      <EmailList
        emails={emails[selectedFolder]}
        onSelectEmail={handleSelectEmail}
        onCompose={handleComposeClick}
 
      />
      <EmailDetail selectedEmail={selectedEmail}  onSendReply={handleSendReply}  onSendForward={handleSendForward} />

      {/* Email Modal for composing new emails */}
      {showModal && (
        <EmailModal
          visible={showModal}
          setVisible={setShowModal}
          toList={emailModalData.to}
          subject={emailModalData.subject}
          body={emailModalData.body}
          userInboxConfigId="67022e32902b7af70f596bcf" 
          fromEmail="shaik.tahaseen@codinglimits.com"  // Add the sender's email
          fromName="tahaseen"  // Add the sender's name
        />
      )}
    </div>
  );
};

export default EmailClient;
