import { Panel } from 'primereact/panel';
import { Menu } from 'primereact/menu';
import styles from './index.module.scss';
import { useState,  useEffect, useRef } from 'react';
import { getJobAssignCount } from '@/services/api.service';

const JobAllocationCard = ({ job, isDragging }) => {
  const employmentTypeMapping = {
    'full-time': 'Full Time',
    'part-time': 'Part Time',
    contract: 'Contract',
    temporary: 'Temporary',
  };

  useEffect(() => {
    const updateDraggablePosition = (e: MouseEvent) => {
      const draggingElement = document.querySelector(`.${styles.draggingCard}`) as HTMLElement;
      if (draggingElement) {
        const { clientX: x, clientY: y } = e;
        draggingElement.style.setProperty('--translate-x', `${x}px`);
        draggingElement.style.setProperty('--translate-y', `${y}px`);
      }
    };

    window.addEventListener('dragover', updateDraggablePosition);
    return () => window.removeEventListener('dragover', updateDraggablePosition);
  }, []);

  const [jobAssignmentCounts, setJobAssignmentCounts] = useState({
    teamCount: 0,
    memberCount: 0,
    vendorCount: 0,
  });

  const [, setUpdateDialogVisible] = useState(false);

  const menu = useRef(null);
  const menuItems = [
    {
      label: 'Options',
      items: [
        {
          label: 'Comments',
          icon: 'pi pi-comments',
          command: () => {
            // Handle comments action
            console.log('Comments clicked');
          }
        },
        {
          label: 'Update Allocation',
          icon: 'pi pi-user-edit',
          command: () => {
            setUpdateDialogVisible(true);
          }
        }
      ]
    }
  ];

  // const handleUpdateAllocation = async (formData) => {
  //   try {
  //     await updateAllAssignedJobAllocation(job._id, formData);
  //     setUpdateDialogVisible(false);
  //     // Optionally refresh job assignment counts
  //     await handlePanelClick();
  //   } catch (error) {
  //     console.error('Failed to update allocation:', error);
  //   }
  // };

  const handlePanelClick = async () => {
    try {
      const counts = await getJobAssignCount(job._id);
      console.log(counts);
      setJobAssignmentCounts(counts);
    } catch (error) {
      console.error('Failed to fetch job assignment count:', error);
    }
  };

  const getJobApplicationCountByType = (stages, type) =>
    stages.filter(stage => stage.type === type).reduce((total, stage) => total + stage.jobApplicationsCount, 0);

  const sourcingCount = getJobApplicationCountByType(job.workflow.stages, 'sourcing');
  const interviewCount = getJobApplicationCountByType(job.workflow.stages, 'interview');
  const offerCount = getJobApplicationCountByType(job.workflow.stages, 'offer');

  if (isDragging) {
    return (
      <div className={styles.minimizedCard}>
        <p>{job.title}</p>
      </div>
    );
  }

  return (
    <section className={styles.jobCardContainer}>
      <div className={styles.headerSection}>
        <div className={styles.headerColumn}>
          <div className={styles.idContainer}>
            <p className={styles.textAlign_p}>{job.jobCode}</p>
            <i 
              className="pi pi-ellipsis-v" 
              onClick={(e) => {
                e.preventDefault();
                menu.current.toggle(e);
              }}
              style={{ cursor: 'pointer' }}
            />
            <Menu model={menuItems} popup ref={menu} />
          </div>
          <div className={styles.titleContainer}>
            <p>{job.title}</p>
            <span className={styles.logo}>
              <i className="pi pi-briefcase"></i>
            </span>
          </div>
        </div>
      </div>
      <div className={styles.infoGrid}>
        <div className={styles.infoColumn}>
          <label className={styles.label_style}>Positions</label>
          <p className={styles.p_style}>{job.noOfVacancies}</p>
        </div>
        <div className={styles.infoColumn}>
          <label className={styles.label_style}>Budget</label>
          <p className={styles.p_style}>{(job.maxCtcOffered / 100000).toFixed(2)} L</p>
        </div>
        <div className={styles.infoColumn}>
          <label className={styles.label_style}>SPOC</label>
          <p className={styles.p_style}>{job.spoc?.firstName || 'NA'}</p>
        </div>
      </div>
      <div>
        <Panel
          toggleable
          collapsed
          collapseIcon="pi pi-chevron-up"
          expandIcon="pi pi-chevron-down"
          className={styles.detailPanel}
          onExpand={handlePanelClick}
        >
          <div className={styles.panelContent}>
            <div className={styles.detailColumn}>
              <span>Team</span>
              <span>{jobAssignmentCounts.teamCount > 0 ? `${jobAssignmentCounts.teamCount}T - ${jobAssignmentCounts.memberCount}R` : '0T - 0R'}</span>
            </div>
            <div className={styles.detailColumn}>
              <span>Vendor</span>
              <span>{jobAssignmentCounts.vendorCount > 0 ? jobAssignmentCounts.vendorCount : '0'}</span>
            </div>
            <div className={styles.detailColumn}>
              <span>Freelancer</span>
              <span>Yes</span>
            </div>
          </div>
          <div className={styles.panelContent}>
            <div className={styles.detailColumn}>
              <span>Profiles</span>
              <span>{sourcingCount > 0 ? sourcingCount : '0'}</span>
            </div>
            <div className={styles.detailColumn}>
              <span>Interviews</span>
              <span>{interviewCount > 0 ? interviewCount : '0'}</span>
            </div>
            <div className={styles.detailColumn}>
              <span>Selections</span>
              <span>{offerCount > 0 ? offerCount : '0'}</span>
            </div>
          </div>
          <div className={styles.extraDetails}>
            <div className={styles.detailRow}>
              <span>Employment Type</span>
              <span>{employmentTypeMapping[job.employmentType] || job.employmentType}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Primary Skills</span>
              <span className={styles.skills}>{job.primarySkills?.length > 0 ? job.primarySkills.join(', ') : 'No primary skills listed'}</span>
            </div>
          </div>
        </Panel>
      </div>
      {/* <UpdateAllocationDialog
        visible={updateDialogVisible}
        onHide={() => setUpdateDialogVisible(false)}
        job={job}
        onSuccess={handlePanelClick}
      /> */}
    </section>
  );
};

export default JobAllocationCard;
