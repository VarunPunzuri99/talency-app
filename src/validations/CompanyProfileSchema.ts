import * as yup from 'yup';

const CompanyProfileSchema = yup.object().shape({
  title: yup.string().required('Company Name is required'),

  websiteUrl: yup
    .string()
    .url('Enter a valid website URL')
    .required('Company Website is required')
    .matches(
      /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/,
      'Enter a valid website URL'
    ),

  subDomain: yup.string().required('Subdomain is required'),

  description: yup
    .string()
    .nullable()
    .max(300, 'Description can be at most 300 characters'),

  logo: yup
    .string()
    .required('Logo is required')
    .test('isStringOrNull', 'Logo ID must be a valid string', (value) => {
      // Check if value is either null or a string
      return value === null || typeof value === 'string';
    }),

  contactDetails: yup.array().of(
    yup.object().shape({
      contactNumber: yup
        .string()
        .required('Contact Number is required')
        .matches(
          /^[6-9]\d{9}$/,
          'Invalid phone number (must be 10 digits and start with 6, 7, 8, or 9)'
        ),
    })
  ).required('At least one contact detail is required'),

  thumbNail: yup
    .mixed()
    .nullable()
    .test('fileType', 'Only .jpg, .jpeg, and .png formats are allowed', (value) => {
      if (value) {
        const file = value[0];
        const validFormats = ['image/jpeg', 'image/png'];
        return file && validFormats.includes(file.type);
      }
      return true;
    }),

  socialDescription: yup.string().nullable().max(300, 'Description can be at most 300 characters'),

});

export default CompanyProfileSchema;
