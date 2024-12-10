import styles from '@/styles/shared/list_page.module.scss';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import AccountCard from '@/components/Card/AccountCard';
import TitleBar from '@/components/TitleBar';
import React, { useEffect, useState } from 'react';
import { bulkChangeStatus, bulkDeleteOrgs, getAccountTypes, getAllIndustries, getCountries, getFilterOrgs, getOrgByType, getSalesDashboard, setToken } from '@/services/api.service';
import Pagination from '@/components/Pagination';
import CustomDialog from '@/utils/Dialog';
import { OrgType } from '@/services/types';
import { Dropdown } from 'primereact/dropdown';
import ChangeStatusModal from '@/components/Modals/ChangeStatus';
import { ToastContainer, toast } from 'react-toastify';

export async function getServerSideProps({ req, query }) {
  try {
    setToken(req);
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const [data, dashboardData, industries, countries, accountType] = await Promise.all([
      getOrgByType('account-org', page, limit),
      getSalesDashboard('account-org'),
      getAllIndustries(),
      getCountries(),
      getAccountTypes(),
    ]);
    const totalRecords = dashboardData.count || 0;
    return {
      props: {
        initialData: data || [],
        industryData: industries || [],
        countryData: countries || [],
        accountTypeData: accountType || [],
        totalRecords: totalRecords,
        currentPage: page,
        limit: limit
      }
    };
  } catch (error) {
    console.error(error?.message);
    return {
      props: {
        error: error?.message,
      },
    };
  }
}

const orgStatus = [
  { label: 'Qualified', value: 'qualified' },
  { label: 'Prospect', value: 'prospect' },
  { label: 'Dormant', value: 'dormant' },
  { label: 'Client', value: 'client' },
  { label: 'Customer', value: 'customer' },
  { label: 'Dead', value: 'dead' },
];
export default function Accounts({ initialData, error, currentPage, limit, totalRecords, industryData, countryData, accountTypeData }) {
  const router = useRouter();
  const [data, setData] = useState(initialData || null);
  const [page, setPage] = useState(currentPage || 1);
  const [itemsPerPage, setItemsPerPage] = useState(limit);
  const [selectedIds, setSelectedIds] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedBulkAction, setSelectedBulkAction] = useState(null);
  const [title, setTitle] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [, setLoading] = useState(true);
  const [changeStatusVisible, setChangeStatusVisible] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState(null);
  const [confirmBulkUpdateVisible, setConfirmBulkUpdateVisible] = useState(false);

  useEffect(() => {
    fetchData(); // Fetch data on component mount
  }, [page, itemsPerPage]);


  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getOrgByType('account-org', page, itemsPerPage);
      setData(response || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const newAccountClicked = () => router.push(`/sales/accounts/add`);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error("No accounts selected for deletion.");
      return;
    }

    try {
      await bulkDeleteOrgs(selectedIds); // Call your bulk delete API function
      const response = await getOrgByType('account-org', page, itemsPerPage);
      setData(response || []);
      setSelectedIds([]); // Clear selection
      setDialogVisible(false);
    } catch (error) {
      toast.error("Error during bulk delete:", error);
    }
  };

  const handleBulkAction = (action) => {
    setSelectedBulkAction(action); // Just set the action, don't trigger any operation here
  };

  const handleStatusChange = async (status, fileIds, comment, ) => {
    if (selectedIds.length === 0) {
      toast.error('No accounts selected for bulk update.');
      return;
    }

    const payload = {
      status,
      orgIds: selectedIds,
      comment: {
        contents: comment, // Add your status change message here
        attachments:  fileIds ? fileIds : [], // You can add attachments if necessary
        orgIds: selectedIds, // Include the selected IDs here as well
      }
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await bulkChangeStatus(payload);
      const updatedData = data.map(item =>
        selectedIds.includes(item._id) ? { ...item, status } : item
      );
      setData(updatedData); // Update UI with new status for selected accounts
      setChangeStatusVisible(false); // Close modal after success
      setSelectedIds([]); // Clear selection
      toast.success('Successfully updated the status of the selected accounts.');
      fetchData();

    } catch (error) {
      toast.error('Error during bulk status update:', error);
    }
  };


  const handleApplyBulkAction = () => {
    if (!selectedBulkAction) {
      toast.error("Please select a bulk action.");
      return;
    }

    switch (selectedBulkAction) {
      case 'bulkDelete':
        if (selectedIds.length === 0) {
          toast.error("No accounts selected for deletion.");
        } else {
          setDialogVisible(true); // Show bulk delete confirmation dialog
        }
        break;

      case 'bulkUpdate':
        if (selectedIds.length === 0) {
          toast.error("No accounts selected for bulk update.");
        } else {
          setConfirmBulkUpdateVisible(true); // Open the ChangeStatus modal
        }
        break;

      default:
        break;
    }
  };
  const handleApplyFilters = async () => {
    const params = {
      title: title || undefined,
      industryId: selectedIndustry || undefined,
      countryId: selectedCountry || undefined,
      orgType: OrgType.ACCOUNT_ORG,
      page: page,
      limit: itemsPerPage,
    };

    try {
      const filteredOrgs = await getFilterOrgs(params);
      setData(filteredOrgs || []);
    } catch (error) {
      console.error('Error fetching filtered clients:', error);
    }
  };

  const handleResetFilters = async () => {
    setTitle('');
    setSelectedIndustry(null);
    setSelectedCountry(null);

    // Refetch the unfiltered data
    try {
      const response = await getOrgByType('account-org', 1, itemsPerPage);
      setData(response || []);
      setPage(1); // Reset the page to the first page
      router.push({
        pathname: router.pathname,
        query: { page: 1, limit: itemsPerPage }, // Reset query params
      });
    } catch (error) {
      console.error('Error resetting filters:', error);
    }
  };

  const handleConfirmBulkUpdate = () => {
    setConfirmBulkUpdateVisible(false); // Close confirmation dialog
    setChangeStatusVisible(true); // Open ChangeStatusModal
  };


  if (error) {
    return <div>Something Went Wrong!!!</div>;
  }

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
    setPage(1); // Reset to the first page when items per page changes
    router.push({
      pathname: router.pathname,
      query: { ...router.query, limit: value, page: 1 },
    });
  };

  return (
    <>
      <ToastContainer />
      <TitleBar title={'Accounts'}>
        <Button label="New Account" onClick={newAccountClicked} />
      </TitleBar>
      <div className={styles.filters}>
        <div className={styles.right_section}>
         <div className="p-inputgroup">
            <InputText
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Search by Title"
              className="p-inputtext"
            />
            <span className="p-inputgroup-addon">
              <i className="pi pi-search"></i>
            </span>
          </div>

          <Dropdown
            value={selectedIndustry}
            options={industryData?.map(industry => ({ label: industry.name, value: industry._id }))}
            onChange={(e) => setSelectedIndustry(e.value)}
            placeholder="Select Industry"
          />
          <Dropdown
          value={selectedAccountType}
          options={accountTypeData?.map(type => ({ label: type.name, value: type._id }))}
          onChange={(e) => setSelectedAccountType(e.value)}
          placeholder="Select Account Type"
        />

          <Dropdown
            value={selectedCountry}
            options={countryData?.map(country => ({ label: country.countryName, value: country._id }))}
            onChange={(e) => setSelectedCountry(e.value)}
            placeholder="Select Country"
          />

          <Button label="Apply" onClick={handleApplyFilters} />
          <Button label="Reset" onClick={handleResetFilters} />
        </div>
      </div>
      <div className={styles.left_section}>
        <Dropdown
          value={selectedBulkAction}
          options={[
            { label: 'Bulk Delete', value: 'bulkDelete' },
            { label: 'Bulk Update', value: 'bulkUpdate' },
          ]}
          onChange={(e) => handleBulkAction(e.value)}
          placeholder="Select Bulk Action"
        // disabled={selectedIds.length === 0} // Disable if no clients are selected
        />
        <Button label="Apply" onClick={handleApplyBulkAction} />

      </div>

      <AccountCard data={data} selectedIds={selectedIds} setSelectedIds={setSelectedIds}  />

      {/* <div className='flex justify-content-center'> */}
      <div className={styles.paginationContainer}>
        <Pagination
          page={page}
          itemsPerPage={itemsPerPage}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </div>

      <CustomDialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        header="Confirm bulk delete"
        content={(
          <div className={styles.dialogContent}>
            <p className={styles.dialogHeader}>Are you sure you want to delete ?</p>
            <p className={styles.dialogBody}>
              Currently, you have <strong className={styles.highlight}>{selectedIds.length}</strong> accounts selected.
            </p>
          </div>
        )}
        onConfirm={handleBulkDelete}
        onCancel={() => setDialogVisible(false)}
      />

      <CustomDialog
        visible={confirmBulkUpdateVisible}
        onHide={() => setConfirmBulkUpdateVisible(false)}
        header="Confirm bulk update"
        content={(
          <div className={styles.dialogContent}>
            <p className={styles.dialogHeader}>Are you sure you want to change the status ?</p>
            <p className={styles.dialogBody}>
              Currently, you have <strong className={styles.highlight}>{selectedIds.length}</strong> accounts selected.
            </p>
          </div>
        )}
        onConfirm={handleConfirmBulkUpdate} // Confirming will open ChangeStatusModal
        onCancel={() => setConfirmBulkUpdateVisible(false)}
      />


      {changeStatusVisible && (
        <ChangeStatusModal
          statusEnum={orgStatus}
          visible={changeStatusVisible}
          setVisible={setChangeStatusVisible}
          onConfirm={handleStatusChange}
          
        />
      )}
    </>
  );
}
