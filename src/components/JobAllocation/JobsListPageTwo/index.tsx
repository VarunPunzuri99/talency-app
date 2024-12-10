import React, { useState } from 'react';
import Fuse from 'fuse.js';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Badge } from 'primereact/badge';
import styles from './index.module.scss';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import JobAssignmentCard from '../JobAssignmentCard';

interface Job {
  _id: string;
  title: string;
  hiringMode: string;
  primarySkills: string[];
  jobType: string;
  noOfVacancies: number;
  maxCtcOffered: number;
  endClientOrg?: { title: string };
}

interface JobsListPageProps {
  jobs: Job[];
  onDragStart: (event: React.DragEvent<HTMLDivElement>, dragData: any) => void;
  departments;
  locations
}

function JobsListPageOfAssignment({ jobs, onDragStart }: JobsListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [groupByOption, setGroupByOption] = useState('');
  const [activeTabIndex, setActiveTabIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 3;

  // const [selectedDepartment, setSelectedDepartment] = useState(null);
  // const [selectedLocation, setSelectedLocation] = useState(null);
  // const [selectedStatus, setSelectedStatus] = useState(null);




  // Search Configuration for Fuse.js
  const fuseOptions = {
    keys: ['title', 'hiringMode', 'primarySkills', 'jobType', 'jobCode', 'endClientOrg'],
    threshold: 0.3,
  };

  const sortOptions = [
    { label: 'None', value: '' },
    { label: 'No of Vacancies', value: 'noOfVacancies' },
    { label: 'Max CTC Offered', value: 'maxCtcOffered' },
  ];

  // const jobStatus = [
  //   { label: 'Open', value: 'Open' },
  //   { label: 'Close', value: 'Close' },
  //   { label: 'Draft', value: 'Draft' },
  // ];

  const groupByOptions = [
    { label: 'None', value: '' },
    { label: 'End Client', value: 'endClientOrg' },
    { label: 'Job Type', value: 'jobType' },
    { label: 'Hiring Mode', value: 'hiringMode' },
  ];

  const fuse = new Fuse(jobs, fuseOptions);
  const searchResults: Job[] = searchQuery
    ? fuse.search(searchQuery).map((result) => result.item)
    : jobs;

  // Sorting Function
  const applySorting = (jobs: Job[], sortOption: string) => {
    const sortedJobs = [...jobs];
    if (sortOption === 'noOfVacancies') {
      sortedJobs.sort((a, b) => b.noOfVacancies - a.noOfVacancies);
    } else if (sortOption === 'maxCtcOffered') {
      sortedJobs.sort((a, b) => b.maxCtcOffered - a.maxCtcOffered);
    }
    return sortedJobs;
  };

  const sortedJobs = applySorting(searchResults, sortOption);

  // Grouping Function
  const groupJobs = (jobs: Job[], groupBy: string) => {
    return jobs.reduce<Record<string, Job[]>>((acc, job) => {
      const key =
        groupBy === 'endClientOrg'
          ? job.endClientOrg?.title ?? 'Unknown'
          : groupBy === 'jobType'
            ? job.jobType
            : groupBy === 'hiringMode'
              ? job.hiringMode
              : 'Ungrouped';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(job);
      return acc;
    }, {});
  };

  const groupedJobs = groupJobs(sortedJobs, groupByOption);

  // Handle accordion tab change
  const onTabChange = (e: any) => {
    setActiveTabIndex(e.index);
  };

  // Determine if grouping is applied
  const isGroupedView = groupByOption !== '';

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSortOption('');
    setGroupByOption('');
  };

  // Pagination logic
  const totalPages = Math.ceil(sortedJobs.length / jobsPerPage);
  const paginatedJobs = sortedJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="max-h-screen w-full border-1 border-round-xl p-2 overflow-y-scroll border-200">
      {/* Search, Sort, and Group controls */}
      <div className="flex flex-column gap-2 mb-2">
        <InputText
          value={searchQuery}
          type="text"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Jobs..."
        />
        <div className="flex gap-2" style={{ maxWidth: '400px' }}>
          <div className='filterDropdown'>
            <Dropdown
              value={groupByOption}
              onChange={(e) => setGroupByOption(e.value)}
              options={groupByOptions}
              placeholder="Group By"
              className={`w-full md:w-8rem ${styles.dropdownWrapper}`}
              style={{ fontSize: "8px" }}
            />
          </div>
          <div className='filterDropdown'>
            <Dropdown
              value={sortOption}
              onChange={(e) => setSortOption(e.value)}
              options={sortOptions}
              placeholder="Sort By"
              className={`w-full md:w-8rem ${styles.dropdownWrapper}`}
            />
          </div>
          <div>
            <Button
              label="Reset"
              onClick={resetFilters}
              className="p-button-outlined"
              style={{fontSize:'14px', padding:"10px"}}
            />
          </div>
        </div>
        {/* <div className="flex gap-2">
        <span className="">
              <Dropdown
                inputId="departments"
                value={selectedDepartment}
                options={departments}
                placeholder='department'
                className="w-full md:w-15rem"  
                onChange={(e) => setSelectedDepartment(e.value)}
                filter
              />
            </span>
            <Button label="Apply" />
        </div>
        <div className='flex'>
        <span className="">
              <Dropdown
                inputId="locationOptions"
                value={selectedLocation}
                options={locations}
                placeholder='location'
                className="w-full md:w-15rem"
                onChange={(e) => setSelectedLocation(e.value)}
                filter
              />
            </span>
         
        </div>
        <div className='flex'>
        <span className="">
              <Dropdown
                inputId="jobStatus"
                value={selectedStatus}
                options={jobStatus}
                placeholder='status'
                className="w-full md:w-15rem"
                onChange={(e) => setSelectedStatus(e.value)}
              />
            </span>
         
        </div> */}
      </div>

      {/* Default List View (Normal List of Jobs) */}
      {!isGroupedView ? (
        <div className={styles.maxHeightScreen}>
          {paginatedJobs.length === 0 ? (
            <div className={styles.noJobsMessage}>No jobs found for your search.</div>
          ) : (
            paginatedJobs.map((job) => (
              <div key={job._id} className={styles.jobCard}>
                <JobAssignmentCard
                  job={job}
                  onDragStart={onDragStart}
                />
              </div>
            ))
          )}
        </div>
      ) : (
        // Grouped View (Accordion)
        <div className={styles.jobGroups}>
          {searchResults.length === 0 ? (
            <div className={styles.noJobsMessage}>No jobs available.</div>
          ) : Object.keys(groupedJobs).length > 0 ? (
            <Accordion activeIndex={activeTabIndex} onTabChange={onTabChange}>
              {Object.entries(groupedJobs).map(([key, jobsList]) => (
                <AccordionTab
                  key={key}
                  header={
                    <span className="flex align-items-center gap-2 w-full">
                      <span className="font-bold">{key}</span>
                      <Badge value={jobsList.length} className="ml-auto" />
                    </span>
                  }
                >
                  <div className={styles.jobList}>
                    {jobsList.map((job) => (
                      <div key={job._id} className={styles.jobCard}>
                        <JobAssignmentCard
                          job={job}
                          onDragStart={onDragStart}
                        />
                      </div>
                    ))}
                  </div>
                </AccordionTab>
              ))}
            </Accordion>
          ) : (
            <div className={styles.noJobsMessage}>
              No jobs available for grouping by {groupByOption}.
            </div>
          )}
        </div>
      )}
      {!isGroupedView && (
        <div
          className="flex justify-content-center mt-3 p-2"
          style={{ background: "white", position: "sticky", bottom: 0 }}
        >
          <i
            className={`pi pi-chevron-left ${currentPage === 1 ? 'p-disabled' : ''}`}
            onClick={() => handlePageChange(currentPage - 1)}
            style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '1.1rem', color:'#E58D75' }}
          />
          <span className="mx-3" >
            Page {currentPage} of {totalPages}
          </span>
          <i
            className={`pi pi-chevron-right ${currentPage === totalPages ? 'p-disabled' : ''}`}
            onClick={() => handlePageChange(currentPage + 1)}
            style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '1.1rem',color:'#E58D75'  }}
          ></i>
        </div>
      )}
    </div>
  );
}

export default JobsListPageOfAssignment;
