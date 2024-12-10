import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'primereact/menu';
import { useRouter } from 'next/router';
import styles from '@/styles/shared/Cards/contact_recruiter.module.scss'
import React, {useRef, useState } from 'react';
import EmailModal from '../../Modals/Email';
import MoveToModal from '../../Modals/MoveTo';
import NoDataFound from '../../NoDataFound';
import ChangeStatusModal from '../../Modals/ChangeStatus';
import { AccountStatus, Contact } from '@/services/types';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import ApiCall from '@/services/api.service';
import { toast, ToastContainer } from 'react-toastify';
import { Checkbox } from 'primereact/checkbox';

// interface ContactCardProps {
//     data?: Contact[],
//     setData: Dispatch<SetStateAction<Contact[]>>;
//     link?: string;
// }

export default function ContactCard({
  data,
  setData,
  selectedIds,
  setSelectedIds,
}) {
  const router = useRouter();
  const menuRight = useRef<Menu>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [moveToVisible, setMoveToVisible] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [changeStatusVisible, setChangeStatusVisible] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState<'soft' | 'hard' | ''>('');

  const contactStatus = [
    { label: 'Qualified', value: AccountStatus.QUALIFIED },
    { label: 'Prospect', value: AccountStatus.PROSPECT },
    { label: 'Dormant', value: AccountStatus.DORMANT },
    { label: 'Customer', value: AccountStatus.CUSTOMER },
    { label: 'Dead', value: AccountStatus.DEAD },
  ];

  const items = [
    {
      label: 'Edit',
      command: () => {
        if (selectedContact?._id) {
          router.push(`/sales/contacts/add?id=${selectedContact._id}`);
        }
      },
    },
    {
      label: 'Move To',
      command: () => setMoveToVisible(true),
    },
    {
      label: 'Change Status',
      command: () => setChangeStatusVisible(true),
    },
    // {
    //     label: 'Comments',
    //     command: () => { },
    // },
    // {
    //     label: 'Task',
    //     command: () => { },
    // },
    // {
    //     label: 'Email',
    //     command: () => setEmailModalVisible(true),
    // },
    {
      label: 'Soft Delete',
      command: () => {
        setDeleteType('soft');
        setShowDeleteDialog(true);
      },
    },
    {
      label: 'Hard Delete',
      command: () => {
        setDeleteType('hard');
        setShowDeleteDialog(true);
      },
    },
  ];

  const stopBackgroundClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // const handleCallClick = (number: string | undefined) => {
  //     if (number) {
  //         window.location.href = `tel:${number}`;
  //     }
  // };

  const handleEmailClick = (email: string | undefined) => {
    if (email) {
      window.location.href = `mailto:${email}?subject=Hello&body=Hi%20there,`;
    }
  };

  // const handleWhatsAppClick = (number: string | undefined) => {
  //     if (number) {
  //         window.open(`//api.whatsapp.com/send?phone=${number}&text=Hi`);
  //     }
  // };

  const favouriteClicked = () => {
    // Implement favourite functionality if needed
  };

  const handleSoftDelete = async (id: string) => {
    try {
      await ApiCall.softDeleteContact(id);
      toast.success('Contact Soft Deleted');
      // Refresh
      setData((prevData) => prevData.filter((contact) => contact._id !== id));
    } catch (error) {
      console.error('Error while soft deleting contact:', error?.message);
      toast.error('Error while soft deleting contact', error?.message);
    }
  };

  const handleHardDelete = async (id: string) => {
    try {
      await ApiCall.hardDeleteContact(id);
      toast.success('Contact Permanently Deleted');
      setData((prevData) => prevData.filter((contact) => contact._id !== id));
    } catch (error) {
      console.error('Error while hard deleting contact:', error?.message);
      toast.error('Error while hard deleting contact', error?.message);
    }
  };

  const handleDelete = () => {
    if (selectedContact?._id) {
      if (deleteType === 'soft') {
        handleSoftDelete(selectedContact._id);
      } else if (deleteType === 'hard') {
        handleHardDelete(selectedContact._id);
      }
    }
    setShowDeleteDialog(false);
  };

  const cancel = () => {
    setShowDeleteDialog(false);
  };

  const dialogMessage =
    deleteType === 'soft'
      ? 'Are you sure you want to soft delete this contact?'
      : 'Are you sure you want to permanently delete this contact?';

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <>
      <ToastContainer />
      <Menu
        model={items}
        popup
        ref={menuRight}
        id="popup_menu_right"
        popupAlignment="right"
      />
      <section className={styles.wrapper}>
        {data?.map((contact, i) => (
          <Link
            href={`/sales/contacts/${contact?._id}`}
            className={styles.card}
            key={`contact_card-${i}`}
          >
            <div className={styles.icons}>
              <Checkbox
                checked={Array.isArray(selectedIds) && selectedIds.includes(contact._id)}
                onChange={(event) => {
                  event.stopPropagation();  
                  toggleSelect(contact._id); 
                }}
                onClick={(event) => {
                  event.stopPropagation(); 
                }}
              />
              <i
                className={`pi pi-ellipsis-v ${styles.options_button}`}
                onClick={(event) => {
                  event.stopPropagation(); // Prevent click from triggering the link
                  stopBackgroundClick(event); // Your custom logic
                  setSelectedContact(contact); // Open the menu for the current contact
                  menuRight.current.toggle(event); // Open the right-click menu
                }}
              />
            </div>

            <div className={styles.box}>
              {contact.firstName?.toUpperCase()?.substring(0, 1)}{' '}
              {contact.lastName?.toUpperCase()?.substring(0, 1)}
            </div>
            <div className={styles.name}>
              <i
                className={`pi heart ${
                  contact.favourite ? 'pi-star-fill' : 'pi-star'
                }`}
                onClick={(e) => {
                  stopBackgroundClick(e);
                  favouriteClicked();
                }}
              />
              {/* {contact.salutation}  */}
              {contact.firstName} {contact.lastName}
              {/* {contact.middleName}  */}
            </div>
            <div className={styles.address}>
              {/* {`${contact?.contactAddress[0]?.apartment + contact?.contactAddress[0]?.street + 
                                contact?.contactAddress[0]?.city + contact?.contactAddress[0]?.country?.countryName }` || 'Location not Available'
                            } */}
              {/* {`${contact?.contactAddress[0]?.city + ",  " +  contact?.contactAddress[0]?.country?.countryName}` || 'Location not available'} */}
            </div>

            <div className={styles.button_wrapper}>
              <div className={styles.details}>Detail & Activity</div>
              <div className={styles.action}>
                {/* <a
                                        href={`tel:${contact?.contactDetails?.[0]?.contactNumber}`}
                                        onClick={(e) => {
                                            stopBackgroundClick(e);
                                            handleCallClick(contact?.contactDetails?.[0]?.contactNumber);
                                        }}
                                    >
                                    </a> */}
                <Image
                  alt="call"
                  width={25}
                  height={25}
                  src="/assets/icons/Call.svg"
                />
                <Image
                  width={25}
                  height={25}
                  alt="email"
                  src="/assets/icons/Email2.svg"
                  onClick={() =>
                    handleEmailClick(contact?.contactDetails?.[0]?.contactEmail)
                  }
                />
                {/* <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => {
                                            stopBackgroundClick(e);
                                            handleWhatsAppClick(contact?.contactDetails?.[0]?.contactNumber);
                                        }}
                                        href={`//api.whatsapp.com/send?phone=${contact?.contactDetails?.[0]?.contactNumber}&text=Hi`}
                                    >
                                    </a> */}
                <Image
                  alt="whatsapp"
                  src="/assets/icons/WhatsApp.svg"
                  height={25}
                  width={25}
                />
              </div>
            </div>
          </Link>
        ))}
      </section>
      {data?.length == 0 && <NoDataFound />}
      {emailModalVisible && (
        <EmailModal
          visible={emailModalVisible}
          setVisible={setEmailModalVisible}
        />
      )}
      {changeStatusVisible && (
        <ChangeStatusModal
          statusEnum={contactStatus}
          contact={selectedContact}
          visible={changeStatusVisible}
          setVisible={setChangeStatusVisible}
        />
      )}
      {moveToVisible && (
        <MoveToModal
          contact={selectedContact}
          visible={moveToVisible}
          setVisible={setMoveToVisible}
        />
      )}
      {showDeleteDialog && (
        <Dialog
          header="Confirm Deletion"
          visible={showDeleteDialog}
          onHide={() => setShowDeleteDialog(false)}
          // style={{ width: '40vw' }}
        >
          <p>{dialogMessage}</p>
          <div className={styles.dialog_buttons}>
            <Button label="Cancel" onClick={cancel} className="p-button-text" />
            <Button
              label={`Delete ${
                deleteType === 'soft' ? 'Softly' : 'Permanently'
              }`}
              onClick={handleDelete}
              className="p-button-danger"
            />
          </div>
        </Dialog>
      )}
    </>
  );
}
