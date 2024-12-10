import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Panel } from 'primereact/panel';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import api, { scheduleInterview } from '@/services/api.service';
import moment from 'moment';
import ComposeModal from '@/components/Modals/Compose';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import { BusinessUnitType, InterviewType } from '@/services/types';
import { ControlledCalendar } from '@/utils/Calander';

const InPersonInterview = ({ visible, setVisible, applicantData }) => {
    const { handleSubmit, control } = useForm({
        defaultValues: {
            jobApplication: applicantData?._id || '',
            interviewDate: null,
            technicalPanel: [],
            screeningType: InterviewType.IN_PERSON_SCREENING,
            spoc: '',
            spocPhoneNumber: '',
            companyAddress: '',
        },
    });
    const [emailVisible, setEmailVisible] = useState(false);
    const [emailContent, setEmailContent] = useState('');
    const [personsList, setPersonsList] = useState(null);
    const [technicalPanelEmails, setTechnicalPanelEmails] = useState([]);

    useEffect(() => {
        if (visible) {
            fetchPanelMembers();
        }
    }, [visible]);

    const fetchPanelMembers = async () => {
        try {
            const panelMembers = await api.getUsersByBusinessUnitType({ type: BusinessUnitType.TECHNICAL })
            // console.log(panelMembers)
            setPersonsList(panelMembers);
        } catch (error) {
            console.error('Error fetching panel members:', error);
        }
    };

    const onSubmit = async (data) => {
        try {
            // Extract only the `id` from the `technicalPanel`
            const formattedData = {
                ...data,
                interviewDate: moment(data.interviewDate).toISOString(),
            };

            const selectedEmails = personsList.map(person => person.email);

            setTechnicalPanelEmails(selectedEmails);

            const response = await scheduleInterview(formattedData);
            console.log(response);
            setEmailContent(response);
            setEmailVisible(true);
        } catch (error) {
            console.error('Error scheduling interview:', error);
        }
    };

    const headerContent = (
        <div style={{ borderBottom: "1px solid #E7E7E7" }} className='flex align-items-center justify-content-between'>
            <p className='text-2xl'>Schedule In person Interview</p>
            <div className="flex align-items-center justify-content-between gap-4">
                <div className="flex align-items-center gap-2">
                    <p className='text-base'>{`${applicantData?.firstName || ''} ${applicantData?.lastName || ''}`}</p>
                </div>
                <Button onClick={() => setVisible(false)} style={{ scale: ".7" }} icon="pi pi-times" rounded outlined severity="danger" aria-label="Cancel" size="small" />
            </div>
        </div>
    );

    return (
        <div>
            <Dialog
                pt={{ closeButtonIcon: { style: { display: 'none' } }, content: { style: { overflowY: "visible" } } }}
                header={headerContent}
                visible={visible}
                style={{ width: '90vw' }}
                onHide={() => setVisible(false)}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid">
                        <div className="col-8">
                            <ScrollPanel pt={{ barY: { className: 'bg-primary' } }} style={{ width: '100%', height: '70vh' }} className="custombar1">
                                <Panel style={{ marginBottom: "20px" }} header="Interview Details">
                                    <div className="flex flex-column gap-6">
                                        {/* Interview Date */}
                                        <div className='flex align-items-center'>
                                            <label className='col-4' htmlFor="interviewDate">
                                                Select Date & Time: <span className="text-red-500"> *</span>
                                            </label>
                                            <Controller
                                                name="interviewDate"
                                                control={control}
                                                rules={{ required: "Date & Time is required" }}
                                                render={({ field, fieldState: { error } }) => (
                                                    <>
                                                        <ControlledCalendar
                                                            className='col-4 p-0 mr-1'
                                                            placeholder={(new Date()).toDateString()}
                                                            showIcon
                                                            minDate={new Date()} // Sets the minimum date to today
                                                            maxDate={new Date(new Date().getFullYear() + 1, 11, 31)}
                                                            value={field.value ? new Date(field.value) : null}
                                                            onChange={(e) => field.onChange(e.value ? moment(e.value).toISOString() : null)}
                                                            showTime={true}
                                                        />
                                                        {error && <small className="p-error">{error.message}</small>}
                                                    </>
                                                )}
                                            />
                                        </div>

                                        {/* Technical Panel */}
                                        <div className='grid align-items-center'>
                                            <label className='col-4'>Technical Panel: <span className="text-red-500"> *</span></label>
                                            <Controller
                                                name="technicalPanel"
                                                control={control}
                                                rules={{ required: "Select at least one panel member" }}
                                                render={({ field, fieldState: { error } }) => (
                                                    <div>
                                                        <MultiSelect
                                                            value={field.value || []}
                                                            options={personsList}
                                                            optionValue="_id" // Use `id` as the value
                                                            optionLabel="lastName" // Display `name` in the dropdown
                                                            placeholder="Select Panel Members"
                                                            onChange={(e) => field.onChange(e.value)}
                                                            filter
                                                            className="w-full"
                                                        />
                                                        {error && <small className="p-error">{error.message}</small>}
                                                    </div>
                                                )}
                                            />
                                        </div>

                                        {/* SPOC */}
                                        <Divider align="center" />
                                        <div className='grid align-items-center'>
                                            <label className='col-4' htmlFor="spoc">
                                                SPOC: <span className="text-red-500"> *</span>
                                            </label>
                                            <Controller
                                                name="spoc"
                                                control={control}
                                                rules={{ required: "SPOC is required" }}
                                                render={({ field, fieldState: { error } }) => (
                                                    <>
                                                        <InputText
                                                            className='col-8'
                                                            placeholder='Enter SPOC name'
                                                            {...field}
                                                        />
                                                        {error && <small className="p-error">{error.message}</small>}
                                                    </>
                                                )}
                                            />
                                        </div>

                                        {/* SPOC Phone Number */}
                                        <div className='grid align-items-center'>
                                            <label className='col-4' htmlFor="spocPhoneNumber">
                                                SPOC Phone Number: <span className="text-red-500"> *</span>
                                            </label>
                                            <Controller
                                                name="spocPhoneNumber"
                                                control={control}
                                                rules={{
                                                    required: "SPOC phone number is required",
                                                    pattern: {
                                                        value: /^[0-9]{10,15}$/,
                                                        message: "Enter a valid phone number"
                                                    }
                                                }}
                                                render={({ field, fieldState: { error } }) => (
                                                    <>
                                                        <InputText
                                                            className='col-8'
                                                            placeholder='Enter phone number'
                                                            {...field}
                                                        />
                                                        {error && <small className="p-error">{error.message}</small>}
                                                    </>
                                                )}
                                            />
                                        </div>

                                        {/* Company Address */}
                                        <div className='grid align-items-center'>
                                            <label className='col-4' htmlFor="companyAddress">
                                                Company Address: <span className="text-red-500"> *</span>
                                            </label>
                                            <Controller
                                                name="companyAddress"
                                                control={control}
                                                rules={{ required: "Company address is required" }}
                                                render={({ field, fieldState: { error } }) => (
                                                    <>
                                                        <InputText
                                                            className='col-8'
                                                            placeholder='Enter company address'
                                                            {...field}
                                                        />
                                                        {error && <small className="p-error">{error.message}</small>}
                                                    </>
                                                )}
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex justify-content-end">
                                            <Button
                                                type='submit'
                                                style={{ background: "#31BA02", border: "1px solid #31BA02" }}
                                                severity="success"
                                                label="Schedule"
                                            />
                                        </div>
                                    </div>
                                </Panel>
                            </ScrollPanel>
                        </div>
                        <div className="col-4">
                            {/* <ChatBox /> */}
                        </div>
                    </div>
                </form>
            </Dialog>
            <ComposeModal visible={emailVisible} setVisible={setEmailVisible} emailContent={emailContent} jobApplicationEmail={applicantData?.contactDetails?.contactEmail} technicalPanelEmails={technicalPanelEmails} applicantData={undefined} getStageId={undefined} fetchJobData={undefined} setOfferVisible={undefined}/>
        </div>
    );
};

export default InPersonInterview;
