import * as yup from 'yup';

const memberSchema = yup.object().shape({
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
    email: yup.string().email("Pleade provide a valid email").required("Email is required")
        .matches(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Please provide a valid email address with a domain"
        ),
    reportingTo: yup.string(),
    roles: yup
        .array()
        .of(yup.string().required('Each role must be a valid string')) // Each item must be a string
        .min(1, 'At least one role is required') // Require at least one role
        .required('Roles are required'),
})

export default memberSchema;