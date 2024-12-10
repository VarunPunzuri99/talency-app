import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import moment from 'moment';
import styles from '@/styles/shared/view_page.module.scss';
import TitleBar from '@/components/TitleBar';
import ApiCall, { addNote, deleteNote, getNotesByContactId, getTasksByContactId, getTodayActivitiesOfContacts, getUpComingActivitiesOfContacts, setToken } from '@/services/api.service';
import MailAccordion from '@/components/MailAccordion';
import {
    Button,
    Timeline,
    TabView,
    TabPanel,
    Accordion,
    AccordionTab,
    Dialog,
    InputText,
    Editor,
    Checkbox,
    Panel,
    Toast
    } from '@/primereact'
import { formatDueDate } from '@/utils/constant';
import MoveToModal from '@/components/Modals/MoveTo';
import React from 'react';

export async function getServerSideProps({ params, req }) {
    setToken(req);
    let contactData = null;
    try {
        contactData = await ApiCall.getContactById(params.slug);
        const [todayActivity, upcomingActivity, todayTasks, upcomingTasks, notes] = await Promise.all([
        getTodayActivitiesOfContacts(params.slug, 1, 10),
        getUpComingActivitiesOfContacts(params.slug, 1, 10),
        getTasksByContactId(params.slug,'today', 1, 10),
        getTasksByContactId(params.slug, 'upcoming', 1, 10),
        getNotesByContactId(params.slug, 1, 10)

        ]);
        console.log(todayTasks)
        console.log(upcomingTasks)
        return {
            props: {
                error: "",
                contactData,
                todayActivity,
                upcomingActivity,
                todayTasks,
                upcomingTasks,
                notes
            },
        };
    }
    catch (e) {
        return {
            props: {
                contactData,
                error: e.message,
            },
        };
    }
}

export default function ContactDetails({
    error,
    contactData,
    todayActivity,
    upcomingActivity,
    todayTasks,
    upcomingTasks,
    notes
}) {   
    const router = useRouter();
    const toast = useRef(null);
    const [visible, setVisible] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [moveToVisible, setMoveToVisible] = useState(false);
    const [isFavourite, setIsFavourite] = useState(true);
    const [notesState, setNotesState] = useState(notes);
    const [activeAccordionIndex,] = useState(1);
    const [newNote, setNewNote] = useState({
      contact: contactData._id,
      title: '',
      summary: '',
      content: '',
      isPrivate: false,
      attachments: []
    });

    const [collapsedPanels, setCollapsedPanels] = useState<boolean[]>(notesState.map(() => true));

    const handlePanelToggle = (index: number) => {
      const updatedCollapseState = [...collapsedPanels];
      updatedCollapseState[index] = !updatedCollapseState[index];
      setCollapsedPanels(updatedCollapseState);
    };

    if (error && !contactData) {
        return (
        <div className='flex m-5 justify-content-center'>
            <h5>
                Something Went Wrong!!!
            </h5>
            <p style={{ color: "red" }}>{error.message}</p>
        </div> )
    }
    
    const todayEvents = todayActivity.map(activity => ({
      status: activity.title,
      date: new Date(activity.updatedAt).toLocaleString(),
      icon: 'pi pi-calendar',
      color: '#9C27B0',
    }));

    const upComingEvents = upcomingActivity.map(upcoming => ({
        status: upcoming.title,
        date: new Date(upcoming.updatedAt).toLocaleString(),
        icon: 'pi pi-calendar',
        color: '#9C27B0',
    }));

    const tabs = [
      { name: 'Activity', icon: 'pulse.svg', },
      { name: 'Notes', icon: 'Note.svg', },
      { name: 'Email', icon: 'Inbox.svg', },
      { name: 'Tasks', icon: 'Task.svg', },
      { name: 'Jobs', icon: 'New_Job.svg', },
    ];


    const headerTemplate = (options, i) => {
      return (
          <div
              onClick={options.onClick}
              className="flex justify-content-center gap-2"
          >
              <Image
                  src={`/assets/icons/${tabs[i].icon}`}
                  alt={tabs[i]?.name}
                  height={20}
                  width={20}
              />
              {tabs[i]?.name}
          </div>
      );
    };

    const watchTabChange = (e) => {
      switch (tabs[e].name) {
          case '':
              break;
          default:
              break;
      }
    };
    
    const isRecentActivity = (date) => {
      const now = moment();
      const activityDate = moment(date);
      return now.diff(activityDate, 'hours') < 24; // true if within last 24 hours
  };

    
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewNote({
          ...newNote,
          [name]: value
      });
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setNewNote({
            ...newNote,
            [name]: checked
        });
    };

    const handleContentChange = (e) => {
        setNewNote({
            ...newNote,
            content: e.htmlValue
        });
    };

  const addNoteHandler = async (e) => {
      e.preventDefault();
      try {
          const response = await addNote(newNote);
          setNotesState((prevNotes) => [...prevNotes, response]);
          // Reset the new note form
          setNewNote({
              contact: contactData._id,
              title: '',
              summary: '',
              content: '',
              isPrivate: false,
              attachments: []
          });
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Note Added', life: 1000 });
          setVisible(false)

      }catch (error) {
        toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: `Error while adding Note: ${error.message}`,
            life: 1000
        });
    }
    
  };

  const handleDeleteNote = async (noteId) => {
      try {
          await deleteNote(noteId);
          setNotesState((prevNotes) => prevNotes.filter(note => note._id !== noteId));
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Note deleted', life: 1000 });
      }catch (error) {
        toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: `Error while deleting Note: ${error.message}`,
            life: 1000
        });
    }
  };


    return (
        <>
            <Toast ref={toast} />
            {/* <Menu
                model={items}
                popup
                ref={menuRight}
                id="popup_menu_right"
                popupAlignment="right"
            /> */}
            <TitleBar title={'Contact'}>
                <Button
                    onClick={() => router.push(`/sales/contacts/add`)}
                    label="New Contact"
                />
            </TitleBar>
            <div className='grid mt-2'>
              <div className='col-3'>
                <div className={styles.left_column}>
                  <div className={styles.card}>
                    <div className={styles.header}>
                      <div className={styles.name}>{contactData?.status?.substring(0,1).toUpperCase() + contactData?.status?.substring(1).toLowerCase()}</div>
                      <div className={styles.favourite_section}>
                        <i
                          className={`pi star ${
                              isFavourite ? 'pi-star-fill' : 'pi-star'
                          }`}
                          onClick={() => setIsFavourite((prev) => !prev)}
                        ></i>
                        {/* <i
                            className={`pi pi-ellipsis-v ${styles.options_button}`}
                            onClick={(event) => menuRight.current.toggle(event)}
                        /> */}
                      </div>
                    </div>
                    <div className={styles.body}>
                      <div className={styles.name_box}>
                          {contactData.firstName?.toUpperCase()?.substring(0, 1)}{' '}
                          {contactData.lastName?.toUpperCase()?.substring(0, 1)}
                      </div>
                      <div className={styles.name}>
                          {/* {contact.salutation}  */}
                          {contactData.firstName}{' '} {contactData.lastName}
                          {/* {contact.middleName}  */}
                      </div>
                      <div className= { styles.title}>
                          {/* <label>Company / Account</label> */}
                          {contactData?.accountOrg?.title || "Not-Set"}
                      </div>
                      <button
                          className={styles.move_to_button}
                          onClick={() => setMoveToVisible(true)}
                      >
                          Move To
                      </button>
                      <div className={styles.last_activity}>
                            {isRecentActivity(contactData.updatedAt) ? (
                                <span className={styles.greenDot} /> // Green dot for recent activity
                            ) : contactData?.status !== 'active' ? (
                                <span className={styles.redDot} /> // Red dot for non-active status
                            ) : null}
                            Last activity:{' '}
                            {moment(contactData.updatedAt).format(
                                'LL [at] LT',
                            )}
                      </div>
                    </div>
                  </div>
                  <TabView className={styles.tabs}>
                      <TabPanel header="Contact Info">
                          <div className={styles.tabs_body}>
                              <label>Designation</label>
                              {contactData?.designation || "Not-Set"}
                                <label>Industry</label>
                                {contactData?.industry?.name || "Not-Set"}
                                <label>Reference</label>
                                {contactData?.referredBy|| "Not-Set"}
                                <label>Assigned To</label>
                                {contactData?.assignTo?.fullName || "Not-Set"}
                                <label>Reporting To</label>
                                {contactData?.reportingTo?.firstName + " " + contactData?.reportingTo?.lastName || "Not-Set"}
                                <label>LinkedIn URL</label>
                                {contactData?.linkedInUrl || "Not-Set"}
                                <label>Status</label>
                                {(contactData?.status)?.charAt(0).toUpperCase() + (contactData?.status)?.substring(1).toLowerCase()  || "Not-Set"}
                            {/* <div>
                                <label>Comments</label>
                                {contactData?.comments || "Not-Set"}
                            </div> */}
                        </div>
                      </TabPanel>
                      <TabPanel header="Address Info">
                          <div className={styles.tabs_body}>
                              <div className="flex flex-column">
                                <label>Emails: </label>
                                <div className='flex flex-column md:flex-row flex-wrap'>
                                  {contactData?.contactDetails?.map((val, i) => (
                                      <div key={`email-${i}`} className="p-1 ml-0 mr-1 my-1">
                                          <span>{val.contactEmail}</span>
                                      </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex flex-column">
                                <label>Phone Numbers: </label>
                                <div className='flex flex-column md:flex-row flex-wrap'>
                                  {contactData?.contactDetails?.map((val, i) => (
                                      <div key={`phone-${i}`} className="p-1 ml-0 mr-1 my-1">
                                          <span>+91 {val.contactNumber}</span>
                                      </div>
                                  ))}
                                </div>
                              </div>
                              {/*                             
                              <div>
                                  <label>Address</label>
                                  {contactData?.contactAddress?.apartment + ", "}{contactData?.contactAddress?.street + ", "}
                                  {(contactData?.contactAddress?.city)?.charAt(0).toUpperCase() + (contactData?.contactAddress?.city)?.substring(1).toLowerCase()} {',  '}
                                  {contactData?.contactAddress?.country?.countryName + ", "}{contactData?.contactAddress?.postalCode}{" ( " + contactData?.contactAddress?.addressType + " )"}
                              </div> */}
                              <label>Address Type</label>
                                      {contactData?.contactAddress?.addressType}
                                      <label> Address</label>
                                      {contactData?.contactAddress?.apartment}
                                      {/* <label>Country</label>
                                      {contactData?.contactAddress?.country.countryName}
                                      <label>State</label>
                                      {contactData?.contactAddress?.state.stateName} */}
                                      <label>City</label>
                                      {contactData?.contactAddress?.city}
                                      <label>Pincode</label>
                                      {contactData?.contactAddress?.postalCode}
                                  <label>Comments</label>
                                  Sometimes no, is dummy text used in laying out print. Sometimes
                                  no, is dummy text used in laying out print 
                          </div>
                      </TabPanel>
                  </TabView>
                </div>
              </div>
              <div className='col-9'>
                <div className={styles.wrapper}>
                  <div className={styles.search_bar}>
                      <i className="pi pi-search" />
                      <input
                          type="search"
                          placeholder="Search activity, notes, email and more"
                      />
                  </div>
                      <TabView
                            className={styles.tabs}
                            activeIndex={activeIndex}
                            onTabChange={(e) => {
                                watchTabChange(e.index);
                                setActiveIndex(e.index);
                            }}
                        >
                            <TabPanel headerTemplate={(e) => headerTemplate(e, 0)}>

                                <div className={styles.activity}>
                                    <Accordion activeIndex={activeIndex} className="outer_accordion">
                                        <AccordionTab header="Upcoming" className="removeHeaderCss">
                                            {upComingEvents.length > 0 ? (
                                                <Timeline value={upComingEvents} content={(data) => <MailAccordion data={data} />} />
                                            ) : (
                                                <div className={styles.noActivityMessage}>No upcoming events.</div>
                                            )}
                                        </AccordionTab>
                                        <AccordionTab header="Today" className="removeHeaderCss">
                                            {todayEvents.length > 0 ? (
                                                <Timeline value={todayEvents} content={(data) => <MailAccordion data={data} />} />
                                            ) : (
                                                <div className={styles.noActivityMessage}>No events today.</div>
                                            )}
                                        </AccordionTab>
                                    </Accordion>
                                </div>
                            </TabPanel>

                            <TabPanel
                                headerTemplate={(e) => headerTemplate(e, 1)}
                            >
                                <div className={styles.new}>
                                    <Button label="New Note" onClick={() => setVisible(true)} />
                                    <Dialog header="New Note" visible={visible} modal={false} style={{ width: '60vw' }} onHide={() => { if (!visible) return; setVisible(false); }}>
                                        <div className={styles.notes}>
                                            <div className={styles.card}>
                                                <div className='flex flex-column gap-2 md:gap-3'>
                                                    <div className={styles.inputGroup}>
                                                        <InputText
                                                            className="w-full"
                                                            name="title"
                                                            value={newNote.title}
                                                            onChange={handleInputChange}
                                                            placeholder="Title"
                                                        />

                                                    </div>
                                                    <div className={styles.inputGroup}>
                                                        <InputText
                                                            name="summary"
                                                            value={newNote.summary}
                                                            onChange={handleInputChange}
                                                            placeholder="Summary"
                                                        />
                                                    </div>

                                                    <div className={styles.inputGroup}>
                                                        <Editor
                                                            name="content"
                                                            value={newNote.content}
                                                            onTextChange={handleContentChange}
                                                            placeholder="Write Content Here"
                                                            style={{ height: '120px' }}  // Adjust the height and width
                                                        />
                                                    </div>

                                                    <div className='flex justify-content-between'>
                                                        <div className='mt-3'>
                                                            <Checkbox
                                                                inputId="isPrivate"
                                                                name="isPrivate"
                                                                checked={newNote.isPrivate}
                                                                onChange={handleCheckboxChange}
                                                            />
                                                            <label htmlFor="isPrivate" style={{ paddingLeft: "5px" }}>Private</label>
                                                        </div>
                                                        <Button
                                                            label="Add Note"
                                                            // icon="pi pi-plus"
                                                            className='button'
                                                            onClick={addNoteHandler}
                                                        />
                                                    </div>

                                                </div>
                                            </div>
                                        </div>

                                    </Dialog>
                                </div>
                                {notesState.map((note, index) => (
                                    <Panel expandIcon="pi pi-chevron-down" collapseIcon="pi pi-chevron-up"  key={note._id} header={note.title} toggleable collapsed={collapsedPanels[index]} // Set initial state to collapsed
                                        onToggle={() => handlePanelToggle(index)} // Handle toggle state  
                                        className={styles.panel}>
                                        <p className={styles.summary}>{note.summary}</p>
                                        <div className="m-0" dangerouslySetInnerHTML={{ __html: note.content }} />
                                        {note.isPrivate && <p className="m-0"><em>Private</em></p>}
                                        <Button
                                            // label="Delete"
                                            icon="pi pi-trash"
                                            onClick={() => handleDeleteNote(note._id)}
                                        />
                                    </Panel>
                                ))}

                            </TabPanel>
                            <TabPanel
                                headerTemplate={(e) => headerTemplate(e, 2)}
                            >
                                <div className="Notes">
                                    <p>No Email Data Found.</p>
                                </div>
                            </TabPanel>
                            <TabPanel
                                headerTemplate={(e) => headerTemplate(e, 3)}
                            >
                                <div className={styles.activity}>
                                    <Accordion
                                        activeIndex={activeAccordionIndex}
                                        className="outer_accordion"
                                    >
                                        <AccordionTab header="Upcoming">
                                            {upcomingTasks.length > 0 ? (
                                                upcomingTasks?.map((item, i2) => {
                                                    const isUpcoming = new Date(item.dueDate) > new Date();
                                                    return (
                                                        <div className={styles.box} key={i2}>
                                                            <div className={styles.icon_section}>
                                                                <Image
                                                                    src="/assets/icons/spottedPatterns.svg"
                                                                    fill={true}
                                                                    alt="icon"
                                                                />
                                                            </div>
                                                            <div className={styles.account_section}>
                                                                <div className={styles.title}>{item.title}</div>
                                                                <div className={styles.account_and_assigned}>
                                                                    <div className={styles.round_box}>
                                                                        {item.createdBy.fullName[0]}
                                                                    </div>
                                                                    <div className={styles.name}>{item.createdBy.fullName}</div>
                                                                    <div className={styles.assigned_to}>
                                                                        Assigned To
                                                                        <div className={styles.round_box}>
                                                                            {item.assignee.fullName[0]
                                                                            }
                                                                        </div>
                                                                        <div className={styles.name}>{item.assignee.fullName}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className={styles.right_section}>
                                                                <div className={styles.time_section}>
                                                                    <div className={styles.date}>{formatDueDate(item.dueDate)}</div>
                                                                    <div className={`tag ${isUpcoming ? 'active' : 'closed'}`}>
                                                                        {isUpcoming ? 'upcoming' : 'closed'}
                                                                    </div>
                                                                </div>
                                                                <div className={styles.buttons_section}>
                                                                    <Button
                                                                        className="secondary"
                                                                        label="View Task"
                                                                        size="small"
                                                                        onClick={() => router.push(`/sales/tasks/${item._id}`)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className={styles.noTaskMessage}>No Upcoming Task.</div>
                                            )}
                                        </AccordionTab>
                                        <AccordionTab header="Today">
                                            {todayTasks.length > 0 ? (
                                                todayTasks?.map((item, i2) => {
                                                    const isPastDue = new Date(item.dueDate) < new Date();
                                                    return (
                                                        <div className={styles.box} key={i2}>
                                                            <div className={styles.icon_section}>
                                                                <Image
                                                                    src="/assets/icons/spottedPatterns.svg"
                                                                    fill={true}
                                                                    alt="icon"
                                                                />
                                                            </div>
                                                            <div className={styles.account_section}>
                                                                <div className={styles.title}>{item.title}</div>
                                                                <div className={styles.account_and_assigned}>
                                                                    <div className={styles.round_box}>
                                                                        {item.createdBy.fullName[0]
                                                                        }
                                                                    </div>
                                                                    <div className={styles.name}>{item.createdBy.fullName}</div>
                                                                    <div className={styles.assigned_to}>
                                                                        Assigned To
                                                                        <div className={styles.round_box}>
                                                                            {item.assignee.fullName[0]
                                                                            }
                                                                        </div>
                                                                        <div className={styles.name}>{item.assignee.fullName}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className={styles.right_section}>
                                                                <div className={styles.time_section}>
                                                                    <div className={styles.date}>{moment(item.createdAt).format('MMM DD YYYY, h:mm A')}</div>
                                                                    <div className={`tag ${isPastDue ? 'closed' : 'active'}`}>
                                                                        {isPastDue ? 'closed' : 'active'}
                                                                    </div>
                                                                </div>
                                                                <div className={styles.buttons_section}>
                                                                    <Button
                                                                        className="secondary"
                                                                        label="View Task"
                                                                        size="small"
                                                                        onClick={() => router.push(`/sales/tasks/${item._id}`)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className={styles.noTaskMessage}>No Task Available Today. </div>
                                            )}
                                        </AccordionTab>

                                    </Accordion>
                                </div>
                            </TabPanel>
                            <TabPanel
                                headerTemplate={(e) => headerTemplate(e, 4)}
                            >
                                <div className="Notes">
                                    <p>No Jobs Data Found.</p>
                                </div>
                            </TabPanel>
                      </TabView>
                </div>
              </div>
            </div>

{/* 
            {emailModalVisible && <EmailModal
                visible={emailModalVisible}
                setVisible={setEmailModalVisible}
            />}
            {changeStatusVisible && <ChangeStatusModal
                visible={changeStatusVisible}
                setVisible={setChangeStatusVisible}
            />}

            // {moveToVisible && <MoveToModal
            //     visible={moveToVisible}
            //     setVisible={setMoveToVisible}
            //     // decodedData={decodedData}
            // />} */
            }
            
            {moveToVisible && <MoveToModal
                visible={moveToVisible}
                setVisible={setMoveToVisible}
              contact={contactData}
/>} 
        </>
    );
}
