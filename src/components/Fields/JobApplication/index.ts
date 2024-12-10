const Gender = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
]

export const personalInfoFields = (errors) => [
    {
        title: "First Name",
        name: "firstName",
        type: "text",
        className: "w-full my-2",
        placeholder: "Enter your first name",
        isRequired: true
    },
    {
        title: "Last Name",
        name: "lastName",
        type: "text",
        className: "w-full my-2",
        placeholder: "Enter your last name",
        isRequired: true
    },
    {
        title: "PAN Number",
        name: "panNumber",
        type: "text",
        className: "w-full my-2",
        placeholder: "Enter your PAN number",
        maximumLength: 10,
        isRequired: true
    },
    {
        title: "Email Address",
        name: "contactDetails.contactEmail",
        type: "text",
        className: "w-full my-2",
        placeholder: "Enter your email address",
        comValidation: errors?.contactDetails?.contactEmail?.message,
        isRequired: true
    },
    {
        title: "Phone Number",
        name: "contactDetails.contactNumber",
        type: "text",
        className: "w-full my-2",
        placeholder: "Enter your phone number",
        maximumLength: 10,
        comValidation: errors?.contactDetails?.contactNumber?.message,
        isRequired: true
    },
    {
        title: "Address",
        name: "contactAddress.street",
        type: "text",
        className: "w-full my-2",
        placeholder: "Enter your address",
        comValidation: errors?.contactAddress?.street?.message,
        isRequired: true
    },
    {
        title: "City",
        name: "contactAddress.city",
        type: "text",
        className: "w-full my-2",
        placeholder: "Enter your city",
        comValidation: errors?.contactAddress?.city?.message,
        isRequired: true
    },
    {
        title: "Postal Code",
        name: "contactAddress.postalCode",
        type: "text",
        className: "w-full my-2",
        placeholder: "Enter your postal code",
        maximumLength: 9,
        comValidation: errors?.contactAddress?.postalCode?.message,
        isRequired: true
    },
    {
        title: "State",
        name: "state",
        type: "text",
        className: "w-full my-2",
        placeholder: "Enter your state",
        isRequired: true
    },
    {
        title: "Country",
        name: "country",
        type: "text",
        className: "w-full my-2",
        placeholder: "Enter your country",
        isRequired: true
    },
    {
        title: "Date of Birth",
        name: "dob",
        type: "Calendar",
        placeholder: "Enter your date of birth",
        minDate: new Date(new Date().getFullYear() - 70, 0, 1), // January 1, 70 years ago
        maxDate: new Date(new Date().getFullYear() - 18, 11, 31), // December 31, 18 years ago
        isRequired: true
    },
    {
        title: "Nationality",
        name: "nationality",
        type: "text",
        className: "w-full my-2",
        placeholder: "Enter your nationality",
        isRequired: true
    },
    {
        title: "LinkedIn Profile URL",
        name: "linkedInUrl",
        type: "text",
        className: "w-full my-2",
        placeholder: "Enter your LinkedIn profile URL",
    },
    {
        title: "Website",
        name: "websiteOrBlogUrl",
        type: "text",
        className: "w-full my-2",
        placeholder: "Enter your website URL",
    },
    {
        title: "Gender",
        name: "gender",
        type: "dropdown",
        options: Gender,
        isRequired: true
    }
];