import { useState} from 'react';
import styles from './index.module.scss';

export default function MailAccordion({ data }) {
    console.log("testing:",data)
    const [isOpen, setIsOpen] = useState(true);

    const { status, date, comment, attachments, color } = data;
    const text = status || 'No title available '

     // Format date as needed
     const formattedDate = new Date(date).toLocaleTimeString() + '  ' + new Date(date).toLocaleDateString();

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left_section} onClick={() => setIsOpen((prev) => !prev)}>
                    <i className={`pi ${isOpen ? 'pi-angle-right' : 'pi-angle-down'}`} />
                    <i className={`pi pi-envelope`} />
                    <span style={{ color: color }} dangerouslySetInnerHTML={{ __html: text }}></span>
                </div>
                <div className={styles.timing}>
                   {formattedDate}
                    {/* <i className="pi pi-ellipsis-v"></i> */}
                </div>
            </div>
            {isOpen && comment && (
                <div className={styles.details}>
                    <ul>
                        <li>
                            <div className={styles.li_div}>
                                <strong>Comment:</strong> {comment}
    
                            </div>
                        </li>
                        {attachments && attachments.length > 0 && (
                            <li>
                                <div className={styles.li_div_at}>
                                   
                                      
                                        {attachments.map((attachment, index) => (
                                          
                                             <li key={index}>
                                                  <strong>Attachment:</strong> 
                                             <a href={attachment.locationUrl} target="_blank" rel="noopener noreferrer">
                                                 {attachment.originalName || `Attachment ${index + 1}`}
                                             </a>
                                         </li>
                                        ))}
                                
                                </div>
                            </li>
                        )}
                        
                    </ul>
                </div>
            )}
        </>
    );
}
