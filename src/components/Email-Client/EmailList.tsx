import { Button } from 'primereact/button';
import styles from './EmailClient.module.scss';

const EmailList = ({ emails,  onSelectEmail,onCompose }) => {
 
  return (
    <div className={styles.emailList}>
     <Button onClick={onCompose} label="Compose" className="p-button-primary" />
      {emails?.map((email) => {
         console.log(email);
        const sender = email.headers?.From || 'Unknown Sender';
        const subject = email.headers?.Subject || 'No Subject';

        return (
          <div
            key={email.uid}
            className={`${styles.emailItem} ${email.isRead ? styles.read : styles.unread}`}
          >
            <div
              className={styles.emailContent}
              onClick={() => onSelectEmail(email)}
              title={subject} // For full subject tooltip
            >
              <strong>{sender}</strong>
              <p>{subject}</p> {/* Text truncation handled via CSS */}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EmailList;
