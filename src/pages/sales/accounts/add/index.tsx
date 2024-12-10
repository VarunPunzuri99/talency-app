/* eslint-disable @typescript-eslint/no-unused-vars */
import styles from '@/styles/shared/add.module.scss';
import { useRouter } from 'next/router';
import TitleBar from '@/components/TitleBar';
import { Button } from 'primereact/button';
import api, { addOrg, getAccountTypes, getAllIndustries, getAllUsers, getCountries, getOrgById, getOrgByType, getStatesByCountryName, setToken, updateOrg } from '@/services/api.service';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { State, OrgType } from '@/services/types';
import OrgSchema from '@/validations/orgschema';
import React from 'react';
import DynamicFields from '@/utils/DynamicComponents';
import { accountFields } from '@/components/Fields/Account';
import { statePincodes } from '@/utils/cityDropdown'


const fetchData = async (apiCall) => {
    try {
        return { data: await apiCall(), error: '' };
    } catch (error: unknown) {
        return { data: null, error: (error as Error).message };
    }
};

export const getServerSideProps = async ({ req, query: { id } }) => {
    setToken(req)
    const [countries, industries, accountData, allUsers, parentOrg, accountType] = await Promise.all([
        fetchData(getCountries),
        fetchData(getAllIndustries),
        id ? fetchData(() => getOrgById(id)) : { data: {}, error: '' },
        fetchData(getAllUsers),
        fetchData(() => getOrgByType('account-org')),
        fetchData(getAccountTypes),
    ]);
    return {
        props: {
            edit: !!id,
            countryList: countries.data,
            allIndustries: industries.data,
            allUsers: allUsers.data,
            accountDetails: accountData.data,
            parentOrgs: parentOrg.data,
            allaccountTypes: accountType.data,
            errors: {
                industriesError: industries.error,
                accountDetailsError: accountData.error,
                allUsersError: allUsers.error,
                countryError: countries.error,
                parentOrgsError: parentOrg.error,
                accountTypeError: accountType.error,
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

    },
    ],
    contactAddress: [{
        city: '',
        apartment: '',
        postalCode: '',
        street: '',
        addressType: 'office',
    },
    ],
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

export default function AddAccount({ edit, allIndustries, allUsers, accountDetails, countryList, parentOrgs, allaccountTypes }) {

    const router = useRouter();
    const [stateList, setStateList] = useState<State[]>([]);
    const [stateName, pincode, cityName] = statePincodes.reduce((acc, item) => {
        Object.keys(item).forEach((ele, i) => {
            acc[i].push(item[ele])
        })
        return acc;
    }, [[], [], []])
    const { handleSubmit, control, reset, watch, setValue, getValues, formState: { errors, ...data } } = useForm({
        resolver: yupResolver(OrgSchema), // Integrate Yup with useForm
        mode:'onChange',
        defaultValues
    });

    useEffect(() => {
        if (edit && accountDetails) {
            const mergedValues = {
                ...defaultValues,
                ...accountDetails,
                industryOrDomain: accountDetails.industryOrDomain?._id ?? defaultValues.industryOrDomain,
                parentOrg: accountDetails.parentOrg?._id ?? defaultValues.parentOrg,
                country: accountDetails.country?._id ?? defaultValues.country,
                assignTo: accountDetails.assignTo?._id ?? defaultValues.assignTo,
                reportingTo: accountDetails.reportingTo?._id ?? defaultValues.reportingTo,
                accountType: accountDetails.accountType?._id ?? defaultValues.accountType,
            }
            console.log(mergedValues, 'mergedValues')
            // Define unwanted fields to remove
            const unwantedFields = ['createdBy', 'createdAt', 'updatedAt', '__v'];

            unwantedFields.forEach(field => delete mergedValues[field]);

            Object.keys(mergedValues).forEach((key) => {
                setValue(key as keyof FormValues, mergedValues[key]);
            });

            if (accountDetails.country?._id) {
                fetchStates(accountDetails.country._id, accountDetails.state?._id);  // Fetch states after setting the country
            }

        }
    }, [edit, accountDetails]);



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

    async function onChangeForPincode(e) {
        const inputValue = e.target.value;
        console.log(e, 'e')
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
    const fields = accountFields(parentOrgs, allIndustries, allUsers, countryList, stateList, errors, allaccountTypes, onChangeForPincode);

    const handleProceed = async (data: FormValues) => {
        console.log(data)
        console.log("errors:",errors)
        try {
            // Clone the defaultValues object to avoid mutation
            data.orgType = OrgType.ACCOUNT_ORG;
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

            const response = edit ? await updateOrg(accountDetails._id, baseData) : await addOrg(baseData);
            setTimeout(() => {
                window.parent.postMessage('done', window.location.origin);
                window?.postMessage?.('done', window.location.origin);        
                router.push('/sales/accounts');
            }, 2000); // Delay in milliseconds
            toast.success(`Account ${edit ? 'updated' : 'created'} successfully:`, response);

        } catch  {
            toast.error('An error occurred while creating the account.');
        } 
    };

    const handleDiscard = () => {
        if (!edit) {
            reset();
        }
        router.push('/sales/accounts');
    };

    const handleGoBack = () => {
        router.push('/sales/accounts');
    };

    return (
        <>
            <ToastContainer />
            <div className={styles.goBackArrow} onClick={handleGoBack} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <i className="pi pi-arrow-left" style={{ fontSize: '1rem', marginRight: '0.5rem' }}></i>
                <span>Back</span>
            </div>
            <TitleBar title={edit ? 'Edit Account' : 'Add Account'} />
            <form onSubmit={handleSubmit(handleProceed)}>
                <div className={`grid ${styles.form}`}>
                { fields.map((item, index) => (
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
                        <Button
                            label="Discard"
                            type="button"
                            className="secondary"
                            onClick={handleDiscard}
                        />
                        <Button type="submit" label={edit ? 'Update' : 'Submit'} />
                    </div>

                </div>
            </form>
        </>
    );
}
