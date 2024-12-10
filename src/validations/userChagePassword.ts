import * as yup from 'yup';



const passwordChangeSchema = yup.object().shape({
    // currentPassword: yup.string()
    // .required('Current password is required')
    // .min(1, 'Current password is required'),

    newPassword: yup.string()
        .required('New password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
        ),
    confirmPassword: yup.string()
        .required('Please confirm your password')
        .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

export default passwordChangeSchema;