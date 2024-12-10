import React, { useEffect} from 'react';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

import { Dropdown } from 'primereact/dropdown';
import { Controller, useForm, useFieldArray } from 'react-hook-form';

const InterviewL2 = ({visible, setVisible, applicantData}) => {
    // const [visible, setVisible] = useState(false);
    console.log(applicantData)
    const { control, handleSubmit } = useForm();
    const { fields, append, remove} = useFieldArray({
        control,
        name: 'panels',
        // defaultValue: []
    });
    useEffect(() => {
        if (fields.length === 0) {
            append({ penalist: null, slots: [{ date: '', candidate: '' }] })
        }
    }, [fields.length,append])

    const panelistArray = [
        { name: 'Panelist 1' },
        { name: 'Panelist 2' },
        { name: 'Panelist 3' },
    ];
   

    const onSubmit = (data) => {
        console.log(data);
    };
    // const addSlot = (panelIndex, fields) => {
    //     update(panelIndex, { ...fields[panelIndex], slots: [...fields[panelIndex].slots, { date: '', candidate: '' }] })
    // }
    // const removeSlot = (panelIndex, slotIndex, fields) => {
    //     const slots = fields[panelIndex].slots
    //     const filteredArray = slots.filter((val, index) => index !== slotIndex)
    //     update(panelIndex, { ...fields[panelIndex], slots: [...filteredArray] })
    // }
    const headerContent = (
        <div style={{ borderBottom: '1px solid #E7E7E7' }} className="flex align-items-center justify-content-between">
            <p className="text-2xl">Interviews Planner</p>
            <Button onClick={() => setVisible(false)} style={{ scale: '.7' }} icon="pi pi-times" rounded outlined severity="danger" aria-label="Cancel" size="small" />
        </div>
    );


    return (
        <div>
            {/* <Button onClick={() => setVisible(true)} label="Interview L2" /> */}
            <Dialog
                pt={{
                    closeButtonIcon: { style: { display: 'none' } },
                    content: { style: { overflowY: 'visible' } },
                }}
                header={headerContent}
                visible={visible}
                style={{ width: '90vw' }}
                onHide={() => setVisible(false)}
            >
                <ScrollPanel pt={{ barY: { className: 'bg-primary' } }} style={{ width: '100%', height: '70vh' }} className="custombar1">
                    <form onSubmit={handleSubmit(onSubmit)} className='p-3 grid gap-4'>
                        {fields.map((panel, index) => (
                            <div key={index} className='col-12 grid p-0 surface-ground border-round-md' style={{ border: "1px solid #dadada" }} >
                                {/* Header */}
                                <div className='col-12 flex align-items-center justify-content-between  surface-300 border-round-top-md'>
                                    <div className="col-6 p-0 align-items-center flex gap-4 " >
                                        <p>Panel {index + 1} :</p>
                                        <Controller
                                            control={control}
                                            name={`panels.${index}.penalist`}
                                            defaultValue={null}
                                            render={({ field }) => (
                                                <Dropdown
                                                    value={field.value}
                                                    className='py-0 col-8  surface-200 '
                                                    options={panelistArray}
                                                    optionLabel="name"
                                                    onChange={(e) => field.onChange(e.value)}
                                                    placeholder="Select a Panelist"
                                                />
                                            )}
                                        />
                                    </div>
                                    {index > 0 && <Button icon="pi pi-trash" size='small' rounded severity="danger" onClick={() => remove(index)} aria-label="Cancel" />}
                                </div>
                                {/* Header */}
                                {/* <div className="col-12 flex flex-column px-3 gap-2">
                                    {panel?.slots?.map((slot, slotIndex) => {
                                        const newIndex = slotIndex.toString() + index
                                        return (
                                            <div key={newIndex} className="grid align-items-center">
                                                <label className='col-3' >Slot {slotIndex + 1}</label>
                                                <div className=" col-9 flex gap-1 align-items-center">
                                                    <Calendar className='col-6' {...register(`panels.${index}.slots.${slotIndex}.date`)} placeholder="Select date" showIcon />
                                                    <Controller
                                                        control={control}
                                                        name={`panels.${index}.slots.${slotIndex}.candidate`}
                                                        defaultValue={null}
                                                        render={({ field }) => (
                                                            <Dropdown
                                                                value={field.value}
                                                                options={candidateArray}
                                                                className='col-5 py-0 mr-2'
                                                                onChange={(e) => field.onChange(e.value)}
                                                                placeholder="Enter candidate name"
                                                            />
                                                        )}
                                                    />

                                                    {slotIndex === 0 ?
                                                        <i className='pi pi-plus-circle hover:text-green-400' type="button" onClick={() => addSlot(index, fields, panel)}>
                                                        </i> :
                                                        <i className='pi pi-trash hover:text-red-400 ' type="button" onClick={() => removeSlot(index, slotIndex, fields, panel)}>
                                                        </i>
                                                    }
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div> */}
                            </div>
                        ))}
                        <div className="col-12 flex justify-content-end">
                            <Button type='submit' style={{ width: "max-content", margin: "10px" }} onClick={() => append({ penalist: null, slots: [{ date: '', candidate: '' }] })} severity="success" label="Add Panel" />
                            <Button type='submit' style={{ width: "max-content", margin: "10px", background: " #31BA02", border: "1px solid #31BA02" }} severity="success" label="Submit" />
                        </div>
                    </form>
                </ScrollPanel>
            </Dialog>
        </div>
    );
};

export default InterviewL2;
