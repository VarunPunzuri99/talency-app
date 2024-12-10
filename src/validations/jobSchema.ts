import * as yup from 'yup';


const JobSchema = yup.object().shape({
    title: yup.string().required('Job title is required'),
    jobType: yup.string(),
    department: yup.string(),
    noOfVacancies: yup.number().min(1, 'At least 1 vacancy is required').required('Number of vacancies is required'),
    jdUrl: yup.string(),
    employmentType: yup.string(),
    workMode: yup.string(),
    description: yup.string(),
    primarySkills: yup.array().min(1, 'At least one primary skill is required').required(),
    secondarySkills: yup.array(),
    workExperience: yup.object().shape({
        minimum: yup.number()
            .min(0, 'Minimum experience must be 0 or more')
            .required('Minimum experience is required'),
        maximum: yup.number()
            .min(yup.ref('minimum'), 'Maximum experience must be greater than or equal to minimum experience')
            .max(100, 'Maximum experience must be 100 or less')
            .required('Maximum experience is required')
    }).required(),
    jobLocation: yup.array(),
    industryOrDomain: yup.string(),
    educationalQualification: yup.array(),
    videoProfileRequested: yup.boolean(),
    hiringMode: yup.string(),
    instructionsVideoUrl: yup.string(),
    instructionsToRecruiter: yup.string(),
    questionAnswers: yup.array().of(
        yup.object().shape({
            question: yup.string(),
            answer: yup.string(),
        })
    ).required(),
    shareWithVendors: yup.boolean(),
    isDeleted: yup.boolean(),
    isOpen: yup.boolean(),
    isDraft: yup.boolean(),
    shareOnSocialMedia: yup.boolean(),
    socialMediaLinks: yup.array().of(
        yup.object().shape({
            platform: yup.string(),
            url: yup.string().url('Must be a valid URL'),
        })
    ),
    endClientOrg: yup.string().required('Hiring organization is required'),
    postingOrg: yup.string(),
    hiringOrg: yup.string(),
    spoc: yup.string(),
    maxCtcOffered: yup.number().min(0, 'Max CTC offered must be 0 or more').required('Max CTC offered is required'),
    currency: yup.string().required('Currency is required')
});


export default JobSchema;