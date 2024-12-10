import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Panel } from 'primereact/panel';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Avatar } from 'primereact/avatar';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { RadioButton } from 'primereact/radiobutton';
import { Divider } from 'primereact/divider';
import Image from 'next/image';
import ChatBox from '../../Modals/Chatbox';
import { getAllUsers, scheduleInterview } from '@/services/api.service';
import moment from 'moment';
import { Platform, ScreeningType } from '@/services/types';  // Importing both Platform and ScreeningType enums

const InterviewL1 = ({ visible, setVisible, applicantData }) => {
    const { register, handleSubmit, control, setValue, watch } = useForm();
    const [personsList, setPersonsList] = useState([]);
    const [datetime12h, setDateTime12h] = useState(null);

    useEffect(() => {
        if (visible && personsList.length === 0) {
            fetchPanelMembers();
        }
    }, [visible, personsList.length]);

    const fetchPanelMembers = async () => {
        try {
            const panelMembers = await getAllUsers();
            console.log(panelMembers)
            setPersonsList(panelMembers.map(member => ({ name: member.fullName, id: member._id})));
        } catch (error) {
            console.error('Error fetching panel members:', error);
        }
    };

    const onSubmit = async (data) => {
        console.log(data);  
        try {
            const interviewDate = moment(data.interviewDate).toISOString();
            console.log(interviewDate)
            data['interviewDate'] = interviewDate;
            data['jobApplication'] = applicantData?._id;
            data['technicalPanel'] = data.technicalPanel.map(member => member.id);
            
            await scheduleInterview(data);
            console.log('Interview scheduled successfully');
        } catch (error) {
            console.error('Error scheduling interview:', error);
        }
    };

    const headerContent = (
        <div style={{ borderBottom: "1px solid #E7E7E7" }} className='flex align-items-center justify-content-between'>
            <p className='text-2xl'>Interview Details</p>
            <div className="flex align-items-center justify-content-between gap-4">
                <div className="flex align-items-center gap-2">
                    <Avatar image="assets/images/my.png" size="large" shape="circle" pt={{ image: { style: { objectFit: "cover" } } }} />
                    <p className='text-base'>{`${applicantData?.firstName || ''} ${applicantData?.lastName || ''}`}</p>
                </div>
                <Button onClick={() => setVisible(false)} style={{ scale: ".7" }} icon="pi pi-times" rounded outlined severity="danger" aria-label="Cancel" size="small" />
            </div>
        </div>
    );

    return (
        <div>
            <Dialog pt={{
                closeButtonIcon: { style: { display: 'none' } }, content: { style: { overflowY: "visible" } }
            }} header={headerContent} visible={visible} style={{ width: '90vw' }} onHide={() => setVisible(false)}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid">
                        <div className="col-8">
                            <ScrollPanel pt={{
                                barY: { className: 'bg-primary' }
                            }} style={{ width: '100%', height: '70vh' }} className="custombar1">
                                <Panel style={{ marginBottom: "20px" }} header="Interview Details">
                                    <div className="flex flex-column gap-6">
                                        <div className='flex align-items-center'>
                                            <label >
                                                Select Date & Time :
                                            </label>
                                            <Controller
                                              name="interviewDate"
                                              control={control}
                                              rules={{ required: "Date & Time is required" }}
                                              render={({ field, fieldState: { error } }) => (
                                                  <>
                                                    <Calendar
                                                        showTime
                                                        showIcon
                                                        className={`w-full ${error ? 'p-invalid' : ''}`}
                                                        value={field.value || datetime12h}
                                                        onChange={(e) => {
                                                            setDateTime12h(e.value);
                                                            field.onChange(e.value);
                                                        }}
                                                        hourFormat="12"
                                                    />
                                                    {error && <small className="p-error">{error.message}</small>}
                                                  </>
                                              )}
                                            />
                                        </div>
                                        <div className='grid align-items-center'>
                                            <label className='col-4' htmlFor="technicalPanel">
                                                Technical Panel :
                                            </label>
                                            <MultiSelect
                                                value={watch('technicalPanel')}
                                                onChange={(e) => setValue('technicalPanel', e.value)}
                                                options={personsList}
                                                optionLabel="name"
                                                placeholder="Select Persons"
                                                className="col-8 p-1"
                                                {...register('technicalPanel')}
                                            />
                                        </div>
                                        <div className='grid align-items-center'>
                                            <label className='col-4' htmlFor="other">
                                                Other :
                                            </label>
                                            <InputText
                                                className='col-8'
                                                placeholder='Add email addresses'
                                                {...register('other')}
                                            />
                                        </div>
                                        <div className='grid align-items-center'>
                                            <label className='col-4' htmlFor="screeningType">
                                                Screening Type :
                                            </label>
                                            <div className="col-8 flex flex-wrap gap-3">
                                                <div className="flex align-items-center">
                                                    <RadioButton
                                                        inputId={ScreeningType.PhoneScreening}
                                                        name="screeningType"
                                                        value={ScreeningType.PhoneScreening}
                                                        checked={watch('screeningType') === ScreeningType.PhoneScreening}
                                                        onChange={(e) => setValue('screeningType', e.value)}
                                                    />
                                                    <label htmlFor={ScreeningType.PhoneScreening} className="ml-2">Phone Screening</label>
                                                </div>
                                                <div className="flex align-items-center">
                                                    <RadioButton
                                                        inputId={ScreeningType.VideoScreening}
                                                        name="screeningType"
                                                        value={ScreeningType.VideoScreening}
                                                        checked={watch('screeningType') === ScreeningType.VideoScreening}
                                                        onChange={(e) => setValue('screeningType', e.value)}
                                                    />
                                                    <label htmlFor={ScreeningType.VideoScreening} className="ml-2">Video Screening</label>
                                                </div>
                                            </div>
                                        </div>
                                        <Divider />
                                        <div className='grid align-items-center'>
                                            <label className='col-4' htmlFor="platform">
                                                Select a Platform :
                                            </label>
                                            <div className="col-8 flex flex-wrap gap-6">
                                                <div className="flex align-items-center gap-3">
                                                    <RadioButton
                                                        inputId={Platform.ZoomMeet}
                                                        name="platform"
                                                        value={Platform.ZoomMeet}
                                                        checked={watch('platform') === Platform.ZoomMeet}
                                                        onChange={(e) => setValue('platform', e.value)}
                                                    />
                                                    <Image style={{ backgroundColor: "#D9D9D9", padding: "10px", borderRadius: "5px", objectFit: "contain" }} height={40} width={100} src={"/assets/Settings/zoom.png"} alt='zoom' />
                                                </div>
                                                <div className="flex align-items-center gap-3">
                                                    <RadioButton
                                                        inputId={Platform.GoogleMeet}
                                                        name="platform"
                                                        value={Platform.GoogleMeet}
                                                        checked={watch('platform') === Platform.GoogleMeet}
                                                        onChange={(e) => setValue('platform', e.value)}
                                                    />
                                                    <Image style={{ backgroundColor: "#D9D9D9", padding: "10px", borderRadius: "5px", objectFit: "contain" }} height={40} width={100} src={"/assets/Settings/google_meet.png"} alt='google_meet' />
                                                </div>
                                                <div className="flex align-items-center gap-3">
                                                    <RadioButton
                                                        inputId={Platform.MicrosoftTeams}
                                                        name="platform"
                                                        value={Platform.MicrosoftTeams}
                                                        checked={watch('platform') === Platform.MicrosoftTeams}
                                                        onChange={(e) => setValue('platform', e.value)}
                                                    />
                                                    <Image style={{ backgroundColor: "#D9D9D9", padding: "10px", borderRadius: "5px", objectFit: "contain" }} height={40} width={100} src={"/assets/Settings/microsoft_teams.png"} alt='microsoft_teams' />
                                                </div>
                                            </div>
                                        </div>
                                        <Divider align="center">
                                            <span>OR</span>
                                        </Divider>
                                        <div className='grid align-items-center'>
                                            <label className='col-4' htmlFor="meeting_URL">
                                                Enter meeting URL :
                                            </label>
                                            <InputText
                                                className='col-8'
                                                placeholder='https://....'
                                                {...register('meetingURL')}
                                            />
                                        </div>
                                        <div className='grid align-items-center'>
                                            <label className='col-4' htmlFor="meeting_ID">
                                                Meeting ID :
                                            </label>
                                            <InputText
                                                className='col-8'
                                                placeholder='ID....'
                                                {...register('meetingID')}
                                            />
                                        </div>
                                        <div className='grid align-items-center'>
                                            <label className='col-4' htmlFor="meeting_Code">
                                                Code :
                                            </label>
                                            <InputText
                                                className='col-8'
                                                placeholder='Code ....'
                                                {...register('meetingCode', {
                                                  required: "Meeting Code is required",
                                                  valueAsNumber: true, // Converts the input value to a number
                                                  // min: { value: 0, message: "Meeting Code must be a positive number" }, // Define other constraints as needed
                                                  // max: { value: 999999, message: "Meeting Code must be less than 1,000,000" } // Define max value or other constraints
                                              })}
                                            />
                                        </div>
                                        <div className="flex justify-content-end">
                                            <Button type='submit' style={{ background: "#31BA02", border: "1px solid #31BA02" }} severity="success" label="Schedule" />
                                        </div>
                                    </div>
                                </Panel>
                            </ScrollPanel>
                        </div>
                        <div className="col-4">
                            <ChatBox />
                        </div>
                    </div>
                </form>
            </Dialog>
        </div>
    );
};

export default InterviewL1;
