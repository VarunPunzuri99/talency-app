import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import { EvaluationForm, Job } from '@/services/types';
import styles from './index.module.scss';

type Candidate = {
  _id: string;
  firstName: string;
  lastName: string;
  evaluationForm: EvaluationForm[];
};

type SeparatedSkills = {
  [key: string]: number;
};

type SkillData = {
  subject: string;
  [key: string]: number | string;
};

interface RadarChartsVisProps {
  candidates: Candidate[];
  job: Job;
}

const formatValue = (value: number) => {
  const roundedValue = Math.round(value * 100) / 100; // Round to 2 decimal places
  const years = Math.floor(roundedValue);
  const months = Math.round((roundedValue - years) * 12);
  return `${years}y ${months}m`;
};

const CustomTooltip = ({
  payload,
  label,
}: {
  payload?: any[];
  label?: string;
}) => {
  if (!payload || payload.length === 0) return null;

  return (
    <div
      className={styles.custom_tooltip}
    >
      <p>{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.stroke }}>
          {entry.name}: {formatValue(entry.value as number)}
        </p>
      ))}
    </div>
  );
};

const prepareData = (
  candidates: Candidate[],
  skills: Set<string>,
) => {
  const skillsMap: { [key: string]: { [key: string]: number } } = {};

  candidates.forEach((candidate) => {
    candidate.evaluationForm.forEach((skill) => {
      if (skill.isPrimary && skills.has(skill.skill)) {
        const totalExperience = skill.years + skill.months / 12;
        const roundedExperience = Math.round(totalExperience * 100) / 100; // Round to 2 decimal places
        if (!skillsMap[skill.skill]) {
          skillsMap[skill.skill] = {};
        }
        skillsMap[skill.skill][`${candidate.firstName} ${candidate.lastName}`] =
          roundedExperience;
      }
    });
  });

  const allSkills = Array.from(skills);
  return candidates.map((candidate) => {
    const candidateData: SeparatedSkills = {};
    allSkills.forEach((skill) => {
      candidateData[skill] =
        skillsMap[skill]?.[`${candidate.firstName} ${candidate.lastName}`] || 0;
    });
    return {
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      skills: candidateData,
    };
  });
};

const RadarChartsVis2: React.FC<RadarChartsVisProps> = ({
  candidates,
  job,
}) => {
  const primarySkills = new Set(job.primarySkills || []);
  const secondarySkills = new Set(job.secondarySkills || []);

  const primarySkillsData = prepareData(candidates, primarySkills);
  const secondarySkillsData = prepareData(candidates, secondarySkills);

  // Prepare data for radar charts
  const allPrimarySkills = Array.from(primarySkills);
  const allSecondarySkills = Array.from(secondarySkills);

  // Create a radar chart for each candidate's primary skills
  const primaryCharts = primarySkillsData.map((candidate) => {
    const skillData: SkillData[] = allPrimarySkills.map((skill) => ({
      subject: skill,
      [candidate.candidateName]: candidate.skills[skill],
    }));

    const maxDomain = Math.max(
      ...skillData.map((d) =>
        Math.max(...(Object.values(d).slice(1) as number[])),
      ),
    );

    return (
      <div
        key={candidate.candidateName}
        // className='flex justify-content-between'
        style={{ margin: '10px', flex: '1 1 30%' }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart
            data={skillData}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, maxDomain]} />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name={candidate.candidateName}
              dataKey={candidate.candidateName}
              stroke="#1f77b4" // Blue stroke color
              fill="#1f77b4" // Blue fill color
              fillOpacity={0.7}
            >
              <LabelList
                dataKey={candidate.candidateName}
                position="insideEnd"
                content={({ x, y, value }: any) => (
                  <text
                    x={x}
                    y={y}
                    dy={-10}
                    fill="#ff7f0e"
                    textAnchor="middle"
                    fontSize={15}
                  >
                    {formatValue(value)}
                  </text>
                )}
              />
            </Radar>
            {/* <Legend /> */}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  });

  // Create a radar chart for each candidate's secondary skills
  const secondaryCharts = secondarySkillsData.map((candidate) => {
    const skillData: SkillData[] = allSecondarySkills.map((skill) => ({
      subject: skill,
      [candidate.candidateName]: candidate.skills[skill],
    }));

    const maxDomain = Math.max(
      ...skillData.map((d) =>
        Math.max(...(Object.values(d).slice(1) as number[])),
      ),
    );

    return (
      <div
        key={candidate.candidateName}
        style={{ margin: '10px', flex: '1 1 30%' }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart
            data={skillData}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, maxDomain]} />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name={candidate.candidateName}
              dataKey={candidate.candidateName}
              stroke="#708871" // Purple stroke color
              fill="#708871" // Purple fill color
              fillOpacity={0.7}
            >
              <LabelList
                dataKey={candidate.candidateName}
                position="insideEnd"
                content={({ x, y, value }: any) => (
                  <text
                    x={x}
                    y={y}
                    dy={-10}
                    fill="#ff7f0e"
                    textAnchor="middle"
                    fontSize={15}
                  >
                    {formatValue(value)}
                  </text>
                )}
              />
            </Radar>
            {/* <Legend /> */}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  });

  return (
    <div>
      <div className="flex flex-column gap-2">
        <span className='border-1 font-bold text-lg p-1'>Primary Skills</span>
        <div className='flex gap-2'>
          {primaryCharts}
        </div>
      </div>
      <div className="flex flex-column gap-2">
        <span className='border-1 font-bold text-lg p-1'>Secondary Skills</span>
        <div className='flex gap-2'>
          {secondaryCharts}
        </div>
      </div>
    </div>
  );
};

export default RadarChartsVis2;
