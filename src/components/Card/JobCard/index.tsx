import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { useRouter } from 'next/router';
import moment from 'moment';
import Image from 'next/image';
import styles from '@/styles/shared/Jobs/list_page.module.scss';
import { Checkbox, Dialog } from '@/primereact';
import { Menu } from 'primereact/menu';
import ChangeStatusModal from '@/components/Modals/ChangeStatus';
import api, { getJobAssignCount } from '@/services/api.service';
import { ToastContainer, toast } from 'react-toastify';
import { InputNumber } from 'primereact/inputnumber';
interface JobCardProps {
  data: any; // Mandatory prop
  selectedIds?: string[]; // Optional prop
  setSelectedIds?: (ids: string[]) => void; // Optional prop
  basePath?: string; // Optional prop, with default value
}

const JobCard: React.FC<JobCardProps> = ({
  data,
  selectedIds,
  setSelectedIds,
  basePath = '/jobs/lists',
}) => {
  console.log(data);
  const router = useRouter();
  const menuRef = useRef(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [changeStatusVisible, setChangeStatusVisible] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTargetDialog, setShowTargetDialog] = useState(false);
  const [target, setTarget] = useState(0)

  const jobStatus = [
    { label: 'Open', value: 'Open' },
    { label: 'Close', value: 'Close' },
  ];

  const items = [
    {
      label: 'Edit',
      command: () => {
        router.push(`add?jobId=${selectedJob?._id}`);
      },
    },
    {
      label: 'Change Status',
      command: () => setChangeStatusVisible(true),
    },
    {
      label: 'Delete',
      command: () => setShowDeleteDialog(true),
    },
    {
      label: 'Target applications',
      command: () => setShowTargetDialog(true),
    }
  ];

  const handleSoftDelete = async () => {
    try {
      await api.softDeleteJob(selectedJob._id);
      toast.success('Job deleted successfully!');
      setShowDeleteDialog(false);
      setTimeout(() => {
        router.reload();
      }, 1000);
    } catch (error) {
      console.error('Error while deleting job:', error?.message);
      toast.error('Failed to delete the job. Please try again later.');
    }
  };

  const handleMenuClick = (event, job, menu) => {
    setSelectedJob(job);
    menu.current.toggle(event);
  };

  const defaultClick = (e, id, route) => {
    e.preventDefault();
    router.push(`${basePath}/${id}/${route}`);
  };

  const jobAllocationClick = (e, id, route) => {
    e.preventDefault();
    router.push(`${route}`);
  };

  const [jobAssignmentCounts, setJobAssignmentCounts] = useState<{
    [key: string]: {
      teamCount: number;
      memberCount: number;
      vendorCount: number;
    };
  }>({});

  // Function to fetch the job assignment counts for a specific job
  const fetchJobAssignmentCounts = async (jobId: string) => {
    try {
      const counts = await getJobAssignCount(jobId); // Fetch data from your API
      setJobAssignmentCounts((prevState) => ({
        ...prevState,
        [jobId]: counts, // Store counts using the job ID as key
      }));
    } catch (error) {
      console.error('Failed to fetch job assignment count:', error);
    }
  };

  // Effect hook to fetch counts when the component is mounted or data changes
  useEffect(() => {
    data.forEach((job) => {
      // Fetch job assignment counts for each job in the data
      if (!jobAssignmentCounts[job._id]) {
        fetchJobAssignmentCounts(job._id); // Only fetch if counts are not already available
      }
    });
  }, [data, jobAssignmentCounts]); // Depend on data and jobAssignmentCounts

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSetTarget = async () => {
    try {
      await api.updateJob(selectedJob._id, { targetApplications: target });
      toast.success('Target updated successfully!');
      setShowTargetDialog(false);
    } catch (error) {
      console.error('Error updating target:', error?.message);
      toast.error('Failed to update target. Please try again.');
    }
  };

  return (
    <>
      <ToastContainer />
      <Menu
        model={items}
        popup
        ref={menuRef}
        id="popup_menu_right"
        popupAlignment="right"
      />
      {data && data.length > 0 ? (
        data.map((job) => (
          <div key={job._id} className={styles.card}>
            <div className={styles.first_row}>
              <div className={styles.left_section}>
                <div className={styles.job_details}>
                  <Checkbox
                    checked={Array.isArray(selectedIds) && selectedIds.includes(job._id)}
                    onChange={() => toggleSelect(job._id)}
                  />
                  <div className={styles.title}>
                    <h2>{job.title} -</h2>
                    <p>{job.endClientOrg?.title}</p>
                  </div>
                  <div className={styles.title}>
                    <p>{job.jobCode}</p>
                  </div>
                </div>
                <ul className={styles.job_jd}>
                  {job.jobLocation?.length > 0 ? (
                    <>
                      <li>
                        <Image
                          src="/assets/icons/PlaceMarker.svg"
                          height={20}
                          width={50}
                          alt="PlaceMarker icon"
                        />
                        {job.jobLocation.map((location, index) => (
                          <span key={index}>
                            {location.city}
                            {index < job.jobLocation.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </li>
                    </>
                  ) : (
                    <li>
                      <Image
                        src="/assets/icons/PlaceMarker.svg"
                        height={20}
                        width={50}
                        alt="PlaceMarker icon"
                      />
                      Location not specified
                    </li>
                  )}

                  <li>
                    <Image
                      src="/assets/icons/Resume.svg"
                      height={20}
                      width={50}
                      alt="Resume icon"
                    />
                    Experience: {job.workExperience?.minimum ?? 0} to{' '}
                    {job.workExperience?.maximum ?? 0} years
                  </li>

                  <li>
                    <Image
                      src="/assets/icons/DevelopmentSkill.svg"
                      height={20}
                      width={50}
                      alt="Development icon"
                    />
                    Primary Skills:
                    {Array.isArray(job.primarySkills)
                      ? job.primarySkills.join(', ')
                      : 'Not specified'}
                    ,
                    <br />
                    Secondary Skills:{' '}
                    {Array.isArray(job.secondarySkills)
                      ? job.secondarySkills.join(', ')
                      : 'Not specified'}
                  </li>

                  <li>
                    <Image
                      src="/assets/icons/PermanentJob.svg"
                      height={20}
                      width={50}
                      alt="PermanentJob icon"
                    />
                    {job.employmentType
                      ? job.employmentType.charAt(0).toUpperCase() +
                      job.employmentType.slice(1)
                      : 'Not specified'}
                  </li>
                </ul>
              </div>
              <div className={styles.right_section}>
                <div className={styles.posted}>
                  <div>
                    Posted on{' '}
                    {moment(job.createdAt).format('MMM DD YYYY, h:mm A')}
                  </div>
                  <i
                    className="pi pi-ellipsis-v"
                    onClick={(e) => handleMenuClick(e, job, menuRef)}
                  />
                </div>
                {!job.isDraft ? (
                  <div className={`tag ${job.isOpen ? 'active' : 'closed'}`}>
                    {job.isOpen ? 'Open' : 'Closed'}
                  </div>
                ) : (
                  <div className={`tag active`}>Draft</div>
                )}
              </div>
            </div>
            <div className={styles.second_row}>
              <div className={styles.left_section}>
                {Array.isArray(job?.workflow?.stages) &&
                  job.workflow.stages.length > 0 ? (
                  job.workflow.stages.map((stage) => (
                    <div key={stage._id} className={styles.box}>
                      <h5>{stage.name}</h5>
                      <p>{stage.jobApplicationsCount}</p>
                    </div>
                  ))
                ) : (
                  <div>No stages available</div>
                )}
              </div>
              <div className={styles.middle_section}>
                <div className={styles.allocate}>
                  <h5>Teams</h5>
                  <p>
                    {jobAssignmentCounts[job._id]?.teamCount > 0
                      ? `${jobAssignmentCounts[job._id].teamCount}T - ${jobAssignmentCounts[job._id].memberCount
                      }R`
                      : '0T - 0R'}
                  </p>
                </div>
                <div className={styles.allocate}>
                  <h5>Vendors</h5>
                  <p>
                    {jobAssignmentCounts[job._id]?.vendorCount > 0
                      ? jobAssignmentCounts[job._id].vendorCount
                      : '0'}
                  </p>
                </div>
                <div className={styles.allocate}>
                  <h5>Freelancers</h5>
                  <p>Yes</p> {/* Assuming Freelancers is always "Yes" */}
                </div>
              </div>
              <div className={styles.right_section}>
                <Button
                  onClick={(e) => jobAllocationClick(e, job._id, 'jobs-allocation')}
                  className="surface-300 outline-0 border-0 font-semibold text-600"
                >
                  Allocate
                </Button>
                <Button
                  onClick={(e) => defaultClick(e, job._id, 'workflow')}
                  className="surface-300 outline-0 border-0 font-semibold text-600"
                >
                  Workflow
                </Button>
                <Button
                  onClick={() => router.push(`${basePath}/${job._id}`)}
                  className="surface-300 outline-0 border-0 font-semibold text-600"
                >
                  View
                </Button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No jobs are available</p>
      )}

      {changeStatusVisible && (
        <ChangeStatusModal
          statusEnum={jobStatus}
          job={selectedJob._id}
          visible={changeStatusVisible}
          setVisible={setChangeStatusVisible}
        />
      )}

      <Dialog
        header="Confirm Deletion"
        visible={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
      >
        <p>Are you sure you want to delete this job?</p>
        <div className={styles.dialog_buttons}>
          <Button
            label="Cancel"
            onClick={() => setShowDeleteDialog(false)}
            className="p-button-text mr-2"
          />
          <Button
            label="Delete"
            onClick={handleSoftDelete}
            className="p-button-danger"
          />
        </div>
      </Dialog>

      <Dialog
        header="Set Job Applications Target"
        visible={showTargetDialog}
        onHide={() => setShowTargetDialog(false)}
      >
        <div>
          <p>Enter the target number of applications for this job:</p>
          <div className="my-2">
            <InputNumber
              value={target} // Controlled state for the input
              onValueChange={(e) => setTarget(e.value || 0)} // Update target state
              min={0} // Prevent negative values
              placeholder="Enter target number"
            />
          </div>
        </div>
        <div className={styles.dialog_buttons}>
          <Button
            label="Cancel"
            onClick={() => setShowTargetDialog(false)}
            className="p-button-danger mr-2"
          />
          <Button
            label="Set Target"
            onClick={handleSetTarget} // Use the separated function here
            className="p-button-success"
            disabled={target <= 0} // Disable button if target is not valid
          />
        </div>
      </Dialog>
    </>
  );
};

export default JobCard;
