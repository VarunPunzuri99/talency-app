import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import DynamicFields from '@/utils/DynamicComponents';
import passwordChangeSchema from '@/validations/userChagePassword';
import styles from './styles.module.scss';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { userChangePassword } from '@/services/usersProfile';
import { userPasswordFields } from '@/components/Fields/Settings/userPassword';

const ChangePassword = () => {
  // const [isChangingPassword, setIsChangingPassword] = useState(false);
  const toastRef = useRef<Toast>(null);
  const router = useRouter();
  // const { userId } = router.query;

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(passwordChangeSchema),
    mode: 'onChange',
  });


  const onPasswordSubmit = async (data: any) => {
    console.log(data, 'onPassword......')
    // if (!userId) {
    //   toast.error("User ID is not available");
    //   return;
    // }
    
    try {
      const newData = {
        password: data.confirmPassword
      };

      const response = await userChangePassword(newData);

      if (response) {
        toast.success("Password changed successfully");
        reset();
        router.push('/settings/user-profile');
      } else {
        toast.error("Failed to change password");
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className={styles.userPasswordContainer}>
      <Toast ref={toastRef} />
      <h1 className={styles.header}>USER CHANGE PASSWORD</h1>
      <div className={styles.settingsContainer}>
        <form
          onSubmit={handleSubmit(onPasswordSubmit)}
          className={styles.settingsForm}
        >
          <div className="grid">
            {userPasswordFields().map((item, index) => (
              <React.Fragment key={index}>
                <DynamicFields
                  item={item}
                  control={control}
                  errors={errors}
                  edit={true}
                  setValue={setValue}
                  getValues={getValues}
                  disbaled={false}
                />
              </React.Fragment>
            ))}
          </div>
          <div>
            <Button type="submit" label="Save" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
