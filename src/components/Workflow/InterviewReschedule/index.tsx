import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Panel } from 'primereact/panel';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import moment from 'moment';
import ComposeModal from '@/components/Modals/Compose';
import { scheduleInterview } from '@/services/api.service';
import { InterviewType } from '@/services/types';

const RescheduleInterview = ({ visible, setVisible, applicantData }) => {
    const { handleSubmit, control } = useForm({
        defaultValues: {
            jobApplication: applicantData?._id || '',
            interviewDate: null,
            screeningType: InterviewType.VIDEO_SCREENING,
            isRescheduled: true,
        },
    });

    const [emailVisible, setEmailVisible] = useState(false);
    const [emailContent, setEmailContent] = useState('');

    const onSubmit = async (data) => {
        try {
            const formattedData = {
                ...data,
                newInterviewDate: moment(data.newInterviewDate).toISOString(),
            };

            const response = await scheduleInterview(formattedData);
            console.log(response);
            setEmailContent(response);
            setEmailVisible(true);
        } catch (error) {
            console.error('Error rescheduling interview:', error);
        }
    };

    const headerContent = (
        <div style={{ borderBottom: '1px solid #E7E7E7' }} className="flex align-items-center justify-content-between">
            <p className="text-2xl">Reschedule Interview</p>
            <div className="flex align-items-center gap-4">
                <p className="text-base">{`${applicantData?.firstName || ''} ${applicantData?.lastName || ''}`}</p>
                <Button
                    onClick={() => setVisible(false)}
                    style={{ scale: '.7' }}
                    icon="pi pi-times"
                    rounded
                    outlined
                    severity="danger"
                    size="small"
                />
            </div>
        </div>
    );

    return (
        <div>
            <Dialog
                pt={{ closeButtonIcon: { style: { display: 'none' } }, content: { style: { overflowY: 'visible' } } }}
                header={headerContent}
                visible={visible}
                style={{ width: '50vw' }}
                onHide={() => setVisible(false)}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ScrollPanel pt={{ barY: { className: 'bg-primary' } }} style={{ width: '100%', height: '50vh' }}>
                        <Panel header="Reschedule Details">
                            <div className="flex flex-column gap-6">
                                {/* New Interview Date */}
                                <div className="flex align-items-center">
                                    <label className="col-4">
                                        Select New Date & Time: <span className="text-red-500"> *</span>
                                    </label>
                                    <Controller
                                        name="interviewDate"
                                        control={control}
                                        rules={{ required: 'Date & Time is required' }}
                                        render={({ field, fieldState: { error } }) => (
                                            <>
                                                <Calendar
                                                    value={field.value}
                                                    placeholder="Select New Date & Time"
                                                    showIcon
                                                    minDate={new Date()} // Minimum date is today
                                                    maxDate={new Date(new Date().getFullYear() + 1, 11, 31)} // Maximum date is one year ahead
                                                    onChange={(e) => field.onChange(e.value)}
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
                </form>
            </Dialog>
            <ComposeModal
                visible={emailVisible}
                setVisible={setEmailVisible}
                emailContent={emailContent}
                jobApplicationEmail={applicantData?.contactDetails?.contactEmail} applicantData={undefined} getStageId={undefined} fetchJobData={undefined} setOfferVisible={undefined}            />
        </div>
    );
};

export default RescheduleInterview;
