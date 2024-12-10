import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card'; // Import the Card component
import Image from 'next/image';
import { JobApplication } from '@/services/types';

interface CandidateDataTableProps {
  candidates: JobApplication[];
}

const CandidateDataTable: React.FC<CandidateDataTableProps> = ({ candidates }) => {

  // Function to format dates
  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'
    ];
    const month = monthNames[monthIndex];
    return `${day} ${month} ${year}`;
  }

   // Function to get the most recent education record
   function getMostRecentEducation(educationArray) {
    if (!educationArray || educationArray.length === 0) return '';

    // Find the most recent education record
    const sortedEducation = educationArray
      .filter(edu => edu.endDate) // Filter out records with no endDate
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

    // Get the most recent education
    const mostRecent = sortedEducation[0]; 
    if (mostRecent) {
      const endDate = formatDate(mostRecent.endDate);
      return `${mostRecent.university}${endDate ? ', ' + endDate : ''}`;
    }
    return '';
  }


  // Labels for columns
  const labels = [
    'Notice Period Days',
    'Last Working Date',
    'BGV Verified',
    'Ranking',
    'Current Location',
    'Preferred Locations',
    'Study',
    'Certifications',
    'Rewards',
  ];

  const getCandidateDetails = (candidate, label) => {
    switch (label) {
      case 'Notice Period Days':
        return candidate.noticePeriodDays;
      case 'BGV Verified':
        return candidate.bgvVerified ? (
          <i className="pi pi-verified" style={{ color: 'green' }}></i>
          ) : (
            <i className="pi pi-ban" style={{ color: 'red' }}></i>
          );
      case 'Ranking':
        return candidate.ranking;
      case 'Serving Notice Period':
        return candidate.servingNoticePeriod ? (
          <i className="pi pi-verified" style={{ color: 'green' }}></i>
        ) : (
          <i className="pi pi-ban" style={{ color: 'red' }}></i>
        );
      case 'Last Working Date':
        return formatDate(candidate.lastWorkingDate);
      case 'Current Location':
        return candidate.currentLocation;
      case 'Preferred Locations':
        return (
          <Card style={{ padding: '1rem' }}>
            <ul>
              {candidate.reLocation.map((location, index) => (
                <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Image
                    style={{ objectFit: 'contain', marginRight: '0.5rem' }}
                    src="/assets/job/Place Marker.svg"
                    height="24"
                    width="26"
                    alt=""
                  />
                  <span>{location.city}</span>
                </li>
              ))}
            </ul>
          </Card>
        );
      case 'Study':
        return getMostRecentEducation(candidate.educationQualification);
      default:
        return '';
    }
  };

  // Inline styles for table cells
  const cellStyle = {
    textAlign: 'center' as React.CSSProperties['textAlign'], // Cast to correct type
    border: '1px solid #e5e7eb',
    borderWidth: '0 1px 0 1px' as React.CSSProperties['borderWidth'], // Cast to correct type
    padding: '2rem'
  };

  // Define header styles
  const headerStyle = {
    display: 'none'
  };

  // Columns with applied styles
  const candidateColumns = candidates.map((candidate, index) => (
    <Column
      key={index}
      body={(rowData) => getCandidateDetails(candidate, rowData.label)}
      header={`${candidate.firstName} ${candidate.lastName}`}
      bodyStyle={cellStyle} 
      headerStyle={headerStyle} 
    />
  ));

  return (
    <div style={{ overflow: 'auto', border: '2px solid #e5e7eb', borderRadius:'20px'}}>
      <DataTable
        value={labels.map(label => ({ label }))}
        scrollable
        scrollHeight="flex"
      >
        <Column
          field="label"
          header="Detail"
          bodyStyle={cellStyle}  
          headerStyle={headerStyle} 
        />
        {candidateColumns}
      </DataTable>
    </div>
  );
};

export default CandidateDataTable;
