import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import styles from '@/styles/shared/Jobs/applications_list_view_page.module.scss';
import Image from 'next/image';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { Controller, useForm } from 'react-hook-form';
import { MultiSelect } from 'primereact/multiselect';
import { Toast } from '@/hooks/tryCatch';
import api, { setToken } from '@/services/api.service';
import { useRouter } from 'next/router';


export const getServerSideProps = async ({ req, params }) => {
    setToken(req);
    let jobApplication = null;
    try {
        if (params.view) {
            jobApplication = await api.getJobApplication(params.view);
            console.log(jobApplication);
        }
    } catch (error) {
        console.error('Error fetching job:', error);
    }
    return {
        props: {
            jobApplication: jobApplication || {}
        }
    };
};
const personalInfoNameArray = {
    'First Name': { name: 'firstName', type: 'text' },
    'Last Name': { name: 'lastName', type: 'text' },
    'PAN Number': { name: 'panNumber', type: 'text' },
    'Email Address': { name: 'contactDetails.contactEmail', type: 'email' },
    'Phone Number': { name: 'contactDetails.contactNumber', type: 'text' },
    'Address': { name: 'contactAddress.street', type: 'text' },
    'City': { name: 'contactAddress.city', type: 'text' },
    'State': { name: 'state', type: 'text' },
    'Postal Code': { name: 'contactAddress.postalCode', type: 'text' },
    'Country': { name: 'country', type: 'text' },
    'Date of Birth': { name: 'dob', type: 'date' },
    'LinkedIn Profile URL': { name: 'linkedInUrl', type: 'text' },
    'Website': { name: 'websiteOrBlogUrl', type: 'text' },
    'Gender': { name: 'gender', type: 'text' }
};



export default function Application({ jobApplication }) {

    const router = useRouter();

    const jobRedirect =jobApplication?.jobId?._id ;

    const { control, getValues } = useForm({
        defaultValues: {
            jobId: jobApplication?.jobId?._id || '',
            jobTitle: jobApplication?.jobId?.title || '',
            workflow: jobApplication?.workflow?._id || '',
            resumeMetadata: jobApplication?.resumeMetadata || '',
            coverLetterMetadata: jobApplication?.coverLetterMetadata || '',
            firstName: jobApplication?.firstName || '',
            lastName: jobApplication?.lastName || '',
            panNumber: jobApplication?.panNumber || '',
            contactDetails: {
                contactEmail: jobApplication?.contactDetails?.contactEmail || '',
                contactNumber: jobApplication?.contactDetails?.contactNumber || '',
            },
            contactAddress: {
                street: jobApplication?.contactAddress?.street || '',
                city: jobApplication?.contactAddress?.city || '',
                postalCode: jobApplication?.contactAddress?.postalCode || '',
            },
            state: jobApplication?.state || '',
            country: jobApplication?.country || '',
            dob: jobApplication?.dob || '',
            linkedInUrl: jobApplication?.linkedInUrl || '',
            websiteOrBlogUrl: jobApplication?.websiteOrBlogUrl || '',
            gender: jobApplication?.gender || '',
            disability: jobApplication?.disability || false,
            isExperienced: jobApplication?.isExperienced || false,
            yearsOfExperience: jobApplication?.yearsOfExperience || 0,
            workExperience: jobApplication?.workExperience || [],
            educationQualification: jobApplication?.educationQualification || [],
            evaluationForm: jobApplication?.evaluationForm || [],
            noticePeriodDays: jobApplication?.noticePeriodDays || 0,
            servingNoticePeriod: jobApplication?.servingNoticePeriod || false,
            lastWorkingDate: jobApplication?.lastWorkingDate || '',
            currentLocation: jobApplication?.currentLocation || '',
            willingToRelocate: jobApplication?.willingToRelocate || false,
            reLocation: jobApplication?.reLocation.map(location => location._id) || [],
            preferredLocation: jobApplication?.preferredLocation || '',
            currentCTC: jobApplication?.currentCTC || 0,
            expectedCTC: jobApplication?.expectedCTC || 0,
            ctcPercentage: jobApplication?.ctcPercentage || 0,
            currency: jobApplication?.currency || '',
            companyNorms: jobApplication?.companyNorms || false,
            bgvVerified: jobApplication?.bgvVerified || false,
            communicationSkillRating: jobApplication?.communicationSkillRating || 0,
            isScreenSelected: jobApplication?.isScreenSelected || false,
        },
    });

    const parseDateString = (dateString: string) => {
        return dateString ? new Date(dateString) : null;
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

            <div className={styles.application}>
                <div className={styles.job_details}>
                    <div className={styles.headline}>
                        <h4>Personal Information</h4>
                        <span></span>
                        <i
                            className="pi pi-pencil"
                            style={{ color: 'green', cursor: 'pointer' }}
                            onClick={() => {
                                router.push(`/jobs/application?jobApplicationId=${jobApplication._id}`);
                            }}
                        ></i>
                    </div>

                    <div className="flex justify-content-center align-items-center gap-8">
                        <div className="flex align-items-center gap-2">
                            <div className={styles.attachment}>
                                <div className={styles.attachment_wrapper}>
                                    {/* Mapping Resume Metadata */}
                                    {jobApplication.resumeMetadata && (
                                        <div className={styles.attachment_box}>
                                            <div className={styles.attachment_icons}>
                                                <Image
                                                    src="/assets/icons/pdf.svg"
                                                    height={20}
                                                    width={20}
                                                    alt="PDF Icon"
                                                />
                                            </div>
                                            <div className={styles.attachment_text_details}>
                                                <div className={styles.attachment_text_title}>
                                                    {jobApplication.resumeMetadata.originalName.split('/').pop()}
                                                </div>
                                                <div className={styles.attachment_size}>
                                                    {Math.ceil(jobApplication.resumeMetadata.fileSize / 1024)} KB
                                                </div>
                                            </div>
                                            <div className={styles.attachment_download}>
                                                <a
                                                    href={jobApplication.resumeMetadata.locationUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Image
                                                        src="/assets/icons/Download.svg"
                                                        height={20}
                                                        width={20}
                                                        alt="Download Icon"
                                                    />
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex align-items-center gap-2">
                            <div className={styles.attachment}>
                                <div className={styles.attachment_wrapper}>
                                    {/* Mapping Resume Metadata */}
                                    {jobApplication.coverLetterMetadata && (
                                        <div className={styles.attachment_box}>
                                            <div className={styles.attachment_icons}>
                                                <Image
                                                    src="/assets/icons/pdf.svg"
                                                    height={20}
                                                    width={20}
                                                    alt="PDF Icon"
                                                />
                                            </div>
                                            <div className={styles.attachment_text_details}>
                                                <div className={styles.attachment_text_title}>
                                                    {jobApplication.coverLetterMetadata.originalName.split('/').pop()}
                                                </div>
                                                <div className={styles.attachment_size}>
                                                    {Math.ceil(jobApplication.coverLetterMetadata.fileSize / 1024)} KB
                                                </div>
                                            </div>
                                            <div className={styles.attachment_download}>
                                                <a
                                                    href={jobApplication.resumeMetadata.coverLetterMetadata}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Image
                                                        src="/assets/icons/Download.svg"
                                                        height={20}
                                                        width={20}
                                                        alt="Download Icon"
                                                    />
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        {Object.keys(personalInfoNameArray).map((fieldName) => {
                            const { name, type } = personalInfoNameArray[fieldName];
                            return (
                                <div key={fieldName} className="mb-4">
                                    <label>{fieldName}</label>
                                    <Controller
                                        control={control}
                                        name={name}
                                        render={({ field }) => (
                                            <div>
                                                {type === 'date' ? (
                                                    <Calendar
                                                        showIcon
                                                        value={parseDateString(field.value)}
                                                        disabled={true}
                                                    />
                                                ) : (
                                                    <InputTextarea
                                                        {...field}
                                                        readOnly
                                                    />
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-center">
                        <Checkbox
                            checked={getValues('disability')}
                            readOnly
                        />
                        <label htmlFor="disability" className="ml-2 text-sm font-medium text-gray-700">
                            Do you have a disability?
                        </label>
                    </div>
                </div>
                <div className={styles.job_details}>
                    <div className={styles.headline}>
                        <h4>Professional Experience</h4>
                        <span></span>
                    </div>
                    <div className="flex gap-8 align-items-center  ">
                        <div className="flex align-items-center">
                            <Checkbox
                                checked={getValues('isExperienced')}
                                readOnly
                            />
                            <label htmlFor="Experienced" className="ml-2">
                                Experienced
                            </label>
                        </div>
                        <div className="flex align-items-center">
                            <Checkbox
                                checked={!getValues('isExperienced')}
                                readOnly
                            />
                            <label htmlFor="Fresher" className="ml-2">
                                Fresher
                            </label>
                        </div>
                    </div>
                    <div>
                        {jobApplication.workExperience.map((experience) => (
                            <div key={experience._id} className="mb-4 p-4 border border-gray-200 rounded-lg">
                                <div className="flex flex-column gap-2">
                                    <label htmlFor={`jobTitle_${experience._id}`}>
                                        Job Title
                                    </label>
                                    <InputText
                                        id={`jobTitle_${experience._id}`}
                                        value={experience.jobTitle}
                                        readOnly
                                    />
                                </div>
                                <div className="flex flex-column gap-2">
                                    <label htmlFor={`companyName_${experience._id}`}>Company Name</label>
                                    <InputText
                                        id={`companyName_${experience._id}`}
                                        value={experience.companyName}
                                        readOnly
                                    />
                                </div>
                                <div className="flex gap-8 align-items-center">
                                    <div className="w-3 flex flex-column gap-2">
                                        <label htmlFor={`jobStartDate_${experience._id}`}>Job Start Date</label>
                                        <Calendar
                                            id={`jobStartDate_${experience._id}`}
                                            value={experience.jobStartDate ? new Date(experience.jobStartDate) : null}
                                            showIcon
                                            dateFormat="mm/dd/yy"
                                            disabled={true}
                                        />
                                    </div>
                                    <div className="w-3 flex flex-column gap-2">
                                        <label htmlFor={`jobEndDate_${experience._id}`}>Job End Date</label>
                                        <Calendar
                                            id={`jobEndDate_${experience._id}`}
                                            value={experience.jobEndDate ? new Date(experience.jobEndDate) : null}
                                            showIcon
                                            dateFormat="mm/dd/yy"
                                            disabled={true}
                                        />
                                    </div>
                                    <div className="pt-4 flex align-items-center">
                                        <Checkbox
                                            inputId={`currentlyWorking_${experience._id}`}
                                            checked={experience.currentlyWorking}
                                            disabled
                                        />
                                        <label htmlFor={`currentlyWorking_${experience._id}`} className="ml-2">
                                            Currently working
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.job_details}>
                    <div className={styles.headline}>
                        <h4>Educational Qualification</h4>
                        <span></span>
                    </div>
                    <div className="form-container">
                        {jobApplication.educationQualification.map((education, index) => (
                            <div key={education._id} className="education-section mb-4 p-4 border border-gray-200 rounded-lg">
                                <div className="flex flex-column gap-2">
                                    <label htmlFor={`CourseName_${index}`}>
                                        Course Name
                                    </label>
                                    <InputText
                                        id={`CourseName_${index}`}
                                        value={education.courseName || ''}
                                        readOnly
                                    />
                                </div>
                                <div className="flex flex-column gap-2">
                                    <label htmlFor={`University_${index}`}>University</label>
                                    <InputText
                                        id={`University_${index}`}
                                        value={education.university || ''}
                                        readOnly
                                    />
                                </div>
                                <div className="flex flex-column gap-3">
                                    <label htmlFor={`CompletionDate_${index}`}>Completion Date</label>
                                    <div className="flex gap-8 align-items-center">
                                        <Calendar
                                            id={`CompletionMonth_${index}`}
                                            value={education.startDate ? new Date(education.startDate) : null}
                                            showIcon
                                            dateFormat="mm/dd/yy"
                                            disabled={true}
                                        />
                                        <Calendar
                                            id={`CompletionMonth_${index}`}
                                            value={education.startDate ? new Date(education.startDate) : null}
                                            showIcon
                                            dateFormat="mm/dd/yy"
                                            disabled={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
                <div className={`${styles.job_details}`}>
                    <div className={styles.headline}>
                        <h4>Skills</h4>
                        <span></span>
                    </div>
                    <div className="form-container">
                        {jobApplication.evaluationForm.map((skill, index) => (
                            <div key={index} className="skill-section my-4">
                                <div className="flex gap-6 align-items-center">
                                    <div className="w-6 flex gap-2 justify-content-between align-items-center">
                                        <div className="w-4 flex gap-2 align-items-center">
                                            <InputText
                                                type="text"
                                                placeholder="Skill"
                                                value={skill.skill}
                                                readOnly
                                            />
                                        </div>
                                        <div className="w-4 flex gap-2 align-items-center">
                                            <label>Years</label>
                                            <InputText
                                                type="number"
                                                placeholder="No. of years"
                                                value={skill.years}
                                                readOnly
                                            />
                                        </div>
                                        <div className="w-4 flex gap-2 align-items-center">
                                            <label>Months</label>
                                            <InputText
                                                type="number"
                                                placeholder="No. of months"
                                                value={skill.months}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <Slider
                                        className={`${styles.slider} w-4`}
                                        min={1}
                                        max={10}
                                        value={skill.rating}
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
                                        disabled
                                    />
                                    <div className="flex gap-2 align-items-center">
                                        {skill.isPrimary && (
                                            <div className="flex gap-2 align-items-center">
                                                <Checkbox
                                                    type="checkbox"
                                                    checked={skill.isPrimary}
                                                    readOnly
                                                    disabled
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
                <div className="form-container">
                    <div className={styles.headline}>
                        <h4>Notice Period</h4>
                        <span></span>
                    </div>
                    <div className="flex flex-column gap-2">
                        <label htmlFor="notice">No. of days of notice</label>
                        <InputText
                            value={getValues("noticePeriodDays")}
                            readOnly
                        />
                    </div>
                    <div className="flex align-items-center my-4">
                        <Checkbox
                            checked={getValues("servingNoticePeriod")}
                            disabled={true}
                        />
                        <label htmlFor="notice_period" className="ml-2">
                            Serving notice period
                        </label>
                    </div>

                    <div className="w-3 flex flex-column gap-2">
                        <label htmlFor="lastWorkingDate">Last Working Date</label>
                        <Calendar
                            showIcon
                            value={parseDateString(getValues("lastWorkingDate"))}
                            disabled={true}
                        />
                    </div>

                </div>
                <div className={`${styles.job_details}`}>
                    <div className={styles.headline}>
                        <h4>Availability</h4>
                        <span></span>
                    </div>
                    <div className="field">
                        <label htmlFor="currentLocation">Current Location</label>
                        <InputTextarea
                            readOnly
                            value={getValues("currentLocation")}
                        />
                    </div>

                    <div className="flex gap-2 align-items-center">
                        <label className="w-3" htmlFor="Re_Location">Relocation Preferences</label>
                        <MultiSelect
                            value={getValues("reLocation")} // Matches the format expected by MultiSelect                                 
                            options={jobApplication?.reLocation.map(location => ({
                                label: `${location.city}, ${location.state}, ${location.country}`,
                                value: location._id
                            })) || []}
                            optionLabel="label"
                            optionValue="value"
                            className="w-full md:w-5"
                            display="chip"
                        />
                    </div>
                    <div className="flex gap-2 align-items-center">
                        <label htmlFor="preferredLocation" className="w-4" >Prefered Location</label>
                        <InputTextarea
                            readOnly
                            value={getValues("preferredLocation")}
                        />
                    </div>

                    <div className="flex gap-2 align-items-center">
                        <label className="w-3" htmlFor="currentCTC">
                            Current CTC?
                        </label>
                        <div className="w-4 flex gap-2">
                            <InputText
                                value={getValues("currency")}
                                readOnly
                                className="w-full md:w-5"
                            />
                            <InputText
                                value={getValues("currentCTC")} // Set the selected value
                                readOnly
                                className="w-7"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 align-items-center">
                        <h4 className="w-3">Expected CTC?</h4>
                        <div className="w-2 flex align-items-center">
                            <Checkbox
                                checked={getValues("companyNorms")}
                                disabled={true}
                            />
                            <label htmlFor="Serving" className="text-md">
                                As per company norms
                            </label>
                        </div>

                        <div className="w-4 card flex justify-content-center align-items-center gap-3 ml-2">
                            <InputText
                                value={getValues("ctcPercentage")} // Set the selected value
                                readOnly
                                className="w-8 md:w-8"
                            />
                            <h5 className="w-6 white-space-nowrap">% of current CTC</h5>
                        </div>
                        <InputText
                            value={getValues("expectedCTC")} // Set the selected value
                            readOnly
                            className="w-3"
                        />
                    </div>
                </div>
            </div >
        </>
    );
}

