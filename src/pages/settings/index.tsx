import React from 'react';
import Image from 'next/image';
import { InputText } from 'primereact/inputtext';
import styles from './index.module.scss';
import Link from 'next/link';
const index = () => {
    const postArray = [
        {
            title: 'Software Engineer',
            date: 'Today',
            experience: '3 years to 8 years',
            location: ' Haryana, India',
            jobType: 'Full Time',
        },
        {
            title: 'Network Engineer',
            date: 'yesterday',
            experience: '3 years to 8 years',
            location: ' Delhi, India',
            jobType: 'Full Time',
        },
        {
            title: 'Product Designer',
            date: 'on 12 Jan 2024',
            experience: '3 years to 8 years',
            location: ' Haryana, India',
            jobType: 'Full Time',
        },
    ];
    return (
        <div>
            <header className={styles.header}>Careers Page Builder</header>
            <div className={styles.main}>
                <h4>Your company’s Careers Page is Published</h4>
                <div className={styles.content}>
                    <header className={styles.headerContent}>
                        <Image
                            className={styles.heroImage}
                            height="80"
                            width="80"
                            src="/"
                            alt="icon"
                        />
                        <h4>Careers at Codinglimits Pvt Ltd.</h4>
                        <div className={styles.links}>
                            <Image
                                height="30"
                                width="30"
                                src="/assets/Settings/Facebook.svg"
                                alt="link"
                            />
                            <Image
                                height="30"
                                width="30"
                                src="/assets/Settings/Instagram.svg"
                                alt="link"
                            />
                            <Image
                                height="30"
                                width="30"
                                src="/assets/Settings/LinkedIn.svg"
                                alt="link"
                            />
                        </div>
                    </header>
                    <div className={styles.contentBox}>
                        <h2>Job Openings</h2>
                        <div className={styles.filters}>
                            {/* Search bar */}
                            <span className={`${styles.searchBar} p-input-icon-left w-full`}>
                                <i className="pi pi-search" />
                                <InputText placeholder="Search jobs..." />
                            </span>
                            {/* Search bar */}
                            <div className={styles.filtersList}>
                                <span>Workplace type</span>
                                <span>Location (1)</span>
                                <span>Department</span>
                                <span>Work type</span>
                            </div>
                            <button>Clear filters</button>
                            <ul className={styles.activeFilters}>
                                <li>Hyderabad, Telangana, India</li>
                            </ul>
                        </div>
                        <ul>
                            {postArray.map((value, ind) => (
                                <Link
                                    href="settings/career/view-job"
                                    className={styles.listItem}
                                    key={ind}
                                >
                                    <div className={styles.title}>
                                        <h5>{value.title}</h5>
                                        <p>Posted {value.date}</p>
                                    </div>
                                    <div className={styles.info}>
                                        <div className="flex align-items-center">
                                            <Image
                                                src="assets/Settings/Resume.svg"
                                                height="19"
                                                width="19"
                                                alt="resume"
                                            />
                                            <span className={`${styles.span} white-space-nowrap`}>
                                                Experience: {value.experience}
                                            </span>
                                        </div>
                                        <div className="flex align-items-center">
                                            <Image
                                                src="assets/Settings/Place Marker.svg"
                                                height="19"
                                                width="19"
                                                alt="resume"
                                            />
                                            <span className={`${styles.span} white-space-nowrap`}>
                                                {value.location}
                                            </span>
                                        </div>
                                        <div className="flex align-items-center">
                                            <Image
                                                src="assets/Settings/Permanent Job.svg"
                                                height="19"
                                                width="19"
                                                alt="resume"
                                            />
                                            <span className={`${styles.span} white-space-nowrap`}>
                                                {value.jobType}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className={styles.otherInfo}>
                    <div className={styles.upperSection}>
                        <div>
                            <h4>Codinglimits Pvt Ltd Published</h4>
                            <h2>15 Jobs</h2>
                        </div>
                        <div>
                            <h4> Last job published</h4>
                            <h2>30 days ago</h2>
                        </div>
                    </div>
                    <div className={styles.lowerSection}>
                        <Link href="/settings/career">View careers page</Link>
                        <Link href="/settings/career">Edit careers page</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default index;
