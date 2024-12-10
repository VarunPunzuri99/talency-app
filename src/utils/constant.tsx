
import { ErrorMessage } from '@hookform/error-message';

const FormError = (errors, name) => {
    return (
        <ErrorMessage
            name={name}
            errors={errors}
            message={`${name?.charAt(0)?.toUpperCase() + name?.slice(1)
                } is required`}
            render={({ message }) => {
                return <p className="p-error m-2 mx-0">{message}</p>;
            }}
        />
    );
};
const applicantArray = [
    {
        id: 1,
        checked: false,
        title: "Huma Therman",
        companyName: "Codinglimits Pvt Ltd.",
        experience: "5y 3m",
        minSalary: "15 lac",
        maxSalary: "25 lac",
        address: "Haryana",
        postedTime: "25 days+",
        branches: "Hyderabad, Mumbai, Kolkata, Delhi ...",
    },
    {
        id: 2,
        checked: false,
        title: "John Doe",
        companyName: "Tech Innovators Inc.",
        experience: "7y 2m",
        minSalary: "18 lac",
        maxSalary: "30 lac",
        address: "Bangalore",
        postedTime: "20 days+",
        branches: "Bangalore, Pune, Chennai, Mumbai ...",
    },
    {
        id: 3,
        checked: false,
        title: "Alice Smith",
        companyName: "Infinite Coders Ltd.",
        experience: "4y 6m",
        minSalary: "12 lac",
        maxSalary: "22 lac",
        address: "Delhi",
        postedTime: "15 days+",
        branches: "Delhi, Noida, Gurgaon, Faridabad ...",
    },
    {
        id: 4,
        checked: true,
        title: "Bob Johnson",
        companyName: "TechSolutions Co.",
        experience: "6y 8m",
        minSalary: "20 lac",
        maxSalary: "35 lac",
        address: "Mumbai",
        postedTime: "18 days+",
        branches: "Mumbai, Pune, Thane, Navi Mumbai ...",
    },
    {
        id: 5,
        checked: false,
        title: "Samantha Lee",
        companyName: "Digital Innovations Ltd.",
        experience: "3y 9m",
        minSalary: "14 lac",
        maxSalary: "26 lac",
        address: "Chennai",
        postedTime: "22 days+",
        branches: "Chennai, Bangalore, Hyderabad, Coimbatore ...",
    }
]



const educationalQualifications = [
    'High School',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'Doctorate'
];

const hiringModes = [
    { label: 'Scheduled Interview', value: 'scheduled-interview' },
    { label: 'Walk-In', value: 'walk-in' },
    { label: 'Drive', value: 'drive' },
    { label: 'On Campus', value: 'on-campus' },
    { label: 'Off Campus', value: 'off-campus' }
];

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

const departments = [
    'Human Resources',
    'Finance',
    'Engineering',
    'Sales',
    'Marketing',
    'Customer Support'
];

const job_boardsArray = [
    {
        state: false,
        img: '/assets/job/indeed.png',
    },
    {
        state: false,
        img: '/assets/job/linkedIn.png',
    },
    {
        state: false,
        img: '/assets/job/naukri.png',
    },
    {
        state: false,
        img: '/assets/job/monster.png',
    },
];

const formatDueDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${formattedDate}, ${formattedTime}`;

};
export { FormError, applicantArray, hiringModes, employmentTypes, workModes, departments, job_boardsArray, educationalQualifications, formatDueDate };

