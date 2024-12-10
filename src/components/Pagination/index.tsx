import React from 'react';
import { Paginator } from 'primereact/paginator';
import { Dropdown } from 'primereact/dropdown';

const Pagination = ({ page, itemsPerPage, totalRecords, onPageChange, onItemsPerPageChange }) => {
  const itemsPerPageOptions = [
    { label: 5, value: 5 },
    { label: 10, value: 10 },
    { label: 20, value: 20 },
    { label: 30, value: 30 },
    { label: 'All', value: totalRecords }
  ];

  return (
    <div className='flex justify-content-center'>
      <Paginator
        first={(page - 1) * itemsPerPage}
        rows={itemsPerPage}
        totalRecords={totalRecords}
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
  );
};

export default Pagination;
