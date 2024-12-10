import * as Yup from 'yup';

const DynamicFieldSchema = Yup.object().shape({
    title: Yup.string()
        .required('Field title is required.')
        .max(50, 'Title cannot exceed 50 characters.'),
    type: Yup.string().required('Field type is required.'),
    placeholder: Yup.string()
});

export default DynamicFieldSchema;
