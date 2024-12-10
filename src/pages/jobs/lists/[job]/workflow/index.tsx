import { Button } from 'primereact/button';
import styles from './index.module.scss';
import ApplicantCard from '@/components/Card/ApplicantCard/Applicant';
import { useEffect, useRef, useState } from 'react';

import ApiCall, {

  generateTrackerEmailContent,
  getWorkflowById,
  setToken,

} from '@/services/api.service';

import DeleteModal from '@/components/Modals/DeleteModal';
import StageModal from '@/components/Modals/StageModal';
import { JobApplication, StageType } from '@/services/types';
import CompareCandidates from '@/components/Workflow/CompareCandidates';
import { Dropdown } from 'primereact/dropdown';
import Assessment from '@/components/Workflow/Assessment/Assessment';
import Offer from '@/components/Workflow/Offer';
import ScreenSelect from '@/components/Workflow/ScreenSelect/ScreenSelect';
import { Menu } from 'primereact/menu';
import { Tooltip } from 'primereact/tooltip';
import SearchCandidates from '@/components/Workflow/SearchCandidate/SearchCandidate';
import Fuse from 'fuse.js';
import EditWorkflow from '@/components/Workflow/EditWorkflow';
import { Sidebar } from 'primereact/sidebar';
import { toast, ToastContainer } from 'react-toastify';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Badge } from 'primereact/badge';
import ComposeModal from '@/components/Modals/Compose';
import TelephonicInterview from '@/components/Workflow/TelephonicInterview';
import VideoInterview from '@/components/Workflow/VideoInterview';
import InPersonInterview from '@/components/Workflow/InPersonInterview';
import { useRouter } from 'next/router';

export const getServerSideProps = async ({ req, params }) => {
  setToken(req);
  let jobData = null;
  let jobApplicationsData = null;
  let workflowData = null;

  try {
    if (params?.job) {
      jobData = await ApiCall.getJobById(params.job);
    }
    if (jobData?._id) {
      const [jobApplicationsResult, workflowResult] = await Promise.all([
        ApiCall.getJobApplicationsByJobId(jobData._id),
        getWorkflowById(jobData.workflow?._id),
      ]);
      jobApplicationsData = jobApplicationsResult;
      workflowData = workflowResult || {};
    }

    return {
      props: {
        jobData,
        jobApplicationsData,
        workflowData,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        error: error.message || 'An error occurred',
      },
    };
  }
};

interface Candidate {
  _id: string; // Unique identifier for the candidate
  fullName: string; // Full name of the candidate
  currentLocation: string; // Candidate's current location
  createdBy: {
    fullName: string; // Full name of the creator
  };
}

const JobWorkflow = ({ jobData, jobApplicationsData, workflowData, error, type }) => {
  if (error) {
    return (
      <div className="flex justify-content-center">
        <div>Error: {error}</div>
      </div>
    );
  }

  const router = useRouter();

  const [jobApplications, setCurrentJobApplications] = useState(jobApplicationsData);
  const [job, setCurrentJob] = useState<any>(jobData);
  const [workflow, setCurrentWorkflow] = useState<any>(workflowData);
  const [, setFetchError] = useState(null);

  const [fullView, setFullView] = useState(false);
  const [activeTabState, setActiveTabState] = useState([]);
  const [applicationsByStageName, setApplicationsByStageName] = useState({});
  const [visible, setVisible] = useState(false); // Modal visibility
  const [stageVisible, setStageVisible] = useState(false); // Modal visibility
  const [selectedRow, setSelectedRow] = useState(null); // Selected job application for modal
  const [modalType, setModalType] = useState(''); // Modal type (optional)
  const [assessmentVisible, setAssessmentVisible] = useState(false);
  const [screenSelectVisible, setScreenSelectVisible] = useState(false);
  const [telePhonicVisible, setTelePhonicVisible] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const [inPersonVisible, setInPersonVisible] = useState(false);
  const [isDropped, setIsDropped] = useState(false);


  const [offerVisible, setOfferVisible] = useState(false);
  const [movedApplicant, setmovedApplicant] = useState(null);

  const [searchCandidatesVisible] = useState(false);
  const [searchQuery] = useState('');
  // const [filteredApplications, setFilteredApplications] = useState(applicationsByStageName);
  const [, setMenuVisible] = useState(false);
  const menuRef = useRef(null);
  const [visibleRightEdit, setVisibleRightEdit] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [searchQueries, setSearchQueries] = useState({});
  const [selectedSortings, setSelectedSortings] = useState({});
  const [filteredApplications, setFilteredApplications] = useState({});
  const [currentStage, setCurrentStage] = useState('');
  const [isSortMenu, setIsSortMenu] = useState(false);
  const [searchInputVisible, setSearchInputVisible] = useState({});
  const [selectedApplicants, setSelectedApplicants] = useState<
    JobApplication[]
  >([]);
  const [showCompare, setShowCompare] = useState(false);
  const [selectedSort, setSelectedSort] = useState(null);
  const [showRejectButton, setShowRejectButton] = useState(false);
  const [groupBy, setGroupBy] = useState(false); // Default group by location
  const [groupByOption, setGroupByOption] = useState('Current Location'); // Default group by location
  const [groupedCandidates, setGroupedCandidates] = useState({}); // Store grouped candidates

  const stageTypeEnum: string[] = Object.values(StageType);

  const [activeTab, setActiveTab] = useState({ index: null, header: '' });

  const [emailVisible, setEmailVisible] = useState(false);
  const [emailConetnt, setEmailContent] = useState('');
  const [getStageId, setStageId] = useState('');


  const fetchJobData = async () => {
    try {
      // Fetch job
      const jobResponse: any = await ApiCall.getJobById(job._id);

      // Fetch job applications and workflow
      const [jobApplicationsResult, workflowResult] = await Promise.all([
        ApiCall.getJobApplicationsByJobId(jobResponse._id),
        getWorkflowById(jobResponse.workflow?._id),
      ]);

      setCurrentJob(jobResponse);
      setCurrentJobApplications(jobApplicationsResult);
      setCurrentWorkflow(workflowResult || {});
      setFetchError(null); // Clear any previous errors
    } catch (error) {
      setFetchError(error.message || 'An error occurred');
    }
  };

  useEffect(() => {
    if (workflow && workflow.stages) {
      // Initialize active tabs
      const initialActiveState = workflow.stages.map(() => false);
      setActiveTabState(initialActiveState);

      // Initialize applications by stage
      const initialState = {};
      workflow.stages.forEach((stage) => {
        initialState[stage.name] = [];
      });

      jobApplications?.forEach((app) => {
        const stageName = workflow.stages.find(
          (stage) => stage._id === app.stage,
        )?.name;
        if (stageName) {
          initialState[stageName] = [...initialState[stageName], app];
        }
      });

      setApplicationsByStageName(initialState);

      // Initialize search queries and sorting options
      const initialSearchQueries = {};
      const initialSortings = {};
      workflow.stages.forEach((stage) => {
        initialSearchQueries[stage.name] = '';
        initialSortings[stage.name] = null; // No sorting by default
      });

      setSearchQueries(initialSearchQueries);
      setSelectedSortings(initialSortings);
    }
  }, [workflow, jobApplications]);


  useEffect(() => {
    // This effect will update the filteredApplications based on the search query
    const updatedFilteredApplications = {};

    Object.keys(applicationsByStageName).forEach((stageName) => {
      const fuse = new Fuse(applicationsByStageName[stageName], fuseOptions);
      const result = searchQuery
        ? fuse.search(searchQuery).map((result) => result.item)
        : applicationsByStageName[stageName];
      updatedFilteredApplications[stageName] = result;
    });

    setFilteredApplications(updatedFilteredApplications);
  }, [searchQuery, applicationsByStageName]);

  useEffect(() => {
    const updatedFilteredApplications = {};

    Object.keys(applicationsByStageName).forEach((stageName) => {
      // Apply search
      const fuse = new Fuse(applicationsByStageName[stageName], fuseOptions);
      const searchedApplications = searchQueries[stageName]
        ? fuse.search(searchQueries[stageName]).map((result) => result.item)
        : applicationsByStageName[stageName];

      // Apply sorting
      const sortedApplications = applySorting(
        searchedApplications,
        selectedSortings[stageName],
      );

      updatedFilteredApplications[stageName] = sortedApplications;
    });

    setFilteredApplications(updatedFilteredApplications);
  }, [searchQueries, selectedSortings, applicationsByStageName]);

  const sortOptions = [
    { label: 'Sort by Notice Period', value: 'noticeAsc' },
    { label: 'Sort by Current CTC', value: 'currentAsc' },
    { label: 'Sort by Expected CTC', value: 'expectedAsc' },
    { label: 'Clear Filters', value: 'clear' },
  ];

  const fuseOptions = {
    keys: [
      'firstName',
      'lastName',
      'contactDetails.contactEmail',
      'contactDetails.contactNumber',
      'linkedInUrl',
      'workExperience.jobTitle',
      'workExperience.companyName',
    ],
    threshold: 0.5,
  };

  const menuItems = [
    {
      label: 'Current Location',
      command: () => {
        groupCandidates(applicationsByStageName[currentStage], 'currentLocation');
        setGroupByOption('Current Location')
      }
    },
    {
      label: 'Source',
      command: () => {
        groupCandidates(applicationsByStageName[currentStage], 'createdBy');
        setGroupByOption('Source')
      }
    },
  ];

  // Function to handle tab change event
  const onTabChange = (e) => {
    const index = e.index;
    setIsDropped(false)
    setSelectedApplicants([])
    // Get the corresponding key (header) based on the index from groupedCandidates
    const dynamicHeaders = Object.keys(groupedCandidates);
    const header = dynamicHeaders[index];

    // Set the active index and header
    setActiveTab({ index, header });
  };

  const groupCandidates = (
    candidates: Candidate[],
    criteria: 'currentLocation' | 'createdBy' = 'currentLocation',
  ) => {
    if (!candidates || candidates.length === 0) {
      console.warn('No candidates available for grouping');
      return;
    }

    setGroupBy(true);

    const grouped = new Map<string, Candidate[]>();

    candidates.forEach((candidate) => {
      // Determine the key based on the criteria
      const key =
        criteria === 'createdBy'
          ? candidate[criteria]?.fullName || 'Unknown'
          : candidate[criteria] || 'Unknown';

      // Initialize the group if it doesn't exist
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)?.push(candidate); // Push the candidate into the correct group
    });

    // Convert Map to a plain object if necessary
    const result = Object.fromEntries(grouped);

    // Filter out groups with only one candidate
    const filteredResult = Object.fromEntries(
      Object.entries(result).filter(([_, candidates]) => candidates.length > 1),
    );

    console.log('Grouped Candidates:', filteredResult); // Log the grouped candidates
    setGroupedCandidates(filteredResult); // Save the result in state for rendering
  };

  const bulkActions = [
    { label: 'Compare', value: 'compare' },
    { label: 'Delete', value: 'delete' },
    { label: 'Email', value: 'email' },
  ];

  const handleCompare = () => {
    setShowCompare(true);
  };

  const setActiveTabStateHandler = (index, stageName) => {
    setActiveTabState(activeTabState.map((_, i) => i === index));
    setCurrentStage(stageName);
    setGroupBy(false);
    setSelectedApplicants([])
    setIsDropped(false)
    setSearchInputVisible((prev) => ({
      ...prev,
      [stageName]: false, // Hide the search input for the deactivated stage
    }));
  };

  const deactivateTabHandler = (index, stageName) => {
    setIsDropped(false)
    
    // Toggle the full view state if it's active
    if (fullView) {
      setFullView(false);
    }

    setGroupBy(false);
    // Deactivate the tab and preserve the rest of the functionality
    setActiveTabState((prev) =>
      prev.map((state, i) => (i === index ? false : state)),
    );

    // Hide the search input for the deactivated stage
    setSearchInputVisible((prev) => ({
      ...prev,
      [stageName]: false, // Hide the search input for the deactivated stage
    }));
  };

  const VerticalText = ({ index, text, stageId, value }) => {
    return (
      <div
        draggable="true"
        onDragStart={(e) => handleDragStart(e, 'stage', false, stageId)}
        onDragOver={(e) => handleDragOver(e)}
        onDrop={(e) => handleDrop(e, value, stageId)}
        onClick={() => setActiveTabStateHandler(index, stageId)}
        className={styles.AccordionTabHeader}
      >
        <span>
          <i className="pi pi-angle-down"></i>
          <p>{text}</p>
        </span>
      </div>
    );
  };

  const AccordionSideTab = ({ className, index, text, stageId, value }) => {
    return (
      <div
        onDragStart={(e) => handleDragStart(e, 'stage', 'data', stageId)}
        onDragOver={(e) => handleDragOver(e)}
        onDrop={(e) => handleDrop(e, value, stageId)}
        onClick={() => setActiveTabStateHandler(index, stageId)}
        className={className}
        style={
          activeTabState[index]
            ? {
              border: '1px solid cyan',
              boxShadow: '0px 0px 1px 1px cyan inset',
            }
            : null
        }
      >
        <p>{text}</p>
      </div>
    );
  };

  const editWorkflowButton = () => {
    setSelectedWorkflow(workflow);
    setVisibleRightEdit(true);
  };

  const handleSearchChange = (stageName, query) => {
    setSearchQueries((prev) => ({
      ...prev,
      [stageName]: query,
    }));
  };

  const handleSortChange = (stageName, sortOption) => {
    if (sortOption === 'clear') {
      setSelectedSortings((prev) => ({
        ...prev,
        [stageName]: null, // Reset sorting for this stage
      }));
    } else {
      setSelectedSortings((prev) => ({
        ...prev,
        [stageName]: sortOption, // Set the selected sort option
      }));
    }
    setMenuVisible(false);
  };

  const applySorting = (applications, sortOption) => {
    const sortedList = [...applications];

    switch (sortOption) {
      case 'noticeAsc':
        sortedList.sort((a, b) => a.noticePeriodDays - b.noticePeriodDays);
        break;
      case 'currentAsc':
        sortedList.sort((a, b) => a.currentCTC - b.currentCTC);
        break;
      case 'expectedAsc':
        sortedList.sort((a, b) => a.expectedCTC - b.expectedCTC);
        break;
      default:
        break;
    }

    return sortedList;
  };

  const sortMenuItems = sortOptions.map((option) => ({
    label: option.label,
    command: () => {
      handleSortChange(currentStage, option.value);
    },
  }));

  const combinedMenuItems = isSortMenu ? sortMenuItems : menuItems;

  // Moving candidate between stages
  const handleDragStart = (e, type, data, sourceStageName) => {
    setShowRejectButton(true);
    e.dataTransfer.setData('text/plain', type);
    if (type === 'candidateCard') {
      const updatedData = { ...data, from: sourceStageName };
      const serializedData = JSON.stringify(updatedData);
      e.dataTransfer.setData('application/type', serializedData);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();

  };

  const handleDrop = async (e, value, to) => {
    setShowRejectButton(false);
    setIsDropped(true)
    e.preventDefault();
    const target = e.target;
    console.log(target)

    if (!target) {
      console.log('Dropped on a non-droppable area');
      return;  // Do not proceed if it's a non-droppable area
    }

    const itemType = e.dataTransfer.getData('text/plain');
    if (itemType === 'candidateCard') {
      const droppedData = e.dataTransfer.getData('application/type');
      const itemData = JSON.parse(droppedData);
      const takenFrom = itemData.from;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { from, ...updatedItemData } = itemData;
      const alreadyExists = applicationsByStageName[to].some(
        (val) => val._id === updatedItemData._id,
      );
      if (alreadyExists) return;
      const removeItem = applicationsByStageName[takenFrom].filter(
        (val) => val._id !== updatedItemData._id,
      );

      // Handle moving candidates from group by 

      setApplicationsByStageName((prevState) => ({
        ...prevState,
        [takenFrom]: removeItem,
        [to]: [updatedItemData, ...value],
      }));

      // if (groupBy && groupByOption) {
      //   // Find and remove the candidate from the `groupedCandidates` structure
      //   let removeItem;
      //   if (groupByOption === 'Current Location') {
      //     Object.entries(groupedCandidates).forEach(([group, candidates]) => {
      //       if (group === activeTab.header) {
      //         removeItem = groupedCandidates[activeTab.header].filter(
      //           (val) => val._id !== updatedItemData._id
      //         );
      //       }
      //     });
      //   }

      //   // Check if the candidate already exists in the "to" group
      //   const alreadyExistsInGroup = groupedCandidates[activeTab.header]?.some(
      //     (val) => val._id === updatedItemData._id,
      //   );
      //   if (alreadyExistsInGroup) return;

      //   // Update `groupedCandidates` state
      //   setGroupedCandidates((prevState) => ({
      //     ...prevState,
      //     [activeTab.header]: removeItem, // Remove candidate from current group
      //     // [to]: [updatedItemData, ...(prevState[to] || [])], // Add to the new group
      //   }));
      // }


      // Get the stageId from the stageName
      const stageId = getStageIdByName(to);
      setStageId(stageId)

      // Call the function to update the stage and refresh data
      // await updateJobApplicationStage(updatedItemData._id, stageId);  
      const stage = workflow.stages.find((stage) => stage.name === to);
      if (stage) {
        const stageType = stage.type;
        setmovedApplicant(updatedItemData);

        switch (stageType) {
          case StageType.WORKFLOW_PHONE_SCREENING:
            await updateJobApplicationStage(updatedItemData._id, stageId);
            break;
          case StageType.WORKFLOW_SOURCING:
            await updateJobApplicationStage(updatedItemData._id, stageId);
            break;
          case StageType.WORKFLOW_ASSESSMENT:
            setAssessmentVisible(true);
            break;
          case StageType.WORKFLOW_INTERVIEW_TELEPHONIC:
            setTelePhonicVisible(true);
            break;
          case StageType.WORKFLOW_INTERVIEW_VIDEO:
            setVideoVisible(true);
            break;
          case StageType.WORKFLOW_INTERVIEW_IN_PERSON:
            setInPersonVisible(true);
            break;
          case StageType.WORKFLOW_OFFER:
            setOfferVisible(true);
            break;
          case StageType.WORKFLOW_SCREENING:
            await updateJobApplicationStage(updatedItemData._id, stageId);
            setScreenSelectVisible(true);
            break;
          default:
            break;
        }
      }
    }


    fetchJobData()
  };

  const getStageIdByName = (stageName) => {
    const stage = workflow.stages.find((stage) => stage.name === stageName);
    return stage ? stage._id : null;
  };

  const updateJobApplicationStage = async (jobApplicationId, newStageId) => {
    try {
      await ApiCall.updateStageOfJobApplication(jobApplicationId, newStageId);
    } catch (error) {
      toast.error('Error updating job application stage:', error);
    }
  };

  const handleCancelDrop = (e) => {
    setShowRejectButton(false);
    e.preventDefault();
    const itemType = e.dataTransfer.getData('text/plain');
    if (itemType === 'candidateCard') {
      const droppedData = e.dataTransfer.getData('application/type');
      const itemData = JSON.parse(droppedData);
      setSelectedRow(itemData);
      setModalType('Reject');
      setVisible(true);
    }
  };

  const handleSelectApplicant = (applicant: JobApplication) => {
    setSelectedApplicants([...selectedApplicants, applicant]);
  };

  const handleDeselectApplicant = (applicant: JobApplication) => {
    setSelectedApplicants(
      selectedApplicants.filter((a) => a._id !== applicant._id),
    );
  };

  const handleBulkAction = async (e) => {
    const action = e.value;
    setSelectedSort(e.value);
    switch (action) {
      case 'compare':
        handleCompare();
        break;
      case 'delete':
        console.log('Delete action selected');
        break;
      case 'email':
        {
          const applicationIds = selectedApplicants.map(applicant => applicant._id);
          console.log(applicationIds);

          if (applicationIds.length === 0) {
            toast.error("Please select at least one applicant to send tracker email.");
            return;
          }

          try {
            const response = await generateTrackerEmailContent({
              jobApplicationIds: applicationIds
            });
            console.log(response);
            setEmailContent(response);
            setEmailVisible(true);
            console.log('Email action selected');
          } catch (error) {
            console.error("Error generating tracker email content:", error);
            toast.error("Failed to generate email content. Please try again.");
          }
          break;
        }
      default:
        break;
    }
  };

  const handleSelectAll = (stageName) => {
    const allApplicantsInStage = applicationsByStageName[stageName] || [];
    const allSelected = allApplicantsInStage.every((applicant) =>
      selectedApplicants.some((selected) => selected._id === applicant._id),
    );

    if (allSelected) {
      // Deselect all if all are already selected
      setSelectedApplicants((prevSelected) =>
        prevSelected.filter(
          (applicant) =>
            !allApplicantsInStage.some(
              (stageApplicant) => stageApplicant._id === applicant._id,
            ),
        ),
      );
    } else {
      // Select all if not all are selected
      setSelectedApplicants((prevSelected) => {
        const selectedIds = prevSelected.map((applicant) => applicant._id);
        const newSelections = allApplicantsInStage.filter(
          (applicant) => !selectedIds.includes(applicant._id),
        );
        return [...prevSelected, ...newSelections];
      });
    }
  };

  const isAllSelected = (stageName) => {
    const allApplicantsInStage = applicationsByStageName[stageName] || [];
    if (allApplicantsInStage.length === 0) return false;
    return allApplicantsInStage.every((applicant) =>
      selectedApplicants.some((selected) => selected._id === applicant._id),
    );
  };

  const getSelectButtonLabel = (stageName) => {
    const allApplicantsInStage = applicationsByStageName[stageName] || [];
    if (allApplicantsInStage.length === 0) return 'Select All'; // No applicants in the stage
    return isAllSelected(stageName) ? 'Deselect All' : 'Select All';
  };

  // const stopBackgroundClick = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  // };

  const handleGoBack = () => {
    router.push(`/jobs/lists`);
  };

  return (
    <>
      <ToastContainer />
      <div className={styles.titleBarContainer} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', cursor: 'pointer' }} onClick={handleGoBack}>
        <i className="pi pi-arrow-left" style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}></i>
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Workspace</span>
      </div>
      <Menu
        model={combinedMenuItems}
        popup
        ref={menuRef}
        id="popup_menu_combined"
        popupAlignment="right"
        onHide={() => setMenuVisible(false)}
      />
      <div className={styles.workspace}>
        <header>
          <div className="flex ">
            <h4>{job?.title}</h4>
            <span className="mt-1">&nbsp;( {job?.jobCode} )</span>
          </div>
          {showRejectButton && (
            <div className={styles.fullView_tab_item}>
              <Button
                icon="pi pi-trash text-red-500"
                rounded
                severity="danger"
                aria-label="Cancel"
                size="large"
                style={{
                  height: '100px',
                  width: '100px',
                  background: '#FFAD97',
                  borderColor: '#FFAD97',
                }}
                onDrop={handleCancelDrop}
                onDragOver={handleDragOver}
              />
            </div>
          )}
          <Button
            text
            icon="pi pi-pencil"
            rounded
            onClick={() => {
              editWorkflowButton();
            }}
            className={styles.editWorkflowButton}
          />
        </header>
        <div className={styles.main}>
          <div className={styles.mainLeftSection}>
            {workflow?.stages?.map((stage, index) => (
              <div
                key={stage?._id}
                // style={
                //   !activeTabState?.[index] && fullView
                //     ? { display: 'none' }
                //     : {}
                // }
                style={{
                  ...(!activeTabState?.[index] && fullView ? { display: 'none' } : {}),
                  ...(isDropped && stage?._id == getStageId ? { background: '#efefef' } : { color: '' }),
                }}
                className={`${styles.AccordionTab} ${activeTabState[index] ? styles.active : ''
                  } ${activeTabState[index] && fullView ? styles.fullView : ''}`}
                  // style={{background: isDropped ? '#d80000' : ''}}
              >
                {/* VerticalText is rendered when the tab is not active and not in full view */}
                {!activeTabState[index] && !fullView && (
                  <VerticalText
                    index={index}
                    text={stage.name}
                    stageId={stage.name}
                    value={applicationsByStageName[stage.name]}
                  />
                )}
                {/* The tab content is rendered when the tab is active */}
                {activeTabState[index] && (
                  <div className={styles.tabContent}>
                    <div
                      className={styles.tabContentHeader}
                      style={{ flex: '1 0 100%' }}
                    >
                      <div
                        className="flex gap-2 w-5 align-items-center pr-2"
                        onClick={() => deactivateTabHandler(index, stage.name)}
                      >
                        <i className="pi pi-angle-right"></i>
                        <h4
                          id={`tooltip_${stage.id}`}
                          className={styles.truncate}
                        >
                          {stage.name}
                        </h4>
                        <Tooltip
                          position="top"
                          target={`#tooltip_${stage.id}`}
                          content={stage.name}
                        />
                      </div>
                      <div className="flex w-full justify-content-end gap-3 align-items-center">
                        {!searchInputVisible[stage.name] && (
                          <i
                            className="pi pi-search"
                            onClick={() =>
                              setSearchInputVisible((prevState) => ({
                                ...prevState,
                                [stage.name]: true,
                              }))
                            }
                          />
                        )}

                        {searchInputVisible[stage.name] && (
                          <input
                            type="text"
                            value={searchQueries[stage.name] || ''}
                            onChange={(e) =>
                              handleSearchChange(stage.name, e.target.value)
                            }
                            placeholder="Search candidates..."
                            className={styles['search-input-bottom-border']}
                          />
                        )}

                        <div className="flex align-items-center relative h-1rem w-1rem">
                          {selectedSortings[stage.name] && (
                            <span className={styles.sortEnabled} />
                          )}
                          <i
                            className="pi pi-sort-alt"
                            onClick={(event) => {
                              setIsSortMenu(true);
                              menuRef.current?.toggle(event);
                            }}
                          />
                        </div>
                        <i
                          className="pi pi-plus"
                          onClick={(event) => {
                            setIsSortMenu(false); // Close any other menu or state
                            menuRef.current?.toggle(event); // Open the menu on click
                          }}
                        />
                        <i
                          onClick={() => setFullView((pre) => !pre)}
                          className={`pi pi-window-maximize ${fullView ? ' text-blue-400' : ''
                            }`}
                        ></i>
                      </div>
                    </div>
                    <div className="flex pt-1">
                      <Button
                        severity="secondary"
                        outlined
                        className="ml-2 mr-2"
                        onClick={() => handleSelectAll(stage.name)}
                      >
                        {getSelectButtonLabel(stage.name)}
                      </Button>
                      <Dropdown
                        options={bulkActions}
                        value={selectedSort}
                        className=""
                        placeholder="Bulk Actions"
                        disabled={selectedApplicants && selectedApplicants.length == 0}
                        onChange={(e) => handleBulkAction(e)}
                      />
                    </div>
                    <div className={styles.tabContent_Data}>
                      {filteredApplications[stage.name]?.length > 0 ? (
                        !groupBy ? (
                          <ApplicantCard
                            key={stage._id}
                            stageId={stage.name}
                            jobApplications={filteredApplications[stage.name]} // Use filtered applications here
                            jobInfo={job}
                            handleDragOver={handleDragOver}
                            handleDrop={handleDrop}
                            handleDragStart={handleDragStart}
                            selectedApplicants={selectedApplicants}
                            onSelectApplicant={handleSelectApplicant}
                            onDeselectApplicant={handleDeselectApplicant}
                            onCompare={handleCompare}
                          />
                        ) :
                          Object.keys(groupedCandidates).length > 0 ? (
                            <Accordion activeIndex={activeTab.index} onTabChange={onTabChange} >
                              {Object.entries(groupedCandidates).map(
                                ([key, candidates]) => (
                                  <AccordionTab
                                    key={key}
                                    
                                    header={
                                      <span className="flex align-items-center gap-2 w-full" >
                                        <span className="font-bold white-space-nowrap" >
                                          {key}
                                        </span>
                                        <Badge value={(candidates as JobApplication[]).length} className="ml-auto" />
                                      </span>
                                    }
                                  >
                                    <ApplicantCard
                                      key={key}
                                      stageId={stage.name}
                                      jobApplications={
                                        candidates as JobApplication[]
                                      } // Wrap in array if needed
                                      jobInfo={job}
                                      handleDragOver={handleDragOver}
                                      handleDrop={handleDrop}
                                      handleDragStart={handleDragStart}
                                      selectedApplicants={selectedApplicants}
                                      onSelectApplicant={handleSelectApplicant}
                                      onDeselectApplicant={
                                        handleDeselectApplicant
                                      }
                                      onCompare={handleCompare}
                                    />
                                  </AccordionTab>
                                ),
                              )}
                            </Accordion>
                          ) : (
                            // No candidates message for group by case
                            <div className={styles.noCandidatesMessage}>
                              No candidates are available for grouping by {groupByOption} in this stage.
                            </div>
                          )
                      ) : (
                        // No candidates message for filtered applications
                        <div className={styles.noCandidatesMessage}>
                          There are no candidates to display.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className={styles.mainRightSection}>
            {fullView && (
              <div className="flex flex-column w-full">
                {workflow?.stages?.map((stage, index) => (
                  <AccordionSideTab
                    key={stage?._id}
                    className={styles.fullView_tab_item}
                    index={index}
                    text={stage.name}
                    stageId={stage.name}
                    value={applicationsByStageName[stage.name]}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {showCompare && (
        <CompareCandidates
          visible={showCompare}
          setVisible={setShowCompare}
          candidates={selectedApplicants}
          job={job}
          setSelectedSort={setSelectedSort}
          setSelectedApplicants={setSelectedApplicants}
        />
      )}
      <DeleteModal
        visible={visible}
        item={selectedRow}
        setVisible={setVisible}
        title={'Are you sure to reject candidate?'}
        modalType={modalType}
      />
      <StageModal
        workflow={workflow}
        visible={stageVisible}
        setVisible={setStageVisible}
        StagTypeEnum={stageTypeEnum}
      />
      {assessmentVisible && (
        <Assessment
          visible={assessmentVisible}
          setVisible={setAssessmentVisible}
          applicantData={movedApplicant}
          getStageId={getStageId}
          fetchJobData={fetchJobData}
          setOfferVisible={setAssessmentVisible}
        />
      )}
      {screenSelectVisible && (
        <ScreenSelect
          visible={screenSelectVisible}
          setVisible={setScreenSelectVisible}
          applicantData={movedApplicant}
        />
      )}
      {telePhonicVisible && (
        <TelephonicInterview
          visible={telePhonicVisible}
          setVisible={setTelePhonicVisible}
          applicantData={movedApplicant}
        />
      )}
      {videoVisible && (
        <VideoInterview
          visible={videoVisible}
          setVisible={setVideoVisible}
          applicantData={movedApplicant}
          getStageId={getStageId}
          fetchJobData={fetchJobData}
          setOfferVisible={setVideoVisible}
        />
      )}
      {inPersonVisible && (
        <InPersonInterview
          visible={inPersonVisible}
          setVisible={setInPersonVisible}
          applicantData={movedApplicant}

        />
      )}
      {offerVisible && (
        <Offer
          visible={offerVisible}
          setVisible={setOfferVisible}
          applicantData={movedApplicant}
          getStageId={getStageId}
          fetchJobData={fetchJobData}
          setOfferVisible={setOfferVisible}

        />
      )}
      {searchCandidatesVisible && (
        <SearchCandidates
        // visible={offerVisible}
        // setVisible={setOfferVisible}
        // applicantData={movedApplicant}
        />
      )}

      <ComposeModal visible={emailVisible} setVisible={setEmailVisible} emailContent={emailConetnt} jobApplicationEmail={undefined} applicantData={undefined} getStageId={undefined} fetchJobData={undefined} setOfferVisible={undefined} />
      <Sidebar
        visible={visibleRightEdit}
        position="right"
        className={styles.sidebar}
        onHide={() => setVisibleRightEdit(false)}
      >
        {selectedWorkflow && (
          <EditWorkflow
            workflow={selectedWorkflow}
            edit={true}  type={type}        // onClose={() => setVisibleRightEdit(false)}
          />
        )}
      </Sidebar>
    </>
  );
};

export default JobWorkflow;
