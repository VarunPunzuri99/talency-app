import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import api, { bulkDeleteOrgMembers, getMembersByOrg, searchMembers, setToken } from '@/services/api.service';
import { InputText } from 'primereact/inputtext';
import TitleBar from '@/components/TitleBar';
import React, { useEffect, useState } from 'react';
import Pagination from '@/components/Pagination';
import CustomDialog from '@/utils/Dialog';
import { Dropdown } from 'primereact/dropdown';
import { ToastContainer, toast } from 'react-toastify';
import MemberCard from '@/components/Card/MemberCard';
import { jwtDecode } from 'jwt-decode';
import { Dialog } from 'primereact/dialog';
import { useDebounce } from 'primereact/hooks';
import 'react-toastify/dist/ReactToastify.css';


export async function getServerSideProps({ req, query }) {
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

    const decoded:any= jwtDecode(cookie);
        const orgId = decoded.org._id;

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;


    const data:any = await getMembersByOrg(orgId, page, limit);

    const { members, totalRecords } = data



    return {
      props: {
        initialData: members || [],
        totalRecords: totalRecords,
        // internalDepartments: internalDepartments,
        // internalRecruitmentTeams: internalRecruitmentTeams,
        currentPage: page,
        limit: limit,
        orgId: orgId
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

export default function Members({ initialData, error, currentPage, limit, totalRecords, orgId }) {
  const router = useRouter();
  const [data, setData] = useState(initialData || []);
  const [, setLoading] = useState(true);
  const [page, setPage] = useState(currentPage || 1);
  const [itemsPerPage, setItemsPerPage] = useState(limit);
  const [selectedIds, setSelectedIds] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedBulkAction, setSelectedBulkAction] = useState(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [inputValue, debouncedValue, setInputValue] = useDebounce(
    '',
    2000,
  );

  console.log('initialData', initialData);
  console.log('totalRecords', totalRecords)
  console.log('data',data)

  useEffect(() => {
    const fetch = async () => {
      if (inputValue && inputValue.trim() !== "") {
        try {
          const res = await searchMembers(orgId, debouncedValue);
          console.log('search card:', res)
          setData(res || []);
        } catch (error) {
          console.error('Error fetching members:', error);
        }
      } else if (inputValue.trim() === "") {
        const res = await getMembersByOrg(orgId, page, limit);
        setData(res || []);
      }
      else {
        setData(null);
      }
    };
    if (inputValue != null) {
      fetch();
    }
  }, [debouncedValue, inputValue]);

  useEffect(() => {
    fetchData();
  }, [page, itemsPerPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getMembersByOrg(orgId, page, itemsPerPage);
      setData(response || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error("No members selected for deletion.");
      return;
    }
    try {
      await bulkDeleteOrgMembers(orgId, selectedIds);
      setSelectedIds([]);
      setDialogVisible(false);
      fetchData();
    } catch (error) {
      toast.error("Error during bulk delete:", error);
    }
  };

  const handleBulkAction = (action) => {
    setSelectedBulkAction(action);
  };

  const handleApplyBulkAction = () => {
    if (!selectedBulkAction) {
      toast.error("Please select a bulk action.");
      return;
    }

    switch (selectedBulkAction) {
      case 'bulkDelete':
        if (selectedIds.length === 0) {
          toast.error("No members selected for deletion.");
        } else {
          setDialogVisible(true); // Show bulk delete confirmation dialog
        }
        break;

      default:
        break;
    }
  };

  const handleDeleteOptionClick = (member) => {
    setSelectedMember(member);
    setDeleteDialogVisible(true);
    console.log('member', member);
  };

  const handleDelete = async () => {
    try {
      await (api as any).deleteMember(orgId, selectedMember._id);
      setDeleteDialogVisible(false);
      toast.success(`Member  ${selectedMember.firstName ? selectedMember.firstName : selectedMember.fullName} deleted successfully `);
      fetchData();
    } catch (error) {
      console.log(error);
      toast.error(`An error occurred while deleting the member. ${selectedMember._id}`);
    }
  };


  const onPageChange = (event) => {
    const newPage = event.page + 1; // Page index starts from 0
    setPage(newPage);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: newPage },
    });
  };

  if (error) {
    return <div>Something Went Wrong!!!</div>;
  }

  const newMemberClicked = () => router.push('/settings/members/add');

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
      <TitleBar title={'Members'}>
        <Button label="New Member" onClick={newMemberClicked} />
      </TitleBar>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <div style={{
          flex: 1,
          marginRight: '1rem'
        }}>
          <span className="p-input-icon-left" style={{
            width: '100%',
          }}>

            <InputText
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search by Name, Email"
              style={{
                width: '100%',
                paddingLeft: '2rem',
                display: 'flex', // Use flexbox to align items
                alignItems: 'center',
              }}
            />
            <i className="pi pi-search" style={{
              position: 'absolute',
              left: '0.65rem',
              top: '70%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              marginRight: '1rem'
            }}></i>
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
        }}>
          <Dropdown
            value={selectedBulkAction}
            options={[{ label: 'Bulk Delete', value: 'bulkDelete' }]}
            onChange={(e) => handleBulkAction(e.value)}
            placeholder="Select Bulk Action"
            disabled={selectedIds.length === 0} // Disable if no clients are selected
            style={{
              marginRight: '0.5rem', // Space between dropdown and button
            }}
          />
          <Button
            label="Apply"
            onClick={handleApplyBulkAction}
          />
        </div>
      </div>

      <MemberCard data={data.members} selectedIds={selectedIds} setSelectedIds={setSelectedIds} onDeleteOptionClick={handleDeleteOptionClick} />
      <div className='flex justify-content-center ' style={{ marginBottom: '3.5rem' }}>
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.15rem',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                marginBottom: '0.05rem',
                color: '#333',
              }}
            >
              Are you sure you want to delete ?
            </p>
            <p
              style={{
                fontSize: '1rem',
                color: '#555',
                lineHeight: 1.5,
              }}
            >
              Currently, you have{' '}
              <strong
                style={{
                  color: '#d9534f',
                  fontWeight: 700,
                }}
              >
                {selectedIds.length}
              </strong>{' '}
              members selected.
            </p>
          </div>
        )}
        onConfirm={handleBulkDelete}
        onCancel={() => setDialogVisible(false)}
      />


      <Dialog
        visible={deleteDialogVisible}
        onHide={() => setDeleteDialogVisible(false)}
        header="Confirm Delete"
        footer={
          <div style={{ textAlign: 'right', marginTop: '10px' }}>
            <Button
              label="Proceed"
              icon="pi pi-check"
              onClick={handleDelete}
              className="p-button-danger"
              style={{ marginRight: '10px', backgroundColor: '#e74c3c', borderColor: '#e74c3c' }}
            />
          </div>
        }
        style={{
          width: '400px',
          borderRadius: '8px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '16px', color: '#555', margin: '20px 0' }}>
          Are you sure you want to delete this member?
        </p>
      </Dialog>


    </>
  );
}



