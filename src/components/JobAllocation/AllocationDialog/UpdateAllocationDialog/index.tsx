// UpdateAllocationDialog.tsx
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
import {  updateAllAssignedJobAllocation, updateJobAllocation } from '@/services/api.service';


interface UpdateAllocationDialogProps {
  visible: boolean;
  onHide: () => void;
  job: any;
  baseAllocation: {
    _id: string;
    job: string;
    startDate: Date;
    targetProfiles: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    isDeleted: boolean;
    untilPositionClosed: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  };
  onSuccess?: () => void;
}

const UpdateAllocationDialog: React.FC<UpdateAllocationDialogProps> = ({
  visible,
  onHide,
  job,
  baseAllocation,
  onSuccess,
}) => {


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

  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isSingleUpdate, setIsSingleUpdate] = useState(false);

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

  // Load current allocation when dialog opens
  useEffect(() => {
    if (visible && baseAllocation) {
      reset({
        targetProfiles: baseAllocation.targetProfiles || 1,
        startDate: baseAllocation.startDate ? new Date(baseAllocation.startDate) : new Date(),
        dueDate: null, // Since untilPositionClosed is true in your data
        priority: baseAllocation.priority || 'HIGH',
        untilPositionClosed: baseAllocation.untilPositionClosed || true,
      });
      setIsSingleUpdate(false); // Reset to default state when dialog opens
    }
  }, [visible, baseAllocation, reset]);

  // Handle save for single allocation
  const handleSave = async (data) => {
    try {
      setIsSingleUpdate(true);
      const payload = {
        startDate: data.startDate,
        dueDate: data.untilPositionClosed ? null : data.dueDate,
        targetProfiles: data.targetProfiles,
        priority: data.priority,
        untilPositionClosed: data.untilPositionClosed,
        job: job._id,
        isDeleted: false,
      };

      await updateJobAllocation(baseAllocation._id, payload);
      toast.success('Job allocation saved successfully');
      onSuccess?.();
      setIsFormDirty(false);
      onHide();
    } catch (error) {
      console.error('Error saving job allocation:', error);
      toast.error('Failed to save job allocation');
    }
  };

  // Watch for start date and untilPositionClosed changes
  const startDate = watch('startDate');
  const untilPositionClosed = watch('untilPositionClosed');

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
  const handleProceed = async (data) => {
    console.log('data', data);
    try {
      // Due date validation moved to Yup schema
      const payload = {
        startDate: data.startDate,
        dueDate: data.untilPositionClosed ? null : data.dueDate, // Set dueDate to null when untilPositionClosed is true
        targetProfiles: data.targetProfiles,
        priority: data.priority,
        untilPositionClosed: data.untilPositionClosed,
        job: job._id,
      };

      await updateAllAssignedJobAllocation(job._id, payload);
      toast.success('all job allocation updated successfully');
      onSuccess?.();
      onHide();
    } catch (error) {
      console.error('Error updating job allocation:', error);
      toast.error('Failed to update job allocation');
    }
  };

  return (
    <Dialog
      visible={visible}
      className={styles.dialog}
      modal
      onHide={onHide}
      header={
        <div className={styles.dialogHeader}>
          <span className={styles.jobTitle}>{job?.title || 'Job Title'}</span>
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
                {/* Remove duplicate error messages since they're shown in DynamicFields */}
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
                          // Clear due date when checking the box
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
              setIsSingleUpdate(false);
              onHide();
            }}
          />
          <Button
            label="Save"
            type="button"
            className="p-button-secondary"
            disabled={!isFormDirty}
            onClick={handleSubmit(handleSave)}
          />
          <Button
            type="submit"
            label="Update All"
            className="p-button-primary"
            disabled={isFormDirty && isSingleUpdate}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default UpdateAllocationDialog;
