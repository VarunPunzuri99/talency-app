import React from 'react';
import {
  LineChart, Line, XAxis, CartesianGrid, Tooltip, Legend, LabelList,
  ResponsiveContainer, YAxis
} from 'recharts';
import { JobApplication } from '@/services/types';

// Define the data format for the chart
interface CTCData {
  name: string;
  CurrentCTC: number | null;
  ExpectedCTC: number | null;
  ExpectedCTCWithPercentage: string | null;
  Percentage: string;
  Budget: number | null; // New field for budget
}

// Convert amount to lakhs
const convertToLakhs = (amount: number | null | undefined): string | null => {
  if (amount === null || amount === undefined) return null;
  return (amount / 100000).toFixed(2); // Converting to lakhs with two decimal places
};

// Calculate CTC data for each candidate
const calculateCTCData = (candidate: JobApplication, budgetInLakhs: number | null): CTCData => {
  const { firstName, lastName, currentCTC, expectedCTC } = candidate;
  const name = `${firstName} ${lastName}`;
  let percentage = 0;

  // Convert current and expected CTC to lakhs
  const currentCTCInLakhs = convertToLakhs(currentCTC);
  const expectedCTCInLakhs = convertToLakhs(expectedCTC);

  if (currentCTC && expectedCTC) {
    if (expectedCTC > currentCTC) {
      percentage = ((expectedCTC - currentCTC) / currentCTC) * 100;
    } else if (currentCTC > expectedCTC) {
      percentage = -((currentCTC - expectedCTC) / currentCTC) * 100;
    }
  }

  const percentageFormatted = percentage > 0 ? `${percentage.toFixed(2)}% ↑` : `${Math.abs(percentage).toFixed(2)}% ↓`;

  return {
    name,
    CurrentCTC: currentCTCInLakhs ? parseFloat(currentCTCInLakhs) : null,
    ExpectedCTC: expectedCTCInLakhs ? parseFloat(expectedCTCInLakhs) : null,
    ExpectedCTCWithPercentage: expectedCTCInLakhs
      ? `${parseFloat(expectedCTCInLakhs)}L (${percentageFormatted})`
      : null,
    Percentage: percentageFormatted,
    Budget: budgetInLakhs, // Set the budget for every candidate (constant value)
  };
};

// Function to render the formatted percentage with color
const renderFormattedPercentage = (percentage: string) => {
  const color = percentage?.includes('↑') ? 'green' : 'red';
  return <tspan style={{ fill: color }}>{percentage}</tspan>;
};

// Custom Label component
const CustomLabel: React.FC<{ x: number, y: number, value: string, dataKey: string }> = ({ x, y, value, dataKey }) => {
  const formattedX = Number(x);
  const formattedY = Number(y);

  if (dataKey === 'ExpectedCTCWithPercentage') {
    const [prefix, percentage] = value.split(' (');
    const formattedPercentage = percentage?.slice(0, -1);

    return (
      <text x={formattedX} y={formattedY} dx={-15} textAnchor="middle" fontSize="15px" fontFamily="Dosis">
        {prefix} (<tspan>{renderFormattedPercentage(formattedPercentage)}</tspan>)
      </text>
    );
  } else if (dataKey === 'CurrentCTC') {
    return (
      <text x={formattedX} y={formattedY} textAnchor="end" fontSize="15px" fontFamily="Dosis">
        <tspan>{`${value}L`}</tspan>
      </text>
    );
  }
  return null;
};

// Custom Budget Label component
const BudgetLabel: React.FC<{ x: number, y: number, value: string, index: number }> = ({ x, y, value, index }) => {
  // Show label only at the first data point (index === 0)
  if (index === 0) {
    return (
      <text x={x} y={y} dx={-15} textAnchor="middle" fontSize="15px" fontFamily="Dosis" fill="#D2649A">
        {`Budget: ${value}L`}
      </text>
    );
  }
  return null;
};

const CTCComparisonChart2 = ({ candidates, job }) => {
  // Convert the job's max CTC offered to lakhs
  const budgetInLakhs = job.maxCtcOffered ? parseFloat(convertToLakhs(job.maxCtcOffered)) : null;

  // Aggregate data for all candidates, including the budget
  const data = candidates.map((candidate) => calculateCTCData(candidate, budgetInLakhs));

  const CustomDot: React.FC<{ cx: number, cy: number, stroke: string, fill: string }> = ({ cx, cy, stroke, fill }) => (
    <circle cx={cx} cy={cy} r={3} stroke={stroke} fill={fill} />
  );

  
  const tooltipFormatter = (value, name) => {
    
    if (name === 'ExpectedCTC') {
      const candidate = data.find(d => d.ExpectedCTC === value);
      if (candidate && candidate.ExpectedCTCWithPercentage) {
        const [expectedCTC, percentage] = candidate.ExpectedCTCWithPercentage.split(' (');
        const formattedPercentage = percentage.slice(0, -1);
        const color = formattedPercentage.includes('↑') ? 'green' : 'red';
  
        return [
          <span key={`${name}-expected`}  style={{ color }}>
            {expectedCTC} ({formattedPercentage})
          </span>,
          name
        ];
      }
      return [value, name];
    }
    return [`${value}L`, name];
  };
  

  return (
    <div className="flex justify-center">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }} // Increased bottom margin for XAxis labels
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" />
          <YAxis
            tick={false} // Hide the tick labels
            axisLine={false} // Show the axis line
            tickLine={false} // Hide the tick lines
          />
          <Tooltip
            formatter={tooltipFormatter}
          />
          <Legend />
          <Line
            type="linear"
            dataKey="CurrentCTC"
            stroke="#8884d8"
            dot={<CustomDot cx={0} cy={0} stroke='#8884d8' fill='#8884d8' />} // Use custom dot
            activeDot={{ r: 5 }}
          >
            <LabelList
              dataKey="CurrentCTC"
              position="top"
              content={({ x, y, value }) => (
                <CustomLabel x={Number(x)} y={Number(y)} value={String(value)} dataKey="CurrentCTC" />
              )}
            />
          </Line>
          <Line
            type="linear"
            dataKey="ExpectedCTC"
            stroke="#82ca9d"
            dot={<CustomDot cx={0} cy={0} stroke='#82ca9d' fill='#82ca9d' />} 
            activeDot={{ r: 5 }}
          >
            <LabelList
              dataKey="ExpectedCTCWithPercentage"
              position="top"
              content={({ x, y, value }) => (
                <CustomLabel x={Number(x)} y={Number(y)} value={String(value)} dataKey="ExpectedCTCWithPercentage" />
              )}
            />
          </Line>
          {/* Add the budget line */}
          <Line
            type="monotone"
            dataKey="Budget"
            stroke="#D2649A"
            strokeDasharray="5 5" // Dashed line for the budget
            dot={false}
            activeDot={{ r: 5 }}
          >
            <LabelList
              dataKey="Budget"
              position="top"
              content={({ x, y, value, index }) => (
                <BudgetLabel x={Number(x)} y={Number(y)} value={String(value)} index={index} />
              )}
            />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CTCComparisonChart2;
