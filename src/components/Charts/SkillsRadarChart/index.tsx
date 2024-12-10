import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  Legend,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from 'recharts';
import { EvaluationForm } from '@/services/types';

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
}

const formatValue = (value: number) => {
  const years = Math.floor(value);
  const months = Math.round((value - years) * 12);
  return `${years}y ${months}m`;
};

const formatRanking = (value: number) => {
  return `${value}/10`;
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
      className="custom-tooltip"
      style={{
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        padding: '10px',
        borderRadius: '4px',
      }}
    >
      <p className="label">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.stroke }}>
          {entry.name}: {formatValue(entry.value as number)}
        </p>
      ))}
    </div>
  );
};

const RankingTooltip = ({
  payload,
  label,
}: {
  payload?: any[];
  label?: string;
}) => {
  if (!payload || payload.length === 0) return null;

  return (
    <div
      className="custom-tooltip"
      style={{
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        padding: '10px',
        borderRadius: '4px',
      }}
    >
      <p className="label">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.stroke }}>
          {entry.name}: {formatRanking(entry.value as number)}
        </p>
      ))}
    </div>
  );
};

const prepareData = (candidates: Candidate[], isPrimary: boolean) => {
  const skillsSet = new Set<string>();
  const skillsMap: { [key: string]: { [key: string]: number } } = {};

  candidates.forEach((candidate) => {
    candidate.evaluationForm.forEach((skill) => {
      if (skill.isPrimary === isPrimary) {
        // Normalize years and months
        const totalExperience = skill.years + skill.months / 12;
        skillsSet.add(skill.skill);
        if (!skillsMap[skill.skill]) {
          skillsMap[skill.skill] = {};
        }
        skillsMap[skill.skill][`${candidate.firstName} ${candidate.lastName}`] =
          totalExperience;
      }
    });
  });

  const allSkills = Array.from(skillsSet);
  return candidates.map((candidate) => {
    const candidateData: SeparatedSkills = {};
    allSkills.forEach((skill) => {
      candidateData[skill] =
        skillsMap[skill][`${candidate.firstName} ${candidate.lastName}`] || 0;
    });
    return {
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      skills: candidateData,
    };
  });
};

const prepareRankingData = (candidates: Candidate[]) => {
  const skillsSet = new Set<string>();
  const skillsMap: { [key: string]: { [key: string]: number } } = {};

  candidates.forEach((candidate) => {
    candidate.evaluationForm.forEach((skill) => {
      // Collect all skills and their rankings
      skillsSet.add(skill.skill);
      if (!skillsMap[skill.skill]) {
        skillsMap[skill.skill] = {};
      }
      skillsMap[skill.skill][`${candidate.firstName} ${candidate.lastName}`] =
        skill.rating;
    });
  });

  const allSkills = Array.from(skillsSet);
  return candidates.map((candidate) => {
    const candidateData: SeparatedSkills = {};
    allSkills.forEach((skill) => {
      candidateData[skill] =
        skillsMap[skill][`${candidate.firstName} ${candidate.lastName}`] || 0;
    });
    return {
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      skills: candidateData,
    };
  });
};

export default function RadarChartsVis({ candidates }: RadarChartsVisProps) {
  const primarySkillsData = prepareData(candidates, true);
  const secondarySkillsData = prepareData(candidates, false);
  const rankingData = prepareRankingData(candidates);

  // Prepare data for radar charts
  const allPrimarySkills = Object.keys(primarySkillsData[0].skills);
  const primaryChartData: SkillData[] = allPrimarySkills.map((skill) => {
    const skillData: SkillData = { subject: skill };
    primarySkillsData.forEach((candidate) => {
      skillData[candidate.candidateName] = candidate.skills[skill];
    });
    return skillData;
  });

  const allSecondarySkills = Object.keys(secondarySkillsData[0].skills);
  const secondaryChartData: SkillData[] = allSecondarySkills.map((skill) => {
    const skillData: SkillData = { subject: skill };
    secondarySkillsData.forEach((candidate) => {
      skillData[candidate.candidateName] = candidate.skills[skill];
    });
    return skillData;
  });

  const allRankingSkills = Object.keys(rankingData[0].skills);
  const rankingChartData: SkillData[] = allRankingSkills.map((skill) => {
    const skillData: SkillData = { subject: skill };
    rankingData.forEach((candidate) => {
      skillData[candidate.candidateName] = candidate.skills[skill];
    });
    return skillData;
  });

  // Determine the max value for each domain
  const maxPrimaryDomain = Math.max(
    ...primaryChartData.map((d) =>
      Math.max(...(Object.values(d).slice(1) as number[])),
    ),
  );
  const maxSecondaryDomain = Math.max(
    ...secondaryChartData.map((d) =>
      Math.max(...(Object.values(d).slice(1) as number[])),
    ),
  );
  const maxRankingDomain = 10; // Max value for ranking is 10
  const colors = ['#1f77b4', '#6482AD', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#f7b6d2', '#ff9896', '#c5b0d5', '#c49c94', '#e5ae37', '#9edae5', '#f5cb5c', '#c7c7c7', '#ff9e4a', '#b5b5b5'];


  return (
    <div className='flex gap-2 flex-wrap'>
      <div>
        <p style={{fontWeight: 'bold', textAlign: 'center', fontSize: '20px'}}>Primary Skills - By Years of Experience</p>
        <RadarChart
          cx={300}
          cy={200}
          outerRadius={150}
          width={500}
          height={500}
          data={primaryChartData}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, maxPrimaryDomain]} />
          <Tooltip content={<CustomTooltip />} />
          {primarySkillsData.map((candidate, index) => (
            <Radar
              key={candidate.candidateName}
              name={candidate.candidateName}
              dataKey={candidate.candidateName}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.7}
            />
          ))}
          <Legend />
        </RadarChart>
      </div>
      <div>
        <p style={{fontWeight: 'bold', textAlign: 'center', fontSize: '20px'}}>Secondary Skills - By Years of Experience</p>
        <RadarChart
          cx={300}
          cy={200}
          outerRadius={150}
          width={500}
          height={500}
          data={secondaryChartData}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, maxSecondaryDomain]} />
          <Tooltip content={<CustomTooltip />} />
          {secondarySkillsData.map((candidate, index) => (
            <Radar
              key={candidate.candidateName}
              name={candidate.candidateName}
              dataKey={candidate.candidateName}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.7}
            />
          ))}
          <Legend />
        </RadarChart>
      </div>
      <div>
        <p style={{fontWeight: 'bold', textAlign: 'center', fontSize: '20px'}}>Self - Ranking</p>
        <RadarChart
          cx={300}
          cy={200}
          outerRadius={150}
          width={500}
          height={500}
          data={rankingChartData}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, maxRankingDomain]} />
          <Tooltip content={<RankingTooltip />} />
          {rankingData.map((candidate, index) => (
            <Radar
              key={candidate.candidateName}
              name={candidate.candidateName}
              dataKey={candidate.candidateName}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.7}
            />
          ))}
          <Legend />
        </RadarChart>
      </div>
    </div>
  );
}
