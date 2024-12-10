import * as Yup from 'yup';

const EmailTemplateSchema = Yup.object().shape({
    templateName: Yup.string().required('Template name is required.'),
    eventName: Yup.string().required('Template event type is required.'),
    templateHTMLContent: Yup.string().required('Template HTML content is required.'),
});


export default EmailTemplateSchema