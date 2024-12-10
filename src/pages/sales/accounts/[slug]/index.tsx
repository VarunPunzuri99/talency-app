/* eslint-disable @typescript-eslint/no-unused-vars */
import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from '@/styles/shared/view_page.module.scss';
import { Button } from 'primereact/button';
import TitleBar from '@/components/TitleBar';
import { Timeline } from 'primereact/timeline';
import EmailModal from '@/components/Modals/Email';
import { addNote, deleteNote, editNote, filterWorkflowsByOrgId, getContactsOfAccount, getDynamicFields, getJobsByOrg, getNotesByAccountId, getOrgById, getTasksByAccountId, getTodayActivitiesOrg, getUpcomingActivitiesOrg, setToken, } from '@/services/api.service';
import MoveToModal from '@/components/Modals/MoveTo';
import { useRef, useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import MailAccordion from '@/components/MailAccordion';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import moment from 'moment';
import { formatDueDate } from '@/utils/constant';
import { Dialog } from 'primereact/dialog';
import { Editor } from 'primereact/editor';
import { Panel } from 'primereact/panel';
import ContactCard from '@/components/Card/ContactCard';
import JobCard from '@/components/Card/JobCard';
import React from 'react';
import DynamicField from '@/pages/settings/dynamic-fields';
import AccountsWorkflow from '@/components/Workflow/accountsWorkflow';

export const getServerSideProps = async ({ req, params: { slug } }) => {
    setToken(req);
    let accountDetails = null;
    let contactDetails = null;
    let jobs = null;
    let trackerData = null;
    try {
        accountDetails = await getOrgById(slug);
        contactDetails = await getContactsOfAccount(slug, 1, 10);
        jobs = await getJobsByOrg(slug, 1, 10);
        const todayActivityResponse = await getTodayActivitiesOrg(slug, 1, 10);
        const upcomingActivityResponse = await getUpcomingActivitiesOrg(slug, 1, 10);
        const notesResponse = await getNotesByAccountId(slug, 1, 10);
        const todayTasks = await getTasksByAccountId(slug, 'today', 1, 10);
        const upcomingTasks = await getTasksByAccountId(slug, 'upcoming', 1, 10);
        const workflowsData = await filterWorkflowsByOrgId(slug);

          // Fetch tracker data
          trackerData = await getDynamicFields();

        const todayActivity = todayActivityResponse || [];
        const upcomingActivity = upcomingActivityResponse || [];
        const notes = notesResponse || [];
        const todayTask = todayTasks || [];
        const upcomingTask = upcomingTasks || [];
        const workflows = workflowsData || [];

        return {
            props: {
                error: "",
                accountDetails,
                contactDetails,
                todayActivity,
                upcomingActivity,
                notes,
                todayTask,
                upcomingTask,
                jobs,
                trackerData,
                workflows,
                slug


            },
        };
    }
    catch (e) {
        return {
            props: {
                accountDetails,
                error: e.message,
                todayActivity: [],
                upcomingActivity: [],
                notes: [],
                todayTask: [],
                upcomingTask: [],
                jobs: [],
                contactDetails,
                trackerData: [],
                workflows: [],
                slug
            },
        };
    }
}

export default function AccountDetails({
    accountDetails,
    todayActivity = [],
    upcomingActivity = [],
    notes = [],
    todayTask = [],
    upcomingTask = [],
    contactDetails,
    jobs = [],
    trackerData = [],
    workflows: workflowData,
    slug
}) {
    const toast = useRef(null);
    const menuRef = useRef(null);
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const [moveToVisible, setMoveToVisible] = useState(false);
    const [emailModalVisible, setEmailModalVisible] = useState(false);
    const [activeAccordionIndex,] = useState(1);
    const [notesState, setNotesState] = useState(notes);
    const [isFavourite, setIsFavourite] = useState(true);
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState(contactDetails);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [trackersData, setTrackersData] = useState([]);
    const [workflows, setWorkflows] = useState(workflowData);
    const [fetchError, setFetchError] = useState('');

    const [, setSelectedJob] = useState(null);
    const [newNote, setNewNote] = useState({
        org: accountDetails?._id || '',
        title: '',
        summary: '',
        content: '',
        isPrivate: false,
        attachments: []
    });

    const fetchWorkflows = async () => {
        try {
            // Fetch job
            const workflowResponse: any = await filterWorkflowsByOrgId(slug);
            setWorkflows(workflowResponse);
          } catch (error) {
            setFetchError(error.message || 'An error occurred');
          }
    }

    console.log("workflows",workflows);
    console.log("orgId",slug);
    

    const handleMenuClick = (event, job, menu) => {
        setSelectedJob(job);
        menu.current.toggle(event);
    };

    // Initialize state for collapse status
    const [collapsedPanels, setCollapsedPanels] = useState<boolean[]>(notesState.map(() => true));

    // Toggle function to handle panel expand/collapse
    const handlePanelToggle = (index: number) => {
        const updatedCollapseState = [...collapsedPanels];
        updatedCollapseState[index] = !updatedCollapseState[index];
        setCollapsedPanels(updatedCollapseState);
    };

    const fetchTrackerData = async () => {
        try {
            const data = await getDynamicFields(); // Call the API
            setTrackersData(data); // Update state
        } catch (error) {
            console.error("Failed to fetch tracker data:", error);
            setTrackersData([]); // Fallback to empty data in case of error
        }
    };
    

    const todayEvents = todayActivity.map(activity => ({
        status: activity.title,
        date: new Date(activity.updatedAt).toLocaleString(),
        icon: 'pi pi-calendar',
        color: '#9C27B0',
        comment: activity.title.includes('org status') ? activity.comment?.contents || null : null,
        attachments: activity.title.includes('org status') ? activity.comment?.attachments ?? null : null
    }));

    const upComingEvents = upcomingActivity.map(upcoming => ({
        status: upcoming.title,
        date: new Date(upcoming.updatedAt).toLocaleString(),
        icon: 'pi pi-calendar',
        color: '#9C27B0',
        comment: upcoming.title.includes('org status') ? upcoming.comment?.contents || null : null,
        attachments: upcoming.title.includes('org status') ? upcoming.comment?.attachments ?? null : null
    }));


    const tabs = [
        { name: 'Activity', icon: 'pulse.svg', },
        { name: 'Notes', icon: 'Note.svg', },
        { name: 'Email', icon: 'Inbox.svg', },
        { name: 'Tasks', icon: 'Task.svg', },
        { name: 'Jobs', icon: 'New_Job.svg', },
        { name: 'contacts', icon: 'New_Contact.svg', },
        {
            name: 'Settings',
            icon: 'Briefcase Settings.svg',
            children: [
                { name: 'Tracker', icon: 'notification.svg' },
                { name: 'Workflow', icon: 'Tree.svg' }
            ]
        }
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

    const renderSettingsTab = () => (
        <div className={styles.settingsContainer}>
            <TabView className={styles.flexTabs}>
                <TabPanel header="Tracker" className='flexTabs_nested'>
                <DynamicField data={trackersData} />
                </TabPanel>
                <TabPanel header="Workflow" className='flexTabs_nested'>
                    <AccountsWorkflow workflows={workflows} orgId={slug} fetchWorkflows={fetchWorkflows} type={'accounts'} setWorkFlowVisible={undefined} getSelectedData={undefined}/>
                </TabPanel>
            </TabView>
        </div>
    );

    const watchTabChange = (e) => {
        switch (tabs[e].name) {
            case 'Settings': // Check if the "Settings" tab is clicked
            fetchTrackerData(); // Call the function to fetch tracker data
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

    // Save note (add or edit)
    const saveNoteHandler = async (e) => {
        e.preventDefault();
        try {
            if (editingNoteId) {
                // Editing existing note
                const response = await editNote(editingNoteId, newNote);
                setNotesState((prevNotes) => prevNotes.map(note => note._id === editingNoteId ? response : note));
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Note Updated', life: 1000 });
            } else {
                // Adding new note
                const response = await addNote(newNote);
                setNotesState((prevNotes) => [...prevNotes, response]);
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Note Added', life: 1000 });
            }

            // Reset form and close dialog
            resetForm();
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error while saving Note', life: 1000 });
        }
    };

    const resetForm = () => {
        setNewNote({
            org: accountDetails._id,
            title: '',
            summary: '',
            content: '',
            isPrivate: false,
            attachments: []
        });
        setEditingNoteId(null);
        setVisible(false);
    };

    const handleDeleteNote = async (noteId) => {
        try {
            await deleteNote(noteId);
            setNotesState((prevNotes) => prevNotes.filter(note => note._id !== noteId));
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Note deleted', life: 1000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error while deleting Note', life: 1000 });
        }
    };

    const handleContentChange = (e) => {
        setNewNote({
            ...newNote,
            content: e.htmlValue
        });
    };

    // Handle edit note button click
    const handleEditNote = (noteId) => {
        const noteToEdit = notesState.find(note => note._id === noteId);
        setNewNote(noteToEdit); // Pre-fill the form with existing note data
        setEditingNoteId(noteId); // Set editing mode
        setVisible(true); // Open the dialog
    };


    // Utility function to strip HTML tags
    const stripHtml = (html) => {
        if (!html) return "Not-Set";  // Return "Not-Set" if html is undefined or null
        return html.replace(/<\/?[^>]+(>|$)/g, " ").replace(/\s\s+/g, " ");
    };

    const handleGoBack = () => {
        router.push('/sales/accounts');
    };

    return (
        <>
            <Toast ref={toast} />
            <div className={styles.goBackArrow} onClick={handleGoBack} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <i className="pi pi-arrow-left" style={{ fontSize: '1rem', marginRight: '0.5rem' }}></i>
                <span>Back</span>
            </div>
            <TitleBar title={'Account'}>
                <Button
                    onClick={() => router.push(`/sales/accounts/add`)}
                    label="New Account"
                />
            </TitleBar>
            <div className='grid mt-2'>
                <div className="col-3">
                    <div className={styles.left_column}>
                        <div className={styles.card}>
                            <div className={styles.header}>
                                <div className={styles.name}>{accountDetails?.status}</div>
                                <div className={styles.favourite_section}>
                                    <i
                                        className={`pi heart ${isFavourite ? 'pi-heart-fill' : 'pi-heart'
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
                                    {accountDetails.title?.substring(0, 1)}
                                </div>
                                <div className={styles.name}>
                                    {accountDetails?.title}
                                </div>
                                <div className={styles.title}>
                                    {/* {data?.country}, {data?.state},{' '}
                                        {data.city} */}
                                </div>
                                <button
                                    className={styles.move_to_button}
                                // onClick={() => setMoveToVisible(true)}
                                >
                                    Jobs
                                </button>

                                <button
                                    className={styles.move_to_button}
                                    onClick={() => {
                                        // setMoveToVisible(true)
                                    }}
                                >
                                    Contact
                                </button>
                                <div className={styles.last_activity}>
                                    {isRecentActivity(accountDetails.updatedAt) ? (
                                        <span className={styles.greenDot} /> // Green dot for recent activity
                                    ) : accountDetails?.status !== 'active' ? (
                                        <span className={styles.redDot} /> // Red dot for non-active status
                                    ) : null}
                                    Last activity:{' '}
                                    {moment(accountDetails.updatedAt).format(
                                        'LL [at] LT',
                                    )}

                                </div>
                            </div>
                        </div>
                        <TabView className={styles.tabs}>
                            <TabPanel header="Contact Info">
                                <div className={styles.tabs_body}>
                                    <label>Website</label>
                                    {accountDetails?.websiteUrl || "Not-Set"}

                                    <label>Phone Number</label>
                                    {accountDetails?.contactDetails?.map((val, index) => (
                                        <span key={val.contactNumber || index}>
                                            {val.contactNumber || "Not-Set"}
                                        </span>
                                    ))}


                                    <label>Industry</label>
                                    {accountDetails?.industryOrDomain?.name || "Not-Set"}

                                    <label>Employees</label>
                                    {accountDetails?.headCount || "Not-Set"}

                                    <label>Description</label>
                                    {stripHtml(accountDetails?.description) || "Not-Set"}
                                </div>
                            </TabPanel>

                            <TabPanel header="Address Info">
                                <div className={styles.tabs_body}>
                                    <label>Address Type</label>
                                    {accountDetails?.contactAddress?.[0]?.addressType || "Not-Set"}
                                    <label> Address</label>
                                    {accountDetails?.contactAddress?.[0]?.apartment || "Not-Set"}
                                    <label>Country</label>
                                    {accountDetails?.country?.countryName}
                                    <label>State</label>
                                    {accountDetails?.state?.stateName}
                                    <label>City</label>
                                    {accountDetails?.contactAddress?.[0]?.city || "Not-Set"}
                                    <label>Pincode</label>
                                    {accountDetails?.contactAddress?.[0]?.postalCode || "Not-Set"}
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
                                    <Accordion
                                        activeIndex={activeAccordionIndex}
                                        className="outer_accordion"
                                    >
                                        <AccordionTab header="upcoming">
                                            {upComingEvents.length > 0 ? (
                                                <Timeline value={upComingEvents} content={(data) => <MailAccordion data={data} />} />
                                            ) : (
                                                <div className={styles.noActivityMessage}>No upcoming events.</div>
                                            )}
                                        </AccordionTab>
                                        <AccordionTab header="Today">
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
                                    <Button label={editingNoteId ? "Edit Note" : "New Note"} onClick={() => setVisible(true)} />
                                    <Dialog header={editingNoteId ? "Edit Note" : "New Note"} visible={visible} modal={false} style={{ width: '60vw' }} onHide={resetForm}>
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
                                                            placeholder="Write Content Here ...."
                                                            style={{ height: '120px' }}
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
                                                        <Button label={editingNoteId ? "Update Note" : "Add Note"} onClick={saveNoteHandler} />
                                                    </div>

                                                </div>
                                            </div>
                                        </div>

                                    </Dialog>
                                </div>
                                {notesState.length === 0 ? (
                                    <p>No Notes Available</p>
                                ) : (

                                    notesState.map((note, index) => (
                                        <Panel
                                            expandIcon="pi pi-chevron-down" collapseIcon="pi pi-chevron-up"
                                            key={note._id}
                                            header={note.title}
                                            toggleable
                                            collapsed={collapsedPanels[index]} // Set initial state to collapsed
                                            onToggle={() => handlePanelToggle(index)} // Handle toggle state  
                                            className={styles.panel}

                                        >
                                            <p className={styles.summary}>{note.summary}</p>
                                            <div className="m-0" dangerouslySetInnerHTML={{ __html: note.content }} />
                                            {note.isPrivate && <p className="m-0"><em>Private</em></p>}
                                            <div className='flex justify-content-end gap-2'>

                                                <Button
                                                    icon="pi pi-pencil"
                                                    onClick={() => handleEditNote(note._id)}
                                                />

                                                <Button
                                                    // label="Delete"
                                                    icon="pi pi-trash"
                                                    onClick={() => handleDeleteNote(note._id)}
                                                />
                                            </div>
                                        </Panel>
                                    ))
                                )}

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
                            >  <div className="Notes">
                                    <div className={styles.activity}>
                                        <Accordion
                                            activeIndex={activeAccordionIndex}
                                            className="outer_accordion"
                                        >
                                            <AccordionTab header="upcoming">
                                                {upcomingTask.length > 0 ? (
                                                    upcomingTask?.map((item, i2) => {
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
                                                                            {item.createdBy.firstName}
                                                                        </div>
                                                                        <div className={styles.name}>{item.createdBy.firstName}</div>
                                                                        <div className={styles.assigned_to}>
                                                                            Assigned To
                                                                            <div className={styles.round_box}>
                                                                                {item.assignee.firstName
                                                                                }
                                                                            </div>
                                                                            <div className={styles.name}>{item.assignee.firstName}</div>
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
                                                {todayTask.length > 0 ? (
                                                    todayTask?.map((item, i2) => {
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
                                                                            {item.createdBy.firstName
                                                                            }
                                                                        </div>
                                                                        <div className={styles.name}>{item.createdBy.firstName}</div>
                                                                        <div className={styles.assigned_to}>
                                                                            Assigned To
                                                                            <div className={styles.round_box}>
                                                                                {item.assignee.firstName
                                                                                }
                                                                            </div>
                                                                            <div className={styles.name}>{item.assignee.firstName}</div>
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
                                                    <div className={styles.noTaskMessage}>No Task available Today. </div>
                                                )}
                                            </AccordionTab>

                                        </Accordion>
                                    </div>
                                </div></TabPanel>
                            <TabPanel
                                headerTemplate={(e) => headerTemplate(e, 4)}
                            >

                                <div className={styles.jobs_lists}>
                                    <div className={styles.show_result}>Showing {jobs?.length} Jobs</div>
                                    <JobCard data={jobs} />
                                </div>

                            </TabPanel>
                            <TabPanel
                                headerTemplate={(e) => headerTemplate(e, 5)}
                            >
                                <div className="Notes">
                                    {data?.length > 0 ? (
                                        <ContactCard data={data} setData={setData} selectedIds={undefined} setSelectedIds={undefined} />
                                    ) : (
                                        <p>No Contacts Available</p>
                                    )}
                                </div>
                            </TabPanel>
                            <TabPanel headerTemplate={(e) => headerTemplate(e, 6)}>
                                {renderSettingsTab()}
                            </TabPanel>
                        </TabView>
                    </div>
                </div>
            </div>
            {emailModalVisible && <EmailModal
                visible={emailModalVisible}
                setVisible={setEmailModalVisible}
            />}
            {/* {changeStatusVisible && <ChangeStatusModal
                visible={changeStatusVisible}
                setVisible={setChangeStatusVisible}
            />} */}

            {moveToVisible && <MoveToModal
                visible={moveToVisible}
                setVisible={setMoveToVisible}
            />}
        </>
    );
}
