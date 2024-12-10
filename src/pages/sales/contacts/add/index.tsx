/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import styles from '@/styles/shared/add.module.scss';
import TitleBar from '@/components/TitleBar';
import { Button } from 'primereact/button';
import ApiCall, {
  getAllContacts,
  getAllIndustries,
  getAllUsers,
  getContactById,
  getCountries,
  getOrgByType,
  getStatesByCountryName,
  setToken,
} from '@/services/api.service';
import { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { State } from '@/services/types';
import contactSchema from '@/validations/contactSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import { ToastContainer, toast } from 'react-toastify';
import DynamicFields from '@/utils/DynamicComponents';
import { contactFields } from '@/components/Fields/Contact';
import { ControlledDropdown } from '@/utils/Dropdown';
import { IframeModal } from '@/utils/IframeModal';

const fetchData = async (apiCall) => {
  try {
    return { data: await apiCall(), error: '' };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getServerSideProps = async ({ req, query: { id } }) => {
  setToken(req);
  const [
    allUsers,
    accountList,
    contactData,
    allContacts,
    allIndustries,
    allCountries,
  ] = await Promise.all([
    fetchData(getAllUsers),
    fetchData(() => getOrgByType('account-org')),
    id ? fetchData(() => getContactById(id)) : { data: {}, error: '' },
    fetchData(getAllContacts),
    fetchData(getAllIndustries),
    fetchData(getCountries),
  ]);

  return {
    props: {
      accountList: accountList.data,
      allUsers: allUsers.data,
      allContacts: allContacts.data,
      allIndustries: allIndustries.data,
      allCountries: allCountries.data,
      edit: !!id,
      contactData: contactData.data,
      allErrors: {
        accountListError: accountList.error,
        allUsersError: allUsers.error,
        allContactsError: allContacts.error,
        industriesError: allIndustries.error,
        countriesError: allCountries.error,
        contactDataError: contactData.error,
      },
    },
  };
};

const defaultValues = {
  firstName: '',
  lastName: '',
  referredBy: '',
  emails: [{ contactEmail: '' }],
  phones: [{ contactNumber: '' }],
  contactAddress: {
    apartment: '',
    street: '',
    city: '',
    postalCode: '',
    addressType: 'office',
  },
  country: '',
  state: '',
  designation: '',
  industry: '',
  accountOrg: '',
  salesRepOrg: '',
  linkedInUrl: '',
  businessUnit: '',
  reportingTo: '',
  assignTo: '',
  comments: '',
  isDeleted: false,
};

type FormValues = typeof defaultValues;

export default function AddContact({
  allErrors,
  edit,
  accountList,
  allUsers,
  allIndustries,
  allContacts,
  contactData,
  allCountries,
}) {

  // State and router setup
  const router = useRouter();
  const [stateList, setStateList] = useState<State[]>([]);
  const [accountListClone, setAcountListClone] = useState<any>(accountList);
  const [open, setOpen] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);


  async function dataUpdate() {
    const response = await fetchData(() => getOrgByType('account-org'))
    setAcountListClone(response.data)
  } 
  useEffect(() => {
    if(isDone) {
      dataUpdate()
    }
  }, [isDone])
  // Form setup
  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: yupResolver(contactSchema),
    mode: 'onChange',
    defaultValues,
  });

  // Email and phone field arrays
  const {
    fields: emailFields,
    append: appendEmail,
    remove: removeEmail,
  } = useFieldArray({
    control,
    name: 'emails',
  });

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({
    control,
    name: 'phones',
  });

  // Effect to handle setting form values and fetching states
  useEffect(() => {
    if (edit && contactData) {
      const mergedValues = {
        ...defaultValues,
        ...contactData,
        industry: contactData.industry?._id ?? defaultValues.industry,
        country: contactData.country?._id ?? defaultValues.country,
        assignTo: contactData.assignTo?._id ?? defaultValues.assignTo,
        reportingTo: contactData.reportingTo?._id ?? defaultValues.reportingTo,
        accountOrg: contactData.accountOrg?._id ?? defaultValues.accountOrg,
        salesRepOrg: contactData.salesRepOrg?._id ?? defaultValues.salesRepOrg,
        emails:
          contactData.contactDetails
            ?.filter((detail) => detail.contactEmail)
            .map((detail) => ({
              contactEmail: detail.contactEmail,
            })) || defaultValues.emails,

        phones:
          contactData.contactDetails
            ?.filter((detail) => detail.contactNumber)
            .map((detail) => ({
              contactNumber: detail.contactNumber,
            })) || defaultValues.phones,
      };

      // Remove unwanted fields
      const unwantedFields = ['createdBy', 'createdAt', 'updatedAt', '__v'];
      unwantedFields.forEach((field) => delete mergedValues[field]);

      // Set form values
      Object.keys(mergedValues).forEach((key) => {
        setValue(key as keyof FormValues, mergedValues[key]);
      });

      if (contactData.country?._id) {
        fetchStates(contactData.country._id, contactData.state?._id);
      }
    }
  }, [edit, contactData, reset]);

  // Effect to handle fetching states based on country selection
  useEffect(() => {
    const selectedCountryId = watch('country');
    if (selectedCountryId) {
      fetchStates(selectedCountryId);
    } else {
      setStateList([]);
      setValue('state', null);
    }
  }, [watch('country')]);

  // Fetch states based on country ID
  const fetchStates = async (countryId: string, selectedStateId?: string) => {
    try {
      const response = await getStatesByCountryName(countryId);
      setStateList(response);
      if (selectedStateId) {
        setValue('state', selectedStateId);
      }
    } catch (error) {
      setStateList([]);
      setValue('state', null);
    }
  };

  // Handle form submission
  const handleProceed = async (data) => {
    try {
      if (!data.contactAddress) {
        data.contactAddress = {};
      }

      // Initialize contactDetails array
      const contactDetails = [];
      const maxLength = Math.max(data.emails.length, data.phones.length);

      // Populate contactDetails array
      for (let i = 0; i < maxLength; i++) {
        const contactEmail = data.emails[i]?.contactEmail?.trim() || '';
        const contactNumber = data.phones[i]?.contactNumber?.trim() || '';

        if (contactEmail || contactNumber) {
          contactDetails.push({
            contactEmail: contactEmail || undefined,
            contactNumber: contactNumber || undefined,
            isPrimary: i === 0,
          });
        }
      }

      // Prepare final data object
      const baseData = {
        ...defaultValues,
        ...data,
        contactDetails,
      };

      // Clean up unnecessary fields
      delete baseData.emails;
      delete baseData.phones;

      Object.keys(baseData).forEach((key) => {
        const value = baseData[key];
        if (
          value === '' ||
          value === null ||
          (typeof value === 'object' &&
            !Array.isArray(value) &&
            Object.keys(value).length === 0) ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'number' && isNaN(value))
        ) {
          delete baseData[key];
        }
      });

      // Submit data to API
      const response = edit
        ? await ApiCall.updateContact(contactData?._id, baseData)
        : await ApiCall.addContact(baseData);

      // Redirect and show success toast
      setTimeout(() => {
        router.push('/sales/contacts');
      }, 2000);

      toast.success(`Contact ${edit ? 'updated' : 'created'} successfully`);
    } catch (error) {
      toast.error('An error occurred while creating the contact.');
    }
  };

  // Handle discard action
  const handleDiscard = () => {
    if (!edit) {
      reset();
    }
    // router.push('/sales/contacts');
  };


  const fields = contactFields(accountListClone, allIndustries, allUsers, allCountries, stateList, allContacts);

  return (
    <>
      <ToastContainer />
      <IframeModal setIsDone={setIsDone} path='/sales/accounts/add'  open={open} setOpen={setOpen} />
      <TitleBar title={edit ? 'Edit Contact' : 'Add Contact'} />
      <form onSubmit={handleSubmit(handleProceed)}>
        <div className={`grid ${styles.form}`}>
          {fields?.map((item, index) => {
            switch (item.name) {
              case 'email':
                return (
                  <div key={index} className="col-12 w-full">
                    <div className="col-12 grid">
                      {emailFields.map((email, index) => (
                        <div key={email.id} className="col-4">
                          <label>Email {index + 1}</label>
                          <div className="p-inputgroup">
                            <Controller
                              name={`emails.${index}.contactEmail`}
                              control={control}
                              render={({ field }) => (
                                <InputText
                                  {...field}
                                  placeholder={`Email ${index + 1}`}
                                />
                              )}
                            />
                            <span className="p-inputgroup-addon">
                              {index === 0 && emailFields.length < 3 && (
                                <i
                                  className="pi pi-plus-circle"
                                  style={{ color: 'green' }}
                                  onClick={() => appendEmail({ contactEmail: '' })}
                                />
                              )}
                              {index > 0 && (
                                <i
                                  className="pi pi-minus-circle"
                                  style={{ color: 'red' }}
                                  onClick={() => removeEmail(index)}
                                />
                              )}
                            </span>
                          </div>
                          {errors?.emails?.[index]?.contactEmail && (
                            <small className="p-error">
                              {errors.emails[index].contactEmail.message}
                            </small>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="col-12 grid">
                      {phoneFields.map((phone, index) => (
                        <div key={phone.id} className="col-4">
                          <label>Phone {index + 1}</label>
                          <div className="p-inputgroup">
                            <Controller
                              name={`phones.${index}.contactNumber`}
                              control={control}
                              render={({ field }) => (
                                <InputText
                                  {...field}
                                  placeholder={`Phone ${index + 1}`}
                                  keyfilter="int"
                                  maxLength={10}
                                />
                              )}
                            />
                            <span className="p-inputgroup-addon">
                              {index === 0 && phoneFields.length < 3 && (
                                <i
                                  className="pi pi-plus-circle"
                                  style={{ color: 'green' }}
                                  onClick={() => appendPhone({ contactNumber: '' })}
                                />
                              )}
                              {index > 0 && (
                                <i
                                  className="pi pi-minus-circle"
                                  style={{ color: 'red' }}
                                  onClick={() => removePhone(index)}
                                />
                              )}
                            </span>
                          </div>
                          {errors?.phones?.[index]?.contactNumber && (
                            <small className="p-error">
                              {errors.phones[index].contactNumber.message}
                            </small>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              case 'accountOrg':
                return (
                  <div className="col-12 md:col-4 lg:col-4">
                    <label>{item.title}</label>
                    <div className="p-inputgroup">
                      <Controller
                        name={item.name}
                        control={control}
                        render={({ field }) => (
                          <ControlledDropdown
                            value={field.value}
                            id={item.name}
                            onChange={(e) => field.onChange(e.value)}
                            options={item.options}
                            className={item.className}
                          />
                        )}
                      />

                      <button type='button' onClick={() => setOpen(true)} className="p-inputgroup-addon">
                        Add
                      </button>
                    </div>
                  </div>
                )

              default:
                return (
                  <React.Fragment key={index}>
                    <DynamicFields item={item} control={control} errors={errors} disbaled={null} />
                  </React.Fragment>
                )
            }
          }
          )}
          <div className={`col-12 ${styles.buttons}`}>
            <Button
              label="Discard"
              type="button"
              className="secondary"
              onClick={handleDiscard}
            />
            <Button type="submit" disabled={edit ? !isDirty : false} label={edit ? 'Update' : 'Submit'} />
          </div>
        </div>
      </form>
    </>
  );
}
