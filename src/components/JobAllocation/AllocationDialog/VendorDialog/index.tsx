// VendorDialog.tsx
import React, { useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DynamicFields from '@/utils/DynamicComponents';
import styles from './index.module.scss';

const VendorDialog = ({ visible, onHide, onSubmit, job, vendor }) => {
  // Define Yup validation schema
  const validationSchema = yup.object().shape({
    targetProfiles: yup
      .number()
      .typeError('Target profiles must be a number')
      .positive('Target profiles must be greater than 0')
      .required('Target profiles is required'),
    dueDate: yup.date().required('Due date is required'),
    priority: yup.string().oneOf(['LOW', 'MEDIUM', 'HIGH']).required('Priority is required'),
  });

  // Fields configuration for the dialog
  const vendorFields = [
    { title: 'Target Profiles', name: 'targetProfiles', type: 'number', className: 'w-full', placeholder: 'Enter target profiles' },
    { title: 'Due Date', name: 'dueDate', type: 'Calendar', className: 'w-full', showTime: true, minDate: new Date() },
    { title: 'Priority', name: 'priority', type: 'dropdown', className: 'w-full', options: [{ label: 'LOW', value: 'LOW' }, { label: 'MEDIUM', value: 'MEDIUM' }, { label: 'HIGH', value: 'HIGH' }] },
  ];

  // Setting up react-hook-form with validation
  const { handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      targetProfiles: 0,
      dueDate: null,
      priority: 'LOW',
    },
  });

  // Reset the form and prefill data when the dialog is opened or closed
  useEffect(() => {
    if (visible) {
      // Reset the form when the dialog opens
      reset({
        targetProfiles: vendor?.targetProfiles || '',
        dueDate: vendor?.dueDate || null,
        priority: vendor?.priority || 'LOW',
      });
    }
  }, [visible, reset, vendor]);

  // Handle form submission
  const handleProceed = (data) => {
    const payload = {
      title: job.title,
      assignedDateAndTime: new Date().toISOString(),
      dueDate: data.dueDate,
      targetProfiles: data.targetProfiles,
      priority: data.priority,
      job: job._id,
      assignee: vendor?._id,  // Use vendor's _id for editing
    };
    onSubmit(payload);
    onHide();
  };

  return (
    <Dialog visible={visible} style={{ width: '50vw' }} header={job?.title} modal onHide={onHide}>
      <form onSubmit={handleSubmit(handleProceed)}>
        <div className={styles.form}>
          {vendorFields.map((item, index) => (
            <DynamicFields key={item.name || index} item={item} control={control} errors={errors} disbaled={true} />
          ))}
        </div>
        <div className="flex justify-content-between p-3">
          <Button label="Discard" type="button" className="p-button-danger" onClick={() => { reset(); onHide(); }} />
          <Button type="submit" label="Submit" className="p-button-primary" />
        </div>
      </form>
    </Dialog>
  );
};

export default VendorDialog;
