import { Dialog } from 'primereact/dialog';
import { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { StageType } from '@/services/types';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { tryCatch } from '@/hooks/tryCatch';
import { createStageInWorkflow } from '@/services/api.service';
import {  toast } from 'react-toastify';
import { useRouter } from 'next/router';

export default function StageModal({ workflow, visible, setVisible, StagTypeEnum}) {
    const router = useRouter();
    const [stageName, setStageName] = useState<string>('');
    const [selectedStageType, setSelectedStageType] = useState<StageType>(StageType.NONE);
    const stageTypeEnum = Array.isArray(StagTypeEnum) ? StagTypeEnum : [];
    if(!workflow) return <div>No data</div>
    const addStage = async () => {
      tryCatch(async () => {
        const body = {
          "name": stageName,
          "type": selectedStageType
        }
        try {
          const updatedWorkflow = await createStageInWorkflow(workflow?._id, body);
          console.log(updatedWorkflow)
          toast.success(`Stage created in workflow.`)
          setVisible(false);
        } catch (error) {
          toast.error(`Error while creating stage: ${error?.message}`)
          setVisible(false);
        }
      })
      setTimeout(() => {
        router.reload();
      }, 2000);
    }

    return (
        <>
             <Dialog
                header="Add Stage"
                visible={visible}
                // position={'bottom-right'}
                style={{ width: '40vw' }}
                onHide={() => setVisible(false)}
                draggable={false}
                resizable={false}
                // maximizable
                className=""
              >
                <div className='flex flex-column gap-1 mb-2'>
                  <label>Stage Name</label>
                  <InputText
                    id="name"
                    type="text"
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="Enter stage name"
                  />
              </div>
              <div className='flex flex-column gap-1'>
                <label>Stage Type</label>
                <Dropdown
                    value={selectedStageType}
                    onChange={(e) => setSelectedStageType(e.value)}
                    options={stageTypeEnum}
                    placeholder="Select to assign the contact to account manager"
                />
              </div>
              <div className='mt-2'>
                <Button label="Add Stage" onClick={() => addStage()} />
              </div>
            </Dialog>
        </>
    );
}
