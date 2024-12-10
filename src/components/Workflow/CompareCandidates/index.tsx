import React from 'react';
import { Dialog } from 'primereact/dialog';

import './index.module.scss'; // Ensure this CSS file exists

import RadarChartsVis2 from '../../Charts/SkillsRadarChartCopy';
import CTCComparisonChart2 from '../../Charts/CTCComparisionChartCopy';
import { Card } from 'primereact/card';
import ExperienceBarChart2 from '../../Charts/ExperienceBarChartCopy';
const CompareCandidates = ({ visible, setVisible, candidates, job,setSelectedSort,setSelectedApplicants }) => {
  if (candidates.length < 1) return null; // Ensure there are candidates to display

  return (
    <Dialog
      // header="Compare Candidates"
      visible={visible}
      style={{ width: '95vw', height: '95vh' }}
      maximizable
      modal
      onHide={() => {setVisible(false);setSelectedSort(null);setSelectedApplicants([])}}
    >
      {/* <TabView>
        <TabPanel header='Page 1'>
        <CandidateDataTable candidates={candidates} />
        </TabPanel>
        <TabPanel header='Page 2'>
          <ExperienceChart candidates={candidates} />
        </TabPanel>
        <TabPanel header='Page 3'>
          <CTCComparisonChart candidates={candidates} />
        </TabPanel>
        <TabPanel header='Page 4'>
          <RadarChartsVis candidates={candidates}/>
        </TabPanel>
        <TabPanel header='Page 5'>
          <CTCComparisonChart2 candidates={candidates} job={job}/>
        </TabPanel>
        <TabPanel header='Page 6'>
          <SinglePage candidates={candidates} job={job}/>
        </TabPanel>
      </TabView> */}

{/* <CandidateDataTable candidates={candidates} /> */}

    <div className="flex flex-column gap-2 p-5">
        <div className="sticky top-0 font-semibold text-2xl flex justify-content-between px-8 shadow-1 surface-400">
          {candidates.map((candidate) => (
            <p key={candidate._id} >
              {candidate.firstName} {candidate.lastName}
            </p>
          ))}
        </div>

          <div>
          <span className='border-1 font-bold text-lg p-1'>Primary Skills</span>
        <RadarChartsVis2 candidates={candidates} job={job} />
          </div>
        <ExperienceBarChart2 candidates={candidates} />

        <div className="flex flex-wrap gap-4 justify-content-between">
          {candidates.map((candidate) => (
            <Card
              key={candidate._id}
              className="flex flex-column pr-4 shadow-2 border-round-lg"
            >
              <div className="flex align-items-center gap-2">
                <div>
                  {candidate.bgvVerified ? (
                    <i className="pi pi-verified text-green-500"></i>
                  ) : (
                    <i className="pi pi-ban text-red-500"></i>
                  )}
                </div>
                <div>{candidate.noticePeriodDays}</div>
              </div>
            </Card>
          ))}
        </div>

        <CTCComparisonChart2 candidates={candidates} job={job} />
    </div>

    </Dialog>
  );
};

export default CompareCandidates;
