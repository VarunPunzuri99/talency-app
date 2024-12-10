import React, { useEffect, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import styles from '@/styles/shared/Jobs/applications_list_view_page.module.scss';
import Image from 'next/image';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import api, { createEducation, createSkill, createWorkExperience, deleteEducation, deleteSkill, deleteWorkExperience, getDynamicFields, jobApplicationPost, setToken, updateEducation, updateSkill, updateWorkExperience, uploadFile } from '@/services/api.service';
import moment from 'moment';
import { Controller, useForm } from 'react-hook-form';
import { Toast } from '@/hooks/tryCatch';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { FileUpload } from 'primereact/fileupload';
import DynamicFields from '@/utils/DynamicComponents';
import { yupResolver } from '@hookform/resolvers/yup';
import { personalInfoFields } from '@/components/Fields/JobApplication';
import { ControlledCalendar } from '@/utils/Calander';
import { cleanData } from '@/utils/CleanData';
import { ControlledMultiSelect } from '@/utils/Multiselect';
import { ControlledInputText } from '@/utils/InputText';
import JobApplicationSchema from '@/validations/JobApplicationSchema';
import { Steps } from 'primereact/steps';
import * as yup from 'yup';


export const getServerSideProps = async ({ req, query: { jobId, jobApplicationId } }) => {
    setToken(req);
    let job = null;
    let jobApplication = null;
    let dynamicFields = [];
    try {
        if (jobId) {
            job = await api.getJobById(jobId);
            console.log(job.postingOrg._id)
            dynamicFields = await getDynamicFields(job.postingOrg._id);
            console.log(dynamicFields)
            jobApplication = await api.getUserJobApplicationForJob(jobId);
        }

        if (jobApplicationId) {
            jobApplication = await api.getJobApplication(jobApplicationId);
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            // Job application not found
            console.warn(`Job application for jobId ${jobId} not found.`);
        } else {
            // Log other errors
            console.error('Error fetching job or job application:', error);
        }
    }

    return {
        props: {
            job: job ?? {},
            jobApplication: jobApplication ?? null,
            dynamicFields: dynamicFields ?? [],
        },
    };
};

const addDynamicFieldsToSchema = (schema, dynamicFields) => {
    const updatedSchema = { ...schema.fields }; // Clone existing schema fields

    const dynamicFieldSchemas = {}; // Separate object for dynamic fields schema

    dynamicFields.forEach(field => {
        const fieldPath = `${field.title}`; // Correctly map to dynamicFields

        switch (field.type) {
            case 'text':
                dynamicFieldSchemas[fieldPath] = field.isRequired
                    ? yup.string().required(`${field.title} is required`)
                    : yup.string();
                break;
            case 'number':
                dynamicFieldSchemas[fieldPath] = field.isRequired
                    ? yup.number().required(`${field.title} is required`)
                    : yup.number();
                break;
            // Add more cases for other field types if needed
            default:
                dynamicFieldSchemas[fieldPath] = yup.mixed();
        }
    });

    // Merge dynamic fields schema with the existing schema
    return yup.object().shape({
        ...updatedSchema,
        dynamicFields: yup.object().shape(dynamicFieldSchemas) // Nested schema for dynamic fields
    });
};

export default function Application({ job, jobApplication, dynamicFields }) {
    const router = useRouter();
    const [isFresher, setIsFresher] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<{ id: string; name: string } | null>(null);

    const jobRedirect = job?._id;

    const defaultValues = {
        jobId: job ? job._id : '',
        workflow: job ? job.workflow?._id : '',
        resumeMetadata: '',
        coverLetterMetadata: '',
        firstName: '',
        lastName: '',
        panNumber: '',
        contactDetails: {
            contactEmail: '',
            contactNumber: '',
        },
        contactAddress: {
            street: '',
            city: '',
            postalCode: '',
        },
        state: '',
        country: '',
        dob: null,
        gender: '',
        disability: false,
        nationality: '',
        linkedInUrl: '',
        websiteOrBlogUrl: '',
        isExperienced: false,
        yearsOfExperience: 0,
        workExperience: [],
        educationQualification: [],
        evaluationForm: [],
        noticePeriodDays: 0,
        servingNoticePeriod: false,
        lastWorkingDate: null,
        currentLocation: '',
        willingToRelocate: false,
        reLocation: [],
        preferredLocation: '',
        currentCTC: 0,
        expectedCTC: 0,
        ctcPercentage: 0,
        currency: job ? job.currency : 'INR',
        companyNorms: false,
        org: job ? job.endClientOrg?._id : '',
        isDraft: false,
        dynamicFields: dynamicFields.reduce((acc, field) => {
            acc[field.title] = '';
            return acc;
        }, {})
    };

    const transformedFields = dynamicFields.length > 0
        ? dynamicFields.map(field => ({
            title: field.title,
            name: `dynamicFields.${field.title}`,
            type: field.type,
            placeholder: field.placeholder,
            isRequired: field.isRequired,
            comValidation: ""
        })) : [];


    const schemaWithDynamicFields = addDynamicFieldsToSchema(JobApplicationSchema, transformedFields);

    const { control, handleSubmit, formState: { errors }, trigger, watch, reset, setValue, getValues } = useForm<any>({
        resolver: yupResolver(schemaWithDynamicFields),
        mode: 'onChange',
        defaultValues
    });

    transformedFields.forEach((field) => {
        field.comValidation = errors?.dynamicFields?.[field.title]?.message || "";
    });

    console.log(errors)

    useEffect(() => {
        if (jobApplication) {

            const transformedDynamicFields = Object.entries(jobApplication.dynamicFields).reduce((acc, [key, value]) => {
                acc[key] = value ?? ''; // Map each key-value pair
                return acc;
            }, {});

            reset({
                jobId: jobApplication.jobId?._id ?? defaultValues.jobId,
                workflow: jobApplication.workflow?._id ?? defaultValues.workflow,
                firstName: jobApplication.firstName ?? defaultValues.firstName,
                lastName: jobApplication.lastName ?? defaultValues.lastName,
                panNumber: jobApplication.panNumber ?? defaultValues.panNumber,
                contactDetails: {
                    contactEmail: jobApplication.contactDetails?.contactEmail ?? defaultValues.contactDetails.contactEmail,
                    contactNumber: jobApplication.contactDetails?.contactNumber ?? defaultValues.contactDetails.contactNumber,
                },
                contactAddress: {
                    street: jobApplication.contactAddress?.street ?? defaultValues.contactAddress.street,
                    city: jobApplication.contactAddress?.city ?? defaultValues.contactAddress.city,
                    postalCode: jobApplication.contactAddress?.postalCode ?? defaultValues.contactAddress.postalCode,
                },
                state: jobApplication.state ?? defaultValues.state,
                country: jobApplication.country ?? defaultValues.country,
                dob: jobApplication.dob ?? defaultValues.dob,
                gender: jobApplication.gender ?? defaultValues.gender,
                disability: jobApplication.disability ?? defaultValues.disability,
                nationality: jobApplication.country ?? defaultValues.nationality,
                linkedInUrl: jobApplication.linkedInUrl ?? defaultValues.linkedInUrl,
                websiteOrBlogUrl: jobApplication.websiteOrBlogUrl ?? defaultValues.websiteOrBlogUrl,
                isExperienced: jobApplication.isExperienced ?? defaultValues.isExperienced,
                yearsOfExperience: jobApplication.yearsOfExperience ?? defaultValues.yearsOfExperience,
                workExperience: jobApplication.workExperience?.map(exp => exp._id) ?? defaultValues.workExperience, // Only IDs
                educationQualification: jobApplication.educationQualification?.map(edu => edu._id) ?? defaultValues.educationQualification, // Only IDs
                evaluationForm: jobApplication.evaluationForm?.map(evaluation => evaluation._id) ?? defaultValues.evaluationForm, // Only IDs
                noticePeriodDays: jobApplication.noticePeriodDays ?? defaultValues.noticePeriodDays,
                servingNoticePeriod: jobApplication.servingNoticePeriod ?? defaultValues.servingNoticePeriod,
                lastWorkingDate: jobApplication.lastWorkingDate ?? defaultValues.lastWorkingDate,
                currentLocation: jobApplication.currentLocation ?? defaultValues.currentLocation,
                willingToRelocate: jobApplication.willingToRelocate ?? defaultValues.willingToRelocate,
                reLocation: jobApplication.reLocation ?? defaultValues.reLocation,
                preferredLocation: jobApplication.preferredLocation ?? defaultValues.preferredLocation,
                currentCTC: jobApplication.currentCTC ?? defaultValues.currentCTC,
                expectedCTC: jobApplication.expectedCTC ?? defaultValues.expectedCTC,
                ctcPercentage: jobApplication.ctcPercentage ?? defaultValues.ctcPercentage,
                currency: jobApplication.currency ?? defaultValues.currency,
                companyNorms: jobApplication.companyNorms ?? defaultValues.companyNorms,
                org: jobApplication.org ?? defaultValues.org,
                isDraft: jobApplication.isDraft ?? defaultValues.isDraft,
                dynamicFields: transformedDynamicFields // Map dynamic fields here
            });
            setJobApplicationId(jobApplication._id);
        }
    }, [jobApplication, reset]);


    const hikeOptions = Array.from({ length: 20 }, (_, i) => {
        return { label: `${(i + 1) * 5}%`, value: (i + 1) * 5 };
    });


    const currentCTC = watch('currentCTC');
    const ctcPercentage = watch('ctcPercentage');

    useEffect(() => {
        if (ctcPercentage && currentCTC) {
            const expectedCTC = (currentCTC * (1 + ctcPercentage / 100)).toFixed(2);
            setValue('expectedCTC', parseInt(expectedCTC));
        }
    }, [ctcPercentage]);

    const [selectedOption, setSelectedOption] = useState(''); // Options: 'companyNorms', 'ctcPercentage', 'expectedCTC'

    const handleCompanyNormsChange = (checked) => {
        if (checked) {
            setSelectedOption('companyNorms');
            // Set ctcPercentage and expectedCTC to 0 when companyNorms is selected
            setValue('ctcPercentage', 0);
            setValue('expectedCTC', 0);
        } else {
            setSelectedOption('');
        }
    };

    const handleCTCPercentageChange = () => {
        setSelectedOption('ctcPercentage');
    };

    const handleExpectedCTCChange = () => {
        setSelectedOption('expectedCTC');
        // Clear ctcPercentage when expectedCTC is selected
        setValue('ctcPercentage', 0);
    };

    const handleFresherChange = (isFresherSelected) => {
        setIsFresher(isFresherSelected);
        setValue('isExperienced', !isFresherSelected, { shouldValidate: true });
    };

    const [experiences, setExperiences] = useState(
        jobApplication && jobApplication.workExperience.length > 0
            ? jobApplication.workExperience.map(experience => ({
                id: experience._id || '',
                jobId: jobApplication.jobId._id,
                jobTitle: experience.jobTitle || '',
                companyName: experience.companyName || '',
                jobStartDate: experience.jobStartDate ? new Date(experience.jobStartDate) : null,
                jobEndDate: experience.jobEndDate ? new Date(experience.jobEndDate) : null,
                currentlyWorking: experience.currentlyWorking || false,
                isSaved: true // Assuming these are already saved
            })) : [{
                id: '',
                jobId: job ? job._id : '',
                jobTitle: '',
                companyName: '',
                jobStartDate: null,
                jobEndDate: null,
                currentlyWorking: false,
                isSaved: false
            }]
    );

    const handleAddExperience = () => {
        setExperiences(prevExperiences => {
            if (prevExperiences.length >= 10) {
                return prevExperiences; // Do not add more if already 10 experiences
            }
            return [
                ...prevExperiences,
                {
                    id: '', // Initialize with empty ID
                    jobId: job ? job._id : '',
                    jobTitle: '',
                    companyName: '',
                    jobStartDate: null,
                    jobEndDate: null,
                    currentlyWorking: false,
                    isSaved: false
                }
            ];
        });
    };

    const validateExperience = (experience) => {
        const { jobTitle, companyName, jobStartDate, jobEndDate, currentlyWorking } = experience;

        if (!jobTitle || !companyName || !jobStartDate || (currentlyWorking && !jobEndDate)) {
            return false;
        }

        const startDate = moment(jobStartDate);
        const endDate = moment(jobEndDate);

        // Check if endDate is greater than startDate
        if (endDate.isValid() && startDate.isValid() && (endDate.isBefore(startDate) || endDate.isSame(startDate))) {
            return false; // End date is before start date
        }

        return true;
    };

    const handleExperienceChange = (index, field, value) => {
        setExperiences(prevExperiences => {
            const newExperiences = [...prevExperiences];
            newExperiences[index] = {
                ...newExperiences[index],
                [field]: value
            };
            return newExperiences;
        });
    };


    const handleDeleteExperiences = async (index) => {
        const experienceToDelete = experiences[index];
        const experienceId = experienceToDelete.id;

        // Remove the experience from the state synchronously
        const updatedExperiences = experiences.filter((_, i) => i !== index);
        setExperiences(updatedExperiences);

        // Handle the asynchronous deletion of the experience
        if (experienceId) {
            try {
                // Remove the ID from the workExperience array
                const updatedExperienceIds = getValues('workExperience').filter(id => id !== experienceId);
                setValue('workExperience', updatedExperienceIds);

                // Call the API to delete the experience
                await deleteWorkExperience(experienceId);

                const cleanedData = { ...getValues(), isDraft: true };
                cleanData(cleanedData);
                await api.updateJobApplication(jobApplicationId, cleanedData);
                toast.success('Experience deleted successfully.');

            } catch {
                toast.error('Error deleting experience. Please try again.');
            }
        }
    };

    const handleEditExperiences = async (index) => {
        setExperiences(prevExperiences => {
            // Create a copy of the previous state
            const newExperiences = [...prevExperiences];

            // Modify the specific experience
            if (newExperiences[index].isSaved) {
                newExperiences[index] = {
                    ...newExperiences[index],
                    isSaved: false
                };
            }

            // Return the updated state
            return newExperiences;
        });
    };

    const saveAllExperiences = async () => {
        const experiencesToSave = experiences.filter(experience => !experience.isSaved);

        if (!experiencesToSave.length) {
            toast.info('All experiences are already saved.');
            return;
        }

        const areAllValid = experiencesToSave.every(validateExperience);
        if (!areAllValid) {
            toast.warn('Please ensure all fields are completed before saving.');
            return;
        }

        try {
            const savedExperiences = await Promise.all(
                experiencesToSave.map(async experience => {
                    const formattedExperience = {
                        jobId: experience.jobId,
                        jobTitle: experience.jobTitle,
                        companyName: experience.companyName,
                        jobStartDate: experience.jobStartDate ? new Date(experience.jobStartDate).toISOString() : null,
                        jobEndDate: experience.jobEndDate ? new Date(experience.jobEndDate).toISOString() : null,
                        currentlyWorking: experience.currentlyWorking
                    };

                    if (experience.id) {
                        await updateWorkExperience(experience.id, formattedExperience);
                        return { ...experience, isSaved: true };
                    } else {
                        const response = await createWorkExperience(formattedExperience);
                        setValue('workExperience', [
                            ...getValues('workExperience'),
                            response._id,
                        ]);
                        return { ...experience, isSaved: true, id: response._id };
                    }
                })
            );

            setExperiences(prevExperiences =>
                prevExperiences.map(experience =>
                    savedExperiences.find(saved =>
                        saved.jobId === experience.jobId &&
                        saved.jobTitle === experience.jobTitle &&
                        saved.companyName === experience.companyName &&
                        saved.jobStartDate === experience.jobStartDate
                    ) || experience
                )
            );

            toast.success('All experiences saved successfully.');

            const cleanedData = { ...getValues(), isDraft: true };
            cleanData(cleanedData);
            await api.updateJobApplication(jobApplicationId, cleanedData);

            toast.success('Job application updated successfully.');
            goToNextStep();
        } catch (error) {
            console.error('Error saving experiences:', error);
            toast.error('Error saving one or more experiences. Please try again.');
        }
    };

    const [educations, setEducations] = useState(
        jobApplication
            ? jobApplication.educationQualification.map(education => ({
                id: education._id || '', // Optional ID property
                jobId: jobApplication.jobId._id,
                courseName: education.courseName || '',
                university: education.university || '',
                startDate: education.startDate ? new Date(education.startDate) : null,
                endDate: education.endDate ? new Date(education.endDate) : null,
                isSaved: true // Assuming these are already saved
            }))
            : [{
                id: '',
                jobId: job ? job._id : '',
                courseName: '',
                university: '',
                startDate: null,
                endDate: null,
                isSaved: false
            }]
    );

    const handleAddEducation = () => {
        setEducations(prevEducations => {
            if (prevEducations.length >= 5) {
                return prevEducations; // Do not add more if already 10 education entries
            }
            return [
                ...prevEducations,
                {
                    id: '',
                    jobId: job ? job._id : '',
                    courseName: '',
                    university: '',
                    startDate: null,
                    endDate: null,
                    isSaved: false
                }
            ];
        });
    };

    const validateEducation = (education) => {
        const { courseName, university, startDate, endDate } = education;

        if (!courseName || !university || !startDate || !endDate) {
            return false;
        }

        const start = moment(startDate);
        const end = moment(endDate);

        // Check if startDate and endDate are valid and endDate is after startDate
        if (start.isValid() && end.isValid() && (end.isSameOrBefore(start))) {
            return false;
        }

        return true;
    };

    const handleEducationChange = (index, field, value) => {
        setEducations(prevEducations => {
            const newEducations = [...prevEducations];
            newEducations[index] = {
                ...newEducations[index],
                [field]: value
            };
            return newEducations;
        });
    };

    const handleDeleteEducation = async (index) => {
        const educationToDelete = educations[index];
        const educationId = educationToDelete.id;

        // Remove the education from the state synchronously
        const updatedEducations = educations.filter((_, i) => i !== index);
        setEducations(updatedEducations);

        // Handle the asynchronous deletion of the education
        if (educationId) {
            try {
                // Remove the ID from the educationQualification array
                const updatedEducationIds = getValues('educationQualification').filter(id => id !== educationId);
                setValue('educationQualification', updatedEducationIds);

                // Call the API to delete the education
                await deleteEducation(educationId);

                const cleanedData = { ...getValues(), isDraft: true };
                cleanData(cleanedData);
                await api.updateJobApplication(jobApplicationId, cleanedData);
                toast.success('Education deleted successfully.');

            } catch {
                toast.error('Error deleting education. Please try again.');
            }
        }
    };

    const handleEditEducation = async (index) => {
        setEducations(prevEducations => {
            // Create a copy of the previous state
            const newEducations = [...prevEducations];

            // Modify the specific education
            if (newEducations[index].isSaved) {
                newEducations[index] = {
                    ...newEducations[index],
                    isSaved: false
                };
            }

            return newEducations;
        });
    };

    const saveAllEducations = async () => {
        const educationsToSave = educations.filter(education => !education.isSaved);

        if (!educationsToSave.length) {
            toast.info('All educations are already saved.');
            return;
        }

        const areAllValid = educationsToSave.every(validateEducation);
        if (!areAllValid) {
            toast.warn('Please ensure all fields are completed and the end date is later than the start date before saving.');
            return;
        }

        try {
            const savedEducations = await Promise.all(
                educationsToSave.map(async education => {
                    const formattedEducation = {
                        jobId: education.jobId,
                        courseName: education.courseName,
                        university: education.university,
                        startDate: education.startDate ? new Date(education.startDate).toISOString() : null,
                        endDate: education.endDate ? new Date(education.endDate).toISOString() : null,
                    };

                    if (education.id) {
                        await updateEducation(education.id, formattedEducation);
                        return { ...education, isSaved: true };
                    } else {
                        const response = await createEducation(formattedEducation);
                        setValue('educationQualification', [
                            ...getValues('educationQualification'),
                            response._id,
                        ]);
                        return { ...education, isSaved: true, id: response._id };
                    }
                })
            );

            setEducations(prevEducations =>
                prevEducations.map(education =>
                    savedEducations.find(saved => saved.jobId === education.jobId &&
                        saved.courseName === education.courseName &&
                        saved.university === education.university &&
                        saved.startDate === education.startDate) || education
                )
            );

            toast.success('All educations saved successfully.');

            const cleanedData = { ...getValues(), isDraft: true };
            cleanData(cleanedData);
            await api.updateJobApplication(jobApplicationId, cleanedData);

            toast.success('Job application updated successfully.');
            goToNextStep();
        } catch (error) {
            console.error('Error saving educations:', error);
            toast.error('Error saving one or more educations. Please try again.');
        }
    };

    // Combined Skills State Management
    const [primarySkills, setPrimarySkills] = useState(() => {
        if (jobApplication && jobApplication.evaluationForm && jobApplication.evaluationForm.length > 0) {
            return jobApplication.evaluationForm
                .filter(skill => skill.isPrimary)
                .map(skill => ({
                    id: skill._id || '', // Optional ID property
                    jobId: jobApplication.jobId._id,
                    skillName: skill.skill,
                    years: skill.years || '',
                    months: skill.months || '',
                    skillLevel: skill.rating || 1,
                    isPrimary: true,
                    isSaved: true
                }));
        } else {
            return (job.primarySkills || []).map(skill => ({
                jobId: job ? job._id : '',
                skillName: skill,
                years: '',
                months: '',
                skillLevel: 1,
                isPrimary: true,
                isSaved: false
            }));
        }
    });

    const [secondarySkills, setSecondarySkills] = useState(() => {
        if (jobApplication && jobApplication.evaluationForm && jobApplication.evaluationForm.length > 0) {
            return jobApplication.evaluationForm
                .filter(skill => !skill.isPrimary)
                .map(skill => ({
                    id: skill._id || '', // Optional ID property
                    jobId: jobApplication.jobId._id,
                    skillName: skill.skill,
                    years: skill.years || '',
                    months: skill.months || '',
                    skillLevel: skill.rating || 1,
                    isPrimary: false,
                    isSaved: true
                }));
        } else {
            return (job.secondarySkills || []).map(skill => ({
                jobId: job ? job._id : '',
                skillName: skill,
                years: '',
                months: '',
                skillLevel: 1,
                isPrimary: false,
                isSaved: false
            }));
        }
    });

    const handlePrimarySkillChange = (index, field, value) => {
        const newPrimarySkills = [...primarySkills];
        newPrimarySkills[index][field] = value;
        setPrimarySkills(newPrimarySkills);
    };

    const handleEditPrimarySkill = async (index) => {
        setPrimarySkills(prevPrimarySkills => {
            // Create a copy of the previous state
            const newPrimarySkills = [...prevPrimarySkills];

            if (newPrimarySkills[index].isSaved) {
                newPrimarySkills[index] = {
                    ...newPrimarySkills[index],
                    isSaved: false
                };
            }
            return newPrimarySkills;
        });
    };

    const handleSecondarySkillChange = (index, field, value) => {
        const newSecondarySkills = [...secondarySkills];
        newSecondarySkills[index][field] = value;
        setSecondarySkills(newSecondarySkills);
    };

    const handleEditSecondarySkill = async (index) => {
        setSecondarySkills(prevSecondarySkills => {
            // Create a copy of the previous state
            const newSecondarySkills = [...prevSecondarySkills];

            // Modify the specific skill
            if (newSecondarySkills[index].isSaved) {
                newSecondarySkills[index] = {
                    ...newSecondarySkills[index],
                    isSaved: false
                };
            }

            return newSecondarySkills;
        });
    };

    const validateSkill = (skill) => {
        const { skillName, years, months, skillLevel } = skill;
        return skillName && years && months && skillLevel;
    };

    const saveAllSkills = async () => {
        const allSkills = [...primarySkills, ...secondarySkills];
        const unsavedSkills = allSkills.filter(skill => !skill.isSaved);

        if (!unsavedSkills.length) {
            toast.info('All skills are already saved.');
            return;
        }

        const areAllValid = unsavedSkills.every(validateSkill);
        if (!areAllValid) {
            toast.warn('Please fill out all required fields (years and months) before saving.');
            return;
        }

        try {
            const savedSkills = await Promise.all(
                unsavedSkills.map(async skill => {
                    const formattedSkill = {
                        jobId: skill.jobId,
                        skill: skill.skillName,
                        years: skill.years ? Number(skill.years) : 0,
                        months: skill.months ? Number(skill.months) : 0,
                        rating: skill.skillLevel ? Number(skill.skillLevel) : 0,
                        isPrimary: skill.isPrimary,
                    };

                    if (skill.id) {
                        // Update the skill if ID exists
                        await updateSkill(skill.id, formattedSkill);
                        toast.success('Skill updated successfully.');
                        return { ...skill, isSaved: true };
                    } else {
                        // Create the skill if no ID exists
                        const response = await createSkill(formattedSkill);
                        setValue('evaluationForm', [
                            ...getValues('evaluationForm'),
                            response._id,
                        ]);
                        toast.success('Skill saved successfully.');
                        return { ...skill, isSaved: true, id: response._id };
                    }
                })
            );

            // Update both primary and secondary skills states
            setPrimarySkills(prevSkills =>
                prevSkills.map(skill =>
                    savedSkills.find(saved => saved.skillName === skill.skillName && saved.jobId === skill.jobId && saved.isPrimary) || skill
                )
            );
            setSecondarySkills(prevSkills =>
                prevSkills.map(skill =>
                    savedSkills.find(saved => saved.skillName === skill.skillName && saved.jobId === skill.jobId && !saved.isPrimary) || skill
                )
            );

            const cleanedData = { ...getValues(), isDraft: true };
            cleanData(cleanedData);
            await api.updateJobApplication(jobApplicationId, cleanedData);

            toast.success('Job application updated successfully.');
            goToNextStep();
        } catch (error) {
            console.error('Error saving skills:', error);
            toast.error('Error saving one or more skills. Please try again.');
        }
    };

    const handleAddSecondarySkill = () => {
        setSecondarySkills(prevSecondarySkills => {
            if (prevSecondarySkills.length >= 5) {
                return prevSecondarySkills; // Do not add more if already 5 skills
            }
            return [
                ...prevSecondarySkills,
                {
                    id: '',
                    jobId: job ? job._id : '',
                    skillName: '',
                    years: '',
                    months: '',
                    skillLevel: 1,
                    isSaved: false,
                    isPrimary: false
                }
            ];
        });
    };

    const handleDeleteSecondarySkill = async (index) => {
        const skillToDelete = secondarySkills[index];

        // Remove the skill from the secondarySkills array
        setSecondarySkills(prevSkills => prevSkills.filter((_, i) => i !== index));

        // If the skill is saved, proceed with deleting it from the backend and update the evaluationForm
        if (skillToDelete.isSaved) {
            try {
                // Remove the corresponding skill ID from the evaluationForm
                const updatedSkills = getValues('evaluationForm').filter(skillId => skillId !== skillToDelete.id);
                setValue('evaluationForm', updatedSkills);

                // Call the backend API to delete the skill
                await deleteSkill(skillToDelete.id);

                const cleanedData = { ...getValues(), isDraft: true };
                cleanData(cleanedData);
                await api.updateJobApplication(jobApplicationId, cleanedData);
                toast.success('Skill deleted successfully.');

            } catch {
                toast.error('Error deleting skill. Please try again.');
            }
        }
    };

    const job_Locations_Array = job ? job.jobLocation : []

    const handleResumeUpload = async (event) => {
        const file = event.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await uploadFile(formData,);
            setUploadedFile({ id: response._id, name: file.name });
            setValue('resumeMetadata', response._id);
            toast.success('File uploaded')
        } catch {
            toast.error('Error uploading file')
        }
    };
    const onResumeSelect = (e) => {
        handleResumeUpload(e);
    };


    const handleCancelUpload = () => {
        // Clear uploaded file state
        setUploadedFile(null);
        setValue("resumeMetadata", null); // Reset form field if necessary
        toast.error("Upload canceled");
    };

    const handleCoverLetterUpload = async (event) => {
        const file = event.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await uploadFile(formData,);
            setValue('coverLetterMetadata', response._id);
            toast.success('File uploaded')
        } catch {
            toast.error('Error occurred while File upload')
        }
    };
    const onCoverLetterSelect = (e) => {
        handleCoverLetterUpload(e);
    };

    const fields = personalInfoFields(errors);

    const [activeIndex, setActiveIndex] = useState(0);
    const [jobApplicationId, setJobApplicationId] = useState<string | null>(null);

    const steps = [
        { label: 'Personal Information' },
        { label: 'Professional Experience' },
        { label: 'Education Qualification' },
        { label: 'Skills' },
        { label: 'Availability' }
    ];

    // Function to handle form submission
    const handleProceed = async () => {

        const isValid = await trigger(); // triggers validation for all fields

        if (!isValid) {
            console.log(errors)
            toast.warn('Please fill out all required fields correctly.');
            return;
        }
        // Helper function to check if all items (skills, education, experience) are saved
        const areAllItemsSaved = (items) => items.every(item => item.isSaved);

        try {
            // Fetch form data
            const formData = getValues();

            // Step 1: Create the job application (initial step)
            if (activeIndex === 0) {
                if (!jobApplicationId) {
                    const cleanedData = { ...formData, isDraft: true };
                    cleanData(cleanedData); // Utility function to clean data

                    console.log(cleanedData)

                    const response = await jobApplicationPost(cleanedData);
                    // console.log(response._id)
                    setJobApplicationId(response._id); // Save the job application ID
                    toast.success('Job application created successfully.');
                    goToNextStep();
                }
                else {
                    const cleanedData = { ...formData, isDraft: true };
                    cleanData(cleanedData);
                    await api.updateJobApplication(jobApplicationId, cleanedData);
                    goToNextStep();
                }
            }

            // Step 2: Professional Experience (when not a fresher)
            if (activeIndex === 1) {
                if (!isFresher) {
                    if (!areAllItemsSaved(experiences)) {
                        await saveAllExperiences();
                    }
                    else {
                        goToNextStep();
                    }
                }
                else {
                    goToNextStep();
                }
            }

            // Step 3: Educational Qualification
            if (activeIndex === 2) {
                if (!areAllItemsSaved(educations)) {
                    await saveAllEducations();
                }
                else {
                    goToNextStep();
                }
            }

            // Step 4: Skills (both primary and secondary)
            if (activeIndex === 3) {
                if (!areAllItemsSaved(primarySkills) || !areAllItemsSaved(secondarySkills)) {
                    await saveAllSkills();
                    return;
                }
                else {
                    goToNextStep();
                }
            }

            // If on the last step, submit the entire application
            if (activeIndex === steps.length - 1) {

                const cleanedData = { ...formData, isDraft: false };
                cleanData(cleanedData);

                await api.updateJobApplication(jobApplicationId, cleanedData);
                toast.success('Job application updated successfully.');
                // Navigate to job lists after submission
                setTimeout(() => {
                    router.push('/jobs/lists');
                }, 2000);
            }
        } catch {
            toast.error('Error processing job application. Please try again.');
        }
    };

    // Function to move to the previous step
    const goToPreviousStep = () => {
        setActiveIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };
    const goToNextStep = () => {
        setActiveIndex((prevIndex) => Math.max(prevIndex + 1, 0));
    };

    const handleGoBack = () => {
        router.push(`/jobs/lists/${jobRedirect}`);
    };

    return (
        <>
            <Toast />
            <div className={styles.goBackArrow} onClick={handleGoBack} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <i className="pi pi-arrow-left" style={{ fontSize: '1rem', marginRight: '0.5rem' }}></i>
                {/* <span>Back</span> */}
            </div>
            <form onSubmit={handleSubmit(handleProceed)}>
                <Steps model={steps} activeIndex={activeIndex} onSelect={(e) => setActiveIndex(e.index)} readOnly={true} />
                <div className={styles.application}>
                    {activeIndex === 0 && (<div className={styles.job_details}>
                        <div className={styles.headline}>
                            <h4>Personal Information</h4>
                            <span></span>
                        </div>
                        <div className="flex justify-end">
                            <Button label="View job" severity="secondary" onClick={() => router.push(`lists/${job._id}`)} />
                        </div>

                        <div className="flex justify-content-center align-items-center gap-8">
                            <div className="flex align-items-center gap-2">
                                <h5> Upload Resume/CV</h5>
                                <div>
                                    {uploadedFile ? (
                                        <div className="uploaded-file-info flex align-items-center gap-2">
                                            <p>
                                                <strong>File:</strong> {uploadedFile.name}
                                            </p>
                                            <i
                                                className="pi pi-times"
                                                style={{ cursor: "pointer", color: "red" }}
                                                onClick={handleCancelUpload}
                                                title="Remove"
                                            />
                                        </div>
                                    ) : (
                                        <FileUpload
                                            mode="basic"
                                            accept=".pdf,.doc,.docx"
                                            maxFileSize={1000000}
                                            customUpload
                                            onSelect={onResumeSelect}
                                            chooseLabel="Upload"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="flex align-items-center gap-2">
                                <h5> Upload Cover Letter</h5>
                                <FileUpload
                                    mode="basic"
                                    accept=".pdf,.doc,.docx"
                                    maxFileSize={1000000}
                                    customUpload
                                    onSelect={onCoverLetterSelect}
                                    chooseLabel="Upload"
                                />
                            </div>
                        </div>

                        {fields.map((item, index) => (
                            <React.Fragment key={index}>
                                <DynamicFields
                                    item={item}
                                    control={control}
                                    errors={errors}
                                />
                            </React.Fragment>
                        ))}

                        {transformedFields.map((item, index) => (
                            <React.Fragment key={index}>
                                <DynamicFields
                                    item={item}
                                    control={control}
                                    errors={errors}
                                />
                            </React.Fragment>
                        ))}

                        <Controller
                            name="disability"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center">
                                    <Checkbox
                                        inputId="disability"
                                        {...field}
                                        checked={field.value}
                                    />
                                    <label htmlFor="disability" className="ml-2 text-sm font-medium text-gray-700">
                                        Do you have a disability?
                                    </label>
                                </div>
                            )}
                        />
                    </div>)}

                    {activeIndex === 1 && (<div className={styles.job_details}>
                        <div className={styles.headline}>
                            <h4>Professional Experience</h4>
                            <span></span>
                        </div>
                        <div className="flex gap-8 align-items-center">
                            <div className="flex align-items-center">
                                <Checkbox
                                    inputId="Experienced"
                                    name="isExperienced"
                                    checked={!isFresher} // Assuming if not fresher, then experienced
                                    onChange={(e) => {
                                        setIsFresher(!e.target.checked);
                                        setValue('isExperienced', !e.target.checked, { shouldValidate: true });
                                    }}
                                />
                                <label htmlFor="Experienced" className="ml-2">
                                    Experienced
                                </label>
                            </div>
                            <div className="flex align-items-center">
                                <Checkbox
                                    inputId="Fresher"
                                    name="Fresher"
                                    checked={isFresher}
                                    onChange={(e) => handleFresherChange(e.target.checked)}
                                />
                                <label htmlFor="Fresher" className="ml-2">
                                    Fresher
                                </label>
                            </div>
                        </div>
                        {!isFresher && (
                            <div className="form-container">
                                {experiences.map((experience, index) => (
                                    <div key={index} className="experience-section">
                                        <div className="flex flex-column gap-2">
                                            <label htmlFor={`Job_Title_${index}`}>
                                                {index === 0 ? 'Current Job Title' : 'Previous Job Title'}
                                                <span className="text-red-500"> *</span>
                                            </label>
                                            <InputText
                                                id={`Job_Title_${index}`}
                                                value={experience.jobTitle}
                                                readOnly={experience.isSaved}
                                                maxLength={100}
                                                onChange={(e) => handleExperienceChange(index, 'jobTitle', e.target.value)}
                                                aria-describedby={`Job_Title_${index}-help`}
                                            />
                                        </div>
                                        <div className="flex flex-column gap-2">
                                            <label htmlFor={`Company_Title_${index}`}>
                                                {index === 0 ? 'Current Company' : 'Previous Company'}
                                                <span className="text-red-500"> *</span>
                                            </label>
                                            <InputText
                                                id={`Company_Title_${index}`}
                                                value={experience.companyName}
                                                readOnly={experience.isSaved}
                                                maxLength={100}
                                                onChange={(e) => handleExperienceChange(index, 'companyName', e.target.value)}
                                                aria-describedby={`Company_Title_${index}-help`}
                                            />
                                        </div>
                                        <div className="flex gap-4 align-items-center">
                                            <div className="w-3 flex flex-column gap-2">
                                                <label htmlFor={`JobStartDate_${index}`}>Job Start Date
                                                    <span className="text-red-500"> *</span>
                                                </label>
                                                <Calendar
                                                    showIcon
                                                    id={`JobStartDate_${index}`}
                                                    value={experience.jobStartDate}
                                                    minDate={new Date(new Date().getFullYear() - 50, 0, 1)} // 50 years ago from January 1
                                                    maxDate={new Date(new Date().setMonth(new Date().getMonth() - 1))} // 1 month before the current date
                                                    disabled={experience.isSaved}
                                                    onChange={(e) => handleExperienceChange(index, 'jobStartDate', e.value)}
                                                />
                                            </div>
                                            <div className="w-3 flex flex-column gap-2">
                                                <label htmlFor={`JobEndDate_${index}`}>Job End Date
                                                    <span className="text-red-500"> *</span>
                                                </label>
                                                <Calendar
                                                    showIcon
                                                    id={`JobEndDate_${index}`}
                                                    value={experience.jobEndDate}
                                                    minDate={new Date(new Date().getFullYear() - 50, 0, 1)} // 50 years ago from January 1
                                                    maxDate={new Date(new Date().getFullYear() + 1, 11, 31)} // 1 year ahead to December 31
                                                    disabled={experience.isSaved}
                                                    onChange={(e) => handleExperienceChange(index, 'jobEndDate', e.value)}
                                                />
                                            </div>
                                            <i
                                                className="pi pi-trash mt-4"
                                                style={{ color: 'red', cursor: 'pointer' }}
                                                onClick={() => handleDeleteExperiences(index)}
                                            ></i>
                                            <i
                                                className="pi pi-pencil mt-4"
                                                style={{ color: 'green', cursor: 'pointer' }}
                                                onClick={() => handleEditExperiences(index)}
                                            ></i>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {!isFresher && <p className="underline text-primary-800" onClick={handleAddExperience}>
                            Add Experience
                        </p>}
                    </div>)}

                    {activeIndex === 2 && (
                        <div className={styles.job_details}>
                            <div className={styles.headline}>
                                <h4>Educational Qualification</h4>
                                <span></span>
                            </div>
                            <div className="form-container">
                                {educations.map((education, index) => (
                                    <div key={index} className="education-section">
                                        <div className="flex flex-column gap-2">
                                            <label htmlFor={`CourseName_${index}`}>
                                                Course Name
                                                <span className="text-red-500"> *</span>
                                            </label>
                                            <InputText
                                                id={`CourseName_${index}`}
                                                value={education.courseName}
                                                maxLength={100}
                                                readOnly={education.isSaved}
                                                onChange={(e) => handleEducationChange(index, 'courseName', e.target.value)}
                                                aria-describedby={`CourseName_${index}-help`}
                                            />
                                        </div>
                                        <div className="flex flex-column gap-2">
                                            <label htmlFor={`University_${index}`}>University
                                                <span className="text-red-500"> *</span>
                                            </label>
                                            <InputText
                                                id={`University_${index}`}
                                                value={education.university}
                                                maxLength={100}
                                                readOnly={education.isSaved}
                                                onChange={(e) => handleEducationChange(index, 'university', e.target.value)}
                                                aria-describedby={`University_${index}-help`}
                                            />
                                        </div>
                                        <div className="flex flex-column gap-3">
                                            <label htmlFor={`CompletionDate_${index}`}>Completion Date
                                                <span className="text-red-500"> *</span>
                                            </label>
                                            <div className="flex gap-4 align-items-center">
                                                <Calendar
                                                    showIcon
                                                    placeholder="Enter Start Date"
                                                    value={education.startDate}
                                                    minDate={new Date(new Date().getFullYear() - 50, 0, 1)}
                                                    maxDate={new Date(new Date().setMonth(new Date().getMonth() - 1))}
                                                    disabled={education.isSaved}
                                                    onChange={(e) => handleEducationChange(index, 'startDate', e.value)}
                                                />
                                                <Calendar
                                                    showIcon
                                                    placeholder="Enter End Date"
                                                    value={education.endDate}
                                                    minDate={new Date(new Date().getFullYear() - 50, 0, 1)}
                                                    maxDate={new Date(new Date().getFullYear() + 3, 11, 31)}
                                                    disabled={education.isSaved}
                                                    onChange={(e) => handleEducationChange(index, 'endDate', e.value)}
                                                />
                                                <i
                                                    className={`pi pi-trash px-2 text-red-500`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleDeleteEducation(index)}
                                                ></i>
                                                <i
                                                    className="pi pi-pencil"
                                                    style={{ color: 'green', cursor: 'pointer' }}
                                                    onClick={() => handleEditEducation(index)}
                                                ></i>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <p className="underline text-primary-800" onClick={handleAddEducation}>
                                    Add Education
                                </p>
                            </div>
                        </div>)}

                    {activeIndex === 3 && (
                        <div className={`${styles.job_details}`}>
                            <div className={styles.headline}>
                                <h4>Skills</h4>
                                <span></span>
                            </div>

                            <h4 className="mt-3 font-semibold">Primary Skills</h4>
                            <div className="form-container">
                                {primarySkills.map((skill, index) => (
                                    <div key={index} className="skill-section my-4">
                                        <div className="flex gap-3 align-items-center">
                                            <div className="w-6 flex gap-2 justify-content-between align-items-center">
                                                <div className="w-4 flex gap-2 align-items-center">
                                                    <InputText
                                                        type="string"
                                                        placeholder="Skill"
                                                        value={skill.skillName}
                                                        maxLength={25}
                                                        onChange={(e) => handlePrimarySkillChange(index, 'skillName', e.target.value)}
                                                        readOnly // Disable editing for primary skills from job requirements
                                                    />
                                                </div>
                                                <div className="w-4 flex gap-2 align-items-center">
                                                    <label><span className="text-red-500"> *</span>Years</label>
                                                    <InputText
                                                        type="number"
                                                        placeholder="No. of years"
                                                        value={skill.years}
                                                        min={0}
                                                        max={20}
                                                        onChange={(e) => handlePrimarySkillChange(index, 'years', e.target.value)}
                                                        readOnly={skill.isSaved}
                                                    />
                                                </div>
                                                <div className="w-4 flex gap-2 align-items-center">
                                                    <label><span className="text-red-500"> *</span>Months</label>
                                                    <InputText
                                                        type="number"
                                                        placeholder="No. of months"
                                                        value={skill.months}
                                                        min={0}
                                                        max={11}
                                                        onChange={(e) => handlePrimarySkillChange(index, 'months', e.target.value)}
                                                        readOnly={skill.isSaved}
                                                    />
                                                </div>
                                            </div>
                                            <Slider
                                                className={`${styles.slider} w-5 ml-2`}
                                                min={1}
                                                max={10}
                                                value={skill.skillLevel}
                                                onChange={(value) => handlePrimarySkillChange(index, 'skillLevel', value)}
                                                disabled={skill.isSaved} // Disable the input if the skill is saved
                                                marks={{
                                                    1: { label: '1' },
                                                    2: { label: '2' },
                                                    3: { label: '3' },
                                                    4: { label: '4' },
                                                    5: { label: '5' },
                                                    6: { label: '6' },
                                                    7: { label: '7' },
                                                    8: { label: '8' },
                                                    9: { label: '9' },
                                                    10: { label: '10' },
                                                }}
                                            />
                                            <i
                                                className="pi pi-pencil"
                                                style={{ color: 'green', cursor: 'pointer' }}
                                                onClick={() => handleEditPrimarySkill(index)}
                                            ></i>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h4 className="mt-3 font-semibold">Secondary Skills</h4>
                            <div className="form-container">
                                {secondarySkills.length > 0 ? (
                                    secondarySkills.map((skill, index) => (
                                        <div key={index} className="skill-section my-4">
                                            <div className="flex gap-3 align-items-center">
                                                <div className="w-6 flex gap-2 justify-content-between align-items-center">
                                                    <div className="w-4 flex gap-2 align-items-center">
                                                        <span className="text-red-500"> *</span>
                                                        <InputText
                                                            type="string"
                                                            placeholder="Skill"
                                                            value={skill.skillName}
                                                            readOnly={skill.isSaved}
                                                            onChange={(e) => handleSecondarySkillChange(index, 'skillName', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="w-4 flex gap-2 align-items-center">
                                                        <label> <span className="text-red-500"> *</span>Years</label>
                                                        <InputText
                                                            type="number"
                                                            min={0}
                                                            max={20}
                                                            placeholder="No. of years"
                                                            value={skill.years}
                                                            readOnly={skill.isSaved}
                                                            onChange={(e) => handleSecondarySkillChange(index, 'years', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="w-4 flex gap-2 align-items-center">
                                                        <label> <span className="text-red-500"> *</span>Months</label>
                                                        <InputText
                                                            type="number"
                                                            min={0}
                                                            max={11}
                                                            placeholder="No. of months"
                                                            value={skill.months}
                                                            readOnly={skill.isSaved}
                                                            onChange={(e) => handleSecondarySkillChange(index, 'months', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <Slider
                                                    className={`${styles.slider} w-5 ml-2`}
                                                    min={1}
                                                    max={10}
                                                    value={skill.skillLevel}
                                                    onChange={(value) => handleSecondarySkillChange(index, 'skillLevel', value)}
                                                    disabled={skill.isSaved} // Disable the input if the skill is saved
                                                    marks={{
                                                        1: { label: '1' },
                                                        2: { label: '2' },
                                                        3: { label: '3' },
                                                        4: { label: '4' },
                                                        5: { label: '5' },
                                                        6: { label: '6' },
                                                        7: { label: '7' },
                                                        8: { label: '8' },
                                                        9: { label: '9' },
                                                        10: { label: '10' },
                                                    }}
                                                />
                                                <i
                                                    className="pi pi-trash"
                                                    style={{ color: 'red', cursor: 'pointer' }}
                                                    onClick={() => handleDeleteSecondarySkill(index)}
                                                ></i>
                                                <i
                                                    className="pi pi-pencil"
                                                    style={{ color: 'green', cursor: 'pointer' }}
                                                    onClick={() => handleEditSecondarySkill(index)}
                                                ></i>
                                            </div>
                                        </div>
                                    ))
                                ) : ''}
                                <p className="underline text-primary-800" onClick={handleAddSecondarySkill}>
                                    Add Skills
                                </p>
                            </div>
                        </div>
                    )}

                    {activeIndex === 4 && (
                        <>
                            <div className="form-container">
                                <div className={styles.headline}>
                                    <h4>Notice Period</h4>
                                    <span></span>
                                </div>
                                <div className="flex flex-column gap-2">
                                    <label htmlFor="notice">No. of days of notice</label>
                                    <Controller
                                        name="noticePeriodDays"
                                        control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <div>
                                                <ControlledInputText
                                                    id="notice"
                                                    type="number"
                                                    placeholder="Enter no. of days"
                                                    className='w-full'
                                                    value={field.value !== undefined ? field.value.toString() : ''}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                    min={0} />
                                                {error && <p className="text-red-600">{error.message}</p>}
                                            </div>
                                        )} />

                                </div>

                                <div className="flex align-items-center my-4">
                                    <Controller
                                        name="servingNoticePeriod"
                                        control={control}
                                        render={({ field }) => (
                                            <div>
                                                <Checkbox
                                                    inputId="notice_period"
                                                    {...field}
                                                    checked={field.value} />
                                                <label htmlFor="notice_period" className="ml-2">
                                                    Serving notice period
                                                </label>
                                            </div>
                                        )} />
                                </div>

                                <div className="w-10 flex flex-column gap-2">
                                    <label htmlFor="lastWorkingDate">Last Working Date</label>
                                    <Controller
                                        name="lastWorkingDate"
                                        control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <div>
                                                <ControlledCalendar
                                                    showIcon
                                                    value={field.value ? new Date(field.value) : null}
                                                    onChange={(e) => field.onChange(e.value ? moment(e.value).toISOString() : null)}
                                                    minDate={new Date(new Date().getFullYear() - 50)} // Set minimum date to 50 years in the past
                                                    maxDate={new Date(new Date().setMonth(new Date().getMonth() + 3))} // Set maximum date to 3 months in the future
                                                />
                                                {error && <p className="text-red-600">{error.message}</p>}
                                            </div>
                                        )} />
                                </div>

                            </div>
                            <div className={`${styles.job_details}`}>
                                <div className={styles.headline}>
                                    <h4>Availability</h4>
                                    <span></span>
                                </div>
                                <div className="field">
                                    <label htmlFor="currentLocation">Current Location</label>
                                    <Controller
                                        name="currentLocation"
                                        control={control}
                                        render={({ field }) => (
                                            <InputText
                                                id="currentLocation"
                                                {...field} // This spreads all necessary props (value, onChange, name, ref, etc.)
                                                maxLength={100} />
                                        )} />
                                </div>
                                <div className="w-8 flex gap-4">
                                    <div className="w-3">
                                        <strong>Locations </strong>
                                    </div>
                                    {job_Locations_Array ? job_Locations_Array.map((location, index) => {
                                        return (
                                            <div
                                                key={index}
                                                className="w-2 flex align-items-center">
                                                <Image
                                                    style={{ objectFit: 'contain' }}
                                                    src="/assets/job/Place Marker.svg"
                                                    height="24"
                                                    width="26"
                                                    alt="" />
                                                <span>{location.city}</span>
                                            </div>
                                        );
                                    }) : ''}
                                </div>

                                <div className="flex gap-2 align-items-center">
                                    <label className="w-3" htmlFor="Re_Location">Relocation Preferences</label>
                                    <Controller
                                        name="reLocation"
                                        control={control}
                                        render={({ field }) => (
                                            <ControlledMultiSelect
                                                id="reLocation"
                                                value={field.value || []}
                                                options={job_Locations_Array ? job_Locations_Array.map(location => ({
                                                    label: `${location.city}, ${location.state}`,
                                                    value: location._id
                                                })) : []}
                                                onChange={(e) => {
                                                    const selectedLocations = e.value || [];
                                                    field.onChange(selectedLocations);
                                                }}
                                                filter />
                                        )} />
                                </div>
                                <div className="flex gap-2 align-items-center">
                                    <label htmlFor="preferredLocation" className="w-4">Prefered Location</label>
                                    <Controller
                                        name="preferredLocation"
                                        control={control}
                                        render={({ field }) => (
                                            <InputText id="currentLocation" {...field} maxLength={50} />
                                        )} />
                                </div>
                                <div className="flex gap-2 align-items-center">
                                    <label className="w-3" htmlFor="currentCTC">
                                        Current CTC?
                                    </label>
                                    <div className="w-6 flex gap-2">
                                        <Controller
                                            name="currency"
                                            control={control}
                                            render={({ field, fieldState: { error } }) => (
                                                <>
                                                    <Dropdown
                                                        {...field}
                                                        value={field.value || (job ? job.currency : 'INR')} // Set the value from job or fallback to 'INR'
                                                        options={[{ label: field.value || (job ? job.currency : 'INR'), value: field.value || (job ? job.currency : 'INR') }]} // Only one option
                                                        placeholder="Select Currency"
                                                        readOnly={true} // Disable the dropdown to make it readonly
                                                    />
                                                    {error && <span className="text-red-500 text-sm">{error.message}</span>}
                                                </>
                                            )} />
                                        <Controller
                                            name="currentCTC"
                                            control={control}
                                            render={({ field, fieldState: { error } }) => (
                                                <>
                                                    <ControlledInputText
                                                        id="currentCTC"
                                                        type="number"
                                                        placeholder="Enter your current CTC"
                                                        value={field.value !== undefined ? field.value.toString() : ''}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                        min={0}
                                                        max={10000000} />
                                                    {error && <span className="text-red-500 text-sm">{error.message}</span>}
                                                </>
                                            )} />
                                    </div>
                                </div>
                                <div className="flex gap-2 align-items-center">
                                    <h4 className="w-3">Expected CTC?</h4>
                                    <div className="w-2 flex align-items-center">
                                        <Controller
                                            control={control}
                                            name="companyNorms"
                                            render={({ field }) => (
                                                <>
                                                    <Checkbox
                                                        checked={field.value}
                                                        inputId="Serving"
                                                        name="Serving"
                                                        value="Serving"
                                                        onChange={(e) => {
                                                            field.onChange(e.checked);
                                                            handleCompanyNormsChange(e.checked);
                                                        }} />
                                                    <label htmlFor="Serving" className="text-md">As per company norms</label>
                                                </>
                                            )} />
                                    </div>
                                    <div className="w-4 card flex justify-content-center align-items-center gap-3 ml-2">
                                        <Controller
                                            name="ctcPercentage"
                                            control={control}
                                            render={({ field }) => (
                                                <Dropdown
                                                    {...field}
                                                    options={hikeOptions}
                                                    placeholder="Hike expected"
                                                    className="w-8 md:w-8"
                                                    disabled={selectedOption === 'companyNorms' || selectedOption === 'expectedCTC'}
                                                    onChange={(e) => {
                                                        field.onChange(e.value);
                                                        handleCTCPercentageChange();
                                                    }} />
                                            )} />
                                        <h5 className="w-6 white-space-nowrap">% of current CTC</h5>
                                    </div>
                                    <Controller
                                        name="expectedCTC"
                                        control={control}
                                        render={({ field }) => (
                                            <InputText
                                                id="expectedCTC"
                                                type="number"
                                                value={field.value !== null && field.value !== undefined ? field.value.toString() : ''}
                                                min={0}
                                                max={10000000}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value);
                                                    field.onChange(value);
                                                    handleExpectedCTCChange();
                                                }}
                                                className="w-3"
                                                placeholder="Enter Amount"
                                                disabled={selectedOption === 'companyNorms' || selectedOption === 'ctcPercentage'} />
                                        )} />
                                </div>
                            </div>
                        </>)}

                    <div className="step-navigation-buttons">
                        <Button
                            onClick={(e) => {
                                e.preventDefault(); // Prevent form submission when clicking "Previous"
                                goToPreviousStep()
                            }}
                            visible={activeIndex !== 0}
                            className="mr-2"
                            label="Previous"
                        />

                        <Button
                            type="submit"
                            label={activeIndex === steps.length - 1 ? 'Submit Application' : 'Save and Next'}
                        />
                    </div>
                </div >
            </form>
        </>
    );
}