import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
import TitleBar from '@/components/TitleBar';
import { InputText } from 'primereact/inputtext';
import { FileUpload } from 'primereact/fileupload';
import { Checkbox } from 'primereact/checkbox';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Button } from 'primereact/button';
import api, { getFilterContacts, setToken, uploadFile } from '@/services/api.service';
import { AutoComplete } from 'primereact/autocomplete';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { Toast } from '@/hooks/tryCatch';
import { ControlledInputText } from '@/utils/InputText';
import { ControlledDropdown } from '@/utils/Dropdown';
import { yupResolver } from '@hookform/resolvers/yup';
import DynamicFields from '@/utils/DynamicComponents'
import { jobsFields } from '@/components/Fields/Jobs/jobsFields';
import { employment } from '@/components/Fields/Jobs/employment';
import { locationFields } from '@/components/Fields/Jobs/location';
import { cleanData } from '@/utils/CleanData';
import { InputTextarea } from 'primereact/inputtextarea';
import JobSchema from '@/validations/jobSchema';


export const getServerSideProps = async ({ req, query: { jobId } }) => {
    setToken(req);
    let jobDetails = null;

    try {
        if (jobId) {
            jobDetails = await api.getJobById(jobId);
        }

        const [locations, industries, clients, accounts, contacts, departments] = await Promise.all([
            api.getJobLocations(),
            api.getAllIndustries(),
            api.getOrgsByType('customer-org'),
            api.getOrgsByType('account-org'),
            api.getAllContacts(),
            api.getAllDepartments({ limit: 100 })
        ]);

        return {
            props: {
                locations,
                industries,
                clients,
                accounts,
                contacts,
                departments,
                jobDetails: jobDetails || null,
                edit: !!jobId, // Convert jobId to a boolean
            }
        };
    } catch (error) {
        console.error('Error fetching job details:', error);
        return {
            props: {
                locations: [],
                industries: [],
                clients: [],
                accounts: [],
                contacts: [],
                departments: [],
                jobDetails: {},
                edit: false,
            }
        };
    }
};


export default function AddJob({ locations, industries, clients, accounts, contacts, departments, edit, jobDetails }) {
    const router = useRouter();
    const defaultValues = {
        title: '',
        jobType: 'Internal',
        department: '',
        noOfVacancies: 1,
        jdUrl: '',
        employmentType: '',
        workMode: '',
        description: '',
        primarySkills: [],
        secondarySkills: [],
        workExperience: { minimum: 0, maximum: 1 },
        jobLocation: [],
        industryOrDomain: '',
        educationalQualification: [],
        videoProfileRequested: false,
        hiringMode: '',
        instructionsVideoUrl: '',
        instructionsToRecruiter: '',
        questionAnswers: [{ question: '', answer: '' }],
        shareWithVendors: false,
        isDeleted: false,
        isOpen: true,
        isDraft: false,
        shareOnSocialMedia: false,
        socialMediaLinks: [
            { platform: 'facebook', url: '' },
            { platform: 'instagram', url: '' },
            { platform: 'linkedin', url: '' }
        ],
        endClientOrg: '',
        postingOrg: '',
        hiringOrg: '',
        spoc: '',
        maxCtcOffered: 0,
        currency: 'INR',
    };

    const { handleSubmit, control, reset, watch, setValue, getValues, formState: { errors } } = useForm({
        resolver: yupResolver(JobSchema), // Integrate Yup with useForm
        mode: 'onChange',
        defaultValues
    });
    const [filteredClients, setFilteredClients] = useState([]);

    const [activeTab, setActiveTab] = useState('Internal');

    const currencyOptions = [
        { label: 'INR', value: 'INR' },
        { label: 'USD', value: 'USD' }
    ];

    useEffect(() => {
        if (edit && jobDetails) {
            const mergedValues = {
                ...defaultValues,
                ...jobDetails,
                workExperience: {
                    minimum: jobDetails.workExperience?.minimum ?? defaultValues.workExperience.minimum,
                    maximum: jobDetails.workExperience?.maximum ?? defaultValues.workExperience.maximum
                },
                jobLocation: jobDetails.jobLocation?.map(location => location._id) ?? defaultValues.jobLocation,
                industryOrDomain: jobDetails.industryOrDomain?._id ?? defaultValues.industryOrDomain,
                socialMediaLinks: defaultValues.socialMediaLinks.map(link => {
                    const existingLink = jobDetails.socialMediaLinks?.find(smLink => smLink.platform === link.platform);
                    return existingLink ? { ...link, url: existingLink.url } : link;
                }),
                endClientOrg: jobDetails.endClientOrg?._id ?? defaultValues.endClientOrg,
                postingOrg: jobDetails.postingOrg?._id ?? defaultValues.postingOrg,
                hiringOrg: jobDetails.hiringOrg?._id ?? defaultValues.hiringOrg,
                spoc: jobDetails.spoc?._id ?? defaultValues.spoc,
            };

            // Define unwanted fields to remove
            const unwantedFields = ['createdBy', 'createdAt', 'updatedAt', 'jobCode', '__v'];

            unwantedFields.forEach(field => delete mergedValues[field]);

            console.log(mergedValues)

            // Reset the form with merged values
            reset(mergedValues);

            setActiveTab(jobDetails.jobType === 'Internal' ? 'Internal' : 'External');
        }
    }, [edit, jobDetails]);

    const socialMediaLinks = watch('socialMediaLinks');

    useEffect(() => {
        const hasLinks = socialMediaLinks.some(link => link.url.trim() !== '');
        setValue('shareOnSocialMedia', hasLinks);
    }, [socialMediaLinks, setValue]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'questionAnswers'
    });

    const searchClients = (event) => {
        const query = event.query.toLowerCase();

        if (!clients) {
            setFilteredClients([]);
            return;
        }

        const results = clients.filter(client => {
            const title = client.title ? client.title.toLowerCase() : '';
            const legalName = client.legalName ? client.legalName.toLowerCase() : '';

            return title.includes(query) || legalName.includes(query);
        });

        setFilteredClients(results);
    };

    const handleJdUpload = async (event) => {
        const file = event.files[0];
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        try {
            const response = await uploadFile(uploadFormData);
            console.log('File uploaded successfully:', response);
            setValue('jdUrl', response._id);
            toast.success('File uploaded');

        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleProceed = async (data) => {
        try {
            // Clone the defaultValues object to avoid mutation
            const cleanedData = {
                ...defaultValues,
                ...data, // Spread data over defaultValues to override defaults with form data
                workExperience: {
                    minimum: data?.workExperience?.minimum ? parseInt(data.workExperience.minimum, 10) : defaultValues.workExperience.minimum,
                    maximum: data?.workExperience?.maximum ? parseInt(data.workExperience.maximum, 10) : defaultValues.workExperience.maximum,
                },
                socialMediaLinks: data?.socialMediaLinks?.filter(link => link.url.trim() !== '') ?? defaultValues.socialMediaLinks,
                isDraft: false,
                isOpen: true
            };

            cleanData(cleanedData)

            // Submit or update job
            if (edit) {
                await api.updateJob(jobDetails._id, cleanedData);
            } else {
                await api.jobPost(cleanedData);
            }


            setTimeout(() => {
                router.push('/jobs/lists');
            }, 2000); // Delay in milliseconds
            toast.success(`Job ${edit ? 'updated' : 'posted'} successfully:`);

        } catch {
            toast.error('An error occurred while posting the job.');
        }
    };


    const handleDraft = async () => {
        try {
            const formData = getValues();

            // Mandatory fields validation
            if (!formData.title.trim()) {
                toast.warn('Job Title is required.');
                return;
            }

            if (!formData.endClientOrg.trim()) {
                toast.warn('Hiring company is required.');
                return;
            }

            // Clean and validate the data
            const cleanedData = { ...formData, isDraft: true, isOpen: false };

            cleanData(cleanedData);

            if (edit) {
                await api.updateJob(jobDetails._id, cleanedData);
            } else {
                await api.jobDraft(cleanedData);
            }

            toast.success(`Job ${edit ? 'updated' : 'drafted'} successfully:`);

            setTimeout(() => {
                router.push('/jobs/lists');
            }, 2000);
        } catch {
            toast.error('Error drafting job. Please try again.');
        }
    };

    const details = jobsFields(handleJdUpload)

    const employmentDetails = employment(errors)

    const locationDetails = locationFields(locations, industries)

    const [spocList, setSpocList] = useState(contacts);

    const external = [
        {
            title: "Accounts",
            name: "hiringOrg",
            type: 'dropdown',
            options: accounts ? accounts.map(account => ({
                label: account.title,
                value: account._id
            })) : [],
            placeholder: "Select a account.",
            dropDownFilter: true
        },
        {
            title: "Spoc",
            name: "spoc",
            type: 'dropdown',
            options: spocList ? spocList.map(state => ({
                label: state.firstName,
                value: state._id
            })) : [],
            placeholder: "Select a contact.",
            dropDownFilter: true,
        },
    ]

    departments = departments ? departments.map(department => ({
        label: department.label,
        value: department._id
    })) : []

    const internal = [
        {
            title: "Select Department",
            name: "department",
            type: 'dropdown',
            options: departments,
        },
    ]

    const fetchContacts = async (accountId: string) => {
        try {
            const response = await getFilterContacts({ accountId: accountId });
            setSpocList(response);
            setValue('spoc', jobDetails?.spoc?._id ?? ''); // Set spoc only after list is updated
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setSpocList([]);
            setValue('spoc', ''); // Reset spoc if there's an error
        }
    };

    useEffect(() => {
        const selectedAccountId = watch('hiringOrg');
        if (selectedAccountId) {
            fetchContacts(selectedAccountId)
        } else {
            setSpocList(contacts);
            setValue('spoc', '');
        }
    }, [watch('hiringOrg')]);


    return (
        <>
            <Toast />
            <TitleBar title={'Post a job'} />
            <form onSubmit={handleSubmit(handleProceed)}>
                <div className={styles.addJob}>
                    <div className={styles.job_details}>
                        <div className={styles.headline}>
                            <h4>Job Details</h4>
                            <span></span>
                        </div>
                        {details.map((item, index) => (
                            <React.Fragment key={index}>
                                <DynamicFields
                                    item={item}
                                    control={control}
                                    errors={errors}
                                    disbaled={null}
                                />
                            </React.Fragment>
                        ))}
                        <div className="p-grid p-justify-center p-align-center">
                            <div className="p-col-6 p-d-flex p-jc-between">
                                <Button
                                    label="Internal"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setActiveTab('Internal')
                                        setValue('jobType', 'Internal')
                                    }}
                                    className={`${activeTab === 'Internal' ? 'p-button-raised' : 'p-button-outlined'} ${styles.selectButton}`}
                                />
                                <Button
                                    label="External"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setActiveTab('External')
                                        setValue('jobType', 'External')
                                    }}
                                    className={`${activeTab === 'External' ? 'p-button-raised' : 'p-button-outlined'} ${styles.selectButton}`}
                                />
                            </div>

                            <div className="p-col-12 p-mt-3">
                                <div className={`${styles.tabContent} ${activeTab === 'Internal' ? 'internal' : 'external'}`}>
                                    {activeTab === 'Internal' ? (
                                        <div>
                                            {internal.map((item, index) => (
                                                <React.Fragment key={index}>
                                                    <DynamicFields
                                                        item={item}
                                                        control={control}
                                                        errors={errors}
                                                        disbaled={null}

                                                    />
                                                </React.Fragment>
                                            ))}
                                        </div>) : (
                                        <>
                                            {external.map((item, index) => (
                                                <React.Fragment key={index}>
                                                    <DynamicFields
                                                        item={item}
                                                        control={control}
                                                        errors={errors}
                                                        disbaled={null}

                                                    />
                                                </React.Fragment>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.Employment_Details}>
                        <div className={styles.headline}>
                            <h4>Employment Details</h4>
                            <span></span>
                        </div>
                        <>
                            {employmentDetails.map((item, index) => (
                                <React.Fragment key={index}>
                                    <DynamicFields
                                        item={item}
                                        control={control}
                                        errors={errors}
                                        getValues={getValues}
                                        edit={edit}
                                        disbaled={null}

                                    />
                                </React.Fragment>
                            ))}
                        </>
                        <div className={styles.Location_Details}>
                            <div className={styles.headline}>
                                <h4>Location Details</h4>
                                <span></span>
                            </div>
                            {locationDetails.map((item, index) => (
                                <React.Fragment key={index}>
                                    <DynamicFields
                                        item={item}
                                        control={control}
                                        errors={errors}
                                        disbaled={null}

                                    />
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="flex align-items-center">
                            <Controller
                                name="videoProfileRequested"
                                control={control}
                                defaultValue={false}
                                render={({ field }) => (
                                    <Checkbox
                                        inputId="video_profile"
                                        name="video_profile"
                                        checked={field.value} // Controlled by react-hook-form
                                        onChange={(e) => field.onChange(e.checked)} // Update react-hook-form state
                                    />
                                )}
                            />

                            <label htmlFor="video_profile" className="ml-2">
                                Request for video profile
                            </label>
                        </div>
                        <label htmlFor="hiringMode">Maximum CTC offered</label>
                        <div className="flex flex-row gap-2">
                            <Controller
                                name="currency"
                                control={control}
                                render={({ field }) => (
                                    <ControlledDropdown
                                        {...field}
                                        className="w-2"
                                        options={currencyOptions}
                                    />
                                )}
                            />
                            <Controller
                                name="maxCtcOffered"
                                control={control}
                                render={({ field }) => (
                                    <ControlledInputText
                                        id="maxCtcOffered"
                                        placeholder="Max CTC Offered"
                                        type="number"
                                        value={field.value !== undefined ? field.value : ''} // Use the value directly
                                        onChange={(e) => {
                                            const newValue = e.target.value === '' ? '' : Number(e.target.value); // Convert to number or empty string
                                            field.onChange(newValue);
                                        }}
                                        min={0} // Set the minimum value to 0
                                        max={10000000} // Set the maximum value to 10,000,000
                                    />
                                )}
                            />
                            {errors && (<small className="p-error">{errors.maxCtcOffered?.message || ''}</small>)}
                        </div>
                    </div>
                    <div className={styles.Company_Details}>
                        <div className={styles.headline}>
                            <h4>Company Details</h4>
                            <span></span>
                        </div>
                        <div className="flex flex-column gap-2">
                            <label htmlFor="endClientOrg">Company Name
                                <span className="text-red-500"> *</span>
                            </label>
                            <Controller
                                name="endClientOrg"
                                control={control}
                                defaultValue={jobDetails?.endClientOrg?._id || ''} // Store the client ID as the default value
                                render={({ field }) => (
                                    <>
                                        <AutoComplete
                                            id="endClientOrg"
                                            field="title" // Display the title of the client
                                            value={filteredClients.find(client => client._id === field.value)?.title || jobDetails?.endClientOrg?.title || ''} // Show the client's title if selected, or default to jobDetails title
                                            suggestions={filteredClients}
                                            completeMethod={searchClients} // Method to search clients based on input
                                            onChange={(e) => {
                                                const inputValue = e.target.value;
                                                field.onChange(inputValue); // Update the react-hook-form field with the title for display
                                            }}
                                            onSelect={(e) => {
                                                const selected = e.value;
                                                field.onChange(selected._id); // Store the client ID in the form state
                                            }}
                                            placeholder="Start typing to search for a client..."
                                            itemTemplate={(item) => <span>{item.title}</span>} // Display the client title in the dropdown
                                        />
                                        {errors?.endClientOrg && <small className="p-error">{errors.endClientOrg.message}</small>}
                                    </>
                                )}
                            />
                            <small id="endClientOrg-help">
                                Enter your Company Name to search.
                            </small>
                        </div>
                    </div>

                    <div className="flex flex-column gap-2 py-2">
                        <label htmlFor="instructionsToRecruiter">Instructions to Recruiter</label>
                        <Controller
                            name="instructionsToRecruiter"
                            control={control}
                            defaultValue="" // Set the default value if needed
                            render={({ field }) => (
                                <InputText
                                    id="instructionsToRecruiter"
                                    {...field} // Spread all the field props into InputText
                                    maxLength={100}
                                />
                            )}
                        />
                        <small id="instructionsToRecruiter-help">
                            Enter any instructions for the recruiter.
                        </small>
                    </div>
                    <div className=" flex align-items-center gap-4">
                        <FileUpload
                            mode="basic"
                            url="/api/upload"
                            accept="image/*"
                            chooseLabel="Add Audio/Video Instructions"
                            maxFileSize={1000000}
                        />
                    </div>

                    <label className="my-2">Questions to be posed to the candidate by the recruiter</label>
                    <ul>
                        {fields.map((field, index) => (
                            <li key={field.id}>
                                <div className="flex align-items-center gap-2 my-2">
                                    <label className="mr-2">Question</label>
                                    <Controller
                                        name={`questionAnswers.${index}.question`}
                                        control={control}
                                        defaultValue={field.question} // Should be filled correctly from mergedValues
                                        render={({ field }) => (
                                            <InputTextarea
                                                {...field}
                                                placeholder="Enter question"
                                                maxLength={50}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="flex align-items-center gap-2 my-2">
                                    <label className="mr-2">Answer</label>
                                    <Controller
                                        name={`questionAnswers.${index}.answer`}
                                        control={control}
                                        defaultValue={field.answer} // Should be filled correctly from mergedValues
                                        render={({ field }) => (
                                            <InputTextarea
                                                {...field}
                                                placeholder="Enter answer"
                                                maxLength={100}
                                                rows={4}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="flex justify-content-end">
                                    <Button
                                        type="button"
                                        onClick={() => remove(index)}
                                        label='Remove'
                                    />
                                </div>
                            </li>
                        ))}
                        <div className='flex justify-content-end mt-4'>
                            <Button label="Add Question" type="button"
                                onClick={() => append({ question: '', answer: '' })} />
                        </div>
                    </ul>
                    <div className="flex justify-content-end gap-3 mt-6">
                        <Button
                            label="Discard"
                            severity="danger"
                            onClick={() => router.push('lists')}
                            type="button"
                        />
                        <Button
                            label="Save & Draft"
                            onClick={handleDraft}
                            type="button"
                        />
                        <Button
                            label="Submit Job"
                            severity="secondary"
                            type="submit"
                        />
                    </div>
                </div >
            </form>
        </>
    );
}