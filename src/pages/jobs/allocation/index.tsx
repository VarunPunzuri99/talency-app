import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import JobsListPage from '@/components/JobAllocation/JobsPage';
import styles from './index.module.scss';
import api, {
  assignJobToMember,
  assignJobToVendor,
  getAllVendorsOfOrg,
  getAllMemberAssignedJobs,
  getAllVendorAssignedJobs,
  setToken,
  getTeamMembersOfLead,
  getDepartmentMembers,
} from '@/services/api.service';
import { BusinessUnit, Org } from '@/services/types';
import InternalTeamDialog from '@/components/JobAllocation/AllocationDialog/InternalTeamsDialog';
import FreelancerDialog from '@/components/JobAllocation/AllocationDialog/FreelancerDialog';
import VendorDialog from '@/components/JobAllocation/AllocationDialog/VendorDialog';
import { AccordionItem, CustomAccordion } from '@/components/JobAllocation/CustomAccordion';
import { TreeSelect, TreeSelectChangeEvent, TreeSelectSelectionKeysType } from 'primereact/treeselect';
import HTMLTimeline from '@/components/JobAllocation/HTMLTimeline';

interface DecodedTokenDetails {
  org: Org;
  businessUnit: BusinessUnit;
}

interface SelectionState {
  checked: boolean;
  partialChecked: boolean;
}


export const getServerSideProps = async ({ req }) => {
  try {
    setToken(req);
    const cookie = req.cookies.talency_id_token;
    if (!cookie) {
      return {
        redirect: {
          destination: '/auth/login',
          permanent: false,
        },
      };
    }

    const decoded: DecodedTokenDetails = jwtDecode(cookie);
    const org = decoded.org;
    // const businessUnit = decoded.businessUnit;
    console.log('decoded', decoded);

    const [data, recruitmentTeam, allVendors] = await Promise.all([
      api.getAllJobs({ page: 1, limit: 10 }),
      api.getDepartmentTree(org._id, 'recruitment'),
      getAllVendorsOfOrg(org._id),
    ]);

    console.log('data', data);
    console.log('recruitmentTeam', recruitmentTeam);
    console.log('allVendors', allVendors);
    return {
      props: {
        jobs: data || [],
        orgId: org._id ?? null,
        recruitmentTeam: recruitmentTeam || [],
        allVendors: allVendors || [],
      },
    };
  } catch (error) {
    console.error('Error in fetching jobs data:', error.message);
    return {
      props: {
        jobs: [],
        recruitmentTeam: [],
        orgId: null,
        allVendors: [],
      },
    };
  }
};

export default function JobAllocation({
  jobs,
  recruitmentTeam,
  orgId,
  allVendors,
}) {
  console.log('jobs', jobs);
  console.log('recruitmentTeam', recruitmentTeam);
  console.log('allVendors', allVendors);

  const [activeComponent, setActiveComponent] = useState('internal');
  const [teamDialogVisible, setTeamDialogVisible] = useState(false);
  const [freelancerDialogVisible, setFreelancerDialogVisible] = useState(false);
  const [vendorDialogVisible, setVendorDialogVisible] = useState(false);
  const [, setActiveButton] = useState('internal'); // Set default if needed

  const [draggedJob, setDraggedJob] = useState(null);
  const [droppedMember, setDroppedMember] = useState(null);
  const [droppedTeamLead,] = useState(null);
  const [droppedVendor,] = useState(null);
  const [droppedFreelancer,] = useState(null);
  const [assignedVendorJobs, setAssignedVendorJobs] = useState({});
  const [, setVisibleVendorDialog] = useState(false);
  const [, setSelectedVendor] = useState(null);
  // const [selectedNodeKey, setSelectedNodeKey] = useState(null);
  const [selectedNodeKey, setSelectedNodeKey] = useState<TreeSelectSelectionKeysType | null>(null);
  // const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);
  // const [, setSelectedTeams] = useState<any[]>([]);
  const [membersMap, setTeamMembersMap] = useState<Record<string, any[]>>({});
  const [loadingTeams] = useState<Record<string, boolean>>({});

  const [selectedTeamsAndVendors, setSelectedTeamsAndVendors] = useState<any[]>([]);
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [, setConfirmedSelections] = useState<any[]>([]);

  useEffect(() => {
    console.log('Recruitment Team:', recruitmentTeam);
  }, [recruitmentTeam]);

  const handleActiveComponentAndButton = (value) => {
    setActiveButton(value);
    setActiveComponent(value);
  };

  // const handleTeamSelect = async (e) => {
  //   const selectedNode = e.node;
  //   const teamsToShow = [];

  //   // Push the selected node even if it's a leaf
  //   teamsToShow.push(selectedNode);

  //   // Fetch descendant teams if they exist
  //   const getDescendantTeams = (currentTeam) => {
  //     if (currentTeam.children?.length) {
  //       currentTeam.children.forEach(child => {
  //         teamsToShow.push(child);
  //         getDescendantTeams(child);
  //       });
  //     }
  //   };

  //   getDescendantTeams(selectedNode);

  //   setSelectedTeams(teamsToShow);
  //   setSelecteNode(selectedNode);

  //   const initialLoadingState = teamsToShow.reduce((acc, team) => {
  //     acc[team._id] = true;
  //     return acc;
  //   }, {});
  //   setLoadingTeams(initialLoadingState);

  //   const newMembersMap = {};
  //   await Promise.all(
  //     teamsToShow.map(async (team) => {
  //       try {
  //         const members = await getDepartmentMembers(team.org, team._id);
  //         newMembersMap[team._id] = members;
  //         setLoadingTeams(prev => ({ ...prev, [team._id]: false }));
  //       } catch (error) {
  //         console.error(`Error fetching members for team ${team.label}:`, error);
  //         newMembersMap[team._id] = [];
  //         setLoadingTeams(prev => ({ ...prev, [team._id]: false }));
  //       }
  //     })
  //   );

  //   setTeamMembersMap(newMembersMap);

  //   if (activeComponent !== 'internal') {
  //     setActiveComponent('internal');
  //     setActiveButton('internal');
  //   }
  // };

  const onDragEnd = async (result) => {
    console.log('Drag result:', result);
    const { draggableId, destination } = result;

    if (!destination) return;
    if (!jobs || !Array.isArray(jobs)) {
      console.error('Jobs is not properly initialized:', jobs);
      return;
    }

    // Find the job being dragged
    const movedJob = jobs.find(job => job._id === draggableId);
    if (!movedJob) {
      console.error('Could not find job:', draggableId);
      return;
    }

    const destId = destination.droppableId;

    if (destId.startsWith('member-')) {
      const memberId = destId.replace('member-', '');
      // Find the member in the membersMap
      const droppedMember = Object.values(membersMap)
        .flat()
        .find(member => member._id === memberId);

      if (!droppedMember) {
        toast.error('Member not found');
        return;
      }

      try {
        // Check if job is already assigned
        const jobAllocations = await getAllMemberAssignedJobs(memberId);
        const isJobAssigned = jobAllocations.some(
          allocation => allocation.job._id === movedJob._id
        );

        if (isJobAssigned) {
          toast.error(`This job is already assigned to ${droppedMember.firstName}`);
          return;
        }

        // Set state for dialog
        setDraggedJob(movedJob);
        setDroppedMember(droppedMember);
        setTeamDialogVisible(true);

      } catch (error) {
        console.error('Error checking job assignments:', error);
        toast.error('Failed to check job assignments');
      }
    } else if (destId.startsWith('lead-')) {
      const [leadId, teamId] = destId.replace('lead-', '').split('-');

      try {
        const teamMembersOfLead = await getTeamMembersOfLead(orgId, teamId, leadId);
        const allMembers = [leadId, ...teamMembersOfLead.map(m => m._id)];

        // Check if job is already assigned to lead or any team members
        const assignedJobsPromises = allMembers.map(memberId =>
          getAllMemberAssignedJobs(memberId)
        );

        const assignedJobsArray = await Promise.all(assignedJobsPromises);
        const allAssignedJobs = assignedJobsArray.flat();

        if (allAssignedJobs.some(job => job._id === movedJob._id)) {
          toast.error('This job is already assigned to this lead or a team member');
          return;
        }

        // Find the lead in membersMap
        const lead = Object.values(membersMap)
          .flat()
          .find(member => member._id === leadId);

        if (!lead) {
          toast.error('Team lead not found');
          return;
        }

        setDraggedJob(movedJob);
        setDroppedMember(lead);
        setTeamDialogVisible(true);

      } catch (error) {
        console.error('Error checking lead assignments:', error);
        toast.error('Failed to check lead assignments');
      }
    }
  };

  const handleTeamDialogSubmit = async (data) => {
    console.log('data', data);
    try {
      let response;

      if (activeComponent === 'internal' && droppedMember) {
        response = await assignJobToMember(data);
        if (response) {
          toast.success(
            `Job assigned to ${droppedMember.firstName} successfully`,
          );
        }
        console.log('Job assigned to member:', response);

        // TODO: Need team name also
      } else if (activeComponent === 'internal' && droppedTeamLead) {
        response = await assignJobToMember(data);
        if (response) {
          toast.success(
            `Job assigned to ${droppedMember.firstName} successfully`,
          );
        }
      }
    } catch (error) {
      toast.error('Failed to submit dialog data', error?.message);
      console.error('Failed to submit dialog data:', error.message);
    }
  };

  const handleVendorDialogSubmit = async (data) => {
    try {
      let response;
      if (activeComponent === 'vendor' && droppedVendor) {
        response = await assignJobToVendor(data.org, data);
        if (response) {
          toast.success(`Job assigned to ${droppedVendor.title} successfully`);
        }
        console.log('Job assigned to vendor:', response);
      }
    } catch (error) {
      toast.error('Failed to assign job to vendor', error?.message);
    }
  };

  const handleFreelancerDialogSubmit = async (data) => {
    try {
      let response;
      if (activeComponent === 'freelancer' && droppedFreelancer) {
        response = await assignJobToVendor(data.org, data);
        if (response) {
          toast.success(`Job assigned to ${droppedVendor.title} successfully`);
        }
        console.log('Job assigned to vendor:', response);
      }
    } catch (error) {
      toast.error('Failed to assign job to vendor', error?.message);
    }
  };

  useEffect(() => {
    const transformedData = [
      {
        key: 'recruitment',
        label: 'Recruitment Teams',
        data: 'recruitment',
        children: recruitmentTeam
      },
      {
        key: 'vendors',
        label: 'Vendors',
        data: 'vendors',
        children: allVendors.map(vendor => ({
          key: `vendor-${vendor._id}`,
          label: vendor.title,
          data: { ...vendor, type: 'vendor' }
        }))
      },
      {
        key: 'freelancers',
        label: 'Freelancers',
        data: 'freelancers',
        children: [] // Add freelancers when available
      }
    ];
    setRecruitmentTreeData(transformedData);
  }, [recruitmentTeam, allVendors]);

  useEffect(() => {
    const fetchAllAssignedJobs = async () => {
      const jobsByVendor = {};
      try {
        await Promise.all(
          allVendors.map(async (vendor) => {
            const jobs = await getAllVendorAssignedJobs(vendor._id);
            jobsByVendor[vendor._id] = jobs;
          }),
        );
      } catch (error) {
        console.error('Failed to fetch assigned jobs:', error);
      }
      setAssignedVendorJobs(jobsByVendor);
    };

    fetchAllAssignedJobs();
  }, [allVendors]);

  const handleVendorClick = (vendor) => {
    setSelectedVendor(vendor);
    setVisibleVendorDialog(true);
  };

  const renderVendorContent = () => {
    return (
      <div className={styles.vendorsContainer}>
        {allVendors.map((vendor) => (
          <div className={styles.vendorAccordionContainer} key={vendor._id}>
            <Droppable key={vendor._id} droppableId={`vendor-${vendor._id}`}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={styles.vendorCard}
                  onClick={() => handleVendorClick(vendor)}
                >
                  <div className={styles.vendorName}>{vendor.title}</div>
                  <div className={styles.jobIndicator}>
                    <div
                      style={{
                        width: `${(assignedVendorJobs[vendor._id]?.length || 0) * 20}px`,
                        height: '5px',
                        backgroundColor: '#007bff',
                      }}
                    />
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    );
  };

  // const renderFreelancerContent = () => {
  //   return (
  //     <Droppable droppableId="freelancer-page">
  //       {(provided, snapshot) => (
  //         <div
  //           ref={provided.innerRef}
  //           {...provided.droppableProps}
  //           className={`${styles.freelancerContainer} ${snapshot.isDraggingOver ? styles.draggingOver : ''
  //             }`}
  //         >
  //           <p className={styles.placeholderText}>Drop jobs here for freelancers</p>
  //           {provided.placeholder}
  //         </div>
  //       )}
  //     </Droppable>
  //   );
  // };

  const [recruitmentTreeData, setRecruitmentTreeData] = useState([]);

  const renderTeamAccordion = (team) => {
    console.log('team', team);
    const members = membersMap[team._id] || [];
    const teamLeads = members.filter((member) => member.roles.includes('team-lead'));
    const teamMembersGrouped = teamLeads.map((lead) => ({
      ...lead,
      members: members.filter(
        (member) =>
          member.roles.includes('team-member') &&
          member.reportingTo &&
          member.reportingTo._id === lead._id
      ),
    }));

    return (
      <div key={team._id} className={styles.teamContainer}>
        {loadingTeams[team._id] ? (
          <p className={styles.noMembers}>Loading team members...</p>
        ) : (
          <div className="w-full">
            {teamMembersGrouped && teamMembersGrouped.length > 0 ? (

              <CustomAccordion>
                {teamMembersGrouped.map((lead) => (
                  <div key={lead._id} className={styles.teamLeadContainer}>
                    <Droppable droppableId={`team-${team._id}`}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`${styles.leadDroppable} ${snapshot.isDraggingOver ? styles.draggingOver : ''}`}
                        >
                          <AccordionItem title={`${team.label} ( ${lead.firstName} ${lead.lastName} - TL )`}>
                            <div className={styles.memberAccordionContainer}>
                              {lead.members.length > 0 ? (
                                <CustomAccordion>
                                  {lead.members.map((member) => (
                                    <div key={member._id}>
                                      <Droppable droppableId={`member-${member._id}`}>
                                        {(memberProvided, snapshot) => (
                                          <div
                                            ref={memberProvided.innerRef}
                                            {...memberProvided.droppableProps}
                                            className={`${styles.memberDroppable} ${snapshot.isDraggingOver ? styles.draggingOver : ''}`}
                                          >
                                            <AccordionItem title={`${member.firstName} ${member.lastName}`}>
                                              <HTMLTimeline member={member} />
                                              {memberProvided.placeholder}
                                            </AccordionItem>
                                          </div>
                                        )}
                                      </Droppable>
                                    </div>
                                  ))}
                                </CustomAccordion>
                              ) : (
                                <p className={styles.noMembers}><strong>{(team.label)}:</strong>  No team members assigned.</p>
                              )}
                            </div>
                            {provided.placeholder}
                          </AccordionItem>
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </CustomAccordion>
            ) : (
              <p className={styles.noMembers}><strong>{(team.label)}:</strong>    No team members available.</p>
            )}
          </div>
        )}
      </div>
    );
  };


  const getCheckedKeys = (selectionState: TreeSelectSelectionKeysType) => {
    if (!selectionState || typeof selectionState === 'string') {
      return [];
    }

    // Type guard to check if the object has the correct structure
    const isSelectionStateObject = (obj: any): obj is Record<string, SelectionState> => {
      return typeof obj === 'object' && obj !== null && !Array.isArray(obj) &&
        Object.values(obj).every(value =>
          typeof value === 'object' &&
          'checked' in value &&
          'partialChecked' in value
        );
    };

    if (!isSelectionStateObject(selectionState)) {
      return [];
    }

    return Object.entries(selectionState)
      .filter(([_, state]) => state.checked && !state.partialChecked)
      .map(([key]) => key);
  };

  return (
    <div className={styles.parent}>
      <ToastContainer />
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex parent">
          {/* Job List Droppable */}
          <Droppable droppableId="availableJobs">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="sm:max-w-10rem md:max-w-25rem"
              >
                <JobsListPage jobs={jobs} />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <div className="flex ml-2 gap-2 w-9">
            <div className="border-1 border-solid border-200 border-round-xl w-12">
              <div className="flex gap-2 align-items-center m-2">
                <TreeSelect
                  value={selectedNodeKey}
                  onChange={(e: TreeSelectChangeEvent) => {
                    if (!e.value) {
                      setSelectedNodeKey(null);
                      setSelectedTeamsAndVendors([]);
                      setShowConfirmButton(false);
                      setConfirmedSelections([]);
                      return;
                    }

                    // Type guard to ensure correct type
                    const selectedValue = Array.isArray(e.value)
                      ? e.value[0]
                      : e.value;

                    setSelectedNodeKey(selectedValue as TreeSelectSelectionKeysType);
                    const checkedKeys = getCheckedKeys(selectedValue as TreeSelectSelectionKeysType);

                    const getNodesData = (keys: string[]) => {
                      const nodes = [];
                      keys.forEach(key => {
                        const findNodeRecursively = (searchKey: string, searchNodes: any[]) => {
                          for (const node of searchNodes) {
                            if (node.key === searchKey) {
                              nodes.push(node);
                              return node;
                            }
                            if (node.children?.length) {
                              const foundNode = findNodeRecursively(searchKey, node.children);
                              if (foundNode) return foundNode;
                            }
                          }
                          return null;
                        };

                        findNodeRecursively(key, recruitmentTreeData);
                      });
                      return nodes;
                    };

                    const selectedData = getNodesData(checkedKeys);
                    console.log('Selected data:', selectedData);

                    if (selectedData.length > 0) {
                      setSelectedTeamsAndVendors(selectedData);
                      setShowConfirmButton(true);
                    } else {
                      setSelectedTeamsAndVendors([]);
                      setShowConfirmButton(false);
                    }
                  }}
                  options={recruitmentTreeData}
                  filter
                  filterPlaceholder="Search"
                  className="w-9"
                  placeholder="Select Teams/Vendors"
                  showClear
                  display="chip"
                  selectionMode="checkbox"
                  metaKeySelection={false}
                />
                {showConfirmButton && (
                  <button
                    className="p-button p-button-primary font-bold"
                    onClick={async () => {
                      console.log('OK button clicked');

                      // Clear previous selections
                      setTeamMembersMap({});
                      setConfirmedSelections([]);

                      // Process each selected node
                      for (const node of selectedTeamsAndVendors) {
                        if (node.data?.type === 'vendor') {
                          // Handle single vendor
                          handleActiveComponentAndButton('vendor');
                          handleVendorClick(node.data);
                        } else if (node.data === 'vendors') {
                          // Skip the vendors parent node
                          continue;
                        } else {
                          // Handle team selection
                          try {
                            const members = await getDepartmentMembers(node.org._id, node._id);
                            setTeamMembersMap(prev => ({
                              ...prev,
                              [node._id]: members
                            }));
                            handleActiveComponentAndButton('internal');
                          } catch (error) {
                            console.error(`Error fetching members for team ${node.label}:`, error);
                            setTeamMembersMap(prev => ({
                              ...prev,
                              [node._id]: []
                            }));
                          }
                        }
                      }

                      setConfirmedSelections(selectedTeamsAndVendors);
                    }}
                  >
                    OK
                  </button>
                )}
              </div>

              {/* Render selected components */}
              {selectedTeamsAndVendors.length > 0 && (
                <div className="mt-4">
                  {/* Render Teams */}
                  {selectedTeamsAndVendors
                    .filter(node => node.data !== 'vendors' && !node.data?.type)
                    .map((node, index) => (
                      <div key={`team-${index}`} className="mb-4">
                        {renderTeamAccordion(node)}
                      </div>
                    ))}

                  {/* Render Vendors */}
                  {selectedTeamsAndVendors.some(node =>
                    node.data === 'vendors' || node.data?.type === 'vendor'
                  ) && (
                      <div className="mb-4">
                        {renderVendorContent()}
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </DragDropContext>

      <InternalTeamDialog
        visible={teamDialogVisible}
        onHide={() => setTeamDialogVisible(false)}
        onSubmit={handleTeamDialogSubmit}
        job={draggedJob}
        member={droppedMember}
      />
      <FreelancerDialog
        visible={freelancerDialogVisible}
        onHide={() => setFreelancerDialogVisible(false)}
        onSubmit={handleFreelancerDialogSubmit}
        job={draggedJob}
        freelancer={droppedFreelancer}
      />
      <VendorDialog
        visible={vendorDialogVisible}
        onHide={() => setVendorDialogVisible(false)}
        onSubmit={handleVendorDialogSubmit}
        job={draggedJob}
        vendor={droppedVendor}
      />
    </div>
  );
}
