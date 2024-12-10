import * as yup from 'yup';
const OrgSchema = yup.object().shape({
    title:yup.string().required('Titile is required'),
    description:yup.string().max(300, 'Description can be at most 300 characters').required('Description is required'),
    logo:yup.string(),
    legalName:yup.string(),
    websiteUrl:yup.string().url('Must be a valid URL').required("website is required"),
    contactDetails:yup.array().of(
        yup.object().shape({
            contactEmail:yup.string().email("Pleade provide a valid email").required("Email is required")
            .matches(
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                "Please provide a valid email address with a domain"
              ),
            contactNumber:yup.string().required('Contact Number is required')
            .matches(
                /^[6-9]\d{9}$/,
                'Invalid phone number (must be 10 digits and start with 6, 7, 8, or 9)'
            ), 
            isPrimary:yup.boolean(),
        })
    ),
    contactAddress:yup.array().of(
        yup.object().shape({
            apartment:yup.string(),
            street:yup.string(),
            city:yup.string(),
            postalCode:yup.string(),
            addressType:yup.string(),
        })
    ),
    country: yup.string().required('Country is required'),
    state: yup.string().when('country', (country, schema) => {
        return country ? schema.required('State is required') : schema.nullable();
    }),
    industryOrDomain:yup.string(),
    businessUnit:yup.string(),
    linkedInUrl:yup.string().required("LinkedIn URL is required").matches(
        /^https:\/\/(www\.)?linkedin\.com\/.*$/,
        'Invalid LinkedIn URL format'
    ).url('Invalid LinkedIn URL'),
    isDeleted:yup.boolean(),
    isSuspended:yup.boolean(),
    isBlocked:yup.boolean(),
    isApproved:yup.boolean(),
    headCount:yup.string(),
    parentOrg:yup.string(),
    reportingTo:yup.string(),
    assignTo:yup.string(),
    isDuplicate:yup.boolean(),
    status:yup.string(),
    accountType:yup.string(),
    orgType:yup.string(),


})
export default OrgSchema;