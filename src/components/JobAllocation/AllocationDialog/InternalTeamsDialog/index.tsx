// InternalTeamDialog.tsx
import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DynamicFields from '@/utils/DynamicComponents';
import styles from './index.module.scss';
import { toast } from 'react-toastify';
import { Checkbox } from 'primereact/checkbox';
import { ControlledCalendar } from '@/utils/Calander';

interface InternalTeamDialogProps {
  visible: boolean;
  onHide: () => void;
  onSubmit: (data: any) => void;
  job: any;
  member: any;
  initialValues?: {
    targetProfiles: number;
    startDate: Date | null;
    dueDate: Date | null;
    priority: "LOW" | "MEDIUM" | "HIGH";
    untilPositionClosed: boolean;
  };
}

const InternalTeamDialog: React.FC<InternalTeamDialogProps> = ({
  visible,
  onHide,
  onSubmit,
  job,
  member,
  initialValues
}) => {
  const [, setIsFormDirty] = useState(false);

  // Define Yup validation schema
  const validationSchema = yup.object().shape({
    targetProfiles: yup
      .number()
      .typeError('Target profiles must be a number')
      .min(1, 'Target profiles must be at least 1')
      .max(15, 'Target profiles cannot exceed 15')
      .integer('Target profiles must be a whole number')
      .required('Target profiles is required'),
    startDate: yup
      .date()
      .required('Start date is required')
      .min(new Date(), 'Start date must be in the future'),
    dueDate: yup
      .date()
      .nullable()
      .when('untilPositionClosed', {
        is: true,
        then: () => yup.date().nullable(), // Optional when untilPositionClosed is true
        otherwise: () => yup
          .date()
          .required('Due date is required') // Required when untilPositionClosed is false
          .test('dueDate', 'Due date must be after start date', function (value) {
            const { startDate } = this.parent;
            if (!startDate || !value) return false;
            return new Date(value) > new Date(startDate);
          })
      }),
    priority: yup.string().oneOf(['LOW', 'MEDIUM', 'HIGH']).required('Priority is required'),
    untilPositionClosed: yup.boolean().required(),
  });

  const { handleSubmit, control, reset, watch, formState: { errors, isDirty } } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
    defaultValues: {
      targetProfiles: 1,
      startDate: null,
      dueDate: null,
      priority: 'LOW',
      untilPositionClosed: true,
    },
  });

  // Watch for form changes
  useEffect(() => {
    setIsFormDirty(isDirty);
  }, [isDirty]);

  // Watch for start date and untilPositionClosed changes
  const startDate = watch('startDate');
  const untilPositionClosed = watch('untilPositionClosed');

  // Reset the form and prefill data when the dialog is opened or closed
  useEffect(() => {
    if (visible) {
      reset(initialValues || {
        targetProfiles: 1,
        startDate: new Date(),
        dueDate: null,
        priority: 'LOW',
        untilPositionClosed: true,
      });
    }
  }, [visible, reset, initialValues]);

  // Fields configuration for the dialog
  const internalTeamFields = [
    {
      title: 'Target Profiles',
      name: 'targetProfiles',
      type: 'number',
      className: 'w-full',
      maximumLength: 2,
      placeholder: 'Enter target profiles'
    },
    {
      title: 'Priority',
      name: 'priority',
      type: 'dropdown',
      className: 'w-full',
      options: [
        { label: 'LOW', value: 'LOW' },
        { label: 'MEDIUM', value: 'MEDIUM' },
        { label: 'HIGH', value: 'HIGH' }
      ]
    }
  ];

  // Handle form submission
  const handleProceed = (data) => {
    const payload = {
      startDate: data.startDate,
      dueDate: data.untilPositionClosed ? null : data.dueDate,
      targetProfiles: data.targetProfiles,
      priority: data.priority,
      untilPositionClosed: data.untilPositionClosed,
      job: job._id,
      assignee: member?._id,
    };
    onSubmit(payload);
    onHide();
  };

  return (
    <Dialog
      visible={visible}
      className={styles.dialog}
      modal
      onHide={onHide}
      header={
        <div className={styles.dialogHeader}>
          <span className='w-5'>{job?.title || 'Job Title'}</span>
          <span>{`${member?.firstName || ''} ${member?.lastName || ''}` || 'Team Member'}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit(handleProceed)}>
        <div className={styles.form}>
          <div className="flex gap-4 mb-3">
            {internalTeamFields.map((item, index) => (
              <div key={item.name || index} className="flex-1">
                <DynamicFields
                  item={item}
                  control={control}
                  errors={errors}
                  disbaled={undefined}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-4 mb-3">
            <div className="flex-1">
              <label className="block mb-1">Start Date</label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <ControlledCalendar
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.value);
                      const currentDueDate = control._formValues.dueDate;
                      if (currentDueDate && e.value && new Date(currentDueDate) <= new Date(e.value)) {
                        reset({ ...control._formValues, dueDate: null });
                      }
                    }}
                    showTime
                    minDate={new Date()}
                    className="w-full"
                  />
                )}
              />
              {errors.startDate && (
                <small className="p-error block">{errors.startDate.message}</small>
              )}
            </div>

            <div className="flex-1">
              <label className="block mb-1">Due Date</label>
              <div className="flex gap-2 items-center">
                <div className="flex align-items-center">
                  <Controller
                    name="untilPositionClosed"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="untilPositionClosed"
                        tooltip='Until Position Closed'
                        tooltipOptions={{ position: 'bottom' }}
                        checked={field.value}
                        onChange={(e) => {
                          field.onChange(e.checked);
                          if (e.checked) {
                            reset({ ...control._formValues, dueDate: null });
                          }
                        }}
                      />
                    )}
                  />
                </div>
                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field }) => (
                    <ControlledCalendar
                      value={field.value}
                      onChange={(e) => {
                        const newDate = e.value;
                        if (startDate && newDate && new Date(newDate) <= new Date(startDate)) {
                          toast.error('Due date must be after start date');
                          return;
                        }
                        field.onChange(newDate);
                      }}
                      showTime
                      minDate={startDate ? new Date(startDate) : new Date()}
                      disabled={untilPositionClosed}
                      className="flex-1"
                    />
                  )}
                />
              </div>
              {errors.dueDate && (
                <small className="p-error block">{errors.dueDate.message}</small>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-content-end gap-2 p-3">
          <Button
            label="Discard"
            type="button"
            className="p-button-danger"
            onClick={() => {
              reset();
              onHide();
            }}
          />
          <Button
            type="submit"
            label="Submit"
            className="p-button-primary"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default InternalTeamDialog;
