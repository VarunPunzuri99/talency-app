/* eslint-disable @typescript-eslint/no-unused-vars */
import { addOrg, api, getAllIndustries, getAllUsers, getCountries, getOrgById, getOrgByType, getStatesByCountryName, setToken, updateOrg } from '@/services/api.service';
import styles from '@/styles/shared/add.module.scss';
import { useForm } from 'react-hook-form';
import { Button } from 'primereact/button';
import { useEffect, useState } from 'react';
import TitleBar from '@/components/TitleBar'
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import OrgSchema from '@/validations/orgschema'
import { OrgType, State } from '@/services/types';
import DynamicFields from '@/utils/DynamicComponents';
import React from 'react';
import { clientFields } from '@/components/Fields/Client';
import { statePincodes } from '@/utils/cityDropdown'

const fetchData = async (apiCall) => {
    try {
        return { data: await apiCall(), error: '' };
    }catch (error: unknown) {
        return { data: null, error: (error as Error).message };
      }
};

export const getServerSideProps = async ({ req, query: { id } }) => {
    setToken(req)
    const [countries, industries, clientData, allUsers, parentOrg] = await Promise.all([
        fetchData(getCountries),
        fetchData(getAllIndustries),
        id ? fetchData(() => getOrgById(id)) : { data: {}, error: '' },
        fetchData(getAllUsers),
        fetchData(() => getOrgByType('customer-org')),
    ]);
    return {
        props: {
            edit: !!id,
            countryList: countries.data,
            allIndustries: industries.data,
            allUsers: allUsers.data,
            clientDetails: clientData.data,
            parentOrgs: parentOrg.data,
            errors: {
                industriesError: industries.error,
                clientDetailsError: clientData.error,
                allUsersError: allUsers.error,
                countryError: countries.error,
                parentOrgsError: parentOrg.error,
            },
        },
    };
};
const defaultValues = {
    title: '',
    description: '',
    logo: '',
    legalName: '',
    websiteUrl: '',
    contactDetails: [{
        contactEmail: '',
        contactNumber: '',
        isPrimary: false,
    }],

    contactAddress:[ {
        city: '',
        apartment: '',
        postalCode: '',
        street: '',
        addressType: 'office',
    }],
    country: '',
    state: '',
    industryOrDomain: '',
    businessUnit: '',
    linkedInUrl: '',
    isDeleted: false,
    isSuspended: false,
    isBlocked: false,
    isApproved: false,
    headCount: '',
    parentOrg: '',
    reportingTo: '',
    assignTo: '',
    isDuplicate: false,
    status: '',
    accountType: '',
    orgType: '',
};

type FormValues = typeof defaultValues;

export default function AddClient({
    edit, allIndustries, allUsers, clientDetails, countryList, parentOrgs
}) {
    const router = useRouter()
    const [stateList, setStateList] = useState<State[]>([]);
    const [stateName, pincode, cityName] = statePincodes.reduce((acc, item) => {
        Object.keys(item).forEach((ele, i) => {
            acc[i].push(item[ele])
        })
        return acc;
    }, [[], [], []])

    const { handleSubmit, control, reset, watch, setValue, getValues, formState: { errors, isValid } } = useForm({
        resolver: yupResolver(OrgSchema), // Integrate Yup with useForm
        mode:'onChange',
        defaultValues
    });

    useEffect(() => {
        if (edit && clientDetails) {
            const mergedValues = {
                ...defaultValues,
                ...clientDetails,
                industryOrDomain: clientDetails.industryOrDomain?._id ?? defaultValues.industryOrDomain,
                parentOrg: clientDetails.parentOrg?._id ?? defaultValues.parentOrg,
                country: clientDetails.country?._id ?? defaultValues.country,
                assignTo: clientDetails.assignTo?._id ?? defaultValues.assignTo,
                reportingTo: clientDetails.reportingTo?._id ?? defaultValues.reportingTo,
            }
            // Define unwanted fields to remove
            const unwantedFields = ['createdBy', 'createdAt', 'updatedAt', '__v'];

            unwantedFields.forEach(field => delete mergedValues[field]);

            Object.keys(mergedValues).forEach((key) => {
                setValue(key as keyof FormValues, mergedValues[key]);
            });

            if (clientDetails.country?._id) {
                fetchStates(clientDetails.country._id, clientDetails.state?._id);  // Fetch states after setting the country
            }

        }
    }, [edit, clientDetails]);

    useEffect(() => {
        const selectedCountryId = watch('country');
        if (selectedCountryId) {
            fetchStates(selectedCountryId);
        } else {
            setStateList([]);
            setValue('state', null);
        }
    }, [watch('country')]);
    
    const fetchStates = async (countryId: string, selectedStateId?: string) => {
        try {
            const response = await getStatesByCountryName(countryId);
             setStateList(response);
             if (selectedStateId) {
                 setValue('state', selectedStateId);  // Set the state after fetching
             }
             return response
        } catch (error) {
            setStateList([]);
            setValue('state', ''); // Clear state field in case of error
        }
    };


    const handleProceed = async (data: FormValues) => {
        try {
            // Clone the defaultValues object to avoid mutation
            data.orgType = OrgType.CUSTOMER_ORG;
            const baseData = {
                ...defaultValues,
                ...data, // Spread data over defaultValues to override defaults with form data
            };

            // Remove empty or unnecessary fields
            Object.keys(baseData).forEach((key) => {
                const value = baseData[key];
                if (
                    value === '' || value === null ||
                    (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) ||
                    (Array.isArray(value) && value.length === 0) || (typeof value === 'number' && isNaN(value))
                ) {
                    delete baseData[key];
                }
            });
            const response = edit ? await updateOrg(clientDetails._id, baseData) : await addOrg(baseData);
            setTimeout(() => {
                router.push('/sales/clients');
            }, 2000); // Delay in milliseconds
            toast.success(`Client ${edit ? 'updated' : 'created'} successfully:`, response);

        } catch (error) {
            toast.error('An error occurred while creating the client.');
        }
    };
    async function onChangeForPincode(e) {
        const inputValue = e.target.value;
        if(pincode.includes(inputValue)) {
            const index = pincode.indexOf(inputValue)
            setValue('contactAddress.0.city', cityName[index])
            setValue('country',"66d9b425e659d990565798da")
            const stateData = await fetchStates("66d9b425e659d990565798da");
            const stateObj = stateData.filter(state => state.stateName === stateName[index]).map((state) => ({
                label: state.stateName,
                value: state._id
            }))[0];
            setValue('state', stateObj?.value)
        }
        setValue('contactAddress.0.postalCode', inputValue)
        
    }

    const fields = clientFields(parentOrgs, allIndustries, allUsers, countryList, stateList, errors, onChangeForPincode);
    const handleDiscard = () => {
        if (!edit) {
            reset();
        }
        router.push('/sales/clients');
    };

    const handleGoBack = () => {
        router.push('/sales/clients');
    };

    return (
        <>
            <ToastContainer />
            <div className={styles.goBackArrow} onClick={handleGoBack} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <i className="pi pi-arrow-left" style={{ fontSize: '1rem', marginRight: '0.5rem' }}></i>
                <span>Back</span>
            </div>
            <TitleBar title={edit ? 'Edit Client' : 'Add Client'} />
            <form onSubmit={handleSubmit(handleProceed)}>
                <div className={`grid ${styles.form}`}>
                {fields.map((item, index) => (
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
                    <div className={`col-12 ${styles.buttons}`}>
                        <Button className="secondary" label="Discard" onClick={handleDiscard} />
                        <Button type="submit" label="Submit"  />
                    </div>
                </div>
            </form>
        </>
    );
}
