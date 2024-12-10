const memberRoles = [
    // { label: 'Organization Admin', value: 'org-admin' },
    // { label: 'Organization User', value: 'org-user' },
    // { label: 'Business Unit Head', value: 'bu-head' },
    // { label: 'Account Manager', value: 'account-manager' },
    // { label: 'Resource Manager', value: 'resource-manager' },
    // { label: 'Delivery Manager', value: 'delivery-manager' },
    { label: 'Team Lead', value: 'team-lead' },
    { label: 'Recruiter', value: 'team-member' }
];



export const memberFields = (errors,initialBusinessUnits,initialOrgUsers) => [
    {
        title: "Email Address *",
        name: "email",
        type: "text",
        className: "w-full my-2",
        placeholder: "Enter the email address",
        // comValidation: errors?.email?.message
    },
    {
        title: "First Name *",
        name: "firstName",
        type: "text",
        className: "w-full my-2",
        placeholder: "Enter the first name",
        maximumLength: 30,
    },
    {
        title: "Last Name *",
        name: "lastName",
        type: "text",
        className: "w-full my-2",
        placeholder: "Enter the last name",
        maximumLength: 30,

    },
    {
        title: 'Department *',
        name: 'businessUnit',
        type: 'tree-select',
        options: initialBusinessUnits,
        placeholder: 'Select the department',
        className: 'w-full my-2',
      },
    {
        title: 'Reporting To',
        name: 'reportingTo',
        type: 'dropdown',
        options: initialOrgUsers?.map((user) => ({
          label: user.fullName || user.firstName,
          value: user._id,
        })),
        placeholder: 'Select the user',
        className: 'w-full my-2',
      },
    {
        title: "Roles *",
        name: "roles",
        type: 'multiselect',
        options: memberRoles.map(member => ({
            label: `${member.label}`,
            value: member.value
        })),
        placeholder: "Select user roles",
        className: 'w-full my-2',
    },
]