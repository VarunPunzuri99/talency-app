import React from 'react';
import styles from './index.module.scss';
import Image from 'next/image';
import { Button } from 'primereact/button';
import Link from 'next/link';
const index = () => {
    const requirements_Array = [
        ' Craft and develop new features and solutions that support customer use cases in existing and new software products.',
        ' Work in an agile team environment that practices continuous improvement when planning, estimating and building software.',
        ' Deliver on sprint commitments by working proactively with collaborators to identify and navigate obstacles.',
        ' Build hard-working software with an evolving set of tools across several technology stacks and participate in the stewardship of our development process.',
        ' Collaborate with multi-functional project teams including Architects, QA, Product Management, and others to delight our clients.',
    ];

    const required_Array = [
        'Passionate about understanding our clients.',
        ' Proactive, creative and self-directed with a dedication to excellence.',
        ' Committed to continuous learning and the craft of software development.',
        ' Effective analysis and troubleshooting skills, and persistence in solving problems.',
        ' Active interest and participation in DevOps as a culture.',
        ' Excellent written and oral communication skills, and participation in a culture of writing things down.',
    ];
    const quickInfo = [
        { icon: '/assets/job/Place Marker.svg', name: 'Hyderabad, India.' },
        { icon: '/assets/job/Banknotes.svg', name: '5,00,000 - 10,00,000' },
        {
            icon: '/assets/job/Resume.svg',
            name: 'Experience: 3 years to 8 years',
        },
        { icon: '/assets/job/Permanent Job.svg', name: 'Full Time' },
        {
            icon: '/assets/job/Development Skill.svg',
            name: 'Primary Skills:  Java, Python, NodeJS, ReactJS, Communication, Front end programming',
        },
    ];
    return (
        <div className={`${styles.job} flex flex-column gap-2`}>
            <header className="flex justify-content-between align-items-center py-3 px-4 cursor-pointer ">
                <Link href={'/internals/jobs'}>
                    {' '}
                    <i className="pi pi-angle-left"></i>
                </Link>
                <div className="flex align-items-center  gap-4">
                    <p>Share</p>
                    <h4 className="bg-green-200 text-green-700 px-3 py-1 border-round-sm">
                        Opened
                    </h4>
                    <div className="flex flex-column align-items-end gap-1">
                        <h4>Posted on 12 July 2023</h4>
                        <span>Codinglimits Private Limited</span>
                    </div>
                </div>
            </header>
            <div className={`${styles.main} flex gap-2`}>
                {/* Left Section */}
                <div className="w-4 flex flex-column align-items-center  gap-2">
                    <div className="w-10 pb-4 flex flex-column  gap-4">
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
                        <h3 className={styles.companyName}>
                            Software Engineer
                        </h3>
                    </div>
                    <div className="w-12 border-top-1 border-300 flex flex-column  align-items-center gap-4 p-2">
                        <h3>Google India Private Limited</h3>
                        <div className="w-8 flex flex-column gap-3 my-4 pl-6">
                            {quickInfo.map((value, i) => {
                                return (
                                    <div key={i} className="flex gap-2">
                                        <Image
                                            style={{ objectFit: 'contain' }}
                                            src={value.icon}
                                            height="24"
                                            width="26"
                                            alt={value.name}
                                        />
                                        <span className="pt-1">
                                            {value.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <Button className="w-6" label="Apply" />
                    </div>
                </div>
                {/* Right Section */}
                <div className="w-8 pt-2 flex flex-column gap-6">
                    <div className="flex flex-column gap-3">
                        <h3>About a Job</h3>
                        <h5>
                            To my dear coders, Welcome to your employee-only
                            experience. Bringing the ideas to a reality that
                            shapes future businesses and achieves the greatest
                            ambitions. Our guiding principle behind our work
                            believes that the best technology and expertise with
                            a proper methodology ensures the best and meaningful
                            outcomes.
                        </h5>
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
