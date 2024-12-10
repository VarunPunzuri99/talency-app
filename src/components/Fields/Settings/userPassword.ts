export const userPasswordFields = () => [
    // {
    //   title: 'Current Password',
    //   name: 'currentPassword',
    //   type: 'password',
    //   placeholder: 'Enter Current Password',
    //   parentClassName: 'col-12 md:col-6 lg:col-6',
    //   className: 'w-full mt-1',
    //   maximumLength: 30,
    //   required: true,
    // },
  
    {
      title: 'New Password',
      name: 'newPassword',
      type: 'password',
      placeholder: 'Enter New Password',
      parentClassName: 'col-12 md:col-6 lg:col-6',
      className: 'w-full mt-1',
      maximumLength: 30,
      required: true,
    },
  
    {
      title: 'Confirm Password',
      name: 'confirmPassword',
      type: 'password',
      placeholder: 'Enter Confirm Password',
      parentClassName: 'col-12 md:col-6 lg:col-6',
      className: 'w-full mt-1',
      maximumLength: 30,
      required: true,
    },
  ];