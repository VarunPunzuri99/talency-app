import React, { useState, useEffect } from 'react';
import styles from './styles.module.scss';
import api, { getCurrentUser, getFileMetadataById, setToken, updateOrg } from '@/services/api.service';
import { useForm } from 'react-hook-form';
import { companyProfileFields, socialSharingFields } from '@/components/Fields/Settings/companyProfile';
import DynamicFields from '@/utils/DynamicComponents';
import { Button } from 'primereact/button';
import { yupResolver } from '@hookform/resolvers/yup';
import CompanyProfileSchema from '@/validations/CompanyProfileSchema';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export async function getServerSideProps({ req }) {
    try {
        setToken(req);
        const user = await getCurrentUser();
        const orgData = await api.getOrgByID(user.org._id)

        return {
            props: {
                initialData: orgData || [],
            },
        };
    } catch (error) {
        console.error('Error fetching org details', error.message);
        return {
            props: {
                initialData: [],
            },
        };
    }
}

const index = ({ initialData }) => {

    const orgId = initialData._id;
    console.log('initialData', initialData)

    const [thumbnailUrl, setThumbnailUrl] = useState(null);
    // const [isUserEditing, setIsUserEditing] = useState(false)

    const defaultValues = {
        title: initialData?.title || '',
        websiteUrl: initialData?.websiteUrl || '',
        contactDetails: initialData?.contactDetails || [{ contactNumber: '' }],
        subDomain: initialData?.subDomain || '',
        logo: initialData?.logo?.locationUrl || undefined,
        description: initialData?.description || '',
    }

    const defaultSocialSharingValues = {
        thumbnail: initialData?.thumbnail?.locationUrl || undefined,
        socialDescription: initialData?.socialDescription || ''
    }

    const {
        handleSubmit,
        control,
        reset,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<any>({
        resolver: yupResolver(CompanyProfileSchema),
        mode: 'onChange',
        defaultValues,
    });

    const {
        handleSubmit: handleSubmitSocial,
        control: controlSocial,
        reset: resetSocial,
        setValue: setSocialValue,
        getValues: getSocialValues,
        watch,
        formState: { errors: errorsSocial },
    } = useForm({
        mode: 'onChange',
        defaultValues: defaultSocialSharingValues
    });

    useEffect(() => {
        if (initialData) {
            reset({
                title: initialData?.title || '',
                description: initialData?.description || '',
                websiteUrl: initialData?.websiteUrl || '',
                contactDetails: initialData?.contactDetails || [{ contactNumber: '' }],
                subDomain: initialData?.subDomain || '',
                logo: initialData?.logo?.locationUrl || undefined,
            });
        }
    }, [initialData]);

    useEffect(() => {
        resetSocial({
            thumbnail: initialData?.thumbnail?.locationUrl || undefined,
            socialDescription: initialData?.socialDescription || '',
        });
    }, [initialData]);

    const onSubmit = async (data: any) => {
        const isHttpInclude = data.logo?.includes("http") || false;
        const logo = isHttpInclude ? initialData.logo?._id : data.logo || undefined; // Use a valid ObjectId or undefined
        const newData = { ...data, logo };

        console.log(errors)
        try {
            console.log('Form Data:', newData);
            await updateOrg(orgId, newData);
            toast.success(`Company Profile updated successfully`, { autoClose: 1000 });
            // console.log("Update Response:", response);
        } catch (error) {
            console.error("Failed to update organization with company profile details:", error.message);
        }
    };

    console.log('errors', errors)

    const onSubmitSocialSharing = async (data) => {
        console.log('social sharing errors', errorsSocial);
        console.log('Social Sharing Form Data:', data);
        const isHttpInclude = data.thumbnail.includes("http")
        const newData = { ...data, thumbnail: isHttpInclude ? initialData.thumbnail._id : data.thumbnail }
        try {
            console.log('Social Sharing Form Data:', newData);
            const response = await updateOrg(orgId, newData);
            toast.success(`Company Social Sharing Details successfully`);
            console.log("Update Social Sharing Response:", response);
        } catch (error) {
            console.error("Failed to update organization with social sharing details:", error.message);
        }
    };

    const thumbnail = watch('thumbnail');
    console.log('thumbnail', thumbnail);

    const fetchFile = async (fileId) => {
        try {
            const response = await getFileMetadataById(fileId);
            const { locationUrl } = response || {};
            if (locationUrl) {
                setThumbnailUrl(locationUrl);
            }
        } catch (error) {
            console.error('Error fetching file:', error);
        }
    }

    useEffect(() => {
        if (thumbnail)
            fetchFile(thumbnail)
    }, [thumbnail])

    return (
        <>
            <ToastContainer autoClose={1000} />
            <div className={styles.companyProfileContainer}>
                <h1 className={styles.header}>COMPANY PROFILE</h1>
                <div className={styles.settingsContainer}>
                    <form onSubmit={handleSubmit(onSubmit)} className={styles.settingsForm}>
                        <div className={`grid ${styles.profileGrid}`}>
                            {companyProfileFields(errors)?.map((item, index) => {
                                return (
                                    <React.Fragment key={index}>
                                        <DynamicFields item={item} control={control} errors={errors} edit={true} setValue={setValue} getValues={getValues} disbaled={null} />
                                    </React.Fragment>
                                )
                            }
                            )}
                            <Button type="submit" label="Save" />
                        </div>
                    </form>
                </div>

                <h2 className={styles.socialMediaHeader}>SOCIAL SHARING DETAILS</h2>
                <div className={styles.socialSharingContainer}>
                    <form onSubmit={handleSubmitSocial(onSubmitSocialSharing)} className={styles.socialMediaForm}>
                        <div className={`grid ${styles.socialSharingGrid}`}>
                            {/* Left Column: Uploaded Image Preview */}
                            <div className={styles.socialMediaImageColumn}>
                                <h3 className={styles.socialMediaSubHeader}>Uploaded Image Preview</h3>
                                <div className={styles.socialMediaImagePreview}>
                                    {thumbnailUrl ? (
                                        <img src={thumbnailUrl} alt="Uploaded Preview" className={styles.image} />
                                    ) : thumbnail ? (
                                        <img src={thumbnail} alt="Uploaded Preview" className={styles.image} />
                                    ) : (
                                        <p>No image uploaded</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Form Fields */}
                            <div className={styles.socialMediaFormColumn}>
                                <DynamicFields
                                    item={socialSharingFields()[0]}
                                    control={controlSocial}
                                    errors={errorsSocial}
                                    setValue={setSocialValue}
                                    getValues={getSocialValues}
                                    edit={true}
                                    disbaled={null}
                                />
                            </div>

                        </div>

                        <DynamicFields
                            item={socialSharingFields()[1]}
                            control={controlSocial}
                            errors={errorsSocial}
                            setValue={setSocialValue}
                            getValues={getSocialValues}
                            edit={true}
                            disbaled={null}
                        />

                        <div className={`col-12 ${styles.socialMediaButtons}`}>
                            <Button type="submit" label="Save" />
                        </div>
                    </form>
                </div>

            </div>

        </>
    )

};

export default index;

