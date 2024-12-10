import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import TiptapEditor from '../TiptapEditor';

const EmailModal = ({
  visible,
  setVisible,
  toList = [],
  subject = '',
  body = '',
  ccList = [],
  bccList = [],
  action = 'compose',  // New prop to indicate reply/forward/compose
  userInboxConfigId,
  fromEmail,  // Email sender
  fromName,  // Sender's name
}) => {
  const [to, setTo] = useState(toList.join(', '));
  const [cc, setCc] = useState(ccList.join(', '));
  const [bcc, setBcc] = useState(bccList.join(', '));
  const [emailSubject, setEmailSubject] = useState(subject);
  const [emailBody, setEmailBody] = useState(body);

  const handleSendEmail = async () => {
    const emailData = {
      userInboxConfigId,
      fromEmail,
      fromName,
      to: to.split(',').map(email => email.trim()),
      subject: emailSubject,
      body: emailBody,
    };

    try {
      const response = await fetch('http://localhost:3002/api/email-config/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Email sent successfully:', result);
      } else {
        console.error('Error sending email:', result);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }

    setVisible(false);  // Close the modal after sending
  };

  const renderFooter = () => (
    <div>
      <Button label="Cancel" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
      <Button label="Send" icon="pi pi-check" onClick={handleSendEmail} autoFocus />
    </div>
  );

  useEffect(() => {
    if (action === 'reply' || action === 'forward') {
      setEmailSubject(`Re: ${subject}`);  // Automatically prefix subject for replies
    }
  }, [action, subject]);


  return (
    <Dialog
      header={action === 'reply' ? 'Reply' : action === 'forward' ? 'Forward Email' : 'Compose Email'}
      visible={visible}
      style={{ width: '50vw' }}
      modal
      onHide={() => setVisible(false)}
      footer={renderFooter()}
    >
      {/* To Field */}
      <div className="p-field">
        <label htmlFor="to">To</label>
        <InputText id="to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipient email addresses" />
      </div>

      {/* Cc and Bcc Fields */}
      <div className="p-field">
        <label htmlFor="cc">Cc</label>
        <InputText id="cc" value={cc} onChange={(e) => setCc(e.target.value)} placeholder="Cc email addresses" />
      </div>
      <div className="p-field">
        <label htmlFor="bcc">Bcc</label>
        <InputText id="bcc" value={bcc} onChange={(e) => setBcc(e.target.value)} placeholder="Bcc email addresses" />
      </div>

      {/* Subject Field */}
      <div className="p-field">
        <label htmlFor="subject">Subject</label>
        <InputText id="subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Email subject" />
      </div>

      {/* Body Field using PrimeReact Editor */}
      <div className="p-field">
        <label htmlFor="body">Body</label>
        <TiptapEditor
          value={emailBody}
          onChange={(newBody) => setEmailBody(newBody)} // Update emailBody on editor change
        />
      </div>
    </Dialog>
  );
};

export default EmailModal;
