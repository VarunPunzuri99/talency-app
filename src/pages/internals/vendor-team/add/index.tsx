import styles from './index.module.scss';
import TitleBar from '@/components/TitleBar';

import { Button } from 'primereact/button';
import { FormError } from '@/utils/constant';
import api, { setToken } from '@/services/api.service';
import { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { tryCatch, Toast } from '@/hooks/tryCatch.js';
import { useForm, Controller } from 'react-hook-form';
import { InputTextarea } from 'primereact/inputtextarea';

import { Calendar } from 'primereact/calendar';
import { FileUpload } from 'primereact/fileupload';
import router from 'next/router';

export const getServerSideProps = async ({ req, query }) => {
    setToken(req);
    let allUserNames;
    let accountList;
    let contactDetails;

    // let promises = [api.getAllUserNameAndId(), api.getAllAccountsNames()];

    // if (query?.id) {
    //     promises.push(api.getContactById(query?.id));
    // }

    // [allUserNames, accountList, contactDetails] = await Promise.all(promises);

    return {
        props: {
            accountList,
            allUserNames,
            edit: query?.id ? true : false,
            contactDetails: contactDetails || {},
        },
    };
};

export default function AddContact({
    edit,
    accountList,
    allUserNames,
    contactDetails,
}) {
    const [isEdit, setIsEdit] = useState(edit);

    const categories = [
        { name: 'Admin', key: 'A' },
        { name: 'Department Head', key: 'M' },
        { name: 'Resource Manager', key: 'P' },
        { name: 'TA Leader', key: 'TAL' },
        { name: 'Technical', key: 'T' },
        { name: 'TA Member', key: 'TAM' },
    ];

    const {
       
        control,
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            ...contactDetails,
        },
    });

    const onSubmit = async (data) => {
        data['assignTo'] = Number(data['assignTo']?.id || data['assignTo']);
        data['reportingTo'] = Number(
            data['reportingTo']?.id || data['reportingTo']
        );
        data['accountId'] = Number(data['accountId']?.id || data['accountId']);
        tryCatch(async (toast) => {
            if (!isEdit) {
                await api.addContact(data);
                toast('Contact Created');
            } else {
                await api.updateContact(data, contactDetails?.id);
                router.push(`/sales/contacts/${contactDetails?.id}`);
            }
        });
    };

    useEffect(() => {
        if (isEdit) {
            const selectedAccount = accountList.find(
                (x) => (x.id = contactDetails?.accountId)
            );
            setValue('accountId', selectedAccount);
            const reportingToWhom = allUserNames.find(
                (x) => (x.id = contactDetails?.reportingTo)
            );
            const assignToWhom = allUserNames.find(
                (x) => (x.id = contactDetails?.assignTo)
            );
            setValue('reportingTo', reportingToWhom);
            setValue('assignTo', assignToWhom);

            console.log(contactDetails);
        }
    }, []);

    return (
        <>
            <Toast />
            <TitleBar
                title={isEdit ? 'Edit Internal Contact' : 'Add New Vendor Team'}
            />
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className={`grid ${styles.form}`}>
                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Account Name</label>
                        <InputText
                            type="text"
                            {...register('accountName', { required: true })}
                            placeholder="Enter you account name"
                        />
                        {FormError(errors, 'accountName')}
                    </div>

                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Parent Account</label>
                        <InputText
                            type="text"
                            {...register('parentAccount', { required: true })}
                            placeholder="Enter your parent account name"
                        />
                        {FormError(errors, 'parentAccount')}
                    </div>

                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Website</label>
                        <InputText
                            placeholder="https://"
                            {...register('website')}
                        />
                        {FormError(errors, 'website')}
                    </div>
                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Phone Number</label>
                        <InputText
                            placeholder="Phone"
                            {...register('phone', { required: true })}
                        />
                        {FormError(errors, 'phone')}
                    </div>
                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Industry</label>
                        <InputText
                            placeholder="Enter your Industry Name"
                            {...register('industry', { required: true })}
                        />
                        {FormError(errors, 'industry')}
                    </div>
                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Employees</label>
                        <InputText
                            type="number"
                            placeholder="Enter number of employees"
                            {...register('employees', { required: true })}
                        />
                        {FormError(errors, 'employees')}
                    </div>
                    <div className="col-12 ">
                        <label>Description</label>
                        <InputTextarea
                            autoResize
                            rows={5}
                            cols={100}
                            {...register('description', { required: true })}
                            placeholder="Add Description"
                            style={{ width: '100%' }}
                        />
                        {FormError(errors, 'description')}
                    </div>
                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Account Type</label>
                        <Controller
                            name="account_Type"
                            control={control}
                            rules={{ required: true }}
                            render={({ field}) => (
                                <Dropdown
                                    id={field.name}
                                    className="w-full"
                                    value={field.value}
                                    optionLabel="name"
                                    options={[
                                        { name: 'Admin' },
                                        { name: 'Other' },
                                    ]}
                                    focusInputRef={field.ref}
                                    placeholder="Select Account Type"
                                    onChange={(e) => field.onChange(e.value)}
                                />
                            )}
                        />
                        {FormError(errors, 'account_Type')}
                    </div>
                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Area/Landmark/House No.</label>
                        <InputText
                            placeholder="Enter Area/Kandmark/House no."
                            {...register('landmark', { required: true })}
                        />
                        {FormError(errors, 'landmark')}
                    </div>
                    <div className="col-12 md:col-4 lg:col-4">
                        <label>City</label>
                        <InputText
                            placeholder="Enter Your City Name"
                            {...register('city', { required: true })}
                        />
                        {FormError(errors, 'city')}
                    </div>
                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Pin Code</label>
                        <InputText
                            placeholder="Enter Your Pincode"
                            {...register('pincode', { required: true })}
                        />
                        {FormError(errors, 'pincode')}
                    </div>
                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Country</label>
                        <InputText
                            placeholder="Enter Your Country Name"
                            {...register('pincode', { required: true })}
                        />
                        {FormError(errors, 'pincode')}
                    </div>
                    <div className="col-12 md:col-4 lg:col-4">
                        <label>State</label>
                        <InputText
                            placeholder="Enter Your State Name"
                            {...register('state', { required: true })}
                        />
                        {FormError(errors, 'state')}
                    </div>
                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Created By</label>
                        <InputText
                            placeholder="Created by"
                            {...register('createdBy', { required: true })}
                        />
                        {FormError(errors, 'createdBy')}
                    </div>
                    <div className="col-12 md:col-12 lg:col-12">
                        <label>Primary SPOC</label>
                        <div className="flex gap-3">
                            <div className="w-4 ">
                                <Controller
                                    name="sPOC_Email"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Dropdown
                                            id={field.name}
                                            className="w-full"
                                            value={field.value}
                                            optionLabel="name"
                                            options={[]}
                                            focusInputRef={field.ref}
                                            placeholder="Select Email"
                                            onChange={(e) =>
                                                field.onChange(e.value)
                                            }
                                        />
                                    )}
                                />
                                {FormError(errors, 'sPOC_Email')}
                            </div>
                            <div className="w-8">
                                <InputText
                                    placeholder="Enter email address"
                                    {...register('sPoc_email_text', {
                                        required: true,
                                    })}
                                />
                                {FormError(errors, 'sPoc_email_text')}
                            </div>
                        </div>
                    </div>
                    <div className="col-12 md:col-12 lg:col-12">
                        <label>Secondary SPOC</label>
                        <div className="flex  gap-3">
                            <div className="w-4">
                                <Controller
                                    name="sPOC_Phone"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Dropdown
                                            id={field.name}
                                            className="w-full"
                                            value={field.value}
                                            optionLabel="name"
                                            options={[]}
                                            focusInputRef={field.ref}
                                            placeholder="Select Phone Number"
                                            onChange={(e) =>
                                                field.onChange(e.value)
                                            }
                                        />
                                    )}
                                />
                                {FormError(errors, 'sPOC_Phone')}
                            </div>
                            <div className="w-8">
                                <InputText
                                    type="number"
                                    placeholder="Enter phone number"
                                    {...register('sPoc_phone', {
                                        required: true,
                                    })}
                                />
                                {FormError(errors, 'sPoc_phone')}
                            </div>
                        </div>
                    </div>
                    <div className="col-12 md:col-12 lg:col-12">
                        <label>Escalation 01</label>
                        <div className="flex  gap-3">
                            <div className="w-4">
                                <Controller
                                    name="escalation1_Email"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Dropdown
                                            id={field.name}
                                            className="w-full"
                                            value={field.value}
                                            optionLabel="name"
                                            options={[]}
                                            focusInputRef={field.ref}
                                            placeholder="Select Email"
                                            onChange={(e) =>
                                                field.onChange(e.value)
                                            }
                                        />
                                    )}
                                />
                                {FormError(errors, 'escalation_Email')}
                            </div>
                            <div className="w-8">
                                <InputText
                                    placeholder="Enter email address"
                                    {...register('escalation1_Email_text', {
                                        required: true,
                                    })}
                                />
                                {FormError(errors, 'escalation1_Email_text')}
                            </div>
                        </div>
                    </div>
                    <div className="col-12 md:col-12 lg:col-12">
                        <label>Escalation 02</label>
                        <div className="flex  gap-3">
                            <div className="w-4">
                                <Controller
                                    name="escalation2_Phone"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field}) => (
                                        <Dropdown
                                            id={field.name}
                                            className="w-full"
                                            value={field.value}
                                            optionLabel="name"
                                            options={[]}
                                            focusInputRef={field.ref}
                                            placeholder="Select Phone Number"
                                            onChange={(e) =>
                                                field.onChange(e.value)
                                            }
                                        />
                                    )}
                                />
                                {FormError(errors, 'escalation2_Phone')}
                            </div>
                            <div className="w-8">
                                <InputText
                                    type="number"
                                    placeholder="Enter phone number"
                                    {...register('escalation2_Phone_text', {
                                        required: true,
                                    })}
                                />
                                {FormError(errors, 'escalation2_Phone_text')}
                            </div>
                        </div>
                    </div>
                    <h4 className="w-12 text-lg ml-2 my-4">Bank Details</h4>
                    <div className="col-12 md:col-12 lg:col-4">
                        <label> Bank Account Number</label>
                        <InputText
                            placeholder="Enter Account Number"
                            {...register('bank_Account_Number', {
                                required: true,
                            })}
                        />
                        {FormError(errors, 'bank_Account_Number')}
                    </div>
                    <div className="col-12 md:col-12 lg:col-4">
                        <label>Account Holder Name</label>
                        <InputText
                            placeholder="Enter Account Holder Name"
                            {...register('account_Holder_Name', {
                                required: true,
                            })}
                        />
                        {FormError(errors, 'account_Holder_Name')}
                    </div>
                    <div className="col-12 md:col-12 lg:col-4">
                        <label>Bank IFSC Code</label>
                        <InputText
                            placeholder="Enter Bank IFSC Code"
                            {...register('bank_IFSC_Code', { required: true })}
                        />
                        {FormError(errors, 'bank_IFSC_Code')}
                    </div>
                    <div className="col-12 md:col-12 lg:col-4">
                        <label>Upload Check</label>
                        <FileUpload
                            className="w-12"
                            mode="basic"
                            accept="image/*"
                            maxFileSize={1000000}
                            chooseLabel="Upload Check file"
                        />
                    </div>
                    <div className="col-12 md:col-12 lg:col-8">
                        <label>MSA Signed Date</label>
                        <div className="flex gap-3">
                            <Calendar className="w-8" showIcon />
                            <FileUpload
                                className="w-4"
                                mode="basic"
                                accept="image/*"
                                maxFileSize={1000000}
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-12 lg:col-4">
                        <label>Upload Agreement</label>
                        <FileUpload
                            mode="basic"
                            accept="image/*"
                            chooseLabel="Upload Check file"
                            maxFileSize={1000000}
                        />
                    </div>
                    <div className="col-12 md:col-12 lg:col-8">
                        <label>Escalation 02</label>
                        <div className="flex  gap-3">
                            <div className="w-8">
                                <Controller
                                    name="msme"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field}) => (
                                        <Dropdown
                                            id={field.name}
                                            className="w-full"
                                            value={field.value}
                                            optionLabel="name"
                                            options={[
                                                { name: 'Yes' },
                                                { name: 'No' },
                                            ]}
                                            focusInputRef={field.ref}
                                            placeholder="Yes"
                                            onChange={(e) =>
                                                field.onChange(e.value)
                                            }
                                        />
                                    )}
                                />
                                {FormError(errors, 'msme')}
                            </div>
                            <div className="w-4">
                                <FileUpload
                                    mode="basic"
                                    accept="image/*"
                                    chooseLabel="Upload"
                                    maxFileSize={1000000}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Complete till */}
                    <div
                        className={`col-12 justify-content-end mt-8 gap-3 ${styles.buttons}`}
                    >
                        <Button
                            className={`${styles.discard} px-6`}
                            type="button"
                            label="Discard"
                        />
                        <Button
                            type="button"
                            label="Save & New"
                            className="secondary px-6"
                        />
                        <Button
                            className="secondary w-3 px-6"
                            type="submit"
                            label={isEdit ? 'Update' : 'Submit'}
                        />
                    </div>
                </div>
            </form>
        </>
    );
}
