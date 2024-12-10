import * as yup from 'yup';

const TaskSchema = yup.object().shape({
    title: yup.string().required('Title is required'),
    summary: yup.string().nullable(),       
    dueDate: yup.date().required('Due date is required'), 
    location: yup.string().nullable(),
    org: yup.string().nullable(),
    spoc: yup.string().required('Spoc is required'),
    assignees: yup.array(),
    priority: yup.string().nullable(),
    parentTask: yup.string().nullable(),
});
export default TaskSchema;
