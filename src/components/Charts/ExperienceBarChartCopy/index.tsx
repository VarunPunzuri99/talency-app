import React from 'react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import moment from 'moment';
import { v4 } from 'uuid';


// Define types for experience data
interface ExperienceData {
  name: string;
  [key: string]: number | string;
}

// Function to calculate experience between two dates
const calculateExperience = (startDate: string, endDate?: string) => {
  const start = moment(startDate);
  const end = endDate ? moment(endDate) : moment(); // Use today's date if endDate is missing

  if (!start.isValid() || !end.isValid()) {
    return { years: 0, months: 0, totalMonths: 0 };
  }

  const totalMonths = end.diff(start, 'months');
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return { years, months, totalMonths };
};

// Function to sort jobs by start date
const sortJobsByStartDate = (jobs: any[]) => {
  return jobs.slice().sort((a, b) => new Date(a.jobStartDate).getTime() - new Date(b.jobStartDate).getTime());
};

// Function to get all unique company names
const getAllUniqueCompanies = (candidates: any[]) => {
  const companies = new Set<string>();

  candidates.forEach(candidate => {
    candidate.workExperience.forEach((job: any) => {
      companies.add(job.companyName);
    });
  });

  return Array.from(companies);
};

// Function to process experience data
const processExperienceData = (candidates: any[]): ExperienceData[] => {
  const allCompanies = getAllUniqueCompanies(candidates);

  return candidates.map(candidate => {
    const candidateData: ExperienceData = { name: `${candidate.firstName} ${candidate.lastName}` };

    allCompanies.forEach(company => {
      candidateData[company] = 0; // Initialize each company experience to 0 (ensure it's a number)
    });

    const sortedJobs = sortJobsByStartDate(candidate.workExperience);

    sortedJobs.forEach(job => {
      const endDate = job.currentlyWorking ? moment().format('MM-DD-YYYY') : job.jobEndDate;
      const { totalMonths } = calculateExperience(job.jobStartDate, endDate);
      if (totalMonths > 0) {
        // Use type assertion to ensure TypeScript treats this as a number
        candidateData[job.companyName] = (candidateData[job.companyName] as number) + totalMonths;
      }
    });

    return candidateData;
  });
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
      <text x={-10} y={height / 2} dy=".35em" fill="#666" textAnchor="end" fontSize={12} style={{ maxWidth: maxLabelWidth, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {truncatedCompanyName}
      </text>
      <text x={width + 10} y={height / 2} dy=".35em" fill="#666" textAnchor="start" fontSize={12}>
        {formattedValue}
      </text>
    </g>
  );
};

// Function to generate dynamic colors
const generateColor = (index: number, totalBars: number) => {
  const hue = (index * (360 / totalBars)) % 360;
  return `hsl(${hue}, 70%, 50%)`; // Adjust saturation and lightness for better visibility
};

const ExperienceBarChart2 = ({ candidates }: { candidates: any[] }) => {
  if (!candidates || candidates.length === 0) {
    return <p>No candidate data available</p>;
  }

  // Process experience data for all candidates
  const experienceData = processExperienceData(candidates);

  // Log final processed data for the chart
  console.log('Final data used for the experience bar chart:', experienceData);

  // Determine the total number of bars for dynamic color generation
  const allCompanies = getAllUniqueCompanies(candidates);
  const totalBars = allCompanies.length;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={experienceData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <Tooltip formatter={(value: number) => {
          const years = Math.floor(value / 12);
          const months = value % 12;
          return `${years}y ${months}m`;
        }} />
        {allCompanies.map((company, index) => (
          <Bar
            key={v4()}
            dataKey={company}
            stackId="a"
            fill={generateColor(index, totalBars)}
            barSize={50}
          >
            <LabelList dataKey={company} position="top" content={<CustomLabel payload={{ companyName: company }} />} />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ExperienceBarChart2;
