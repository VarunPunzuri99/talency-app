import React, { useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useForm } from 'react-hook-form';
import DynamicFields from '@/utils/DynamicComponents';
import styles from './index.module.scss';
import { BasicUser, Job, Org } from '@/services/types';

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

interface AllocationDialogProps {
  type: string;
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: any) => void;
  header?: string;
  job: Job;
  member?: BasicUser;
  vendor?: Org;
}

const AllocationDialog: React.FC<AllocationDialogProps> = ({
  type,
  visible,
  onHide,
  onSubmit,
  header,
  job,
  member,
  vendor,
}) => {
  const internalTeamFields = [
    {
      title: 'Target Profiles',
      name: 'targetProfiles',
      type: 'number',
      className: 'w-full',
      placeholder: 'Enter number of target profiles',
    },
    {
      title: 'Due Date',
      name: 'dueDate',
      type: 'Calendar',
      className: 'w-full',
      showTime: true,
      minDate: new Date(),
      maxDate: new Date(new Date().getFullYear() + 1, 11, 31),
    },
  ];

  const vendorFields = internalTeamFields;

  const freelancerFields = [
    ...internalTeamFields,
    {
      title: 'Reward',
      name: 'reward',
      type: 'number',
      className: 'w-full',
      placeholder: 'Enter reward amount',
    },
  ];

  const priorityField = {
    title: 'Priority',
    name: 'priority',
    type: 'dropdown',
    className: 'w-full',
    options: Object.values(Priority).map((priority) => ({
      label: priority,
      value: priority,
    })),
  };

  const fields =
    type === 'internal'
      ? [...internalTeamFields, priorityField]
      : type === 'vendor'
      ? [...vendorFields, priorityField]
      : [...freelancerFields, priorityField];

  const {
    handleSubmit,
    control,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      targetProfiles: '',
      dueDate: null,
      reward: '',
      priority: Priority.LOW,
    },
  });

  // Reset form values whenever dialog is opened or closed
  useEffect(() => {
    if (visible) {
      reset(); // Reset form values to default when dialog is opened
    }
  }, [visible, reset]);

  const handleProceed = (data: any) => {
    let payload;

    switch (type) {
      case 'internal':
        payload = {
          title: job.title,
          assignedDateAndTime: new Date().toISOString(),
          dueDate: data.dueDate,
          targetProfiles: data.targetProfiles,
          job: job._id,
          priority: data.priority,
          assignee: member?._id,
        };
        break;
      case 'vendor':
        payload = {
          title: job.title,
          assignedDateAndTime: new Date().toISOString(),
          dueDate: data.dueDate,
          targetProfiles: data.targetProfiles,
          org: vendor?._id,
          job: job._id,
          priority: data.priority,
        };
        break;
      case 'freelancer':
        payload = {
          title: job.title,
          assignedDateAndTime: new Date().toISOString(),
          dueDate: data.dueDate,
          targetProfiles: data.targetProfiles,
          job: job._id,
          priority: data.priority,
        };
        break;
      default:
        throw new Error('Invalid allocation type');
    }

    onSubmit(payload);
    onHide();
  };

  const handleDiscard = () => {
    reset(); // Reset form fields
    onHide();
  };

  return (
    <Dialog
      visible={visible}
      style={{ width: '50vw' }}
      header={job?.title || header}
      modal
      className="p-fluid"
      onHide={onHide}
    >
      <form onSubmit={handleSubmit(handleProceed)}>
        <div className={` ${styles.form}`}>
          {fields.map((item, index) => (
            <DynamicFields
              key={item.name || index}
              item={item}
              control={control}
              errors={errors}
              getValues={getValues}
              disbaled={null}
            />
          ))}
        </div>
        <div className='flex justify-content-between p-3 '>
          <div className='dummy'></div>
          <div className={styles.buttons}>
            <Button
              label="Discard"
              type="button"
              className="p-button-danger"
              onClick={handleDiscard}
            />
            <Button type="submit" label="Submit" className="p-button-primary" />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AllocationDialog;
