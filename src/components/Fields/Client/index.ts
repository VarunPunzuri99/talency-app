
const headCount = [
    { label: 'not-specified', value: 'not-specified' },
    { label: '1-to-10', value: '1-to-10', },
    { label: '11-to-100', value: '11-to-100' },
    { label: '101-to-1000', value: '101-to-1000' },
    { label: '1000-plus', value: '1000-plus' },

]

export const clientFields = (parentOrgs, allIndustries, allUsers, countryList, stateList, errors, onChangeForPincode) =>[
    {
        title: "Title",
        name: "title",
        type: 'text',
        placeholder: "Enter client name",
        maximumLength: 30,
        parentClassName: "col-12 md:col-4 lg:col-4",
        className: "w-full",
        isRequired:true
    },
    {
        title: "Parent Org",
        name: "parentOrg",
        type: 'dropdown',
        options:  parentOrgs.map(parentOrg =>  ({
            label: parentOrg.title,
            value: parentOrg._id
        })),
        placeholder: "Select Org.",
        parentClassName: "col-12 md:col-4 lg:col-4",
        className: "w-full"
    },
    {
        title: "Website",
        name: "websiteUrl",
        type: 'text',
        placeholder: "Enter website",
        parentClassName: "col-12 md:col-4 lg:col-4",
        className: "w-full",
        maximumLength: 75,
        isRequired: true
    },
    {
        title: "Email",
        name: "contactDetails.0.contactEmail",
        type: 'text',
        placeholder: "Enter email",
        parentClassName: "col-12 md:col-4 lg:col-4",
        className: "w-full",
        comValidation: errors?.contactDetails?.[0]?.contactEmail?.message,
        isRequired: true
    },
    {
        title: "Phone Number",
        name: "contactDetails.0.contactNumber",
        type: 'text',
        keyfilter:'int',
        placeholder: "Enter phone",
        maximumLength: 10,
        parentClassName: "col-12 md:col-4 lg:col-4",
        className: "w-full",
        comValidation: errors?.contactDetails?.[0]?.contactNumber?.message,
        isRequired: true
    },
    {
        title: "Industry/Domain",
        name: "industryOrDomain",
        type: 'dropdown',
        options: allIndustries.map(industry =>   ({
            label: industry.name,
            value: industry._id
        })),
        placeholder: "Select an industry or domain.",
        parentClassName: "col-12 md:col-4 lg:col-4",
        className: "w-full"
    },
    {
        title: "Employee Count",
        name: "headCount",
        type: 'dropdown',
        options: headCount,
        placeholder: " Select a head count from the dropdown.",
        parentClassName: "col-12 md:col-4 lg:col-4",
        className: "w-full"
    },

    {
        title: "Linkedin",
        name: "linkedInUrl",
        type: 'text',
        placeholder: "https://",
        parentClassName: "col-12 md:col-4 lg:col-4",
        className: "w-full",
        isRequired: true
    },
    {
        title: "Business Unit",
        name: "businessUnit",
        type: 'text',
        placeholder: "Enter unit",
        maximumLength: 15,
        parentClassName: "col-12 md:col-4 lg:col-4",
        className: "w-full"
    },
    {
        title: "Area/Landmark/HouseNo.",
        name: "contactAddress.0.apartment",
        type: 'text',
        placeholder: "Enter address",
        maximumLength: 30,
        parentClassName: "col-12 md:col-4 lg:col-4",
        className: "w-full"
    },
    {
        title: "City",
        name: "contactAddress.0.city",
        type: 'text',
        placeholder: "Enter city",
        maximumLength: 28,
        parentClassName: "col-12 md:col-4 lg:col-4",
        className: "w-full"
    },
    {
      title: "Postal Code",
      name: "contactAddress.0.postalCode",
      type: 'text',
      keyfilter: 'int',
      placeholder: "Enter postal code",
      maximumLength: 6,
      parentClassName: "col-12 md:col-4 lg:col-4",
      className: "w-full",
      onChange: onChangeForPincode
    },
    {
        title: "State",
        name: "state",
        type: 'dropdown',
        options: stateList.map(state => ({
            label: state.stateName,
            value: state._id
        })),
        placeholder: "Select a state.",
        parentClassName: "col-12 md:col-4 lg:col-4",
        className: "w-full",
        isRequired: true
    },
    {
        title: "Country",
        name: "country",
        type: 'dropdown',
        options: countryList.map(countryList => ({
            label: countryList.countryName,
            value: countryList._id
        })),
        placeholder: "Select a country.",
        parentClassName: "col-12 md:col-4 lg:col-4",
        className: "w-full",
        isRequired: true
    },
    {
        title: "Assign To",
        name: "assignTo",
        type: 'dropdown',
        options: allUsers.map(user => ({
            label: user.fullName,
            value: user._id
        })),
        placeholder: "Select .",
        parentClassName: "col-12 md:col-4 lg:col-4",
        className: "w-full"
    },
    {
        title: "Reporting To",
        name: "reportingTo",
        type: 'dropdown',
        options: allUsers.map(user =>  ({
            label: user.firstName,
            value: user._id
        })),
        placeholder: "Select .",
        parentClassName: "col-12 md:col-4 lg:col-4",
        className: "w-full"
    },
    {
        title: "Description",
        name: "description",
        type: 'editor',
        placeholder: "Enter Here .....",
        parentClassName: "col-12 md:col-12 lg:col-12",
        className: "w-full",
        maximumLength: 500,
        isRequired: true
    },
];
