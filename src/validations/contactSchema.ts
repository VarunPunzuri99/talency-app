
import * as yup from 'yup';

const phoneRegExp = /^(\+\d{1,3}[- ]?)?\d{10}$/;

const contactSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(30, 'First name must be at most 30 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be at most 30 characters'),
  referredBy: yup.string(),
  // Independent email and phone validation
  emails: yup.array().of(
    yup.object().shape({
      contactEmail: yup.string().email('Enter a valid email').required('Email is required'),
    })
  ).min(1, 'At least one email is required').required('Emails are required'),
  phones: yup.array().of(
    yup.object().shape({
      contactNumber: yup.string().required('Phone number is required').matches(phoneRegExp, 'Enter a valid phone number'),
    })
  ).min(1, 'At least one phone number is required').required('Phone numbers are required'),

  contactAddress: yup.object().shape({
    apartment: yup
    .string(),
    // .min(1, 'Apartment must be at least 1 character')
    // .max(10, 'Apartment must be at most 10 characters'),
  city: yup
    .string(),
    // .min(2, 'City must be at least 2 characters')
    // .max(50, 'City must be at most 50 characters'),
  postalCode: yup
    .string(),
    street: yup.string(),
    addressType: yup.string(),
  }),
  country: yup.string().required('Country is required'),
  state: yup.string().required('State is required'),
  designation: yup.string(),
  industry: yup.string(),
  accountOrg: yup.string().required('Account is required'),
  salesRepOrg: yup.string(),
  linkedInUrl: yup.string().url('Must be a valid URL'),
  businessUnit: yup.string(),
  reportingTo: yup.string(),
  assignTo: yup.string(), 
  isDeleted: yup.boolean(),
  comments: yup.string(),
});

export default contactSchema;
