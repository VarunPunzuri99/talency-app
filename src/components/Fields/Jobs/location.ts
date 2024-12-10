const hiringModes = [
    { label: 'Scheduled Interview', value: 'scheduled-interview' },
    { label: 'Walk-In', value: 'walk-in' },
    { label: 'Drive', value: 'drive' },
    { label: 'On Campus', value: 'on-campus' },
    { label: 'Off Campus', value: 'off-campus' }
];

const educationalQualifications = [
    'High School',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'Doctorate'
];

export const locationFields= (locations, industries) => [
    {
        title: "Job Location",
        name: "jobLocation",
        type: 'multiselect',
        options: locations.map(location => ({
            label: `${location.city}, ${location.state}`,
            value: location._id
        })),
        placeholder: "Select a job location."
    },
    {
        title: "Industry/Domain",
        name: "industryOrDomain",
        type: 'dropdown',
        options: industries.map(industry => ({
            label: industry.name,
            value: industry._id
        })),
        placeholder: "Select an industry or domain."
    },
    {
        title: "Educational Qualification",
        name: "educationalQualification",
        type: 'multiselect',
        options: educationalQualifications,
        placeholder: "Select your educational qualifications."
    },
    {
        title: "Hiring Mode",
        name: "hiringMode",
        type: 'dropdown',
        options: hiringModes,
        placeholder: " Select a hiring mode from the dropdown."
    },
]