import { useState, useRef } from 'react';
import styles from '@/styles/shared/view_page.module.scss';
import { useRouter } from 'next/router';
import MoveToModal from '@/components/Modals/MoveTo';
import { TabView, TabPanel } from 'primereact/tabview';
import Image from 'next/image';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Timeline } from 'primereact/timeline';
import { addNote, deleteNote, editNote, filterWorkflowsByOrgId, getContactsOfAccount, getDynamicFields, getJobsByOrg, getNotesByAccountId, getOrgById, getTasksByAccountId, getTodayActivitiesOrg, getUpcomingActivitiesOrg, setToken } from '@/services/api.service';
import TitleBar from '@/components/TitleBar';
import { Button } from 'primereact/button';
import MailAccordion from '@/components/MailAccordion';
import moment from 'moment';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { formatDueDate } from '@/utils/constant';
import { Toast } from 'primereact/toast';
import { Editor } from 'primereact/editor';
import { Panel } from 'primereact/panel';
import { Dialog } from 'primereact/dialog';
import ContactCard from '@/components/Card/ContactCard';
import JobCard from '@/components/Card/JobCard';
import React from 'react';
import DynamicField from '@/pages/settings/dynamic-fields';
import AccountsWorkflow from '@/components/Workflow/accountsWorkflow';


export const getServerSideProps = async ({ req, params: { slug } }) => {
    setToken(req);
    let clientDetails = null;
    let contactDetails = null;
    let jobs = null;
    let trackerData = null;
    try {
        clientDetails = await getOrgById(slug);
        contactDetails = await getContactsOfAccount(slug, 1, 10);
        jobs = await getJobsByOrg(slug, 1, 10);
        const todayActivityResponse = await getTodayActivitiesOrg(slug, 1, 10);
        const upcomingActivityResponse = await getUpcomingActivitiesOrg(slug, 1, 10);
        const notesResponse = await getNotesByAccountId(slug, 1, 10);
        const todayTasks = await getTasksByAccountId(slug, 'today', 1, 10);
        const upcomingTasks = await getTasksByAccountId(slug, 'upcoming', 1, 10);
        const workflowsData = await filterWorkflowsByOrgId(slug);


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
                clientDetails,
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
                clientDetails,
                contactDetails,
                error: e.message,
                todayActivity: [],
                upcomingActivity: [],
                jobs: [],
                notes: [],
                todayTask: [],
                upcomingTask: [],
                trackerData: [],
                workflows: [],
                slug
            },
        };
    }
}

export default function ContactDetails({
    clientDetails,
    todayActivity = [],
    upcomingActivity = [],
    notes = [],
    todayTask = [],
    upcomingTask = [],
    contactDetails,
    jobs = [],
    workflows: workflowData,
    slug
}) {
    const toast = useRef(null)
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const [moveToVisible, setMoveToVisible] = useState(false);
    const [notesState, setNotesState] = useState(notes);
    const [isFavourite, setIsFavourite] = useState(true);
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState(contactDetails);
    const [trackersData, setTrackersData] = useState([]);
    const [workflows, setWorkflows] = useState(workflowData);
    const [, setFetchError] = useState('');

    const [editingNoteId, setEditingNoteId] = useState(null);
    const [newNote, setNewNote] = useState({
        org: clientDetails?._id || '',
        title: '',
        summary: '',
        content: '',
        isPrivate: false,
        attachments: []
    });

    // Initialize state for collapse status
    const [collapsedPanels, setCollapsedPanels] = useState<boolean[]>(notesState.map(() => true));

    // Toggle function to handle panel expand/collapse
    const handlePanelToggle = (index: number) => {
        const updatedCollapseState = [...collapsedPanels];
        updatedCollapseState[index] = !updatedCollapseState[index];
        setCollapsedPanels(updatedCollapseState);
    };


    const todayEvents = todayActivity.map(activity => ({
        status: activity.title,
        date: new Date(activity.updatedAt).toLocaleString(),
        icon: 'pi pi-calendar',
        color: activity.titleColor || '#9C27B0',
        comment: activity.comment?.contents || null, // No need for conditional check anymore
        attachments: activity.comment?.attachments ?? null // Already processed
    }));

    const upComingEvents = upcomingActivity.map(upcoming => ({
        status: upcoming.title,
        date: new Date(upcoming.updatedAt).toLocaleString(),
        icon: 'pi pi-calendar',
        color: upcoming.titleColor || '#9C27B0',
        comment: upcoming.comment?.contents || null, // No need for conditional check anymore
        attachments: upcoming.comment?.attachments ?? null // Already processed
    }));

    const tabs = [
        { name: 'Activity', icon: 'pulse.svg', },
        { name: 'Notes', icon: 'Note.svg', },
        { name: 'Email', icon: 'Inbox.svg', },
        { name: 'Tasks', icon: 'Task.svg', },
        { name: 'Jobs', icon: 'New_Job.svg', },
        { name: 'contacts', icon: 'Contact.svg', },
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
                <TabPanel header="Tracker">
                <DynamicField data={trackersData} />
                </TabPanel>
                <TabPanel header="Workflow">
                    <AccountsWorkflow workflows={workflows} orgId={slug} fetchWorkflows={fetchWorkflows}  type={'accounts'} setWorkFlowVisible={undefined} getSelectedData={undefined}/>
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

    const handleContentChange = (e) => {
        setNewNote({
            ...newNote,
            content: e.htmlValue
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
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Error while saving Note: ${error.message}`,
                life: 1000
            });
        }
    };

    const resetForm = () => {
        setNewNote({
            org: clientDetails._id,
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
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Error while deleting Note: ${error.message}`,
                life: 1000
            });
        }
    };

    // Handle edit note button click
    const handleEditNote = (noteId) => {
        const noteToEdit = notesState.find(note => note._id === noteId);
        setNewNote(noteToEdit); // Pre-fill the form with existing note data
        setEditingNoteId(noteId); // Set editing mode
        setVisible(true); // Open the dialog
    };


    const handleGoBack = () => {
        router.push('/sales/clients');
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
    
    return (
        <>
            <Toast ref={toast} />
            <div className={styles.goBackArrow} onClick={handleGoBack} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <i className="pi pi-arrow-left" style={{ fontSize: '1rem', marginRight: '0.5rem' }}></i>
                <span>Back</span>
            </div>
            <TitleBar title={'Client'}>
                <Button
                    onClick={() => router.push(`/sales/clients/add`)}
                    label="New Client"
                />
            </TitleBar>
            <div className="grid mt-2">
                <div className="col-3">
                    <div className={styles.left_column}>
                        <div className={styles.card}>
                            <div className={styles.header}>
                                <div className={styles.name}>{clientDetails?.status}</div>
                                <div className={styles.favourite_section}>
                                    <i
                                        className={`pi heart ${isFavourite ? 'pi-heart-fill' : 'pi-heart'
                                            }`}
                                        onClick={() => setIsFavourite((prev) => !prev)}
                                    ></i>
                                </div>
                            </div>
                            <div className={styles.body}>
                                <div className={styles.name_box}>
                                    {clientDetails.title?.substring(0, 1)}
                                </div>
                                <div className={styles.name}>
                                    {clientDetails?.title}
                                </div>
                                <div className={styles.title}> {clientDetails?.legalName}</div>

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
                                    {isRecentActivity(clientDetails.updatedAt) ? (
                                        <span className={styles.greenDot} /> // Green dot for recent activity
                                    ) : clientDetails?.status !== 'active' ? (
                                        <span className={styles.redDot} /> // Red dot for non-active status
                                    ) : null}
                                    Last activity:{' '}
                                    {moment(clientDetails.updatedAt).format(
                                        'LL [at] LT',
                                    )}
                                </div>
                            </div>
                        </div>
                        <TabView className={styles.tabs}>
                            <TabPanel header="Contact Info">
                                <div className={styles.tabs_body}>
                                    <label>Email</label>
                                    {clientDetails?.contactDetails?.map((val, i) => (
                                        <span key={`email-${i}`}>{val.contactEmail || "Not-Set"}</span>
                                    ))}

                                    <label>Phone Number</label>
                                    {clientDetails?.contactDetails?.map((val, i) => (
                                        <span key={`phone-${i}`}>{val.contactNumber || "Not-Set"}</span>
                                    ))}

                                    {/* <label>Designation</label>
                                    {clientDetails?.designation} */}
                                    <label>Industry</label>
                                    {clientDetails?.industryOrDomain?.name}
                                    <label>Assigned To</label>
                                    {clientDetails?.assignTo?.firstName || "Not-Set"}
                                    {/* <label>Reporting To</label>
                                    {clientDetails?.reportingTo?.firstName + " " + clientDetails?.reportingTo?.lastName || "Not-Set"} */}
                                    <label>LinkedIn URL</label>
                                    {clientDetails?.linkedInUrl || "Not-Set"}
                                    {/* <label>Comments</label>
                                    Sometimes no, is dummy text used in laying out print. Sometimes
                                    no, is dummy text used in laying out print */}
                                </div>
                            </TabPanel>

                            <TabPanel header="Address Info">
                                <div className={styles.tabs_body}>
                                    <label>Address Type</label>
                                    {clientDetails?.contactAddress?.[0]?.addressType || "Not-Set"}
                                    <label> Address</label>
                                    {clientDetails?.contactAddress?.[0]?.apartment || "Not-Set"}
                                    {/* <label>Country</label>
                                        {clientDetails?.contactAddress?.[0]?.country.countryName}
                                        <label>State</label>
                                        {clientDetails?.contactAddress?.[0]?.state.stateName} */}
                                    <label>City</label>
                                    {clientDetails?.contactAddress?.[0]?.city || "Not-Set"}
                                    <label>Pincode</label>
                                    {clientDetails?.contactAddress?.[0]?.postalCode || "Not-Set"}
                                    {/* <label>Comments</label>
                                    Sometimes no, is dummy text used in laying out print. Sometimes
                                    no, is dummy text used in laying out print */}
                                </div>
                            </TabPanel>
                        </TabView>
                    </div>
                </div>
                <div className="col-9">
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
                            >
                                <div className={styles.activity}>
                                    <Accordion
                                        activeIndex={1}
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
                                                                        {item.createdBy.firstName[0]}
                                                                    </div>
                                                                    <div className={styles.name}>{item.createdBy.firstName}</div>
                                                                    <div className={styles.assigned_to}>
                                                                        Assigned To
                                                                        <div className={styles.round_box}>
                                                                            {item.assignee.firstName[0]
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
                                                                        {item.createdBy.firstName[0]
                                                                        }
                                                                    </div>
                                                                    <div className={styles.name}>{item.createdBy.firstName}</div>
                                                                    <div className={styles.assigned_to}>
                                                                        Assigned To
                                                                        <div className={styles.round_box}>
                                                                            {item.assignee.firstName[0]
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
                                                <div className={styles.noTaskMessage}>No Task Available Today. </div>
                                            )}
                                        </AccordionTab>

                                    </Accordion>
                                </div>
                            </TabPanel>
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


            {/* <EmailModal visible={emailModalVisible} setVisible={setEmailModalVisible} /> */}

            {/* <ChangeStatusModal visible={changeStatusVisible} setVisible={setChangeStatusVisible} /> */}

            <MoveToModal visible={moveToVisible} setVisible={setMoveToVisible} />

        </>
    );
}
