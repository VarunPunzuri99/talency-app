import { Panel } from 'primereact/panel';
import React, { useState, useEffect, useRef } from 'react';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useForm } from 'react-hook-form';
import { scheduleAssessment } from '@/services/api.service';
import { toast } from "react-toastify";
// import { Avatar } from 'primereact/avatar';
import { Calendar } from 'primereact/calendar';
import ComposeModal from '@/components/Modals/Compose';

const Assessment = ({ visible, setVisible, applicantData, getStageId, fetchJobData, setOfferVisible }) => {
    // const fileUploadRef = useRef(null);
    // const [, setFileIds] = useState([]);
    // const [, setFilesStatus] = useState({});
    const [emailVisible, setEmailVisible] = useState(false);
    const [emailConetnt, setEmailContent] = useState('');
    const calendarRef = useRef<Calendar>(null);

    const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm({
        defaultValues: {
            jobApplication: applicantData?._id || "",
            dueDate: null,
            assessmentLink: '',
            assessmentFiles: [],
            isAssessmentCompleted: false
        }
    });

    useEffect(() => {
        if (applicantData?._id) {
            setValue("jobApplication", applicantData._id);
        }
    }, [applicantData, setValue]);

    // const customUploadHandler = async ({ files }) => {
    //     const fileStatus = {};
    //     try {
    //         const response = await ApiCall.uploadFiles(files);
    //         const uploadedFiles = response.map(file => {
    //             fileStatus[file.uniqueName] = 'Uploaded';
    //             return {
    //                 ...file,
    //                 name: file.originalName,
    //                 size: file.fileSize,
    //                 status: 'Uploaded'
    //             };
    //         });
    //         const uploadedFileIds = response;
    //         setFileIds(uploadedFileIds);
    //         setValue("assessmentFiles", uploadedFileIds);

    //         setFilesStatus(fileStatus);

    //         if (fileUploadRef.current) {
    //             fileUploadRef.current.clear();
    //             fileUploadRef.current.setUploadedFiles(uploadedFiles);
    //         }

    //     } catch (error) {
    //         console.error('Error during file upload:', error);
    //         files.forEach(file => {
    //             fileStatus[file.uniqueName] = 'Failed';
    //         });
    //         setFilesStatus(fileStatus);
    //     }
    // };

    const onSubmit = async (data) => {
        console.log('form data', data);
        try {
            const response = await scheduleAssessment(data);
            console.log(response);
            setEmailContent(response)
            setEmailVisible(true)
            // toast.success('Scheduled assessment');
        } catch (error) {
            toast.error(`Failed to schedule assessment: ${error.message}`);
        }
    };

    const headerContent = (
        <div style={{ borderBottom: "1px solid #E7E7E7" }} className='flex align-items-center justify-content-between'>
            <p className='text-2xl'> Assessment</p>
            <div className="flex align-items-center justify-content-between gap-4">
                <div className="flex align-items-center gap-2">
                    {/* <Avatar image="assets/images/my.png" size="large" shape="circle" pt={{ image: { style: { objectFit: "cover" } } }} /> */}
                    <p className='text-base'>{applicantData?.firstName + " " + applicantData?.lastName}</p>
                </div>
                <Button onClick={() => setVisible(false)} style={{ scale: ".7" }} icon="pi pi-times" rounded outlined severity="danger" aria-label="Cancel" size="small" />
            </div>
        </div>
    );
    const dueDate = watch("dueDate");

    const footerTemplate = () => (
        <div className="flex justify-end w-full">
            <Button
                label="OK"
                onClick={() => {
                    // Close the calendar overlay
                    if (calendarRef.current) {
                        calendarRef.current.hide();
                    }
                }}
            />
        </div>
    );

    return (
        <div>
            <Dialog pt={{
                closeButtonIcon: { style: { display: 'none' } }, content: { style: { overflowY: "visible" } }
            }} header={headerContent} visible={visible} style={{ width: '90vw' }} onHide={() => setVisible(false)}>
                <div className="grid">
                    <div className="col-8">
                        <ScrollPanel pt={{
                            barY: { className: 'bg-primary' }
                        }} style={{ width: '100%', height: '70vh' }} className="custombar1">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <Panel style={{ marginBottom: "20px" }} header="Email Assessment">
                                    <div className="flex flex-column gap-6">
                                        <div className='grid align-items-center'>
                                            <label className='col-4' htmlFor="dueDate">
                                                Assessment due date:
                                                {/* <span className="text-red-500"> *</span> */}
                                            </label>
                                            <Calendar
                                                {...register("dueDate", { required: "Date of Joining is required" })}
                                                showIcon
                                                className="col-4 p-0 mr-1"
                                                value={dueDate || null}
                                                onChange={(e) => setValue("dueDate", e.value)}
                                                minDate={new Date()} // Sets the minimum date to today
                                                maxDate={new Date(new Date().getFullYear() + 1, 11, 31)}
                                                showTime={true}
                                                ref={calendarRef}
                                                footerTemplate={footerTemplate}
                                            />
                                            {errors.dueDate && <p className="text-danger">Assessment due date is required</p>}
                                        </div>
                                        <div className='grid'>
                                            <label className='col-4' htmlFor="assessmentLink">
                                                Assessment link :
                                            </label>
                                            <InputText {...register("assessmentLink", { required: true })} style={{ resize: "vertical" }} className='col-8' />
                                            {errors.assessmentLink && <p className="text-danger">Assessment link is required</p>}
                                        </div>
                                    </div>
                                </Panel>
                                {/* <Panel style={{ marginBottom: "20px" }} header="Upload Assessment Documents">
                                    <div className='grid align-items-center'>
                                        <FileUpload
                                            style={{ flexBasis: "100%" }}
                                            className='mr-2'
                                            ref={fileUploadRef}
                                            name="files"
                                            customUpload
                                            uploadHandler={customUploadHandler}
                                            multiple
                                            accept="image/*,application/pdf,.msword,.vnd.openxmlformats-officedocument.wordprocessingml.document,.vnd.ms-excel,.vnd.openxmlformats-officedocument.spreadsheetml.sheet,.plain,.json,.webp,.webm,.wmv,.mp4,.avi,.mov,.mkv,.ppt,.pptx,.csv"
                                            maxFileSize={10000000} // 10MB limit
                                            emptyTemplate={<p className="m-0">Drag and drop files here to upload.</p>}
                                            {...register("assessmentFiles")}
                                        />
                                        {errors.assessmentFiles && <p className="text-danger">Please upload at least one file.</p>}
                                    </div>
                                </Panel> */}
                                <div className="flex justify-content-end">
                                    <Button type='submit' style={{ background: "#31BA02", border: "1px solid #31BA02" }} severity="success" label="Submit Assessment" />
                                </div>
                            </form>
                        </ScrollPanel>
                    </div>
                    <div className="col-4">
                        {/* <ChatBox /> */}
                    </div>
                </div>
            </Dialog>
            <ComposeModal visible={emailVisible} setVisible={setEmailVisible} emailContent={emailConetnt} jobApplicationEmail={applicantData?.contactDetails?.contactEmail} applicantData={applicantData} getStageId={getStageId} fetchJobData={fetchJobData} setOfferVisible={setOfferVisible}  />
        </div>
    );
};

export default Assessment;
