import React from 'react';
import { Dialog } from 'primereact/dialog';
import styles from './JobDetailsDialog.module.scss';

function JobDetailsDialog({ visible, onHide, selectedMember, assignedJobs }) {
  return (
    <Dialog
      className={styles.dialogContainer}
      header={`${selectedMember ? selectedMember.firstName + ' ' + selectedMember.lastName : ''}'s Assigned Jobs`}
      visible={visible}
      style={{ width: '50vw' }}
      footer={<button className={styles.closeButton} onClick={onHide}>Close</button>}
      onHide={onHide}
    >
      {selectedMember && assignedJobs[selectedMember._id] ? (
        <div>
          {assignedJobs[selectedMember._id].map((job) => (
            <div key={job._id} className={styles.jobDetail}>
              <h4>{job.job.title}</h4>
              <p><strong>Assigned Time:</strong> {new Date(job.assignedDateAndTime).toLocaleString()}</p>
              <p><strong>Due Time:</strong> {new Date(job.dueDate).toLocaleString()}</p>
              <p className={styles.targetProfiles}><strong>Target Profiles:</strong> {job.targetProfiles}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No assigned jobs found.</p>
      )}
    </Dialog>
  );
}

export default JobDetailsDialog;
