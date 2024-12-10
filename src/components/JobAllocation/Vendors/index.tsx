import React, { useState, useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Dialog } from 'primereact/dialog';
import { getAllVendorAssignedJobs } from '@/services/api.service'; // Ensure this API service exists
import moment from 'moment';
import styles from './index.module.scss';

function VendorsPage({ allVendors }) {
  console.log(allVendors);
  const [assignedJobs, setAssignedJobs] = useState({});
  // const [allJobs, setAllJobs] = useState([]); // State to hold all jobs
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

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
      setAssignedJobs(jobsByVendor);
      // setAllJobs(Object.values(jobsByVendor).flat());
    };

    fetchAllAssignedJobs();
  }, [allVendors]);

  const handleVendorClick = async (vendor) => {
    setSelectedVendor(vendor);
    setVisibleDialog(true);
  };

  const closeDialog = () => {
    setVisibleDialog(false);
    setSelectedVendor(null);
  };

  return (
    <div className={styles.vendorsContainer}>
      {allVendors.map((vendor) => (
        <div className={styles.vendorAccordionContainer}  key={vendor._id}>
          <Droppable key={vendor._id} droppableId={`vendor-${vendor._id}`}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                // className={`${styles.droppableLead} ${snapshot.isDraggingOver ? styles.highlighted : ''}`}
                className={styles.vendorCard}
                onClick={() => handleVendorClick(vendor)} // Open dialog on click
              >
                <div className={styles.vendorName}>
                  {vendor.title} 
                </div>
                <div className={styles.jobIndicator}>
                  <div
                    style={{
                      width: `${(assignedJobs[vendor._id]?.length || 0) * 20}px`,
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

      <Dialog
        className={styles.dialogContainer}
        header={`${selectedVendor ? selectedVendor.title : ''}'s Assigned Jobs`}
        visible={visibleDialog}
        style={{ width: '50vw' }}
        footer={
          <button className={styles.closeButton} onClick={closeDialog}>
            Close
          </button>
        }
        onHide={closeDialog}
      >
        {assignedJobs[selectedVendor?._id]?.length > 0 ? (
          <div className={styles.dialogContent}>
            {assignedJobs[selectedVendor._id].map((job) => (
              <div key={job._id} className={styles.jobDetail}>
                <h4>{job.title}</h4>
                <p>
                  <strong>Assigned Time:</strong>{' '}
                  {moment(job.assignedDateAndTime).format(
                    'MMMM DD, YYYY - hh:mm A',
                  )}
                </p>
                <p>
                  <strong>Due Time:</strong>{' '}
                  {moment(job.dueDate).format('MMMM DD, YYYY - hh:mm A')}
                </p>
                <p className={styles.targetProfiles}>
                  <strong>Target Profiles:</strong> {job.targetProfiles}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No assigned jobs found for this vendor.</p>
        )}
      </Dialog>
    </div>
  );
}

export default VendorsPage;
