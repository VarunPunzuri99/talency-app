import * as yup from 'yup';

const JobApplicationSchema = yup.object().shape({
    jobId: yup.string(),
    workflow: yup.string(),
    resumeMetadata: yup.string(),
    coverLetterMetadata: yup.string(),
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    panNumber: yup.string().required('PAN number is required').length(10, 'PAN number must be exactly 10 characters')
        .matches(
            /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
            'Invalid PAN number format (e.g., AAAAA9999A)'
        ),
    contactDetails: yup.object().shape({
        contactEmail: yup.string().email('Invalid email format').required('Contact email is required'),
        contactNumber: yup.string().required('Contact number is required')
            .matches(
                /^[6-9]\d{9}$/,
                'Invalid phone number (must be 10 digits and start with 6, 7, 8, or 9)'
            ),
    }).required(),
    contactAddress: yup.object().shape({
        street: yup.string().required('Street is required'),
        city: yup.string().required('City is required'),
        postalCode: yup.string().required('Postal code is required'),
    }).required(),
    state: yup.string().required('State is required'),
    country: yup.string().required('Country is required'),
    dob: yup.date().required('DOB is required'),
    gender: yup.string().required('Gender is required'),
    disability: yup.boolean(),
    nationality: yup.string().required('Nationality is required'),
    linkedInUrl: yup.string()
    .test('is-linkedin-url', 'Invalid LinkedIn URL format', function(value) {
        // Only apply validation if value is not empty
        if (value && value.trim() !== '') {
            return yup.string()
                .url('Invalid LinkedIn URL')
                .matches(
                    /^https:\/\/(www\.)?linkedin\.com\/(?:in\/|pub\/)?[a-zA-Z0-9_-]+(?:\/)?$/,
                    'Invalid LinkedIn URL format'
                ).isValidSync(value);
        }
        return true; // Skip validation if empty
    }),
    websiteOrBlogUrl: yup.string().url('Invalid URL format'),
    isExperienced: yup.boolean(),
    yearsOfExperience: yup.number(),
    workExperience: yup.array(),
    educationQualification: yup.array(),
    evaluationForm: yup.array(),
    noticePeriodDays: yup.number().min(0, 'Minimum notice period must be 0 or more')
        .required('Notice period is required').max(90, 'Maximum notice period must be 90 or less'),
    servingNoticePeriod: yup.boolean(),
    lastWorkingDate: yup.date().nullable(),
    currentLocation: yup.string(),
    willingToRelocate: yup.boolean(),
    reLocation: yup.array().of(yup.string()),
    preferredLocation: yup.string(),
    currentCTC: yup.number().min(0, 'Minimum CTC must be 0 or more').required('Minimum CTC is required'),
    expectedCTC: yup.number(),
    ctcPercentage: yup.number(),
    currency: yup.string(),
    companyNorms: yup.boolean(),
    org: yup.string(),
    isDraft: yup.boolean(),
});

export default JobApplicationSchema