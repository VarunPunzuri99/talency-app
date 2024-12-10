import { Panel } from 'primereact/panel'
import React, { useState, useEffect } from 'react'
import { ScrollPanel } from 'primereact/scrollpanel'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Avatar } from 'primereact/avatar'
// import { Slider } from 'primereact/slider'
import ChatBox from '../../Modals/Chatbox'
import { getFileMetadataById, rejectCandidateFromWorkflow, updateJobApplication } from '@/services/api.service'
import { Divider } from 'primereact/divider'
import styles from '@/styles/shared/slider.module.scss';
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider'


const ScreenSelect = ({ visible, setVisible, applicantData }) => {
  console.log(applicantData)
    const [communicationSkill, setCommunicationSkill] = useState(0);
    const [resumeContent, setResumeContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [bgvVerified, setBgvVerified] = useState(false);

    const convertToLakhs = (amount) => {
      if (amount === null || amount === undefined) return null;
      return (amount / 100000).toFixed(2); // Converting to lakhs with one decimal place
    };
  
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

    useEffect(() => {
        if (applicantData?.resumeMetadata) {
            fetchResume(applicantData.resumeMetadata);
        }
    }, [applicantData]);

    const fetchResume = async (fileId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getFileMetadataById(fileId); // Assume this function is defined elsewhere
            setResumeContent(response);
        } catch (error) {
            setError('Error fetching resume');
            console.error('Error fetching resume:', error);
        } finally {
            setLoading(false);
        }
    };

   
    const handleSelection = async (isSelected) => {
      const payload = {
          communicationSkillRating: communicationSkill,
          bgvVerified: bgvVerified,
          isScreenSelected: isSelected ? true : false,
          isRejected: isSelected ? false : true,
      };

      try {
          const response = await updateJobApplication(applicantData?._id, payload);
          console.log('Response from backend:', response);
          setVisible(false); // Close the dialog after successful submission
      } catch (error) {
          console.error('Error submitting selection:', error);
          setError('Failed to submit selection');
      }
  };
  
  const handleRejection = async (isRejected) => {
    try {
        const response = await rejectCandidateFromWorkflow(applicantData?._id, isRejected);
        console.log('Response from backend:', response);
        setVisible(false); // Close the dialog after successful submission
    } catch (error) {
        console.error('Error submitting selection:', error);
        setError('Failed to submit selection');
    }
  };
  

    const preliminaryChecks = [
        { label: "Notice Period :", value: `${applicantData?.noticePeriodDays || 'N/A'} Days` },
        { label: "Experience :", value: `${calculateTotalExperience(applicantData?.workExperience || "N/A")}` },
        { label: "Current CTC :", value: `${convertToLakhs(applicantData?.currentCTC) || 'N/A'} Lakhs` },
        { label: "Expected CTC :", value: `${convertToLakhs(applicantData?.expectedCTC) || 'N/A'} Lakhs` },
        { label: "Location :", value: applicantData?.currentLocation || 'N/A' },
    ];

    const backgroundCheck = [
        { label: "Current Payroll Company :", value: (applicantData.workExperience.find(job => job.currentlyWorking)?.companyName) || 'N/A'},
        { label: "LinkedIn URL :", value: applicantData?.linkedInUrl || 'N/A' },
        { label: "No of Employees :", value: "1-20 Employees" }, // TODO
    ];

    const primarySkills = applicantData?.evaluationForm?.filter(skill => skill.isPrimary) || [];
    const secondarySkills = applicantData?.evaluationForm?.filter(skill => !skill.isPrimary) || [];

    const headerContent = (
        <div style={{ borderBottom: "1px solid #E7E7E7" }} className='flex align-items-center justify-content-between'>
            <p className='text-2xl'> Select Screen</p>
            <div className="flex align-items-center justify-content-between gap-4">
                <Button style={{ padding: "8px 25px" }} label='Reject' severity='danger' onClick={() => handleRejection(true)}/>
                <Button style={{ padding: "8px 25px", background: "#22c55e", border: "1px solid #22c55e" }} label='Select' severity="success" onClick={() => handleSelection(true)}/>
                <div className="flex align-items-center gap-2">
                    <Avatar image="assets/images/my.png" size="large" shape="circle" pt={{ image: { style: { objectFit: "cover" } } }} />
                    <p className='text-base'>{`${applicantData?.firstName || ''} ${applicantData?.lastName || ''}`}</p>
                </div>
                <Button onClick={() => setVisible(false)} style={{ scale: ".7" }} icon="pi pi-times" rounded outlined severity="danger" aria-label="Cancel" size="small" />
            </div>
        </div>
    );

    const formatFileSize = (size) => {
      if (size < 1024) return size + ' bytes';
      else if (size < 1048576) return (size / 1024).toFixed(2) + ' KB';
      else if (size < 1073741824) return (size / 1048576).toFixed(2) + ' MB';
      else return (size / 1073741824).toFixed(2) + ' GB';
    };

    return (
        <div>
            {/* <Button onClick={() => setVisible(true)} label='Screen Select' /> */}
            <Dialog pt={{
                closeButtonIcon: { style: { display: 'none' } }, content: { style: { overflowY: "visible" } }
            }} header={headerContent} visible={visible} style={{ width: '90vw' }} onHide={() => setVisible(false)}>
                <div className="grid">
                    <div className="col-8">
                        <ScrollPanel pt={{
                            barY: {
                                className: 'bg-primary'
                            }
                        }} style={{ width: '100%', height: '70vh' }} className="custombar1">
                            <Panel style={{ marginBottom: "20px" }} header="Preliminary Checks">
                                <div className="flex flex-column gap-4">
                                    {preliminaryChecks.map((item, i) =>
                                        <div className='grid' key={i}>
                                            <label className='col-4' htmlFor={item.label}>
                                                {item.label}
                                            </label>
                                            <InputText className='col-8' id={item.label} placeholder={item.value} disabled value={item.value} />
                                        </div>
                                    )}
                                </div>
                            </Panel>
                            <Panel style={{ marginBottom: "20px" }} header="Background Check">
                                <div className='grid mb-4 align-items-center justify-content-between'>
                                    <label className='col-4'>
                                        Communication :
                                    </label>
                                    <div className="col-8">
                                      <Slider 
                                          className={`${styles.slider}`}
                                          value={communicationSkill} 
                                          onChange={(value) => setCommunicationSkill(value as number)} 
                                          min={1} 
                                          max={10} 
                                          marks={{
                                            1: { label: '1' },
                                            2: { label: '2' },
                                            3: { label: '3' },
                                            4: { label: '4' },
                                            5: { label: '5' },
                                            6: { label: '6' },
                                            7: { label: '7' },
                                            8: { label: '8' },
                                            9: { label: '9' },
                                            10: { label: '10' },
                                        }}
                                      />
                                  </div>
                                </div>
                                <div className="flex flex-column gap-4">
                                    {backgroundCheck.map((item, i) =>
                                        <div className='grid' key={i}>
                                            <label className='col-4' htmlFor={item.label}>
                                                {item.label}
                                            </label>
                                            <InputText className='col-8' id={item.label} placeholder={item.value} disabled value={item.value} />
                                        </div>
                                    )}
                                </div>
                                <Divider />
                                <div className="flex justify-content-center">
                                <Button 
                                    icon={`pi ${bgvVerified ? 'pi-verified' : 'pi-ban'}`} 
                                    label={bgvVerified ? "BGV Verified" : "Not Verified"} 
                                    className={`p-button-rounded ${bgvVerified ? 'p-button-success' : 'p-button-danger'}`} 
                                    onClick={() => setBgvVerified(!bgvVerified)} 
                                />
                                </div>
                            </Panel>
                            <Panel style={{ marginBottom: "20px" }} header="Technical Check">
                                <p className='font-semibold text-base mb-4'> Primary Skills</p>
                                <div className="flex flex-column gap-4">
                                    {primarySkills.map((item, i) =>
                                        <div className='grid mb-4 align-items-center justify-content-between' key={i}>
                                            <label className='col-4' htmlFor={item.skill}>
                                                {item.skill} :
                                            </label>
                                            <div className="col-8">
                                                <Slider 
                                                   className={`${styles.slider}`}
                                                   min={0}
                                                   max={10}
                                                   value={item.rating}
                                                   marks={{
                                                       0: { label: '0' },
                                                       1: { label: '1' },
                                                       2: { label: '2' },
                                                       3: { label: '3' },
                                                       4: { label: '4' },
                                                       5: { label: '5' },
                                                       6: { label: '6' },
                                                       7: { label: '7' },
                                                       8: { label: '8' },
                                                       9: { label: '9' },
                                                       10: { label: '10' },
                                                   }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className='font-semibold text-base mb-4'> Secondary Skills</p>
                                <div className="flex flex-column gap-4">
                                    {secondarySkills.map((item, i) =>
                                        <div className='grid mb-4 align-items-center justify-content-between' key={i}>
                                            <label className='col-4' htmlFor={item.skill}>
                                                {item.skill} :
                                            </label>
                                            <div className="col-8">
                                                <Slider 
                                                  className={`${styles.slider}`}
                                                  min={0}
                                                  max={10}
                                                  value={item.rating}
                                                  marks={{
                                                      0: { label: '0' },
                                                      1: { label: '1' },
                                                      2: { label: '2' },
                                                      3: { label: '3' },
                                                      4: { label: '4' },
                                                      5: { label: '5' },
                                                      6: { label: '6' },
                                                      7: { label: '7' },
                                                      8: { label: '8' },
                                                      9: { label: '9' },
                                                      10: { label: '10' },
                                                  }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Panel>
                            <Panel style={{ marginBottom: "20px" }} header="View Resume">
                                {loading && (
                                    <div style={{ minHeight: "400px" }} className='surface-200 border-round-md'>
                                        <pre>Loading resume...</pre>
                                    </div>
                                )}
                                {error && (
                                    <div style={{ minHeight: "400px" }} className='surface-200 border-round-md'>
                                        <pre>{error}</pre>
                                    </div>
                                )}
                                {resumeContent && (
                                    <div>
                                        <div>
                                            <iframe src={resumeContent.locationUrl} title="Document View" width="100%" height="400px">
                                                This is document view
                                            </iframe>
                                        </div>
                                        <div>
                                            <h5 className='underline'>Details</h5>
                                            <Divider />
                                            <p><strong>File Name:</strong> {resumeContent.originalName}</p>
                                            <p><strong>File Type:</strong> {resumeContent.fileType}</p>
                                            <p><strong>File Size:</strong> {formatFileSize(resumeContent.fileSize)}</p>
                                        </div>
                                    </div>
                                )}
                            </Panel>
                        </ScrollPanel>
                    </div>
                    <div className="col-4">
                        <ChatBox />
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default ScreenSelect
