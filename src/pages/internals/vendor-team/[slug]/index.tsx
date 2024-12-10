// import { useState, useEffect, useRef } from 'react';
// import styles from './index.module.scss';
// import { useRouter } from 'next/router';
// import { Menu } from 'primereact/menu';
// import { Toast } from 'primereact/toast';
// import EmailModal from './@/components/Modals/Email';
// import ChangeStatusModal from './@/components/Modals/ChangeStatus';
// import MoveToModal from './@/components/Modals/MoveTo';
// import { TabView, TabPanel } from 'primereact/tabview';
// import Image from 'next/image';
// import { Dropdown } from 'primereact/dropdown';
// import { Accordion, AccordionTab } from 'primereact/accordion';
// import { Timeline } from 'primereact/timeline';
// import apiService from './@/services/api.service';
// import { Button } from 'primereact/button';
// import moment from 'moment';

// export async function getServerSideProps(context) {
//     const { slug } = context.query;
//     return { props: { slug } };
// }
// export default function ContactDetails(props) {
//     const router = useRouter();
//     const toast = useRef(null);
//     const menuRight = useRef(null);
//     const [visible, setVisible] = useState(false);
//     const [emailModalVisible, setEmailModalVisible] = useState(false);
//     const [changeStatusVisible, setChangeStatusVisible] = useState(false);
//     const [moveToVisible, setMoveToVisible] = useState(false);
//     const [slectedTab, setSelectedTab] = useState(0);
//     const [selectedFilter, setSelectedFilter] = useState(null);
//     const [contact, setContact] = useState([]);
//     const filters = [{ name: 'Today & upcoming', code: 'NY' }];
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 let response = await apiService.getContactById(props.slug);
//                 setContact(response);
//             } catch (error) {
//                 console.error(error);
//             }
//         };
//         fetchData();
//     }, []);

//     const addFavourite = async (contact) => {
//         try {
//             let response = await apiService.changeContactFavourite(contact.id);
//             setContact(response);
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     const events = [
//         {
//             status: 'Ordered',
//             date: '15/10/2020 10:30',
//             icon: 'pi pi-shopping-cart',
//             color: '#9C27B0',
//             image: 'game-controller.jpg',
//         },
//         {
//             status: 'Processing',
//             date: '15/10/2020 14:00',
//             icon: 'pi pi-cog',
//             color: '#673AB7',
//         },
//         {
//             status: 'Shipped',
//             date: '15/10/2020 16:15',
//             icon: 'pi pi-shopping-cart',
//             color: '#FF9800',
//         },
//         {
//             status: 'Delivered',
//             date: '16/10/2020 10:00',
//             icon: 'pi pi-check',
//             color: '#607D8B',
//         },
//     ];

//     const customizedContent = (item) => {
//         return <div></div>;
//     };

//     const items = [
//         {
//             label: 'Edit',
//             command: () => {
//                 toast.current.show({
//                     severity: 'success',
//                     summary: 'Info',
//                     detail: 'Edit Clicked',
//                 });
//             },
//         },
//         {
//             label: 'Move To',
//             command: () => setMoveToVisible(true),
//         },
//         {
//             label: 'Change Status',
//             command: () => setChangeStatusVisible(true),
//         },
//         {
//             label: 'Comments',
//             command: () => {
//                 toast.current.show({
//                     severity: 'warn',
//                     summary: 'Info',
//                     detail: 'Comments Clicked',
//                 });
//             },
//         },
//         {
//             label: 'Task',
//             command: () => {
//                 toast.current.show({
//                     severity: 'error',
//                     summary: 'Info',
//                     detail: 'Task Clicked',
//                 });
//             },
//         },
//         {
//             label: 'Email',
//             command: () => setEmailModalVisible(true),
//         },
//     ];

//     const tabs = [
//         {
//             name: 'Activity',
//             icon: 'pulse.svg',
//         },
//         {
//             name: 'Notes',
//             icon: 'Note.svg',
//         },
//         {
//             name: 'Email',
//             icon: 'Inbox.svg',
//         },
//         {
//             name: 'Tasks',
//             icon: 'Task.svg',
//         },
//         {
//             name: 'Jobs',
//             icon: 'New_Job.svg',
//         },
//     ];

//     return (
//         <>
//             <Toast ref={toast} />
//             <div className={styles.title_bar}>
//                 <div className={styles.title}>Vendor Team</div>
//                 <Button label="New Contact" onClick={() => setVisible(true)} raised />
//             </div>
//             <Button
//                 label="Back"
//                 severity="secondary"
//                 icon="pi pi-angle-left"
//                 onClick={() => router.back()}
//                 outlined
//             />
//             <div className="grid mt-2">
//                 <div className="col-3">
//                     <div className={styles.left_column}>
//                         <div className={styles.card}>
//                             <div className={styles.header}>
//                                 <div className={styles.name}></div>
//                                 <div className={styles.favourite_section}>
//                                     <i
//                                         className={`pi heart ${
//                                             contact.favourite ? 'pi-heart-fill' : 'pi-heart'
//                                         }`}
//                                         onClick={() => addFavourite(contact)}
//                                     />
//                                     <i
//                                         className={`pi pi-ellipsis-v ${styles.options_button}`}
//                                         onClick={(event) => menuRight.current.toggle(event)}
//                                     />
//                                 </div>
//                             </div>
//                             <div className={styles.body}>
//                                 <div className={styles.name_box}>
//                                     {contact.firstName?.toUpperCase()?.substring(0, 1)}
//                                     {contact.lastName?.toUpperCase()?.substring(0, 1)}
//                                 </div>
//                                 <div className={styles.name}>
//                                     {contact.salutation} {contact.firstName} {contact.middleName}{' '}
//                                     {contact.lastName}
//                                 </div>
//                                 <div className={styles.title}>{contact.designation}</div>

//                                 <div className={styles.action_section}>
//                                     <div className={styles.box}>
//                                         <a href={`tel:${contact.phone}`}>
//                                             <Image
//                                                 alt="call"
//                                                 src="/assets/icons/Call.svg"
//                                                 height={25}
//                                                 width={25}
//                                             />
//                                         </a>
//                                     </div>
//                                     <div className={styles.box}>
//                                         <Image
//                                             alt="emial"
//                                             src="/assets/icons/Email2.svg"
//                                             height={25}
//                                             width={25}
//                                         />
//                                     </div>
//                                     <div className={styles.box}>
//                                         <a
//                                             target="_blank"
//                                             href={`//api.whatsapp.com/send?phone=${contact.phone}&text=Hi`}
//                                         >
//                                             <Image
//                                                 alt="whatsapp"
//                                                 src="/assets/icons/WhatsApp.svg"
//                                                 height={25}
//                                                 width={25}
//                                             />
//                                         </a>
//                                     </div>
//                                 </div>
//                                 <Button
//                                     label="Move To"
//                                     className="w-full"
//                                     onClick={() => setMoveToVisible(true)}
//                                 />
//                                 <div className={styles.last_activity}>
//                                     <span></span>
//                                     Last activity: {moment(contact.lastVisited).format('LLL')}
//                                 </div>
//                             </div>
//                         </div>
//                         <TabView className={styles.tabs}>
//                             <TabPanel header="Contact Info">
//                                 <div className={styles.tabs_body}>
//                                     <label>Email</label>
//                                     {contact.email}
//                                     <label>Phone Number</label>
//                                     {contact.phone}
//                                     <label>Designation</label>
//                                     {contact.designation}
//                                     <label>Industry</label>
//                                     {contact.industry}
//                                     <label>Assigned To</label>
//                                     {contact.assignTo}
//                                     <label>Reporting To</label>
//                                     {contact.reportingTo}
//                                     <label>LinkedIn URL</label>
//                                     {contact.linkedin}
//                                     <label>Comments</label>
//                                     {contact.comments}
//                                 </div>
//                             </TabPanel>

//                             <TabPanel header="Address Info">
//                                 <div className={styles.tabs_body}>
//                                     <label>Email</label>
//                                     {contact.email}
//                                     <label>Phone Number</label>
//                                     {contact.phone}
//                                     <label>Designation</label>
//                                     {contact.designation}
//                                     <label>Industry</label>
//                                     {contact.industry}
//                                     <label>Assigned To</label>
//                                     {contact.assignTo}
//                                     <label>Reporting To</label>
//                                     {contact.reportingTo}
//                                     <label>LinkedIn URL</label>
//                                     {contact.linkedin}
//                                     <label>Comments</label>
//                                     {contact.comments}
//                                 </div>
//                             </TabPanel>
//                         </TabView>
//                     </div>
//                 </div>
//                 <div className="col-9">
//                     <div className={styles.right_column}>
//                         <div className={styles.search_bar}>
//                             <i className="pi pi-search" />
//                             <input
//                                 type="search"
//                                 placeholder="Search activity, notes, email and more"
//                             />
//                         </div>
//                         <div className={styles.tabs}>
//                             {tabs.map((item, i) => (
//                                 <span
//                                     className={i == slectedTab ? styles.active : ''}
//                                     onClick={() => setSelectedTab(i)}
//                                     key={i}
//                                 >
//                                     <img alt="icon" src={`/assets/icons/${item?.icon}`} />
//                                     {item.name}
//                                 </span>
//                             ))}
//                         </div>
//                         <div className={styles.filter_by}>
//                             <label>Filter by:</label>
//                             <Dropdown
//                                 value={selectedFilter}
//                                 onChange={(e) => setSelectedFilter(e.value)}
//                                 options={filters}
//                                 optionLabel="name"
//                                 placeholder="Select a Filter"
//                                 className="p-inputtext-sm"
//                                 // className="w-full md:w-14rem"
//                             />
//                         </div>
//                         <div className={styles.details_section}>
//                             <Accordion activeIndex={1} className="outer_accordion">
//                                 <AccordionTab header="Upcoming" className="removeHeaderCss">
//                                     <Timeline
//                                         value={events}
//                                         content={customizedContent}
//                                         align="left"
//                                     />
//                                 </AccordionTab>
//                                 <AccordionTab header="Today" className="removeHeaderCss">
//                                     <Timeline
//                                         value={events}
//                                         content={customizedContent}
//                                         align="left"
//                                     />
//                                 </AccordionTab>
//                             </Accordion>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <Menu
//                 model={items}
//                 popup
//                 ref={menuRight}
//                 id="popup_menu_right"
//                 popupAlignment="right"
//             />

//             <EmailModal visible={emailModalVisible} setVisible={setEmailModalVisible} />
//             <ChangeStatusModal visible={changeStatusVisible} setVisible={setChangeStatusVisible} />
//             <MoveToModal visible={moveToVisible} setVisible={setMoveToVisible} />
//         </>
//     );
// }

// pages/internals/vendor-team/[slug].js
import React from 'react';
import { useRouter } from 'next/router';

const VendorTeam = () => {
  const router = useRouter();
  const { slug } = router.query;

  return (
    <div>
      <h1>Vendor Team - {slug}</h1>
    </div>
  );
};

export default VendorTeam;

