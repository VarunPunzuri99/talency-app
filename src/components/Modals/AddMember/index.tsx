import React , { useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useForm } from 'react-hook-form';
import styles from './index.module.scss';
import { memberFields } from '@/components/Fields/Settings/members';
import DynamicFields from '@/utils/DynamicComponents';
import { yupResolver } from '@hookform/resolvers/yup';
import memberSchema from '@/validations/memberSchema';


export const AddMemberDialog = ({ visible, onHide, onSave, initialBusinessUnits=null, initialData=null,initialOrgUsers=null }) => {

console.log('initialData',initialData)
    const defaultValues = {
        email: '',
        firstName: '',
        lastName: '',
        businessUnit: '',
        roles: [],
        reportingTo: undefined,
    }

    const {
        handleSubmit,
        control,
        reset,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<any>({
        resolver: yupResolver(memberSchema),
        mode: 'onChange',
        defaultValues,
    });

    useEffect(() => {
        if (initialData) {
            reset({
                email: initialData?.email || '',
                firstName: initialData?.firstName || '',
                lastName: initialData?.lastName || '',
                businessUnit: initialData?.businessUnit || '',
                roles: initialData?.roles || [],
                reportingTo: initialData?.reportingTo?._id || '',
            });
        }
        else {
            reset(defaultValues);
        }
    }, [initialData, reset]);

    const submitForm = (data) => {
        onSave(data);
        console.log('submit data',data)
        reset();
        onHide();
    };

    console.log('errors',errors)

    return (
        <Dialog header={initialData ? "Edit Member" : "Add New Member"} visible={visible} onHide={onHide} className={styles.addMember}>
            <form onSubmit={handleSubmit(submitForm)}>
                <div className={styles.addMemberDialog}>
                    {memberFields(errors, initialBusinessUnits, initialOrgUsers)?.map((item, index) => {
                                    return (
                                        <React.Fragment key={index}>
                                            {item.type !== 'tree-select' ? (
                                                <DynamicFields
                                                    item={item}
                                                    control={control}
                                                    errors={errors}
                                                    edit={false}
                                                    setValue={setValue}
                                                    getValues={getValues}
                                                    disbaled={null}
                                                />
                                            ) : (
                                                <></>
                                            )}
                                        </React.Fragment>
                                    )
                        }
                        )}
                        <Button type="submit" label="Submit"  className={styles.footer} />
                </div>
            </form>
        </Dialog>
    );
};
