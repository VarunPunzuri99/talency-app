export const jobsFields = (handleJdUpload) => [
    {
        title: "Job Title",
        name: "title",
        type: 'text',
        className: "w-full",
        placeholder: "Enter job title",
        isRequired: true
    },
    {
        title: "Number of Vacancies",
        name: "noOfVacancies",
        type: 'number',
        placeholder: "Enter no of vacancies",
    },
    {
        title: "Upload Job Description",
        name: "description",
        type: 'file',
        onFileSelect: (e) => handleJdUpload(e)
    }
];