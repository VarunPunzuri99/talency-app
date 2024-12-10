export const userProfileFields = (errors) => [
  {
    title: 'First Name',
    name: 'firstName',
    type: 'text',
    placeholder: 'Enter User First Name ',
    maximumLength: 30,
    parentClassName: 'col-12 md:col-6 lg:col-6',
    className: 'w-full mt-1',
  },
  {
    title: 'Email',
    name: 'email',
    type: 'text',
    placeholder: 'Enter User Email',
    parentClassName: 'col-12 md:col-6 lg:col-6',
    className: 'w-full mt-1',
    maximumLength: 75,
  },
  {
    title: 'Phone Number',
    name: 'contactDetails.0.contactNumber',
    type: 'text',
    keyfilter: 'int',
    placeholder: 'Enter phone number',
    maximumLength: 10,
    parentClassName: 'col-12 md:col-6 lg:col-6',
    className: 'w-full mt-1',
    comValidation: errors?.contactDetails?.[0]?.contactNumber?.message,
  },


  {
    title: 'User Logo',
    name: 'logo',
    type: 'file-preview',
    parentClassName: 'col-12 md:col-6 lg:col-6',
    className: 'w-full mt-1',
    description: 'Upload a .jpg or .png logo',
  },
];


