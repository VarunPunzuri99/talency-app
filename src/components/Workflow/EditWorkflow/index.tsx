import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import styles from '@/styles/shared/Workflow/add_edit_workflow.module.scss';
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { StageType, Workflow, Stage } from '@/services/types';
import { FormError } from '@/utils/constant';
import TitleBar from '../../TitleBar';
import { createStage, createStageInWorkflow, updateStage, deleteStage, getStage, updateWorkflow, createWorkflow } from '@/services/api.service';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const stageTypeOptions = Object.keys(StageType).map(key => ({
  label: key.replace(/_/g, ' '),
  value: StageType[key as keyof typeof StageType]
}));

export default function EditWorkflow({ workflow, edit, type }) {
  const router = useRouter();
  const [creatingStages, setCreatingStages] = useState(false);
  const [, setDraggedIndex] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [jobApplicationsCount, setJobApplicationsCount] = useState(0);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const {
    reset,
    control,
    register,
    handleSubmit,
    formState: { isValid, isDirty, errors },
  } = useForm<Workflow>({
    defaultValues: {
      stages: [
        { name: 'Sourcing', type: StageType.WORKFLOW_SOURCING, sequenceNumber: 1 },
        { name: 'Screen Select', type: StageType.WORKFLOW_SCREENING, sequenceNumber: 2 }
      ]
    }
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'stages',
  });

  useEffect(() => {
    if (edit && workflow) {
      reset(workflow);
    }
  }, [edit, workflow, reset]);

  const createStages = async (stages: Stage[]) => {
    try {
      const stagePromises = stages.map(stage => createStage(stage));
      const responses = await Promise.all(stagePromises);
      return responses.map(res => res._id);
    } catch (error) {
      console.error(`Failed to create stages:  ${error.message}`);
    }
  };

  const createStagesInWorkflow = async (stages: Stage[]) => {
    try {
      const stagePromises = stages.map(stage => createStageInWorkflow(workflow._id, stage));
      const responses = await Promise.all(stagePromises);
      return responses.map(res => res._id);
    } catch (error) {
      console.error(`Failed to create stages in workflow :${error.message}`);
    }
  };

  const updateStages = async (stages: Stage[]) => {
    try {
      const stagePromises = stages.map(stage => updateStage(stage._id, stage));
      await Promise.all(stagePromises);
    } catch (error) {
      console.error(`Failed to update stage in workflow :${error.message}`);
    }
  };

  const confirmationDialog = async (stageId: string) => {
    const response = await getCurrentStage(stageId);
    setJobApplicationsCount(response.jobApplicationsCount);
    setShowDeleteDialog(true);
  };

  const deleteCurrentStage = async () => {
    try {
      if (selectedStage) {
        await deleteStage(selectedStage);
        toast.success('Stage deleted');
        setShowDeleteDialog(false); // Close dialog after deletion
        remove(fields.findIndex(field => field._id === selectedStage)); // Remove from UI
        setSelectedStage(null); // Reset selected stage
      }
    } catch (error) {
      toast.error(`Failed to delete stage in workflow :${error.message}`);
    }
  };

  const getCurrentStage = async (stageId: string) => {
    try {
      const response = await getStage(stageId);
      return response;
    } catch (error) {
      console.error(`Failed to retrive stage in workflow :${error.message}`);
      return { jobApplicationsCount: 0 }; // Fallback in case of error
    }
  };

  const onSubmit = async (data: Workflow) => {
    setCreatingStages(true);
    try {
      const existingStages = data.stages.filter(stage => stage._id);
      const newStages = data.stages.filter(stage => !stage._id);

  

      let newStageIds = [];
      if (newStages.length > 0) {
        newStageIds = await createStages(newStages);

      }

      let stagesInWorkflow = [];
      if (edit && newStages.length > 0) {
        stagesInWorkflow = await createStagesInWorkflow(newStages);
      }

      const combinedStageIds = [
        ...existingStages.map(stage => stage._id),
        ...newStageIds,
        ...stagesInWorkflow,
      ];

      const workflowData = {
        ...data,
        stages: combinedStageIds,
      };

      if (edit) {
        await updateWorkflow(workflow._id, workflowData);
      } else {
        await createWorkflow(workflowData);
      }

      if (existingStages.length > 0) {
        await updateStages(existingStages);
        toast.success('Workflow edited Succesfully')
      }
 
      router.push(router.asPath.replace('/add', '').replace(/\?id=.*$/, ''));
    } catch (error) {
      toast.error(`Failed to save WorkFlow: ${error.message}`);
    } finally {
      setCreatingStages(false);
    
    }
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    event.dataTransfer.setData('text/plain', index.toString());
    event.currentTarget.classList.add(styles.dragging);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    const fromIndex = parseInt(event.dataTransfer.getData('text/plain'));
    if (fromIndex !== index && index >= 2 && fromIndex >= 2) {
      move(fromIndex, index);
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(styles.dragging);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const cancel = () => {
    setShowDeleteDialog(false);
    setSelectedStage(null);
  };

  return (
    <>
      {/* <ToastContainer autoClose={5000} />  */}
      <TitleBar title={'Edit Workflow'} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={`grid ${styles.form}`}>
          <div className="flex flex-column gap-2 w-full px-0.5 py-0.5 mb-2">
            <div className="flex flex-column  gap-2 w-12 md:w-6">
              <label className='text-xl font-semibold'>Enter workflow name</label>
              <InputText
                id="name"
                type="text"
                {...register('name', { required: true })}
                placeholder="Enter workflow name"
              />
              {FormError(errors, 'name')}
            </div>
            {type == 'accounts' &&
              <div className="flex flex-column gap-2 w-12 md:w-6">
                <label className='text-xl font-semibold'>Enter department name</label>
                <InputText
                  id="department"
                  type="text"
                  {...register('department', { required: false })}
                  placeholder="Enter department name"
                />
                {FormError(errors, 'department')}
              </div>
            }
          </div>
          <label className='text-xl font-semibold mb-2'>Stages</label>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className={`${styles.card} ${index < 2 ? styles.fixedCard : ''}`}
              draggable={index >= 2}
              onDragStart={(event) => handleDragStart(event, index)}
              onDragOver={handleDragOver}
              onDrop={(event) => handleDrop(event, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="flex w-full justify-content-between px-3 align-content-center">
                <div className="flex align-content-center w-10">
                  <i className="pi pi-bars w-1 align-items-center mt-5 md:mt-3" style={{ cursor: 'grab', marginRight: '10px' }}></i>
                  <div className="flex flex-column md:flex-row gap-2 w-11">
                    <InputText
                      id={`stages.${index}.name`}
                      type="text"
                      maxLength={40}
                      {...register(`stages.${index}.name`, { required: true })}
                      placeholder={`Stage ${index + 1} Name`}
                      readOnly={index < 2}
                    />
                    {FormError(errors, `stages.${index}.name`)}

                    <Controller
                      name={`stages.${index}.type`}
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Dropdown
                          id={`stages.${index}.type`}
                          value={field.value}
                          options={stageTypeOptions}
                          onChange={(e) => field.onChange(e.value)}
                          placeholder="Select Stage Type"
                          className="w-full"
                          disabled={index < 2}
                        />
                      )}
                    />
                    {FormError(errors, `stages.${index}.type`)}
                  </div>
                </div>

                <i
                  className="pi pi-trash mt-5 md:mt-3"
                  style={{ color: 'red', cursor: 'pointer' }}
                  onClick={() => {
                    if (field._id) {
                      setSelectedStage(field._id);
                      confirmationDialog(field._id);
                    } else {
                      remove(index);
                    }
                  }}
                ></i>
              </div>
            </div>
          ))}

          <div className="flex gap-2 mt-3">
            <Button
              type="button"
              label="Add Stage"
              onClick={() => append({ name: '', type: StageType.NONE, sequenceNumber: fields.length + 1, jobApplicationsCount: 0 })}
            />
            <Button
              type="submit"
              disabled={!isDirty || !isValid || creatingStages}
            >
              {'Save Workflow'}
            </Button>
          </div>
        </div>
      </form>

      {showDeleteDialog && (
        <Dialog
          header="Confirm Deletion"
          visible={showDeleteDialog}
          onHide={cancel}
          style={{ width: '40vw' }}
        >
          <p>Job Applications Count is: {jobApplicationsCount ? jobApplicationsCount : 0}</p>
          <div className={styles.dialog_buttons}>
            <Button label="Cancel" onClick={cancel} className="p-button-text" />
            <Button
              label="Delete"
              onClick={deleteCurrentStage}
              style={{
                backgroundColor: jobApplicationsCount ? '#e0e0e0' : '#f44336',
                color: jobApplicationsCount ? '#9e9e9e' : 'white',
                cursor: jobApplicationsCount ? 'not-allowed' : 'pointer',
                opacity: jobApplicationsCount ? 0.8 : 1,
                border: jobApplicationsCount ? 0 : 1
              }}
              disabled={Boolean(jobApplicationsCount)}
            />
          </div>
        </Dialog>
      )}
    </>
  );
}
