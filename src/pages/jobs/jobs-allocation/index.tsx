import { jwtDecode } from 'jwt-decode';
import { useEffect, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import styles from './index.module.scss';
import api, {
    getAllVendorsOfOrg,
    getAllMemberAssignedJobs,
    setToken,
    getDepartmentMembers,
    createAssigneeJobAllocation,
    getJobAllocation
} from '@/services/api.service';
import { BusinessUnit, Org } from '@/services/types';
import { AccordionItem, CustomAccordion } from '@/components/JobAllocation/CustomAccordion';
import { TreeSelect } from 'primereact/treeselect';
import HTMLTimeline from '@/components/JobAllocation/HTMLTimeline';
import JobsListPageOfAssignment from '@/components/JobAllocation/JobsListPageTwo';
import { Button } from 'primereact/button';

interface DecodedTokenDetails {
    org: Org;
    businessUnit: BusinessUnit;
}
interface TeamMember {
    _id: string;
    firstName: string;
    lastName: string;
    roles: string[];
    reportingTo?: {
        _id: string;
    };
}

interface Team {
    _id: string;
    label: string;
}

interface TeamLead extends TeamMember {
    members: TeamMember[];
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

        const [data, recruitmentTeam, allVendors] = await Promise.all([
            api.getAllJobs({ page: 1, limit: 10 }),
            api.getDepartmentTree(org._id, 'recruitment'),
            getAllVendorsOfOrg(org._id),
        ]);

        const [jobsCount, departments] = await Promise.all([
            api.getJobsCount(),
            api.getAllDepartments({ limit: 100 })
        ]);
        const totalRecords = jobsCount || 0;
        // console.log(data);
        const locations = await api.getJobLocations();

        return {
            props: {
                jobs: data || [],
                orgId: org._id ?? null,
                // businessUnitId: businessUnit._id ?? null,
                recruitmentTeam: recruitmentTeam || [],
                allVendors: allVendors || [],
                totalRecords: totalRecords,
                departments,
                locations: locations || [],
            },
        };
    } catch (error) {
        console.error('Error in fetching jobs data:', error.message);
        return {
            props: {
                jobs: [],
                recruitmentTeam: [],
                orgId: null,
                businessUnitId: null,
                allVendors: [],
            },
        };
    }
};

export default function JobsAssignment({
    jobs: initialJobs,
    recruitmentTeam: recruitmentTeamData,
    orgId,
    allVendors : allVendorsData,
    locations,
    departments,
}) {
    console.log("allvendors", allVendorsData)

    const [activeComponent, setActiveComponent] = useState('internal');
    const [, setDraggedJob] = useState(null);
    const [droppedMember, setDroppedMember] = useState(null);
    // const [, setSource] = useState(null);
    // const [, setDestination] = useState(null);
    const [droppedTeamLead,] = useState(null);
    const [, setDroppedVendor] = useState(null);
    // const [droppedFreelancer,] = useState(null);
    const [assignedVendorJobs, ] = useState({});
    const [, setVisibleVendorDialog] = useState(false);
    const [, setSelectedVendor] = useState(null);
    const [, setSelectedNodeKey] = useState(null);
    const [selectedTeams, setSelectedTeams] = useState<any[]>([]);
    const [membersMap, setTeamMembersMap] = useState<Record<string, any>>({});
    const [loadingTeams, setLoadingTeams] = useState<Record<string, boolean>>({});
    const [selecteNode, setSelecteNode] = useState(null);
    const [recruitmentTreeData, setRecruitmentTreeData] = useState([]);
    const [dragOverLeadId, setDragOverLeadId] = useState<string | null>(null);
    const [dragOverMemberId, setDragOverMemberId] = useState<string | null>(null);
    const [dragOverVendorId, setDragOverVendorId] = useState<string | null>(null);
    const [pendingSelection, setPendingSelection] = useState(null);
    const [, setLoading] = useState(false);  // Added loading state
    const [jobs, setJobs] = useState(initialJobs);
    const [recruitmentTeam, setRecruitmentData] = useState(recruitmentTeamData);
    const [allVendors, setVendors] = useState(allVendorsData);
    const [getSelectedVendor, SelectedVendor] = useState([]);

    // Function to refresh the job assignments
    const refreshAssignedJobs = async () => {
        setLoading(true);
        try {
            const updatedJobs = await api.getAllJobs({ page: 1, limit: 10 });  // Fetch updated jobs
            setJobs(updatedJobs);  // Assuming `setJobs` is available in your component
            toast.success('Job assignments updated successfully!');
        } catch (error) {
            console.error('Error refreshing jobs:', error);
            toast.error('Failed to refresh assigned jobs.');
        } finally {
            setLoading(false);
        }
    }


    const refreshRecuritmenData = async () => {
        try {

            const [recruitmentTeam, allVendors] = await Promise.all([
                api.getDepartmentTree(orgId, 'recruitment'),
                getAllVendorsOfOrg(orgId),
            ]);

            setRecruitmentData(recruitmentTeam); 
            setVendors(allVendors)

        } catch (error) {
            console.error('Error refreshing Data:', error);
            toast.error('Failed to refresh Data.');
        } finally {
            setLoading(false);
        }
    }

    const handleClear = () => {
        setPendingSelection(null); // Clear the selected value
        // setRecruitmentTreeData(recruitmentTreeData); // Reset filtered data to default
    };

    // const handleActiveComponentAndButton = (value) => {
    //     setActiveComponent(value);
    // };

    departments = departments ? departments.map(department => ({
        label: department.label,
        value: department._id
    })) : []

    const locationOptions = (locations || []).map((location) => ({
        label: location.city,
        value: location._id,
    }));

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

    const handleTeamSelect = async (e) => {
        const selectedNode = e.node;
        const teamsToShow = [];

        // Push the selected node even if it's a leaf
        teamsToShow.push(selectedNode);

        // Fetch descendant teams if they exist
        const getDescendantTeams = (currentTeam) => {
            if (currentTeam.children?.length) {
                currentTeam.children.forEach(child => {
                    teamsToShow.push(child);
                    getDescendantTeams(child);
                });
            }
        };

        getDescendantTeams(selectedNode);

        setSelectedTeams(teamsToShow);
        setSelecteNode(selectedNode);

        const initialLoadingState = teamsToShow.reduce((acc, team) => {
            acc[team._id] = true;
            return acc;
        }, {});
        setLoadingTeams(initialLoadingState);

        const newMembersMap = {};
        await Promise.all(
            teamsToShow.map(async (team) => {
                try {
                    const members = await getDepartmentMembers(team.org, team._id);
                    newMembersMap[team._id] = members;
                    setLoadingTeams(prev => ({ ...prev, [team._id]: false }));
                } catch (error) {
                    console.error(`Error fetching members for team ${team.label}:`, error);
                    newMembersMap[team._id] = [];
                    setLoadingTeams(prev => ({ ...prev, [team._id]: false }));
                }
            })
        );

        setTeamMembersMap(newMembersMap);

        if (activeComponent !== 'internal') {
            setActiveComponent('internal');
        }
    };

    const handleJobDragStart = (event: React.DragEvent<HTMLDivElement>, dragData: any) => {
        const { job } = dragData;
        setDraggedJob(job);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };


    const handleVendorDragOver = (e: React.DragEvent<HTMLDivElement>, vendorId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverVendorId(vendorId);

    };

    const handleVendorDragLeave = () => {
        setDragOverVendorId(null);
    };

    const handleVendorDrop = (e: React.DragEvent<HTMLDivElement>, vendor) => {
        e.preventDefault();
        setDragOverVendorId(null);
        try {
            const jobData = e.dataTransfer.getData('application/json');
            const job = JSON.parse(jobData);

            if (!job || !job._id) {
                console.error('Invalid job data received');
                return;
            }

            setDraggedJob(job);
            setDroppedVendor(vendor);
        } catch (error) {
            console.error('Error handling vendor drop:', error);
            toast.error('Failed to process the dragged item');
        }
    };

    const handleLeadDragOver = (e: React.DragEvent<HTMLDivElement>, leadId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverLeadId(leadId);
    };

    const handleLeadDragLeave = () => {
        setDragOverLeadId(null);
    };


    const handleLeadDrop = async (e: React.DragEvent<HTMLDivElement>, lead, team) => {
        e.preventDefault();
        setDragOverLeadId(null);

        try {
            const jobData = e.dataTransfer.getData('application/json');
            const { job, baseAllocationId } = JSON.parse(jobData);

            if (!job || !job._id) {
                toast.error('Invalid job data received');
                return;
            }

            // Get team members from membersMap
            const teamMembers = membersMap[team._id]?.filter(
                member => member.reportingTo && member.reportingTo._id === lead._id
            ) || [];

            if (!teamMembers || teamMembers.length === 0) {
                toast.error('No team members found for this lead');
                return;
            }

            // Check if job is already assigned to any team member
            const assignmentChecks = await Promise.all(
                teamMembers.map(async (member) => {
                    const jobAllocations = await getAllMemberAssignedJobs(member._id);
                    const isAssigned = jobAllocations.some(
                        allocation => allocation.job._id === job._id
                    );
                    return {
                        member,
                        isAssigned
                    };
                })
            );

            const alreadyAssignedMembers = assignmentChecks
                .filter(check => check.isAssigned)
                .map(check => check.member.firstName);

            // Get members who don't have the job assigned
            const membersToAssign = assignmentChecks
                .filter(check => !check.isAssigned)
                .map(check => check.member);

            if (membersToAssign.length === 0) {
                toast.error('All team members already have this job assigned');
                return;
            }

            // Get base allocation data
            const baseAllocation = await getJobAllocation(baseAllocationId);

            if (!baseAllocation) {
                toast.error('Base allocation not found');
                return;
            }

            // Destructure required fields from base allocation
            const {
                startDate,
                dueDate,
                targetProfiles,
                priority,
                untilPositionClosed,
            } = baseAllocation;

            // Create assignee allocation payload only for unassigned members
            const assigneePayload = {
                job: job._id,
                assignees: membersToAssign.map(member => member._id),
                startDate,
                dueDate,
                targetProfiles,
                priority,
                untilPositionClosed,
            };

            // Create assignee job allocation
            await createAssigneeJobAllocation(assigneePayload);

            // Show success message with details
            if (alreadyAssignedMembers.length > 0) {
                toast.success(
                    `Job assigned to ${membersToAssign.length} team members. Skipped ${alreadyAssignedMembers.length} members who already had the job: ${alreadyAssignedMembers.join(', ')}`
                );
            } else {
                toast.success('Job assigned to all team members successfully');
            }

            // Update UI state
            setDraggedJob(job);
            setDroppedMember(lead);

        } catch (error) {
            console.error('Error handling lead drop:', error);
            toast.error('Failed to process the dragged item');
        }
    };

    const handleMemberDragOver = (e: React.DragEvent<HTMLDivElement>, memberId: string) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        setDragOverMemberId(memberId);
    };

    const handleMemberDragLeave = () => {
        setDragOverMemberId(null);
    };

    const handleMemberDrop = async (e: React.DragEvent<HTMLDivElement>, member, team) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent event from bubbling up to lead container
        setDragOverMemberId(null);

        try {
            const jobData = e.dataTransfer.getData('application/json');
            const { job, baseAllocationId } = JSON.parse(jobData);

            if (!job || !job._id) {
                toast.error('Invalid job data received');
                return;
            }

            // Check if job is already assigned to this member
            const jobAllocations = await getAllMemberAssignedJobs(member._id);
            const isJobAssigned = jobAllocations.some(
                allocation => allocation.job._id === job._id
            );

            if (isJobAssigned) {
                toast.error(`This job is already assigned to ${member.firstName}`);
                return;
            }

            // Get base allocation data
            const baseAllocation = await getJobAllocation(baseAllocationId);

            if (!baseAllocation) {
                toast.error('Base allocation not found');
                return;
            }

            // Destructure required fields from base allocation
            const {
                startDate,
                dueDate,
                targetProfiles,
                priority,
                untilPositionClosed,
            } = baseAllocation;

            // Create assignee allocation payload
            const assigneePayload = {
                job: job._id,
                assignee: member._id,
                startDate,
                dueDate,
                targetProfiles,
                priority,
                untilPositionClosed,
            };

            // Create assignee job allocation
            await createAssigneeJobAllocation(assigneePayload);
            toast.success(`Job assigned to ${member.firstName + ' ' + member.lastName} successfully`);
            const updatedMemberJobs = await getAllMemberAssignedJobs(member._id);

            setTeamMembersMap((prevMap) => ({
                ...prevMap,
                [team._id]: prevMap[team._id].map((m) =>
                    m._id === member._id ? { ...m, assignedJobs: updatedMemberJobs } : m
                ),
            }));

            // Set job and allocation data
            setDraggedJob(job);
            setDroppedMember(member);

            // Refresh the job list after assignment
            await refreshAssignedJobs();

        } catch (error) {
            console.error('Error handling member drop:', error);
            toast.error('Failed to process the dragged item');
        }
    };

    // const handleTeamDialogSubmit = async (data) => {
    //     try {
    //         let response;

    //         if (activeComponent === 'internal' && droppedMember) {
    //             response = await assignJobToMember(data);
    //             if (response) {
    //                 toast.success(
    //                     `Job assigned to ${droppedMember.firstName} successfully`,
    //                 );
    //             }

    //             // TODO: Need team name also
    //         } else if (activeComponent === 'internal' && droppedTeamLead) {
    //             response = await assignJobToMember(data);
    //             if (response) {
    //                 toast.success(
    //                     `Job assigned to ${droppedMember.firstName} successfully`,
    //                 );
    //             }
    //         }
    //     } catch (error) {
    //         toast.error('Failed to submit dialog data', error?.message);
    //         console.error('Failed to submit dialog data:', error.message);
    //     }
    // };

    const handleVendorClick = (vendor) => {
        const vendorJobs = jobs.filter(job => job.vendorId === vendor._id); // Assuming jobs have vendorId
        setSelectedVendor({ ...vendor, jobs: vendorJobs });
        setVisibleVendorDialog(true);
    };

    const renderVendorContent = (vendors) => {
        return (
            <div className={styles.vendorsContainer}>

                {vendors.map((vendor) => (
                    <div
                        className={styles.vendorAccordionContainer}
                        key={vendor._id}
                        style={{
                            ...(dragOverVendorId === vendor._id && {
                                backgroundColor: 'rgba(3, 105, 161, 0.08)',
                                border: '2px dashed #0369a1'
                            })
                        }}
                        onDragOver={(e) => handleVendorDragOver(e, vendor._id)}
                        onDrop={(e) => handleVendorDrop(e, vendor)}
                        onDragLeave={handleVendorDragLeave}

                    >
                        <div
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
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderFreelancerContent = () => {
        return (
            <div
                className={styles.freelancerContainer}
                onDragOver={(e) => handleDragOver(e)}
                onDrop={(e) => {
                    e.preventDefault();
                    // handleDrop(e);
                }}
            >
                <p className={styles.placeholderText}>Drop jobs here for freelancers</p>
            </div>
        );
    };

    const renderTeamAccordion = (team) => {
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
                    <div className="w-full p-2">
                        {teamMembersGrouped && teamMembersGrouped.length > 0 ? (
                            <CustomAccordion>
                                {teamMembersGrouped.map((lead: TeamLead) => (
                                    <div key={lead._id} className={styles.teamLeadContainer}>
                                        <div
                                            style={{
                                                ...(dragOverLeadId === lead._id && {
                                                    backgroundColor: 'rgba(3, 105, 161, 0.08)',
                                                    border: '2px solid #0369a1',
                                                    borderRadius: '5px',
                                                    boxShadow: '0 0 5px rgba(5, 102, 142, 0.5)'
                                                })
                                            }}
                                            onDragOver={(e) => handleLeadDragOver(e, lead._id)}
                                            onDrop={(e) => handleLeadDrop(e, lead, team)}
                                            onDragLeave={handleLeadDragLeave}

                                        >
                                            <AccordionItem
                                                title={`${team.label} ( ${lead.firstName} ${lead.lastName} - TL )`}
                                            >
                                                <div className={`${styles.memberAccordionContainer}`}>
                                                    {lead.members.length > 0 ? (
                                                        <CustomAccordion>
                                                            {lead.members.map((member: TeamMember) => (
                                                                <div key={member._id}>
                                                                    <div
                                                                        style={{
                                                                            ...(dragOverMemberId === member._id && {

                                                                                backgroundColor: 'rgba(2, 100, 103, 0.08)',
                                                                                border: '2px solid #036324',
                                                                                borderRadius: '5px',
                                                                                boxShadow: '0 0 5px rgba(5, 102, 142, 0.5)'
                                                                            })
                                                                        }}
                                                                        onDragOver={(e) => handleMemberDragOver(e, member._id)}
                                                                        onDrop={(e) => handleMemberDrop(e, member, team)}
                                                                        onDragLeave={handleMemberDragLeave}

                                                                    >
                                                                        <AccordionItem
                                                                            title={`${member.firstName} ${member.lastName}`}
                                                                        >
                                                                            <HTMLTimeline member={member} />
                                                                        </AccordionItem>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </CustomAccordion>
                                                    ) : (
                                                        <p className={styles.noMembers}>
                                                            <strong>{team.label}:</strong> No team members assigned.
                                                        </p>
                                                    )}
                                                </div>
                                            </AccordionItem>
                                        </div>
                                    </div>
                                ))}
                            </CustomAccordion>
                        ) : (
                            <p className={styles.noMembers}><strong>{team.label}:</strong> No team members available.</p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Temporarily store selection
    const handleTreeChange = (e) => {
        if (e.value === undefined) {
            setRecruitmentTreeData(recruitmentTreeData); // Reset to default tree data
            setSelectedNodeKey(null);
            setPendingSelection(null);
            setSelectedTeams([]);
            setTeamMembersMap({});
            setActiveComponent(null); // Reset the active component
            filterTeams(null); // Clear any filtering
            refreshRecuritmenData(); // Refresh recruitment data if needed
        }else{
            setPendingSelection(e.value);
        }


        
    };
    const handleConfirmSelection = () => {
        if (pendingSelection) {
            setSelectedNodeKey(pendingSelection);
            filterTeams(pendingSelection);
        }
    };

    // Filtering logic based on the selected key
    const filterTeams = (key) => {
        const findNodeRecursively = (key, nodes) => {
            for (const node of nodes) {
                if (node.key === key) return node;
                if (node.children?.length) {
                    const foundNode = findNodeRecursively(key, node.children);
                    if (foundNode) return foundNode;
                }
            }
            return null;
        };

        const selectedNode = findNodeRecursively(key, recruitmentTreeData);
        if (selectedNode) {
            if (selectedNode.data?.type === 'vendor') {
                setActiveComponent('vendor');
                const data = []
                data.push(selectedNode.data)
                SelectedVendor(data)
            } else if (selectedNode.data === 'freelancers') {
                setActiveComponent('freelancer');
            } else {
                setActiveComponent('internal');
                handleTeamSelect({ node: selectedNode });
            }
        }
    };
    return (
        <div className={styles.parent}>
            <ToastContainer />
            <div className="flex parent">
                {/* Job List Container */}
                <div
                    className="sm:md:max-w-10rem md:max-w-25rem"
                // onDragOver={handleDragOver}
                // onDrop={handleDrop}
                >
                    <JobsListPageOfAssignment
                        jobs={jobs}
                        departments={departments}
                        locations={locationOptions}
                        onDragStart={handleJobDragStart}
                    />
                </div>

                <div className="flex ml-2 gap-2 w-9">
                    {/* Conditionally render Internal Team, Vendors, or Freelancer component */}
                    <div className="border-1 border-solid border-200 border-round-xl w-12 pa-2 contentContainer">                        <div className="flex  gap-2 justify-content-between m-2">
                        {/* <TreeSelect
                                value={selectedNodeKey}
                                onChange={(e) => {
                                    // If clear button is clicked (e.value is null)
                                    if (!e.value) {
                                        setSelectedNodeKey(null);
                                        setSelecteNode(null);
                                        setSelectedTeams([]);
                                        setActiveComponent('internal');
                                        return;
                                    }

                                    const findNodeRecursively = (key, nodes) => {
                                        for (const node of nodes) {
                                            if (node.key === key) return node;
                                            if (node.children?.length) {
                                                const foundNode = findNodeRecursively(key, node.children);
                                                if (foundNode) return foundNode;
                                            }
                                        }
                                        return null;
                                    };

                                    const selectedNode = findNodeRecursively(e.value, recruitmentTreeData);

                                    if (selectedNode) {
                                        if (selectedNode.data === 'vendors') {
                                            handleActiveComponentAndButton('vendor');
                                        } else if (selectedNode.data === 'freelancers') {
                                            handleActiveComponentAndButton('freelancer');
                                        } else if (selectedNode.data?.type === 'vendor') {
                                            handleActiveComponentAndButton('vendor');
                                            handleVendorClick(selectedNode.data);
                                        } else {
                                            setSelectedNodeKey(e.value);

                                            const getNodeByKey = (key, nodes) => {
                                                for (const node of nodes) {
                                                    if (node.key === key) return node;
                                                    if (node.children) {
                                                        const childNode = getNodeByKey(key, node.children);
                                                        if (childNode) return childNode;
                                                    }
                                                }
                                                return null;
                                            };

                                            const node = getNodeByKey(e.value, recruitmentTreeData);
                                            if (node) {
                                                handleTeamSelect({ node });
                                            }
                                        }
                                    }

                                }}
                                options={recruitmentTreeData}
                                filter
                                filterPlaceholder="Search"
                                className={`w-full ${styles.treeCursor}`}
                                placeholder="Select Team/Vendor/Freelancer"
                                showClear

                            /> */}
                        <TreeSelect
                            value={pendingSelection}  // Use temporary value
                            onChange={handleTreeChange}
                            options={recruitmentTreeData}
                            // filter
                            // filterPlaceholder="Search"
                            className={`w-full ${styles.treeCursor}`}
                            placeholder="Select Team/Vendor/Freelancer"
                            showClear={true}
                            // onClear={handleClear} // Use the clear handler
                        />
                        <Button
                            label="OK"
                            className="ml-2"
                            onClick={handleConfirmSelection}  // Confirm button logic
                            disabled={!pendingSelection}
                        />
                    </div>
                        {(!activeComponent || !selecteNode) &&
                            activeComponent === 'internal' && (
                                <p className={styles.placeholderText}>
                                    Select Team, Vendors, or Freelancers
                                </p>
                            )}
                        {activeComponent === 'internal' && selecteNode && (
                            <div className="mt-4">
                                {selectedTeams.map(team => renderTeamAccordion(team))}
                            </div>
                        )}
                        {activeComponent === 'vendor' && getSelectedVendor.length > 0 ? renderVendorContent(getSelectedVendor) : activeComponent === 'vendor' ? renderVendorContent(allVendors) : '' }
                        {/* {activeComponent === 'vendor' && renderVendorContent(allVendors)} */}
                        {activeComponent === 'freelancer' && renderFreelancerContent()}
                    </div>
                </div>
            </div>

        </div>
    );
}
