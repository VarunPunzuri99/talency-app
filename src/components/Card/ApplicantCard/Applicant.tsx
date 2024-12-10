import React, { useRef, useState } from 'react';
import styles from "./index.module.scss";
import Link from 'next/link';
import Image from 'next/image';
import { Checkbox } from 'primereact/checkbox';
import { Job, JobApplication } from '@/services/types';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import InPersonInterview from '@/components/Workflow/InPersonInterview';
import TelephonicInterview from '@/components/Workflow/TelephonicInterview';
import VideoInterview from '@/components/Workflow/VideoInterview';
import RescheduleInterview from '@/components/Workflow/InterviewReschedule';
import ComposeModal from '@/components/Modals/Compose';
import { cancelInterview, documentReminder, rejectCandidate, remindInterview, remindOfferAcceptance, candidateShowUp, offerAccepted, onBoarded  } from '@/services/api.service';
import { toast, ToastContainer } from 'react-toastify';

interface ApplicantCardProps {
    stageId: string;
    handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDrop: (e: React.DragEvent<HTMLDivElement>, jobApplications: any[], stageId: string) => void;
    handleDragStart: (e: React.DragEvent<HTMLDivElement>, type: string, data: any, stageId: string) => void;
    jobApplications: JobApplication[];
    jobInfo: Job;
    selectedApplicants: JobApplication[];
    onSelectApplicant: (applicant: JobApplication) => void;
    onDeselectApplicant: (applicant: JobApplication) => void;
    onCompare: () => void;
    // isActive: boolean;
}

const ApplicantCard = ({
    stageId, handleDragOver, handleDrop, handleDragStart, jobApplications,
    selectedApplicants, onSelectApplicant, onDeselectApplicant,
}: ApplicantCardProps) => {


    const menuRight = useRef<Menu>(null);
    const [selectedApplicant, setSelectedApplicant] = useState<JobApplication | null>(null);
    const [telePhonicVisible, setTelePhonicVisible] = useState(false);
    const [videoVisible, setVideoVisible] = useState(false);
    const [inPersonVisible, setInPersonVisible] = useState(false);
    const [reschedule, setReschedule] = useState(false);
    const [reject, setReject] = useState(false);
    const [document, setDocument] = useState(false);
    const [emailContent, setEmailContent] = useState('')
    const [cancel, setCancel] = useState(false);


    const handleRejectCandidate = async () => {
        if (!selectedApplicant) return;
        try {
            const response: any = await rejectCandidate(selectedApplicant._id)
            setEmailContent(response);
            setReject(true)
        } catch (error) {
            console.error('Error while rejecting:', error);
        }
    }

    const handleDocument = async () => {
        if (!selectedApplicant) return;
        try {
            const response: any = await documentReminder(selectedApplicant._id)
            setEmailContent(response);
            setDocument(true)
        } catch (error) {
            console.error('Failed to send document reminder:', error);
            toast.error('No offers for the candidate');
        }
    }

    const handlelShowUp = async () => {
        if (!selectedApplicant) return;
        try {
            const response: any = await candidateShowUp(selectedApplicant._id)
            if(response){
                toast.success(response.message)
            }
        } catch (error) {
            console.error('Error while candidate show-up:', error);
            toast.error(error.message)
        }
    }

    const handlelOfferAccepted = async () => {
        if (!selectedApplicant) return;
        try {
            const response: any = await offerAccepted(selectedApplicant._id)
            if(response){
                toast.success(response.message)
            }
        } catch (error) {
            console.error('Error while candidate show-up:', error);
            toast.error(error.message)
        }
    }

    const handlelOnBoarded = async () => {
        if (!selectedApplicant) return;
        try {
            const response: any = await onBoarded(selectedApplicant._id)
            toast.success("Candidate successfully marked as onboarded!");
            return response;
        } catch (error) {
            console.error('Error while candidate show-up:', error);
            // Handle the specific error response
            if (error.response?.message === "The offer must be accepted before marking as on-boarded.") {
                toast.error("Cannot onboard the candidate: Offer must be accepted first.");
            } else {
                toast.error("Failed to mark the candidate as onboarded. Please try again.");
            }
        }
    }

    // console.log(selectedApplicant)

    const handleCancelInterview = async () => {
        if (!selectedApplicant) return;
        try {
            const response = await cancelInterview(selectedApplicant._id);
            setEmailContent(response);
            setCancel(true)
        } catch (error) {
            console.error('Failed to cancel the interview:', error);
            toast.error("No interview is scheduled for the candidate")
        }
    };

    const handlelInterviewRemainder = async () => {
        if (!selectedApplicant) return;
        try {
            const response = await remindInterview(selectedApplicant._id);
            setEmailContent(response);
            setCancel(true)
        } catch (error) {
            console.error('Failed to remaind the interview:', error);
            toast.error("No interview is scheduled for the candidate")
        }
    };

    const handlelOfferAcceptanceRemainder = async () => {
        if (!selectedApplicant) return;
        try {
            const response = await remindOfferAcceptance(selectedApplicant._id);
            setEmailContent(response);
            setCancel(true)
        } catch (error) {
            console.error('Failed to remaind the interview:', error);
            toast.error("No offer letter is generated for the candidate")
        }
    };


    const checkVisibility = (label) => {
        if (label == 'Reschedule interview' || label == 'Remaind interview' || label == 'Cancel interview'  || label == 'Show Up') {
            if (jobApplications?.length > 0 && selectedApplicant?._id) {
                return jobApplications.some((item) => {
                    if (item._id === selectedApplicant._id) {
                        return item.workflow?.stages?.filter((stage) => stage._id == selectedApplicant.stage).some((stage) => stage.type === 'workflow.interview.video' || stage.type === 'workflow.interview.telephonic' || stage.type === 'workflow.interview.inperson');
                    }
                    return false;
                });
            }
        } else {
            if (jobApplications?.length > 0 && selectedApplicant?._id) {
                return jobApplications.some((item) => {
                    if (item._id === selectedApplicant._id) {
                        return item.workflow?.stages?.filter((stage) => stage._id == selectedApplicant.stage).some((stage) => stage.type === label);
                    }
                    return false;
                });
            }
        }
        return false; // Default to false if no match is found
    };


    const menuItems = [
        // {
        //     label: 'Telephonic interview',
        //     command: () => setTelePhonicVisible(true),
        //     show: () => checkVisibility('Telephonic interview')
        // },
        // {
        //     label: 'Video interview',
        //     command: () => setVideoVisible(true),
        //     show: () => checkVisibility('Video Interview')
        // },
        // {
        //     label: 'In-person interview',
        //     command: () => setInPersonVisible(true),
        //     show: () => checkVisibility('In-person interview')
        // },
        {
            label: 'Reschedule interview',
            command: () => setReschedule(true),
            show: () => checkVisibility('Reschedule interview')
        },
        {
            label: 'Cancel interview',
            command: handleCancelInterview,
            show: () => checkVisibility('Cancel interview')
        },
        {
            label: 'Remaind interview',
            command: handlelInterviewRemainder,
            show: () => checkVisibility('Remaind interview')
        },
        {
            label: 'Reject',
            command: handleRejectCandidate,
            show: () => true
        },
        {
            label: 'Offer acceptance remainder',
            command: handlelOfferAcceptanceRemainder,
            show: () => checkVisibility('workflow.offer')
        },
        {
            label: 'Document',
            command: handleDocument,
            show: () => checkVisibility('workflow.offer')
        },
        {
            label: 'OnBoarded',
            command: handlelOnBoarded,
            show: () => checkVisibility('workflow.offer')
        },
        {
            label: 'Offer Accepted',
            command: handlelOfferAccepted,
            show: () => checkVisibility('workflow.offer')
        },
        {
            label:'Show Up',
            command:handlelShowUp,
            show: () => checkVisibility('Show Up')

        }


    ]

    //   const jobPostedDays = (date?: Date) => {
    //     if (!date) return 'N/A';
    //         const today = new Date();
    //         const createdDate = new Date(date);
    //         const differenceInTime = today.getTime() - createdDate.getTime();
    //         const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
    //         return differenceInDays + " Days";
    //     };

    const calculateExperience = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date();
        const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
        return {
            totalMonths,
            years: Math.floor(totalMonths / 12),
            months: totalMonths % 12
        };
    };

    const calculateTotalExperience = (workExperience) => {
        let totalMonths = 0;
        workExperience.forEach(job => {
            const { totalMonths: jobMonths } = calculateExperience(job.jobStartDate, job.jobEndDate);
            totalMonths += jobMonths;
        });
        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;
        return `${years}y ${months}m`;
    };

    const convertToLakhs = (amount) => {
        if (amount === null || amount === undefined) return null;
        return (amount / 100000).toFixed(2); // Converting to lakhs with one decimal place
    };

    const stopBackgroundClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleCheckboxChange = (e, applicant) => {
        if (e.checked) {
            onSelectApplicant(applicant);
        } else {
            onDeselectApplicant(applicant);
        }
    };

    return (
        <>
            <ToastContainer />
            <Menu
                model={menuItems.filter((item) => item.show?.())}
                popup
                ref={menuRight}
                id="popup_menu_right"
                popupAlignment="right"
            />
            <div className={`${styles.jobapplications} `}
                onDragOver={(e) => handleDragOver(e)}
                onDrop={(e) => handleDrop(e, jobApplications, stageId)}
            >
                {jobApplications.map((data, index) => {
                    return (
                        <div draggable="true" key={index} className={styles.jobCard} onDragStart={(e) =>
                            handleDragStart(e, "candidateCard", data, stageId)}
                        >
                            <div className={styles.jobCardMain}>
                                <div className={styles.select}>
                                    <Checkbox
                                        checked={selectedApplicants.includes(data)}
                                        onChange={(e) => handleCheckboxChange(e, data)}
                                    />
                                </div>
                                <div className={styles.jobDetails}>
                                    <div className={styles.title}>
                                        <Link href={`/jobs/application/${data?._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                            <h5>{data?.firstName + " " + data?.lastName}</h5>
                                        </Link>
                                        {/* <p>{jobInfo?.hiringOrg?.title}</p> */}
                                    </div>
                                    <div className={styles.info}>
                                        <div className={styles.iconInfo}>
                                            <Image src={"/assets/icons/Briefcase Settings.svg"} height={20} width={20} alt='case' />
                                            <span>{calculateTotalExperience(data?.workExperience || "N/A")}</span>
                                        </div>
                                        <div className={styles.iconInfo}>
                                            <Image src={"/assets/icons/Cash.svg"} height={20} width={20} alt='cash' />
                                            <span>{convertToLakhs(data?.currentCTC) + "L"}</span>
                                            <span>&nbsp;-&nbsp;</span>
                                            <span>{convertToLakhs(data?.expectedCTC) + "L"}</span>
                                        </div>
                                        {/* <div className={`${styles.iconInfo} ${styles.state}`}>
                                            <Image src={"/assets/icons/Home Address.svg"} height={20} width={20} alt='address' />
                                            <span>{jobInfo?.jobLocation?.city}</span>
                                        </div> */}
                                        <div className={`${styles.iconInfo} ${styles.fullWidth}`}>
                                            <Image src={"/assets/icons/Delivery Time.svg"} height={20} width={20} alt='time' />
                                            <span>{(data?.noticePeriodDays) + " Days"}</span>
                                        </div>
                                        <div className={`${styles.iconInfo} ${styles.fullWidth}`}>
                                            <Image src={"/assets/icons/PlaceMarker.svg"} height={20} width={20} alt='location' />
                                            <span>
                                                {/* {data?.reLocation?.map((loc, index) => {
                                                return (
                                                    <span key={loc._id}>
                                                        {loc?.city }        
                                                        {index < data.reLocation.length - 1 && ", "}
                                                    </span>
                                                )
                                              })} */}
                                                {
                                                    data?.currentLocation
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    {/* <div className={styles.applicantInfo}>
                                        <div className={styles.contact}>
                                            <span>{data?.contactDetails?.contactEmail}</span>{" "}
                                            <span>{data?.contactDetails?.contactNumber}</span>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                            <div className={styles.footer}>
                                <Link href="#">
                                    <Image src={"/assets/icons/Call.svg"} height={20} width={20} alt='call' />
                                </Link>
                                <Link href="#">
                                    <Image src={"/assets/icons/Email2.svg"} height={20} width={20} alt='email' />
                                </Link>
                                <Link href="#">
                                    <Image src={"/assets/icons/Forward Arrow Fill.svg"} height={20} width={20} alt='share' />
                                </Link>
                                <Link href="#" className={styles.fullWidth}>
                                    <Image src={"/assets/icons/Comments.svg"} height={20} width={20} alt='comment' />
                                </Link>

                                {/* <Link href='#'>
                                  <i
                                    className={`pi pi-ellipsis-v ${styles.options_button}`}
                                    onClick={(event) => {
                                        stopBackgroundClick(event);
                                        setSelectedApplicant(data);
                                        menuRight.current.toggle(event);
                                    }}
                                  />
                                </Link> */}
                                <Button text
                                    icon="pi pi-ellipsis-v" rounded
                                    onClick={(event) => {
                                        stopBackgroundClick(event);
                                        setSelectedApplicant(data);
                                        menuRight.current?.toggle(event);
                                    }}
                                    aria-label="Options"
                                    style={{ fontSize: '12px', padding: '4px', paddingBottom: '4px', width: '20px', backgroundColor: 'white', color: 'black', border: '0px', height: '20px' }} // Adjust values as needed
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
            {telePhonicVisible && (
                <TelephonicInterview
                    visible={telePhonicVisible}
                    setVisible={setTelePhonicVisible}
                    applicantData={selectedApplicant}
                />
            )}
            {videoVisible && (
                <VideoInterview
                    visible={videoVisible}
                    setVisible={setVideoVisible}
                    applicantData={selectedApplicant} getStageId={undefined} fetchJobData={undefined} setOfferVisible={undefined}                />
            )}
            {inPersonVisible && (
                <InPersonInterview
                    visible={inPersonVisible}
                    setVisible={setInPersonVisible}
                    applicantData={selectedApplicant}
                />
            )}
            {reschedule && (
                <RescheduleInterview
                    visible={reschedule}
                    setVisible={setReschedule}
                    applicantData={selectedApplicant}
                />
            )}
            {selectedApplicant && selectedApplicant.contactDetails && (
                <ComposeModal
                    visible={reject}
                    setVisible={setReject}
                    emailContent={emailContent}
                    jobApplicationEmail={selectedApplicant.contactDetails.contactEmail} applicantData={undefined} getStageId={undefined} fetchJobData={undefined} setOfferVisible={undefined}                />
            )}
            {selectedApplicant && selectedApplicant.contactDetails && (
                <ComposeModal
                    visible={document}
                    setVisible={setDocument}
                    emailContent={emailContent}
                    jobApplicationEmail={selectedApplicant.contactDetails.contactEmail} applicantData={undefined} getStageId={undefined} fetchJobData={undefined} setOfferVisible={undefined}                />
            )}

            {selectedApplicant && selectedApplicant.contactDetails && (
                <ComposeModal
                    visible={cancel}
                    setVisible={setCancel}
                    emailContent={emailContent}
                    jobApplicationEmail={selectedApplicant.contactDetails.contactEmail} applicantData={undefined} getStageId={undefined} fetchJobData={undefined} setOfferVisible={undefined}                />
            )}
        </>
    );
}

export default ApplicantCard;
