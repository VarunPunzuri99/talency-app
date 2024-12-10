import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  bulkDeleteContacts,
  contactsBulkChangeStatus,
  getAllContacts,
  getAllIndustries,
  getFilterContacts,
  getOrgByType,
  getSalesDashboardContact,
  setToken,
} from '@/services/api.service';
import styles from '@/styles/shared/list_page.module.scss';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import ContactCard from '@/components/Card/ContactCard';
import TitleBar from '@/components/TitleBar';
import { ToastContainer, toast } from 'react-toastify';
import { Dropdown } from 'primereact/dropdown';
import CustomDialog from '@/utils/Dialog';
import Pagination from '@/components/Pagination';
import ChangeStatusModal from '@/components/Modals/ChangeStatus';

export async function getServerSideProps({ req, query }) {
  setToken(req);
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;

  try {
    const [res, contactsCount, accountsData, industriesData] =
      await Promise.all([
        getAllContacts(page, limit),
        getSalesDashboardContact(),
        getOrgByType('account-org', page, limit),
        getAllIndustries(),
      ]);

    const totalRecords = contactsCount.count || 0;
    return {
      props: {
        contacts: res || [], // Responds with an array of contacts
        currentPage: page,
        totalRecords: totalRecords,
        limit: limit,
        industriesData: industriesData,
        accountsData: accountsData,
      },
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

const contactStatus = [
  { label: 'Qualified', value: 'qualified' },
  { label: 'Prospect', value: 'prospect' },
  { label: 'Dormant', value: 'dormant' },
  { label: 'Client', value: 'client' },
  { label: 'Customer', value: 'customer' },
  { label: 'Dead', value: 'dead' },
];

export default function Contacts({
  contacts,
  error,
  currentPage,
  limit,
  totalRecords,
  accountsData,
  industriesData,
}) {
  const router = useRouter();
  const [data, setData] = useState(contacts);
  // const [loading, setLoading] = useState(false);
  // const [inputValue, debouncedValue, setInputValue] = useDebounce('', 300);
  const [page, setPage] = useState(currentPage || 1);
  const [itemsPerPage, setItemsPerPage] = useState(limit);
  const [selectedIds, setSelectedIds] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedBulkAction, setSelectedBulkAction] = useState(null);
  const [name, setName] = useState('');
  const [referredBy, setReferredBy] = useState('');
  const [designation, setDesignation] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [changeStatusVisible, setChangeStatusVisible] = useState(false);
  const [confirmBulkUpdateVisible, setConfirmBulkUpdateVisible] =
    useState(false);

  useEffect(() => {
    fetchData(); // Fetch data on component mount
  }, [page, itemsPerPage]);

  console.log('mahesh');
  const fetchData = async () => {
    // setLoading(true);
    try {
      const response = await getAllContacts(page, itemsPerPage);
      setData(response || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      // setLoading(false);
    }
  };

  const newContactClicked = () => router.push(`/sales/contacts/add`);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('No contacts selected for deletion.');
      return;
    }

    try {
      await bulkDeleteContacts(selectedIds); // Call your bulk delete API function
      const response = await getAllContacts(page, itemsPerPage);
      setData(response || []);
      setSelectedIds([]); // Clear selection
      setDialogVisible(false);
    } catch (error) {
      toast.error('Error during bulk delete:', error);
    }
  };

  const handleBulkAction = (action) => {
    setSelectedBulkAction(action); // Just set the action, don't trigger any operation here
  };

  const handleStatusChange = async (status, fileIds, comment) => {
    if (selectedIds.length === 0) {
      toast.error('No accounts selected for bulk update.');
      return;
    }

    const payload = {
      status,
      contactIds: selectedIds,
      comment: {
        contents: comment, // Add your status change message here
        attachments: fileIds ? fileIds : [], // You can add attachments if necessary
        contactIds: selectedIds, // Include the selected IDs here as well
      },
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await contactsBulkChangeStatus(payload);
      const updatedData = data.map((item) =>
        selectedIds.includes(item._id) ? { ...item, status } : item,
      );
      setData(updatedData); // Update UI with new status for selected accounts
      setChangeStatusVisible(false); // Close modal after success
      setSelectedIds([]); // Clear selection
      toast.success(
        'Successfully updated the status of the selected accounts.',
      );
      fetchData();
    } catch (error) {
      toast.error('Error during bulk status update:', error);
    }
  };

  const handleApplyBulkAction = () => {
    if (!selectedBulkAction) {
      toast.error('Please select a bulk action.');
      return;
    }

    switch (selectedBulkAction) {
      case 'bulkDelete':
        if (selectedIds.length === 0) {
          toast.error('No contacts selected for deletion.');
        } else {
          setDialogVisible(true); // Show bulk delete confirmation dialog
        }
        break;

      case 'bulkUpdate':
        if (selectedIds.length === 0) {
          toast.error('No contacts selected for bulk update.');
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
      name: name || undefined,
      industryId: selectedIndustry || undefined,
      accountId: selectedAccount || undefined,
      designation: designation || undefined,
      referredBy: referredBy || undefined,
      page: page,
      limit: itemsPerPage,
    };

    try {
      const filteredOrgs = await getFilterContacts(params);
      setData(filteredOrgs || []);
    } catch (error) {
      console.error('Error fetching filtered contacts:', error);
    }
  };

  const handleResetFilters = async () => {
    setName('');
    setSelectedIndustry(null);
    setSelectedAccount(null);

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
      <TitleBar title={'Contacts'}>
        <Button label="New Contact" onClick={newContactClicked} />
      </TitleBar>
      <div className={styles.filters}>
        <div className={styles.right_section}>
          <div className="p-inputgroup">
            <InputText
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Search by Name"
              className="p-inputtext"
            />
            <span className="p-inputgroup-addon">
              <i className="pi pi-search"></i>
            </span>
          </div>

          <Dropdown
            value={selectedIndustry}
            options={industriesData?.map((industry) => ({
              label: industry.name,
              value: industry._id,
            }))}
            onChange={(e) => setSelectedIndustry(e.value)}
            placeholder="Select Industry"
          />
          <Dropdown
            value={selectedAccount}
            options={accountsData?.map((account) => ({
              label: account.title,
              value: account._id,
            }))}
            onChange={(e) => setSelectedAccount(e.value)}
            placeholder="Select Account"
          />

          <InputText
            value={designation}
            onChange={(e) => setDesignation(e.target.value)} // Update title state when input changes
            placeholder="Designation" // Add a placeholder for clarity
          />

          <InputText
            value={referredBy}
            onChange={(e) => setReferredBy(e.target.value)} // Update title state when input changes
            placeholder="Referred By" // Add a placeholder for clarity
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

      <ContactCard
        data={data}
        setData={setData}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
      />

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
        content={
          <div className={styles.dialogContent}>
            <p className={styles.dialogHeader}>
              Are you sure you want to delete ?
            </p>
            <p className={styles.dialogBody}>
              Currently, you have{' '}
              <strong className={styles.highlight}>{selectedIds.length}</strong>{' '}
              contacts selected.
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
              contacts selected.
            </p>
          </div>
        }
        onConfirm={handleConfirmBulkUpdate} // Confirming will open ChangeStatusModal
        onCancel={() => setConfirmBulkUpdateVisible(false)}
      />

      {changeStatusVisible && (
        <ChangeStatusModal
          statusEnum={contactStatus}
          visible={changeStatusVisible}
          setVisible={setChangeStatusVisible}
          onConfirm={handleStatusChange}
        />
      )}
    </>
  );
}
