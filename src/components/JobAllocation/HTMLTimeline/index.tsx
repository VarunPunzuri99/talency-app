import React, { useCallback, useEffect, useState } from 'react';
import styles from './index.module.scss';
import { deleteAssignedJobAllocation,  getAllMemberAssignedJobsByDueDate, updateAssignedJobAllocation } from '@/services/api.service';
import { isSameDay, isAfter, isBefore, parseISO } from 'date-fns';
import InternalTeamDialog from '../AllocationDialog/InternalTeamsDialog';
import { toast } from 'react-toastify';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import {  FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { format, addDays, subDays } from 'date-fns';


interface Job {
  job: any;
  _id: string;
  title: string;
  startDate: string;
  dueDate: string;
  untilPositionClosed: boolean;
  priority: 'low' | 'medium' | 'high';
}

function HTMLTimeline({ member }) {
  console.log('Member:', member);
  const [allMemberAssignedAllocations, setallMemberAssignedAllocations] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page,] = useState(1);
  const [limit] = useState(10);
  const [teamDialogVisible, setTeamDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedJobAllocation, setSelectedJob] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    format(currentDate, 'yyyy-MM-dd');
  }, [member]);
  const fetchJobs = useCallback(async () => {
    if (!member?._id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await getAllMemberAssignedJobsByDueDate(
        member._id,
        format(currentDate, 'yyyy-MM-dd'),
        page,
        limit
      );

      console.log('Assigned allocations response:', response);
      const allocations = response || [];
      setallMemberAssignedAllocations(allocations);
    } catch (err) {
      setError('Failed to fetch allocations');
      console.error('Error fetching allocations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [member?._id, page, limit, currentDate]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const starTimes = [
    {
      id: 'star-1',
      time: '2024-11-06T15:23:00.000Z',
      description: 'Profile',
    },
  ];

  const timeToPercentage = (time: string): number => {
    const date = new Date(time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const percentage = ((hours * 60 + minutes) / (24 * 60)) * 100;
    console.log('Time calculation:', { time, hours, minutes, percentage });
    return percentage;
  };

  const handlePreviousDay = () => {
    setCurrentDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setCurrentDate(prev => addDays(prev, 1));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'low':
        return '#90EE90'; // light green
      case 'medium':
        return '#FFE4B5'; // light yellow
      case 'high':
        return '#FFB6C1'; // light red
      default:
        return '#4CAF50'; // default green
    }
  };


  const getJobDisplayStyle = (allocation: Job, selectedDate: string) => {
    const allocationStartDate = parseISO(allocation.startDate);
    const currentDate = parseISO(selectedDate);

    // For untilPositionClosed jobs
    if (allocation.untilPositionClosed) {
      // If current date is before start date, don't show anything
      if (isBefore(currentDate, allocationStartDate)) {
        return null;
      }

      // If it's the start date, show from the specific start time
      if (isSameDay(allocationStartDate, currentDate)) {
        return {
          left: `${timeToPercentage(allocation.startDate)}%`,
          width: `${100 - timeToPercentage(allocation.startDate)}%`,
          borderRadius: '5px',
          backgroundColor: getPriorityColor(allocation.priority),
          border: '2px solid rgba(0,0,0,0.2)',
        };
      }

      // For dates after start date, show full width with dashed border
      return {
        left: '0%',
        width: '100%',
        borderRadius: '5px',
        backgroundColor: getPriorityColor(allocation.priority),
        border: '2px solid rgba(0,0,0,0.2)',
      };
    }

    // For jobs with specific due dates (when untilPositionClosed is false)
    if (!allocation.dueDate) {
      // If no due date and not untilPositionClosed, only show on start date
      if (isSameDay(allocationStartDate, currentDate)) {
        return {
          left: `${timeToPercentage(allocation.startDate)}%`,
          width: `${100 - timeToPercentage(allocation.startDate)}%`,
          borderRadius: '4px',
          backgroundColor: getPriorityColor(allocation.priority),
        };
      }
      return null;
    }

    const allocationDueDate = parseISO(allocation.dueDate);

    // If current date is outside the job's date range, don't show anything
    if (isBefore(currentDate, allocationStartDate) || isAfter(currentDate, allocationDueDate)) {
      return null;
    }

    // Single day job
    if (isSameDay(allocationStartDate, currentDate) && isSameDay(allocationDueDate, currentDate)) {
      const startPercentage = timeToPercentage(allocation.startDate);
      const endPercentage = timeToPercentage(allocation.dueDate);
      return {
        left: `${startPercentage}%`,
        width: `${Math.max(endPercentage - startPercentage, 2)}%`,
        borderRadius: '4px',
        backgroundColor: getPriorityColor(allocation.priority),
      };
    }

    // First day of multi-day job
    if (isSameDay(allocationStartDate, currentDate)) {
      return {
        left: `${timeToPercentage(allocation.startDate)}%`,
        width: `${100 - timeToPercentage(allocation.startDate)}%`,
        borderRadius: '4px 0 0 4px',
        backgroundColor: getPriorityColor(allocation.priority),
      };
    }

    // Last day of multi-day job
    if (isSameDay(allocationDueDate, currentDate)) {
      return {
        left: '0%',
        width: `${timeToPercentage(allocation.dueDate)}%`,
        borderRadius: '0 4px 4px 0',
        backgroundColor: getPriorityColor(allocation.priority),
      };
    }

    // Middle days of multi-day job
    return {
      left: '0%',
      width: '100%',
      borderRadius: '0',
      backgroundColor: getPriorityColor(allocation.priority),
    };
  };

  const handleEditClick = (allocation) => {
    setSelectedJob(allocation);
    setTeamDialogVisible(true);
  };

  const handleDeleteClick = (allocation) => {
    setSelectedJob(allocation);
    setDeleteDialogVisible(true);
  };

  const handleDeleteDialogSubmit = async () => {
    try {
      if (!selectedJobAllocation) {
        return;
      }

      const response = await deleteAssignedJobAllocation(selectedJobAllocation._id);

      if (response) {
        toast.success('Job allocation deleted successfully');
        await fetchJobs(); // Wait for jobs to refresh
      } else {
        toast.error('Failed to delete job allocation');
      }
      setDeleteDialogVisible(false);
      setSelectedJob(null);
    } catch (error: any) {
      toast.error('Failed to delete job allocation: ' + error?.message);
      console.error('Failed to delete job allocation:', error);
    }
  };

  const handleTeamDialogSubmit = async (data) => {
    console.log('data', data);
    try {
      if (!selectedJobAllocation) {
        return;
      }

      const response = await updateAssignedJobAllocation(selectedJobAllocation._id, {
        targetProfiles: data.targetProfiles,
        startDate: data.startDate,
        dueDate: data.dueDate,
        priority: data.priority,
        untilPositionClosed: data.untilPositionClosed,
        jobId: selectedJobAllocation.job._id,
        memberId: member._id
      });

      if (response) {
        toast.success('Job allocation updated successfully');
        await fetchJobs(); // Wait for jobs to refresh
      }

      setTeamDialogVisible(false);
      setSelectedJob(null);
    } catch (error: any) {
      toast.error('Failed to update job allocation: ' + error?.message);
      console.error('Failed to update job allocation:', error);
    }
  };

  if (isLoading) {
    return <div>Loading timeline...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.timelineContainer}>
    <div className={styles.timelineWrapper}>
      <div className={styles.timelineContent}>
        {allMemberAssignedAllocations.length === 0 ? (
          <div className={styles.noJobs}>No jobs assigned</div>
        ) : (
          allMemberAssignedAllocations?.map((jobAllocation) => {
            const displayStyle = getJobDisplayStyle(jobAllocation, currentDate.toISOString());
            if (!displayStyle) return null;

            console.log('displayStyle',displayStyle);
            

            return (
              <div key={jobAllocation._id} className={styles.timelineRow}>
                <span className={styles.jobTitle} title={jobAllocation?.job?.title}>
                  {jobAllocation?.job?.title}
                </span>
                <div className={styles.timelineLine}>
                  <div
                    className={styles.jobBox}
                    style={{
                      ...displayStyle,
                      backgroundColor: getPriorityColor(jobAllocation.priority),
                      height: '20px',
                      minWidth: '10px',
                      position: 'absolute',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div className={styles.tooltip}>
                      <div className={styles.tooltipTitle} title={jobAllocation?.job?.title}>
                        {jobAllocation?.job?.title}
                      </div>
                      <div className={styles.tooltipContent}>
                        Start Date: {format(parseISO(jobAllocation.startDate), 'MMM dd, yyyy HH:mm')}
                        <br />
                        {jobAllocation.dueDate && !jobAllocation.untilPositionClosed ? (
                          <>
                            Due Date: {format(parseISO(jobAllocation.dueDate), 'MMM dd, yyyy HH:mm')}
                            <br />
                          </>
                        ) : null}
                        Priority: {jobAllocation.priority}
                        {jobAllocation.untilPositionClosed && (
                          <>
                            <br />
                            Status: Until Position Closed
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {starTimes.map((starTime) => (
                    <div
                      key={starTime.id}
                      className={styles.star}
                      style={{
                        left: `${timeToPercentage(starTime.time)}%`,
                      }}
                      title={starTime.description}
                    >
                      <i className='pi pi-user'></i>
                    </div>
                  ))}
                </div>
                <div className={styles.actionButtons}>
                  <button onClick={() => handleEditClick(jobAllocation)}>
                    <i className='pi pi-pencil'></i>
                  </button>
                  <button onClick={() => handleDeleteClick(jobAllocation)}>
                    <i className={`pi pi-trash ${styles.deleteIcon}`}></i>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className={styles.dateNavigation}>
        <button onClick={handlePreviousDay} className={styles.navButton}>
          <FaChevronRight />
        </button>
        <span className={styles.currentDate}>
          {format(currentDate, 'd')}<br/>
          -<br/>
          {format(currentDate, 'MMM')}<br/>
          -<br/>
          {format(currentDate, 'yyyy')}
        </span>
        <button onClick={handleNextDay} className={styles.navButton}>
          <FaChevronLeft />
        </button>
      </div>
    </div>
      <InternalTeamDialog
        visible={teamDialogVisible}
        onHide={() => {
          setTeamDialogVisible(false);
          setSelectedJob(null);
        }}
        onSubmit={handleTeamDialogSubmit}
        job={selectedJobAllocation?.job}
        member={member}
        initialValues={selectedJobAllocation ? {
          targetProfiles: selectedJobAllocation.targetProfiles,
          startDate: new Date(selectedJobAllocation.startDate),
          dueDate: selectedJobAllocation.dueDate ? new Date(selectedJobAllocation.dueDate) : null,
          priority: selectedJobAllocation.priority?.toUpperCase(),
          untilPositionClosed: selectedJobAllocation.untilPositionClosed
        } : undefined}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        visible={deleteDialogVisible}
        style={{ width: '450px' }}
        header="Confirm Deletion"
        modal
        onHide={() => {
          setDeleteDialogVisible(false);
          setSelectedJob(null);
        }}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => {
                setDeleteDialogVisible(false);
                setSelectedJob(null);
              }}
            />
            <Button
              label="Delete"
              icon="pi pi-trash"
              className="p-button-danger"
              onClick={handleDeleteDialogSubmit}
            />
          </div>
        }
      >
        <div className="flex align-items-center gap-4">
          <i className="pi pi-exclamation-triangle text-yellow-500 text-2xl" />
          <span>
            Are you sure you want to delete the job allocation for{' '}
            <strong>{selectedJobAllocation?.job?.title}</strong>?
            {/* <br /> */}
            {/* This action cannot be undone. */}
          </span>
        </div>
      </Dialog>
    </div>
  );
}

export default HTMLTimeline;