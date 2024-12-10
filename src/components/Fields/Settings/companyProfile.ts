export const companyProfileFields = (errors) => [
    {
        title: "Name",
        name: "title",
        type: 'text',
        placeholder: "Enter Company Name ",
        maximumLength: 30,
        parentClassName: "col-12 md:col-6 lg:col-6",
        className: "w-full mt-1"
    },
    {
        title: "Website",
        name: "websiteUrl",
        type: 'text',
        placeholder: "Enter Company Website",
        parentClassName: "col-12 md:col-6 lg:col-6",
        className: "w-full mt-1",
        maximumLength: 75
    },
    {
        title: "Phone Number",
        name: "contactDetails.0.contactNumber",
        type: 'text',
        keyfilter: 'int',
        placeholder: "Enter phone number",
        maximumLength: 10,
        parentClassName: "col-12 md:col-6 lg:col-6",
        className: "w-full mt-1",
        comValidation: errors?.contactDetails?.[0]?.contactNumber?.message
    },
    {
        title: "Subdomain",
        name: "subDomain",
        type: 'text',
        placeholder: "Enter Subdomain",
        parentClassName: "col-12 md:col-6 lg:col-6",
        className: "w-full mt-1",
        maximumLength: 75
    },
    {
        title: "Company Logo",
        name: "logo",
        type: 'file-preview',
        parentClassName: "col-12 md:col-6 lg:col-6",
        className: "w-full mt-1",
        description: "Upload a .jpg or .png logo",
        comValidation: errors?.logo?.message
    },
    {
        title: "Description",
        name: "description",
        type: 'editor',
        placeholder: "Enter Here .....",
        parentClassName: "col-12 md:col-6 lg:col-6",
        className: "w-full mt-1",
        maximumLength: 500,
    }
];

export const socialSharingFields = () => [
    {
      title: "Social Sharing Thumbnail",
      name: "thumbnail",
      type: 'file-preview',
      className: "w-full mt-3",
      description: "Upload a thumbnail image for social sharing.",
      labelClassName: "text-center font-bold mb-3"
    },
    {
      title: "Social Sharing Description",
      name: "socialDescription",
      type: 'editor',
      placeholder: "Enter description for the social sharing thumbnail",
      className: "w-full mt-1",
        maximumLength: 150,
      labelClassName: "font-bold"
    }
  ];
