import React from 'react';
import {
  LineChart, Line, XAxis, CartesianGrid, Tooltip, LabelList,
} from 'recharts';
import { JobApplication } from '@/services/types';

// Define the data format for the chart
interface CTCData {
  name: string;
  CurrentCTC: number | null;
  ExpectedCTC: number | null;
  ExpectedCTCWithPercentage: string | null;
  Percentage: string;
}

// Convert amount to lakhs
const convertToLakhs = (amount: number | null | undefined): string | null => {
  if (amount === null || amount === undefined) return null;
  return (amount / 100000).toFixed(2); // Converting to lakhs with two decimal places
};

// Calculate CTC data for each candidate
const calculateCTCData = (candidate: JobApplication): CTCData => {
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
  };
};

// Function to render the formatted percentage with color
const renderFormattedPercentage = (percentage: string) => {
  const color = percentage.includes('↑') ? 'green' : 'red';
  return <tspan style={{ fill: color }}>{percentage}</tspan>;
};

// Custom Label component
const CustomLabel: React.FC<{ x: number, y: number, value: string, dataKey: string }> = ({ x, y, value, dataKey }) => {
  // Ensure x and y are numbers
  const formattedX = Number(x);
  const formattedY = Number(y);

  if (dataKey === 'ExpectedCTCWithPercentage') {
    const [prefix, percentage] = value.split(' (');
    const formattedPercentage = percentage.slice(0, -1);

    return (
      <text x={formattedX} y={formattedY} dy={-5} textAnchor="middle" fontSize="15px" fontFamily="Dosis">
        {'ExpectedCTC:'}{prefix} (<tspan>{renderFormattedPercentage(formattedPercentage)}</tspan>)
      </text>
    );
  } else if (dataKey === 'CurrentCTC') {
    return (
      <text x={formattedX} y={formattedY} dy={-5} textAnchor="middle" fontSize="15px" fontFamily="Dosis">
        <tspan>{`Current: ${value}L`}</tspan>
      </text>
    );
  }
  return null;
};

const CTCComparisonChart = ({ candidates }) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {candidates.map((candidate) => {
        const data = [calculateCTCData(candidate)];

        return (
          <div key={candidate.firstName + candidate.lastName}>
            <LineChart
              data={data}
              width={300}
              height={300}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <Tooltip
                formatter={(value, name) => {
                    if (name === 'ExpectedCTC') {
                      const candidate = data.find(d => d.ExpectedCTC === value);
                      return [candidate.ExpectedCTCWithPercentage, name];
                    }
                    return [`${value}L`, name];
                  }}
              />
              {/* <Legend /> */}
              <Line
                type="monotone"
                dataKey="CurrentCTC"
                stroke="#8884d8"
                dot={false}
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
                type="monotone"
                dataKey="ExpectedCTC"
                stroke="#82ca9d"
                dot={false}
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
            </LineChart>
          </div>
        );
      })}
    </div>
  );
};

export default CTCComparisonChart;
