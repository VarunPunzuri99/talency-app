import React, { useState } from 'react';
import Fuse from 'fuse.js';
import { Accordion, AccordionTab } from 'primereact/accordion';
import JobAllocationCard from '../JobAllocationCard';
import { Badge } from 'primereact/badge';
import { Draggable } from '@hello-pangea/dnd';
import styles from './index.module.scss';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

// Define the job type based on your job object structure
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

// Define the props for the component
interface JobsListPageProps {
  jobs: Job[];
}

function JobsListPage({ jobs }: JobsListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [groupByOption, setGroupByOption] = useState('');
  const [activeTabIndex, setActiveTabIndex] = useState<number | null>(null);

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
        <div className="flex justify-content-between gap-2" style={{ maxWidth: '400px' }}>
          <div style={{ width: '150px' }}>
            <Dropdown
              value={groupByOption}
              onChange={(e) => setGroupByOption(e.value)}
              options={groupByOptions}
              placeholder="Group By"
              className={`w-full ${styles.dropdownWrapper}`}
            />
          </div>
          <div style={{ width: '150px' }}>
            <Dropdown
              value={sortOption}
              onChange={(e) => setSortOption(e.value)}
              options={sortOptions}
              placeholder="Sort By"
              className={`w-full ${styles.dropdownWrapper}`}
            />
          </div>
          <div style={{ width: '50px' }}>
          <Button
            label="Reset"
            onClick={resetFilters}
            className="p-button-outlined"
          />
          </div>
        </div>
      </div>

      {/* Default List View (Normal List of Jobs) */}
      {!isGroupedView ? (
        <div className={styles.maxHeightScreen}>
          {sortedJobs.length === 0 ? (
            <div className={styles.noJobsMessage}>No jobs found for your search.</div>
          ) : (
            sortedJobs.map((job, index) => (
              <Draggable key={job._id} draggableId={job._id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <JobAllocationCard job={job} isDragging={snapshot.isDragging} />
                  </div>
                )}
              </Draggable>
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
                    {jobsList.map((job, index) => (
                      <Draggable key={job._id} draggableId={job._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <JobAllocationCard job={job} isDragging={snapshot.isDragging} />
                          </div>
                        )}
                      </Draggable>
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
    </div>
  );
}

export default JobsListPage;
