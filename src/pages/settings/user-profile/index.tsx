import React, { useState, useEffect } from 'react';
import styles from './styles.module.scss';
import { getCurrentUser, setToken } from '@/services/api.service';
import { useForm } from 'react-hook-form';
import DynamicFields from '@/utils/DynamicComponents';
import { Button } from 'primereact/button';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { userProfileFields } from '@/components/Fields/Settings/userProfile';
import { createUserInboxConfig, softDeleteUser, updateUser, updateUserInboxConfig, userInboxConfigTestImapConnection } from '@/services/usersProfile';
import UserProfileSchema from '@/validations/userProfileSchema';
import { useRouter } from 'next/router';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import userEmailConfigSchema from '@/validations/userEmailConfigSchema';
import { userEmailConfigFields } from '@/components/Fields/Settings/userEmailConfig';


export async function getServerSideProps({ req }) {
  try {
    setToken(req);
    const data = await getCurrentUser();
    return {
      props: {
        initialData: data || {},
      },
    };
  } catch (error) {
    console.error('Error fetching org details', error.message);
    return {
      props: {
        initialData: [],
        error: error.message,
      },
    };
  }
}

const index = ({ initialData }) => {
  console.log(initialData)
  const userId = initialData._id;
  const updateConfigId = initialData?.userInboxConfig?._id;

  const [, setUpdatedUserData] = useState<{
    firstName: string;
    contactDetails: { contactNumber: string }[];
    logo: any
  }>({
    firstName: " ",
    contactDetails: [{ contactNumber: " " }],
    logo: " "

  });

  // console.log(updatedUserData)

  const router = useRouter()
  const [isUserEditing, setIsUserEditing] = useState(false);

  const [isEditing, setIsEditing] = useState(!initialData?.userInboxConfig || Object.keys(initialData?.userInboxConfig).length === 0);

  const defaultValues = {
    firstName: initialData?.firstName || '',
    email: initialData?.email || '',
    contactDetails: initialData?.contactDetails || [{ contactNumber: '' }],
    logo: initialData?.logo?.locationUrl || undefined,
  };


  const defaultEmailConfigValues = {

    fromEmail: initialData?.userInboxConfig?.fromEmail || '',
    fromName: initialData?.userInboxConfig?.fromName || '',
    imapHost: initialData?.userInboxConfig?.imapHost || '',
    imapPort: initialData?.userInboxConfig?.imapPort || '',
    password: initialData?.userInboxConfig?.password || ' ',
    smtpHost: initialData?.userInboxConfig?.smtpHost || '',
    smtpPort: initialData?.userInboxConfig?.smtpPort || '',
    userName: initialData?.userInboxConfig?.userName || '',
  };

  // console.log('ddd', defaultEmailConfigValues)

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(UserProfileSchema),
    mode: 'onChange',
    defaultValues,
  });



  const {
    handleSubmit: handleSubmitEmailConfig,
    control: controlEmailConfig,
    reset: resetEmailConfig,
    setValue: setEmailConfigValue,
    getValues: getEmailconfigValues,
    // watch,
    formState: { errors: errorsEmailConfig },
  } = useForm<any>({
    resolver: yupResolver(userEmailConfigSchema),
    mode: 'onChange',
    defaultValues: defaultEmailConfigValues,
    disabled: !isEditing
  });

  useEffect(() => {
    if (initialData) {
      console.log(initialData, 'initialdata')
      reset({
        firstName: initialData?.firstName || '',
        email: initialData?.email || '',
        contactDetails: initialData?.contactDetails || [{ contactNumber: '' }],
      });
    }
  }, [initialData]);


  const onSubmit = async (data: any) => {

    try {
      // console.log(data, "onsubmit...........");
      // const newData = {
      //   firstName: data?.firstName || initialData?.firstName,
      //   email: data.email,
      //   contactDetails: Array.isArray(data?.contactDetails)
      //     ? data.contactDetails
      //     : [{ contactNumber: data?.contactDetails?.[0]?.contactNumber }],
      //   logo: data?.logo
      // };


      const newData = {
        firstName: data.firstName,
        email: data.email,
        contactDetails: [
          {
            contactNumber: data.contactDetails?.[0]?.contactNumber || ''
          }
        ],
        logo: data?.logo || ''
      };


      console.log('Payload being sent:', newData);

      setUpdatedUserData(newData);


      const response = await updateUser(userId, newData);

      console.log(response, 'response from backend')
      if (response) {
        toast.success('User Profile updated successfully');

        setIsUserEditing(false);

        // reset({
        //   firstName: response?.firstName || '',
        //   email: response?.email || '',
        //   contactDetails: [
        //     { 
        //       contactNumber: response?.contactDetails?.[0]?.contactNumber || ''
        //     }
        //   ]
        // });

        // After successful save, trigger the edit button handler
        handleSubmitUserEditing();

      }

    } catch (error) {
      console.error('Failed to update user profile:', error);
      toast.error('Failed to update user profile. Please try again.');
    }
  };

  console.log('errors', errors);


  useEffect(() => {
    if (initialData?.userInboxConfig) {
      resetEmailConfig({
        // ...initialData?.userInboxConfig
        fromEmail: initialData?.userInboxConfig?.fromEmail || '',
        fromName: initialData?.userInboxConfig?.fromName || '',
        imapHost: initialData?.userInboxConfig?.imapHost || '',
        imapPort: initialData?.userInboxConfig?.imapPort || '',
        password: initialData?.userInboxConfig?.password || ' ',
        smtpHost: initialData?.userInboxConfig?.smtpHost || '',
        smtpPort: initialData?.userInboxConfig?.smtpPort || '',
        userName: initialData?.userInboxConfig?.userName || '',
      })
    }

  }, [initialData, resetEmailConfig]);

  const onSubmitEmailConfig = async (data: any) => {
    console.log('email sharing errors', errorsEmailConfig);
    console.log('email Sharing Form Data:', data);

    const configId = initialData?.userConfigId?._id

    console.log(configId)

    // After successful save, trigger the edit button handler
    handleSubmitEmailConfigEdit()
    console.log('Form submission triggered');
    console.log('Is form editing?', isEditing);
    console.log('Raw form data:', data);

    if (!data) {
      console.error('From data is empty')
      return;
    }

    try {
      const newData = {
        userInboxConfig: {
          fromEmail: data.fromEmail || '',
          fromName: data.fromName || '',
          imapHost: data.imapHost || '',
          imapPort: data.imapPort ? parseInt(data.imapPort) : null,
          password: data.password || '',
          smtpHost: data.smtpHost || '',
          smtpPort: data.smtpPort ? parseInt(data.smtpPort) : null,
          userName: data.userName || '',
        }
      };

      const response = initialData?.userInboxConfig ? await updateUserInboxConfig(updateConfigId, newData) : await createUserInboxConfig(newData);
      console.log(response)

      if (response) {
        toast.success(`Email configuration ${initialData?.userInboxConfig ? 'updated' : 'created'} successfully`);
        setIsEditing(false);

        const configId = initialData?.userInboxConfig ? updateConfigId : response._id;

        if (configId) {
          setTimeout(async () => {
            try {
              const testResponse = await userInboxConfigTestImapConnection(configId);
              console.log(testResponse, 'IMAP connection test successful');
              toast.success("IMAP connection test successful");
            } catch (error) {
              console.error('IMAP connection test failed:', error.message);
              toast.error("IMAP connection test failed. Please check the details and try again.");
            }

          }, 5100); // Five seconds delay
        }
      }
    } catch (error: any) {
      console.error('Email configuration error:', error);
      if (error.inner) {
        // Yup validation errors
        error.inner.forEach((err: any) => {
          toast.error(err.message);
        });
      } else {
        toast.error(error.message || 'Failed to process email configuration');
      }
    }
  };

  const handleSubmitUserEditing = () => {
    setIsUserEditing(!isUserEditing)
  }

  const handleSoftDelete = () => {

    confirmDialog({
      message: 'Are you sure you want to delete this user?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          const response = softDeleteUser(userId);
          console.log(response);
          toast.success("User deleted successfully");
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
        } catch (error) {
          toast.error("Failed to delete user")
          console.error(error);
        }

      }
    });
  }


  // const handleSubmitEmailConfigEdit = () => {
  //   setIsEditing(!isEditing)
  // }

  const handleSubmitEmailConfigEdit = () => {
    setIsEditing(!isEditing) // Toggle editing mode
  };



  const handleCancel = () => {
    console.log("Cancel button clicked");
    resetEmailConfig({
      data: initialData?.userInboxConfig
    });
  };

  return (
    <>
      <div className={styles.userProfileContainer}>
        <h1 className={styles.header}>USER PROFILE</h1>
        <div className={styles.settingsContainer}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={styles.settingsForm}
          >
            <div className={`grid`}>
              {userProfileFields(errors)?.map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    <DynamicFields
                      item={item}
                      control={control}
                      errors={errors}
                      edit={true}
                      setValue={setValue}
                      getValues={getValues}
                      disbaled={!isUserEditing} />
                  </React.Fragment>
                );
              })}
            </div>

            {/* <Link href='/settings/user-profile/change-password'> Change Password
            </Link> */}

            <div className={`col-12 ${styles.userButtons}`}>
              {isUserEditing && <Button type="submit" label="Update" />}
              <Button type="button"
                label={isUserEditing ? "Cancel" : "Edit"}
                onClick={handleSubmitUserEditing}
              />
              <Button
                type="button"
                onClick={() => router.push('/settings/user-profile/change-password')}
                label='Change Password'
              />
              <ConfirmDialog />
              <Button type="button" label='Delete' onClick={handleSoftDelete} />
            </div>

          </form>

        </div>

        <h2 className={styles.socialMediaHeader}>EmailConfig Info</h2>
        <div className={styles.socialSharingContainer}>
          <form
            onSubmit={handleSubmitEmailConfig(onSubmitEmailConfig)}
            className={styles.settingsForm}
          >
            <div className={`grid`}>
              {userEmailConfigFields(errorsEmailConfig)?.map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    <DynamicFields
                      item={item}
                      control={controlEmailConfig}
                      errors={errorsEmailConfig}
                      edit={true}
                      setValue={setEmailConfigValue}
                      getValues={getEmailconfigValues}
                      disbaled={initialData?.userInboxConfig && !isEditing} />
                  </React.Fragment>
                );
              })}
            </div>
            <div className={`col-12 ${styles.emailConfigButtons}`}>
              <>
                {!initialData?.userInboxConfig || Object.keys(initialData?.userInboxConfig).length === 0 ? (
                  <>
                    <Button type="submit" label="Create" />
                    <Button type="button" label="Cancel" onClick={handleCancel} />
                  </>

                ) : (

                  // Show "Save" and "Edit/Cancel" buttons when data exists
                  <>
                    {isEditing && <Button type="submit" label="Update" />}
                    <Button
                      type="button"
                      label={isEditing ? "Cancel" : "Edit"}
                      onClick={handleSubmitEmailConfigEdit}
                    />
                  </>
                )}
              </>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default index;