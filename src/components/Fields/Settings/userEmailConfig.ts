export const userEmailConfigFields = (errorsEmailConfig) => [
    {
      title: 'User Name',
      name: 'userName',
      type: 'text',
      placeholder: 'Enter User Full Name',
      maximumLength: 30,
      parentClassName: 'col-12 md:col-6 lg:col-6',
      className: 'w-full mt-1',
    },
  
    {
      title: 'From Name',
      name: 'fromName',
      type: 'text',
      placeholder: 'Enter User Full Name',
      maximumLength: 30,
      parentClassName: 'col-12 md:col-6 lg:col-6',
      className: 'w-full mt-1',
    },
  
    {
      title: 'Email',
      name: 'fromEmail',
      type: 'text',
      placeholder: 'Enter User Email',
      parentClassName: 'col-12 md:col-6 lg:col-6',
      className: 'w-full mt-1',
      maximumLength: 75,
    },
  
    {
      title: 'Password',
      name: 'password',
      type: 'password',
      placeholder: 'Enter User Password',
      maximumLength: 30,
      parentClassName: 'col-12 md:col-6 lg:col-6',
      className: 'w-full mt-1',
    },
  
    {
      title: 'IMAP Host',
      name: 'imapHost',
      type: 'text',
      placeholder: 'Enter IMAP Host',
      parentClassName: 'col-12 md:col-6 lg:col-6',
      className: 'w-full mt-1',
      maximumLength: 75,
      comValidation: errorsEmailConfig?.imapHost?.message,
    },
    {
      title: 'IMAP Port',
      name: 'imapPort',
      type: 'text',
      placeholder: 'Enter IMAP Port',
      parentClassName: 'col-12 md:col-6 lg:col-6',
      className: 'w-full mt-1',
      maximumLength: 5, // Ports are usually 5 digits or less
    },
    {
      title: 'SMTP Host',
      name: 'smtpHost',
      type: 'text',
      placeholder: 'Enter SMTP Host',
      parentClassName: 'col-12 md:col-6 lg:col-6',
      className: 'w-full mt-1',
      maximumLength: 75,
    },
    {
      title: 'SMTP Port',
      name: 'smtpPort',
      type: 'text',
      placeholder: 'Enter SMTP Port',
      parentClassName: 'col-12 md:col-6 lg:col-6',
      className: 'w-full mt-1',
      maximumLength: 5, // Ports are usually 5 digits or less
    },
  ];