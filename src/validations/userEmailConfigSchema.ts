import * as yup from 'yup';

const userEmailConfigSchema = yup.object().shape({
  username: yup
    .string()
    .required('Username is required')
    .max(30, 'Username can be at most 30 characters'),

  fromName: yup
    .string()
    .required('From Name is required')
    .max(30, 'From Name can be at most 30 characters'),

  fromEmail: yup
    .string()
    .required('Email is required')
    .email('Invalid email format')
    .max(75, 'Email can be at most 75 characters'),

  password: yup
    .string()
    .required('Password is required')
    .max(30, 'Password can be at most 30 characters'),

  imapHost: yup
    .string()
    .required('IMAP Host is required')
    .max(75, 'IMAP Host can be at most 75 characters'),

  imapPort: yup
    .string()
    .required('IMAP Port is required')
    .matches(/^\d+$/, 'Port must be a number')
    .test('port-range', 'Port must be between 1 and 65535', (value) => {
      if (!value) return true;
      const port = parseInt(value);
      return port >= 1 && port <= 65535;
    }),

  smtpHost: yup
    .string()
    .required('SMTP Host is required')
    .max(75, 'SMTP Host can be at most 75 characters'),

  smtpPort: yup
    .string()
    .required('SMTP Port is required')
    .matches(/^\d+$/, 'Port must be a number')
    .test('port-range', 'Port must be between 1 and 65535', (value) => {
      if (!value) return true;
      const port = parseInt(value);
      return port >= 1 && port <= 65535;
    }),
});

export default userEmailConfigSchema;