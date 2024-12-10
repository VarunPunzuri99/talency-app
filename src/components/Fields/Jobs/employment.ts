const employmentTypes = [
    { label: 'Full Time', value: 'full-time' },
    { label: 'Part Time', value: 'part-time' },
    { label: 'Contract', value: 'contract' },
    { label: 'Temporary', value: 'temporary' }
];

const workModes = [
    { label: 'Remote', value: 'remote' },
    { label: 'Hybrid', value: 'hybrid' },
    { label: 'On Site', value: 'onsite' }
];

export const employment =(errors)=> [
    {
        title: "Employment Type",
        name: "employmentType",
        type: 'dropdown',
        options: employmentTypes
    },
    {
        title: "Work Mode",
        name: "workMode",
        type: 'dropdown',
        options: workModes
    },
    {
        title: "Job Description",
        name: "description",
        type: "editor"
    },
    {
        title: "Primary Skills",
        name: "primarySkills",
        type: "chips",
        placeholder: "Add primary skills",
        isRequired: true
    },
    {
        title: "Secondary Skills",
        name: "secondarySkills",
        type: "chips",
        placeholder: "Add secondary skills",
    },
    {
        title: "Minimum Work Experience",
        name: "workExperience.minimum",
        type: "number",
        comValidation: errors?.workExperience?.minimum?.message
    },
    {
        title: "Maximum Work Experience",
        name: "workExperience.maximum",
        type: "number",
        comValidation: errors?.workExperience?.maximum?.message
    },
]
