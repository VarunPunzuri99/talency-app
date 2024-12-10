import { FaForward, FaReply } from 'react-icons/fa';
import styles from './EmailClient.module.scss';
import { useState } from 'react';
import TiptapEditor from '../TiptapEditor';
import { Button } from 'primereact/button';

const EmailDetail = ({ selectedEmail, onSendReply, onSendForward }) => {
  const [isReplying, setIsReplying] = useState(false); // State to show/hide the editor
  const [replyBody, setReplyBody] = useState(''); // State for the reply content

  const [isForwarding, setIsForwarding] = useState(false); // State to show/hide the forward editor
  const [forwardBody, setForwardBody] = useState(''); // State for the forward content
  const [forwardTo, setForwardTo] = useState(''); // State for To field
  const [forwardCC, setForwardCC] = useState([]); // State for CC field (array)
  const [forwardBCC, setForwardBCC] = useState([]); // State for BCC field (array)

  if (!selectedEmail) {
    return <div className={styles.emailDetail}>Select an email to view</div>;
  }

  const handleReply = () => {
    setIsReplying(true); // Show the reply editor
  };

  const handleSendReply = async () => {
    const replyData = {
      userInboxConfigId: "67022e32902b7af70f596bcf",
      uid: selectedEmail.uid,
      folder: selectedEmail.folder || "INBOX",
      body: replyBody,
    };

    await onSendReply(replyData);
    setIsReplying(false);
    setReplyBody('');
  };

  const handleForward = () => {
    setIsForwarding(true); // Show the forward editor
    setForwardBody(''); // Prefill the body with the original email content
    setForwardTo('');
    setForwardCC([]); // Reset CC
    setForwardBCC([]); // Reset BCC
  };

  const handleSendForward = async () => {
    const forwardData = {
      userInboxConfigId: "67022e32902b7af70f596bcf",
      uid: selectedEmail.uid,
      folder: selectedEmail.folder || "INBOX",
      to: forwardTo || selectedEmail.To,
      cc: forwardCC, // Include CC
      bcc: forwardBCC, // Include BCC
      body: forwardBody,
    };

    await onSendForward(forwardData);
    setIsForwarding(false);
    setForwardBody('');
    setForwardTo('');
    setForwardCC([]); // Clear CC
    setForwardBCC([]); // Clear BCC
  };

  const { From: sender, To: recipient, Subject: subject } = selectedEmail.headers;
  const emailBody = selectedEmail.body || '<p>No content available</p>';

  // Add a function to handle CC/BCC changes (for adding/removing emails)
  const handleAddRecipient = (field, value) => {
    if (value && !field.includes(value)) {
      field.push(value);
      return [...field];
    }
    return field;
  };

  const handleRemoveRecipient = (field, index) => {
    field.splice(index, 1);
    return [...field];
  };

  return (
    <div className={styles.emailDetail}>
      <div className={styles.emailActions}>
        <div className={styles.iconBar}>
          <FaReply onClick={handleReply} className={styles.icon} />
          <FaForward onClick={handleForward} className={styles.icon} />
        </div>
      </div>
      <div className={styles.emailHeader}>{subject}</div>
      <div className={styles.emailMeta}>
        From: {sender} | To: {recipient}
      </div>
      <div className={styles.emailContent}>
        <div className={styles.emailHtmlContent} dangerouslySetInnerHTML={{ __html: emailBody }} />
      </div>
      {isReplying && (
        <div className={styles.replyEditor}>
          <TiptapEditor value={replyBody} onChange={(newBody) => setReplyBody(newBody)} />
          <Button label="Send Reply" onClick={handleSendReply} className="p-button-primary" />
        </div>
      )}

      {isForwarding && (
        <div className={styles.forwardEditor}>
          <div className={styles.forwardField}>
            <label htmlFor="forwardTo">To:</label>
            <input
              type="email"
              id="forwardTo"
              value={forwardTo}
              onChange={(e) => setForwardTo(e.target.value)}
              placeholder="Enter recipient email"
              className={styles.inputField}
            />
          </div>

          <div className={styles.forwardField}>
            <label htmlFor="forwardCC">CC:</label>
            <input
              type="email"
              id="forwardCC"
              onBlur={(e) => setForwardCC(handleAddRecipient(forwardCC, e.target.value))}
              placeholder="Enter CC recipients"
              className={styles.inputField}
            />
            {forwardCC.length > 0 && (
              <ul>
                {forwardCC.map((cc, index) => (
                  <li key={index}>
                    {cc} <button onClick={() => setForwardCC(handleRemoveRecipient(forwardCC, index))}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.forwardField}>
            <label htmlFor="forwardBCC">BCC:</label>
            <input
              type="email"
              id="forwardBCC"
              onBlur={(e) => setForwardBCC(handleAddRecipient(forwardBCC, e.target.value))}
              placeholder="Enter BCC recipients"
              className={styles.inputField}
            />
            {forwardBCC.length > 0 && (
              <ul>
                {forwardBCC.map((bcc, index) => (
                  <li key={index}>
                    {bcc} <button onClick={() => setForwardBCC(handleRemoveRecipient(forwardBCC, index))}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <TiptapEditor value={forwardBody} onChange={(newBody) => setForwardBody(newBody)} />
          <Button label="Send Forward" onClick={handleSendForward} className="p-button-primary" />
        </div>
      )}
    </div>
  );
};

export default EmailDetail;
