import * as yup from 'yup';

const PlaceholderSchema = yup.object().shape({
    name: yup.string().required('Place-holder Name is required'),
  
  description: yup
    .string()
    .nullable()
        .max(300, 'Description can be at most 300 characters'),
  
    jsonPath: yup
        .string()
        .required()
        .max(100, 'Description can be at most 100 characters'),
      
  

});

export default PlaceholderSchema;
