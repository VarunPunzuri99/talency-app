import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import styles from '@/styles/shared/Modals/modal.module.scss';
import { Dialog } from 'primereact/dialog';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { ToastContainer, toast } from 'react-toastify';
import api, { getAllUsers } from '@/services/api.service';
import { tryCatch } from '@/hooks/tryCatch';
import { Contact } from '@/services/types';
import { useRouter } from 'next/router';

interface MoveToModalProps {
    account?: any,
    contact?: Contact,
    task?: any,
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
}

export default function MoveToModal({ task, account, contact, visible, setVisible }: MoveToModalProps) {
    // console.log(task)
    const router = useRouter();

    const [checked, setChecked] = useState(false);
    const [assignTo, setAssignTo] = useState(null);
    const [comment, setComment] = useState(null);
    const [assignToList, setAssignToList] = useState(null);
    useEffect(() => {
        const getList = () => {
            tryCatch(async () => {
                const assignToListRes = await getAllUsers();
                setAssignToList(assignToListRes)
            })
        }
        getList()
    }, [])
    const moveToHandler = () => {
        tryCatch(async () => {
            // console.log('assignTo-  ',assignTo)
            const body = {
                "moveTo": assignTo?._id,
                "comment": {
                    "contents": comment,
                    "attachments": []
                }
            }
            console.log(body)
            if (task) {
                const res = await api.updateTaskAssignee(task._id, body)
                if (res) {
                    toast.success(`Successfully MoveTo: ${assignTo?.firstName}`)
                    // console.log(res)
                    setTimeout(() => { setVisible(false);
                        router.reload(); // Refresh the page
                     }, 1700)
                }
            }

            if (account) {
                const res = await api.updateAccountAssignee(account._id, body)
                if (res) {
                    toast.success(`Successfully MoveTo: ${assignTo?.firstName}`)
                    // console.log(res)
                    setTimeout(() => { setVisible(false) }, 1700)
                }
            }
          
            if (contact) {
                const res = await api.updateContactAssignee(contact._id, body)
                if (res) {
                    toast.success(`Successfully MoveTo: ${assignTo?.firstName}`)
                    // console.log(res)
                    setTimeout(() => { setVisible(false) }, 1700)
                }
            }
        })
    }

    const getLabel = () => {
      if (task) return "Assignee Name";
      // if (contact) return "Assign To";
      if (account) return "Assign To";
      return "";
  };
  
  const getDialogHeader = () => {
      if (task) return "Assign Task";
      if (contact) return "Move To";
      if (account) return "Move To";
      return "";
  };

    return (
        <>
            <Dialog
                header={getDialogHeader()}
                visible={visible}
                position={'bottom-right'}
                style={{ width: '40vw' }}
                onHide={() => setVisible(false)}
                draggable={false}
                resizable={false}
                maximizable
                className={styles.email_module}
            >
                <div className={styles.body}>
                    <label>
                      {getLabel()}
                    </label>
                    <Dropdown
                        value={assignTo}
                        onChange={(e) => setAssignTo(e.value)}
                        options={assignToList}
                        optionLabel="firstName"
                        placeholder="Select to assign the contact to account manager"
                    />
                    <label>Comments</label>
                    <InputTextarea
                        autoResize
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        cols={30}
                    />
                </div>
                <div className={styles.follow_up}>
                    <div className={styles.check_box_section}>
                        <Checkbox
                            onChange={(e) => setChecked(e.checked)}
                            checked={checked}
                        ></Checkbox>
                        Create a follow up
                    </div>
                    <button onClick={moveToHandler}>Send</button>
                </div>
            </Dialog>
            <ToastContainer />
        </>
    );
}
