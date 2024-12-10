import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import styles from '@/styles/shared/Jobs/list_page.module.scss';
import { Button } from 'primereact/button';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api, { setToken } from '@/services/api.service';
import JobCard from '@/components/Card/JobCard';
import { Paginator } from 'primereact/paginator';
import CustomDialog from '@/utils/Dialog';
import { ToastContainer, toast } from 'react-toastify';
import ChangeStatusModal from '@/components/Modals/ChangeStatus';

export const getServerSideProps = async ({ req, query }) => {
  try {
    setToken(req);
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;

    const [data, jobsCount, departments] = await Promise.all([
      api.getAllJobs({ page: page, limit: limit }),
      api.getJobsCount(),
      api.getAllDepartments({ limit: 100 })
    ]);
    const totalRecords = jobsCount || 0;
    // console.log(data);
    const locations = await api.getJobLocations();
    return {
      props: {
        jobs: data || [],
        locations: locations || [],
        currentPage: page,
        limit: limit,
        totalRecords: totalRecords,
        departments,
      },
    };
  } catch (error) {
    console.error('Error in fetching jobs data:', error.message);
    return {
      props: {
        jobs: [],
        locations: [],
        currentPage: 1,
        limit: 10,
        totalRecords: 0,
        departments: [],
      },
    };
  }
};

export default function Lists({ jobs, locations, currentPage, limit, totalRecords, departments }) {
  const router = useRouter();
  const [data, setData] = useState(jobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [filterApply, setFilterApply] = useState(false);
  const [selectedBulkAction, setSelectedBulkAction] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [confirmBulkUpdateVisible, setConfirmBulkUpdateVisible] =
    useState(false);
  const [changeStatusVisible, setChangeStatusVisible] = useState(false);
  const [page, setPage] = useState(currentPage || 1);
  const [itemsPerPage, setItemsPerPage] = useState(limit);

  departments = departments ? departments.map(department => ({
    label: department.label,
    value: department._id
  })) : []

  const onPageChange = (event) => {
    const newPage = event.page + 1; // Page index starts from 0
    setPage(newPage);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: newPage },
    });
  };

  const onItemsPerPageChange = (e) => {
    const value = e.value;
    setItemsPerPage(value);
    setPage(1);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, limit: value, page: 1 },
    });
  };

  const itemsPerPageOptions = [
    { label: 5, value: 5 },
    { label: 10, value: 10 },
    { label: 20, value: 20 },
    { label: 30, value: 30 },
    { label: 'All', value: totalRecords.jobsCount }, // 'All' option if needed
  ];

  const jobStatus = [
    { label: 'Open', value: 'Open' },
    { label: 'Close', value: 'Close' },
    { label: 'Draft', value: 'Draft' },
  ];

  const handleApplyBulkAction = () => {
    if (!selectedBulkAction) {
      toast.error('Please select a bulk action.');
      return;
    }

    switch (selectedBulkAction) {
      case 'bulkDelete':
        if (selectedIds.length === 0) {
          toast.error('No jobs selected for deletion.');
        } else {
          setDialogVisible(true); // Show bulk delete confirmation dialog
        }
        break;

      case 'bulkUpdate':
        if (selectedIds.length === 0) {
          toast.error('No jobs selected for bulk update.');
        } else {
          setConfirmBulkUpdateVisible(true); // Open the ChangeStatus modal
        }
        break;

      default:
        break;
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('No jobs selected for deletion.');
      return;
    }

    try {
      await api.bulkSoftDeleteJobs(selectedIds);
      const response = await api.getAllJobs({
        page: page,
        limit: itemsPerPage,
      });
      setData(response || []);
      setSelectedIds([]); // Clear selection
      setDialogVisible(false);
    } catch (error) {
      toast.error('Error during bulk delete:', error);
    }
  };

  const handleConfirmBulkUpdate = () => {
    setConfirmBulkUpdateVisible(false); // Close confirmation dialog
    setChangeStatusVisible(true); // Open ChangeStatusModal
  };

  const locationOptions = (locations || []).map((location) => ({
    label: location.city,
    value: location._id,
  }));

  const bulkActions = [
    { label: 'Bulk delete', value: 'bulkDelete' },
    { label: 'Bulk update', value: 'bulkUpdate' },
  ];

  useEffect(() => {
    const fetchFilteredJobs = async () => {
      if (!filterApply) return; // If apply is not clicked, don't run

      const filters = {
        name: searchTerm ?? undefined,
        locationId: selectedLocation ?? undefined,
        department: selectedDepartment ?? undefined,
        isOpen:
          selectedStatus === 'Open'
            ? true
            : selectedStatus === 'Close'
              ? false
              : undefined,
        isDraft: selectedStatus === 'Draft' ? 'true' : undefined,
        page: 1,
        limit: 10,
      };

      try {
        const res = await api.getAllJobs(filters);
        // console.log(res)
        setData(res);
      } catch (error) {
        console.error('Error fetching filtered jobs:', error);
        setData(jobs);
      }

      setFilterApply(false);
    };

    fetchFilteredJobs();
  }, [filterApply]);

  return (
    <>
      <ToastContainer />
      {/* <div className={styles.header}>
                <div className={styles.title}>Jobs</div>
                <Button  >
                    <Link href={"/jobs/add"} className='text-white'>
                        Create Job
                    </Link>
                </Button>
            </div> */}
      <div className={`sticky top-0 ${styles.glassyHeader}`}>
        <div className={styles.filters}>
          <div className={styles.right_section}>
            <span className="p-input-icon-left">
              {/* <i className="pi pi-search" /> */}
              <InputText
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by job title"
              />
            </span>
            <span className="p-float-label">
              <Dropdown
                inputId="departments"
                value={selectedDepartment}
                options={departments}
                optionLabel="label"
                className="w-full md:w-14rem"
                onChange={(e) => setSelectedDepartment(e.value)}
                filter
              />
              <label htmlFor="dd-city">Select a Department</label>
            </span>
            <span className="p-float-label">
              <Dropdown
                inputId="locationOptions"
                value={selectedLocation}
                options={locationOptions}
                optionLabel="label"
                className="w-full md:w-14rem"
                onChange={(e) => setSelectedLocation(e.value)}
                filter
              />
              <label htmlFor="dd-city">Select a Location</label>
            </span>
            <span className="p-float-label">
              <Dropdown
                inputId="jobStatus"
                value={selectedStatus}
                options={jobStatus}
                optionLabel="label"
                className="w-full md:w-14rem"
                onChange={(e) => setSelectedStatus(e.value)}
              />
              <label htmlFor="Status">Status</label>
            </span>
            <Button label="Apply" onClick={() => setFilterApply(true)} />
            <Button label="Reset" onClick={() => router.reload()} />
            <div className='flex align-content-end'>
              <Button
                className="add-job-button"
                tooltip="Create Job"
                tooltipOptions={{ position: 'mouse' }} // Correct syntax for tooltipOptions
              >
                <Link href={'/jobs/add'} className="text-white">
                  <i className="pi pi-plus"></i>
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className={styles.filters}>
          <div className={styles.left_section}>
            <span className="p-float-label">
              <Dropdown
                value={selectedBulkAction}
                options={bulkActions}
                onChange={(e) => setSelectedBulkAction(e.value)}
                placeholder="Select Bulk Action"
                disabled={selectedIds.length === 0} // Disable if no clients are selected
              />
              <label htmlFor="BulkActions">Bulk Actions</label>
            </span>
            <Button label="Apply" onClick={handleApplyBulkAction} />
          </div>
          <div className={styles.right_section}>
            {limit * currentPage - limit} - {limit * currentPage} of{' '}
            {totalRecords.jobsCount}
            <i className={`pi pi-list ${styles.icons}`} />
            {/* <i className={`pi pi-th-large ${styles.icons}`} /> */}
          </div>
        </div>
      </div>
      <div className={styles.jobs_lists}>
        <div className={styles.show_result}>Showing {data.length} Jobs</div>
        <JobCard
          data={data}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
        />
      </div>
      <div className="flex justify-content-center">
        <Paginator
          first={(page - 1) * itemsPerPage}
          rows={itemsPerPage}
          totalRecords={totalRecords.jobsCount} // Adjust this or manage dynamically if possible
          onPageChange={onPageChange}
          className="justify-content-center"
        />
        <Dropdown
          value={itemsPerPage}
          options={itemsPerPageOptions}
          onChange={onItemsPerPageChange}
          style={{ width: '8rem', marginTop: '1rem', marginBottom: '1.2rem' }}
        />
      </div>

      <CustomDialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        header="Confirm bulk delete"
        content={
          <div className={styles.dialogContent}>
            <p className={styles.dialogHeader}>
              Are you sure you want to delete ?
            </p>
            <p className={styles.dialogBody}>
              Currently, you have{' '}
              <strong className={styles.highlight}>{selectedIds.length}</strong>{' '}
              jobs selected.
            </p>
          </div>
        }
        onConfirm={handleBulkDelete}
        onCancel={() => setDialogVisible(false)}
      />

      <CustomDialog
        visible={confirmBulkUpdateVisible}
        onHide={() => setConfirmBulkUpdateVisible(false)}
        header="Confirm bulk update"
        content={
          <div className={styles.dialogContent}>
            <p className={styles.dialogHeader}>
              Are you sure you want to change the status ?
            </p>
            <p className={styles.dialogBody}>
              Currently, you have{' '}
              <strong className={styles.highlight}>{selectedIds.length}</strong>{' '}
              accounts selected.
            </p>
          </div>
        }
        onConfirm={handleConfirmBulkUpdate} // Confirming will open ChangeStatusModal
        onCancel={() => setConfirmBulkUpdateVisible(false)}
      />

      {changeStatusVisible && (
        <ChangeStatusModal
          statusEnum={jobStatus}
          bulkJobs={selectedIds}
          visible={changeStatusVisible}
          setVisible={setChangeStatusVisible}
        />
      )}
    </>
  );
}
