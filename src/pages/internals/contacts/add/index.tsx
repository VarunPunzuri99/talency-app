import styles from './index.module.scss';
import TitleBar from '@/components/TitleBar';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { FormError } from '@/utils/constant';
import api, { setToken } from '@/services/api.service';
import { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { tryCatch, Toast } from '@/hooks/tryCatch.js';
import { useForm, Controller } from 'react-hook-form';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton } from 'primereact/radiobutton';
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
    const [selectedCategory, setSelectedCategory] = useState(categories[1]);

    const {
        reset,
        control,
        register,
        setValue,
        handleSubmit,
        formState: { isValid, isDirty, errors },
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
                title={
                    isEdit ? 'Edit Internal Contact' : 'Add Internal Contact'
                }
            />
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className={`grid ${styles.form}`}>
                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Salutation</label>
                        <InputText
                            type="text"
                            {...register('salutation', { required: true })}
                            placeholder="Mr / Mrs"
                        />
                        {FormError(errors, 'salutation')}
                    </div>

                    <div className="col-12 md:col-4 lg:col-4">
                        <label>First Name</label>
                        <InputText
                            type="text"
                            {...register('firstName', { required: true })}
                            placeholder="John"
                        />
                        {FormError(errors, 'firstName')}
                    </div>

                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Middle Name</label>
                        <InputText
                            placeholder="Doe"
                            {...register('middleName')}
                        />
                        {FormError(errors, 'middleName')}
                    </div>

                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Last Name</label>
                        <InputText
                            placeholder="Doe"
                            {...register('lastName', { required: true })}
                        />
                        {FormError(errors, 'lastName')}
                    </div>

                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Reference</label>
                        <InputText
                            placeholder="..."
                            {...register('reference', { required: true })}
                        />
                        {FormError(errors, 'reference')}
                    </div>

                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Email Address</label>
                        <InputText
                            type="email"
                            placeholder="john@example.com"
                            {...register('email', { required: true })}
                        />
                        {FormError(errors, 'email')}
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
                        <label>Designation</label>
                        <InputText
                            placeholder="Enter your Designation"
                            {...register('designation', { required: true })}
                        />
                        {FormError(errors, 'designation')}
                    </div>

                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Location</label>
                        <InputText
                            placeholder="Location"
                            {...register('location', { required: true })}
                        />
                        {FormError(errors, 'location')}
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
                        <label>Account Assign</label>
                        <Controller
                            name="account_Assign"
                            control={control}
                            rules={{ required: true }}
                            render={({ field, fieldState }) => (
                                <Dropdown
                                    id={field.name}
                                    className="w-full"
                                    value={field.value}
                                    optionLabel="name"
                                    options={[
                                        { name: 'Internal' },
                                        { name: 'External' },
                                    ]}
                                    focusInputRef={field.ref}
                                    placeholder="Select Internal/External"
                                    onChange={(e) => field.onChange(e.value)}
                                />
                            )}
                        />
                        {FormError(errors, 'account_Assign')}
                    </div>
                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Department</label>
                        <Controller
                            name="department"
                            control={control}
                            rules={{ required: true }}
                            render={({ field, fieldState }) => (
                                <Dropdown
                                    id={field.name}
                                    className="w-full"
                                    value={field.value}
                                    optionLabel="name"
                                    options={[]}
                                    focusInputRef={field.ref}
                                    placeholder="Select Department"
                                    onChange={(e) => field.onChange(e.value)}
                                />
                            )}
                        />
                        {FormError(errors, 'department')}
                    </div>

                    <div className="col-12 md:col-4 lg:col-4">
                        <label>LinkedIn Link</label>
                        <InputText
                            placeholder="Paste your LinkedIn URL"
                            {...register('linkedin', { required: true })}
                        />
                        {FormError(errors, 'linkedin')}
                    </div>
                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Business Unit</label>
                        <InputText
                            placeholder="Enter Unit Name"
                            {...register('businessUnit', { required: true })}
                        />
                        {FormError(errors, 'businessUnit')}
                    </div>
                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Reporting to</label>
                        <Controller
                            name="reportingTo"
                            control={control}
                            rules={{ required: true }}
                            render={({ field, fieldState }) => (
                                <Dropdown
                                    id={field.name}
                                    className="w-full"
                                    value={field.value}
                                    optionLabel="fullName"
                                    options={allUserNames}
                                    focusInputRef={field.ref}
                                    placeholder="Whom to Report?"
                                    onChange={(e) => field.onChange(e.value)}
                                />
                            )}
                        />
                        {FormError(errors, 'reportingTo')}
                    </div>
                    <div className="col-12 md:col-4 lg:col-4">
                        <label>Assign to</label>
                        <Controller
                            name="assignTo"
                            control={control}
                            rules={{ required: true }}
                            render={({ field, fieldState }) => (
                                <Dropdown
                                    id={field.name}
                                    className="w-full"
                                    value={field.value}
                                    optionLabel="fullName"
                                    options={allUserNames}
                                    focusInputRef={field.ref}
                                    placeholder="Whom to Assign?"
                                    onChange={(e) => field.onChange(e.value)}
                                />
                            )}
                        />
                        {FormError(errors, 'assignTo')}
                    </div>
                    <div className="col-12 ">
                        <label>Role Permissions</label>
                        <div className="flex flex-wrap gap-3">
                            {categories.map((category) => {
                                return (
                                    <div
                                        key={category.key}
                                        className="flex align-items-center"
                                    >
                                        <RadioButton
                                            inputId={category.key}
                                            name="category"
                                            value={category}
                                            onChange={(e) =>
                                                setSelectedCategory(e.value)
                                            }
                                            checked={
                                                selectedCategory.key ===
                                                category.key
                                            }
                                        />
                                        <label
                                            htmlFor={category.key}
                                            className="m-0 ml-2 "
                                        >
                                            {category.name}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="col-12 md:col-12 lg:col-12">
                        <label>Comments</label>
                        <InputTextarea
                            autoResize
                            rows={5}
                            cols={100}
                            {...register('comments', { required: true })}
                            placeholder="Please write something"
                            style={{ width: '100%' }}
                        />
                        {FormError(errors, 'comments')}
                    </div>

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
