import React from 'react';
import styles from '@/styles/shared/Jobs/view_page.module.scss';
import Image from 'next/image';
import { Button } from 'primereact/button';
import Link from 'next/link';
import api, { setToken } from '@/services/api.service';
import { useRouter } from 'next/router';
import moment from 'moment';

export const getServerSideProps = async ({ req, params }) => {
    setToken(req);

    try {
        // Fetch job details and job applications count in parallel
        const [job, jobApplicationsCount] = await Promise.all([
            api.getJobById(params.job),
            api.getJobApplicationsCount(params.job),
        ]);

        console.log(job);
        console.log(jobApplicationsCount);

        let jobApplication = null;
        try {
            jobApplication = await api.getUserJobApplicationForJob(params.job);
            console.log(jobApplication);
        } catch (error) {
            if (error.response?.status === 404) {
                console.warn(`Job application for jobId ${params.job} not found.`);
            } else {
                console.error('Error fetching job application:', error);
            }
        }

        return {
            props: {
                job,
                jobApplicationsCount,
                jobApplication: jobApplication || null,
            },
        };
    } catch (error) {
        console.error('Error fetching job details:', error);

        // Return default props in case of an error
        return {
            props: {
                job: null,
                jobApplicationsCount: 0,
                jobApplication: null,
            },
        };
    }
};

const index = ({ job, jobApplication, jobApplicationsCount }) => {

    const router = useRouter();

    let buttonText = 'Apply'; // Default button text
    let buttonAction = () => router.push(`/jobs/application?jobId=${job._id}`);

    if (jobApplication) {
        if (jobApplication.isDraft) {
            buttonText = 'Complete Draft Application';
            buttonAction = () => router.push(`/jobs/application?jobId=${job._id}`); // Redirect to complete draft
        } else {
            buttonText = 'Applied';
            buttonAction = () => router.push(`/jobs/application/${jobApplication._id}`); // Redirect to view application
        }
    }

    const quickInfo = [
        {
            icon: '/assets/job/Place Marker.svg',
            name: (
                <div>
                    {job.jobLocation && job.jobLocation.length > 0 ? (
                        job.jobLocation.map((loc, index) => (
                            <div key={index} className='mb-1'>
                                {`${loc.city}, ${loc.state}`}
                            </div>
                        ))
                    ) : (
                        <div>No job locations available</div>
                    )}
                </div>
            )
        },
        {
            icon: '/assets/job/Resume.svg',
            name: `${job.workExperience.minimum}-${job.workExperience.maximum} years`
        },
        {
            icon: '/assets/job/Development Skill.svg',
            name: job.primarySkills.join(', ')
        },
        {
            icon: '/assets/job/Banknotes.svg',
            name: job.maxCtcOffered && job.currency
                ? `${job.currency} ${job.maxCtcOffered.toLocaleString('en-IN')}`
                : 'Not Disclosed'
        }
    ];


    const requirements_Array = [
        `Primary Skills: ${job.primarySkills.length > 0 ? job.primarySkills.join(', ') : 'Not specified'}`,
        `Secondary Skills: ${job.secondarySkills.length > 0 ? job.secondarySkills.join(', ') : 'Not specified'}`,
        `Employment Type: ${job.employmentType || 'Not specified'}`,
        `Work Mode: ${job.workMode || 'Not specified'}`,
        `Industry: ${job.industryOrDomain?.name || 'Not specified'}`, // Safe access with optional chaining
        `Location: ${job.jobLocation && job.jobLocation.length > 0
            ? job.jobLocation.map(loc => `${loc.city}`).join(' | ')
            : 'Not specified'}` // Loop through jobLocation
    ];


    const required_Array = [
        `Video Profile Requested: ${job.videoProfileRequested ? 'Yes' : 'No'}`,
        `Hiring Mode: ${job.hiringMode || 'Not specified'}`,
        `Instructions to Recruiter: ${job.instructionsToRecruiter || 'Not specified'}`,
    ];
    return (
        <div className={`${styles.job} flex flex-column gap-2`}>
            <header className="flex justify-content-between align-items-center py-3 px-4 cursor-pointer ">
                <Link href={'/jobs/lists'}>
                    <i className="pi pi-angle-left"></i>
                </Link>
                <div className="flex align-items-center gap-4">
                    <p>Share</p>
                    <h4 className={`tag ${job.isOpen ? 'active' : 'closed'}`}>
                        {job.isOpen ? 'Opened' : 'Closed'}
                    </h4>
                    <div className="flex flex-column align-items-end gap-1">
                        <h4>Posted on {moment(job.createdAt).format('MMM DD YYYY, h:mm A')}</h4>
                        {/* <span>{job.postingOrg ? job.postingOrg.title : ''}</span> */}
                    </div>
                </div>
            </header>
            <div className={`${styles.main} flex gap-2`}>
                {/* Left Section */}
                <div className="w-4 flex flex-column align-items-center gap-2">
                    <div className="w-10 pb-4 flex flex-column gap-4">
                        <div className="flex justify-content-center p-8 border-1 border-300 border-round-sm">
                            <Image
                                className="mx-auto"
                                style={{ objectFit: 'contain' }}
                                src="/assets/job/indeed.png"
                                height="40"
                                width="100"
                                alt="company-logo"
                            />
                        </div>
                        <h3 className={styles.companyName}>{job.title}  <p>{job.jobCode ? job.jobCode : ''}</p></h3>

                    </div>
                    <div className="w-12 border-top-1 border-300 flex flex-column align-items-center gap-4 p-2">
                        <h3>Company - {job.endClientOrg ? job.endClientOrg.title : ''}</h3>
                        <div className="w-8 flex flex-column gap-3 my-4 pl-6">
                            {quickInfo.map((value, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <Image
                                        style={{ objectFit: 'contain' }}
                                        src={value.icon}
                                        height="24"
                                        width="26"
                                        alt={value.name}
                                    />
                                    <div className="pt-1">
                                        {typeof value.name === 'string' ? (
                                            <span>{value.name}</span>
                                        ) : (
                                            value.name // Render JSX elements
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {!job.isDraft && (!job.targetApplications || jobApplicationsCount.count <= job.targetApplications) ? (
                        <>
                            <Button
                                className="w-6"
                                label={buttonText}
                                onClick={buttonAction}
                            />
                            <Button
                                className="w-6"
                                label="Recruiter apply"
                                onClick={() => router.push(`/jobs/recruiter-form?jobId=${job._id}`)}
                            />
                        </>
                    ) : null}


                </div>
                {/* Right Section */}
                <div className="w-8 pt-2 flex flex-column gap-6">
                    <div className="flex flex-column gap-3">
                        <h3>About the Job</h3>
                        <div dangerouslySetInnerHTML={{ __html: job ? job.description : '' }} />
                    </div>
                    <div className="flex flex-column gap-3">
                        <h3>Requirements</h3>
                        <ul>
                            {requirements_Array.map((value, i) => (
                                <li key={i}>{value}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex flex-column gap-3">
                        <h3>Required</h3>
                        <ul>
                            {required_Array.map((value, i) => (
                                <li key={i}>{value}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default index;
