import React from 'react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import moment from 'moment';

// Define types for experience data
interface ExperienceData {
  name: string;
  [key: string]: string | number;
}

// Function to calculate experience between two dates
const calculateExperience = (startDate: string, endDate: string) => {
  const start = moment(startDate);
  const end = moment(endDate);
  const totalMonths = end.diff(start, 'months');
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return { years, months, totalMonths };
};

// Function to calculate total experience for a candidate excluding gaps
// const calculateTotalExperience = (workExperience: any[]) => {
//   let totalMonths = 0;
//   workExperience.forEach(job => {
//     const { totalMonths: jobMonths } = calculateExperience(job.jobStartDate, job.jobEndDate);
//     totalMonths += jobMonths;
//   });
//   const years = Math.floor(totalMonths / 12);
//   const months = totalMonths % 12;
//   return `${years}y ${months}m`;
// };

// Function to sort jobs by start date
const sortJobsByStartDate = (jobs: any[]) => {
  return jobs.slice().sort((a, b) => moment(a.jobStartDate).isBefore(moment(b.jobStartDate)) ? -1 : 1);
};

// Custom label component
const CustomLabel = ({ x, y, width, height, value, payload }: any) => {
  const numericValue = value as number;
  const years = Math.floor(numericValue / 12);
  const months = numericValue % 12;
  const formattedValue = `${years}y ${months}m`;

  const maxLabelWidth = 200; // Maximum width for the company name
  const companyName = payload?.companyName || '';
  const truncatedCompanyName = companyName.length > 20 ? companyName.substring(0, 15) + '...' : companyName;

  return (
    <g transform={`translate(${x},${y})`}>
      {/* <text x={width + 10} y={15} fill="#666" textAnchor="start" fontSize={12}>{formattedValue}</text>
      <text x={-10} y={15} fill="#666" textAnchor="end" fontSize={12} style={{ maxWidth: maxLabelWidth, overflow: 'hidden', textOverflow: 'ellipsis' }}>{truncatedCompanyName}</text> */}
      <text x={-10} y={height / 2} dy=".35em" fill="#666" textAnchor="end" fontSize={12} style={{ maxWidth: maxLabelWidth, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {truncatedCompanyName}
        </text>
        <text x={width + 10} y={height / 2} dy=".35em" fill="#666" textAnchor="start" fontSize={12}>
          {formattedValue}
        </text>
    </g>
  );
};

const CandidateChart = ({ candidate }: { candidate: any }) => {
  if (!candidate || !candidate.workExperience || candidate.workExperience.length === 0) {
    // No experience data available, return null or a message
    return <p>No experience data available for {candidate.firstName} {candidate.lastName}</p>;
  }

  // Create the data for the chart
  const experienceData: ExperienceData = { name: `${candidate.firstName} ${candidate.lastName}` };

  let previousEndDate = '';
  const sortedJobs = sortJobsByStartDate(candidate.workExperience);

  sortedJobs.forEach((job) => {
    if (previousEndDate && job.jobStartDate !== previousEndDate) {
      const { totalMonths } = calculateExperience(previousEndDate, job.jobStartDate);
      if (totalMonths > 0) {
        experienceData[`Gap`] = totalMonths; 
      }
    }

    const { totalMonths } = calculateExperience(job.jobStartDate, job.jobEndDate);
    experienceData[`${job.companyName}`] = totalMonths;
    
    previousEndDate = job.jobEndDate;
  });

  // Calculate total experience excluding gaps
  experienceData.totalExperience = candidate.workExperience.reduce((acc, job) => {
    const { totalMonths } = calculateExperience(job.jobStartDate, job.jobEndDate);
    return acc + totalMonths;
  }, 0);

  // Check if there is any experience data to display
  if (experienceData.totalExperience === 0 && Object.keys(experienceData).length === 1) {
    return <p>No experience data available for {candidate.firstName} {candidate.lastName}</p>;
  }

  // Define colors for different experiences and gaps
  const colors = ['#5584d8', '#82ca9d', '#ff7300', '#ff7f50', '#00c49f', '#ffbb28', '#ff8042', '#0088fe', '#d0ed57', '#a4de6c'];
  const gapColor = 'red'; // Color for gaps

  return (
    <ResponsiveContainer width="100%" height={330}>
      <BarChart
        data={[experienceData]}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <Tooltip formatter={(value: number) => {
          const years = Math.floor(value / 12);
          const months = value % 12;
          return `${years}y ${months}m`;
        }} />
        {/* <Legend /> */}
        {Object.keys(experienceData)
          .filter(key => key !== 'name' && key !== 'totalExperience')
          .map((key, index) => (
            <Bar
              key={index}
              dataKey={key}
              stackId="a"
              fill={key.includes('Gap') ? gapColor : colors[index % colors.length]}
              barSize={50} 
            >
              <LabelList dataKey={key} position="top" content={<CustomLabel payload={{ companyName: key }} />} />
            </Bar>
          ))}
        {/* Total experience bar */}
        <Bar
          dataKey="totalExperience"
          fill="#8884d8" 
          stackId="a"
          barSize={50} 
        >
          <LabelList dataKey="totalExperience" position="top" content={<CustomLabel payload={{ companyName: 'Total Experience' }} />} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const ExperienceCharts = ({ candidates }: { candidates: any[] }) => {
  return (
    <div >
      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', flexWrap: 'wrap' }}>
        {candidates.map((candidate, index) => (
          <div key={index} style={{ flex: '1 1 calc(30% - 20px)', minWidth: '250px', marginBottom: '20px' }}>
            <CandidateChart candidate={candidate} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceCharts;
