import * as yup from 'yup';

const  UserProfileSchema = yup.object().shape({
  firstName: yup.string().required('User Name is required'),
  email: yup
  .string()
  .required('Email is required')
  .email('Invalid email format')
  .max(75, 'Email can be at most 75 characters'),

  logo: yup
  .string()
  .required('Logo is required') 
  .test('isStringOrNull', 'Please upload a valid logo to proceed', (value) => {
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

export default UserProfileSchema;




// const UserProfileSchema = yup.object().shape({
//   title: yup
//     .string()
//     .required('First Name is required')
//     .min(1, 'First Name must be at least 1 character')
//     .max(30, 'First Name can be at most 30 characters'),

//   email: yup
//     .string()
//     .required('Email is required')
//     .email('Invalid email format')
//     .max(75, 'Email can be at most 75 characters'),

//   description: yup
//     .string()
//     .nullable()
//     .max(300, 'Description can be at most 300 characters'),
  
//   contactDetails: yup.array().of(
//     yup.object().shape({
//       contactNumber: yup
//         .string()
//         .required('Phone Number is required')
//         .matches(/^[0-9]+$/, 'Phone Number must be only digits')
//         .min(10, 'Phone Number must be exactly 10 digits')
//         .max(10, 'Phone Number must be exactly 10 digits')
//     })
//   ).required('At least one contact detail is required'),

//   socialDescription: yup.string().nullable().max(300, 'Description can be at most 300 characters'),
// });
