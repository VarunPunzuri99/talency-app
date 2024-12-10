import React, { useState } from 'react';
import styles from './styles.module.scss';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { Sidebar } from 'primereact/sidebar';
import { InputText } from 'primereact/inputtext';

// Todo: Check commented code. uncomment and check issues.

import { InputSwitch } from 'primereact/inputswitch';
import Link from 'next/link';
const Career = () => {
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
    const [visibleRight, setVisibleRight] = useState(false);
    const {
        handleSubmit,
        register,
    } = useForm();
    const submitHandler = () => {
        // onSubmit(data);
    };

    const [checked, setChecked] = useState(false);
    return (
        <>
            <div className={styles.Career}>
                <header className={styles.header}>
                    <Image
                        className={styles.companyLogoImage}
                        height="120"
                        width="120"
                        src="/assets/login/mail.svg"
                        alt="hero-img"
                    />
                    <h4>Careers at Codinglimits Pvt Ltd.</h4>
                    <button className={styles.edit} onClick={() => setVisibleRight(true)}>
                        Edit
                    </button>
                    <div className={styles.links}>
                        <Image
                            height="30"
                            width="30"
                            src="/assets/Settings/Facebook.svg"
                            alt="Facebook-link"
                        />
                        <Image
                            height="30"
                            width="30"
                            src="/assets/Settings/Instagram.svg"
                            alt="Instagram-link"
                        />
                        <Image
                            height="30"
                            width="30"
                            src="/assets/Settings/LinkedIn.svg"
                            alt="LinkedIn-link"
                        />
                    </div>
                </header>
                <div className={styles.main}>
                    <h4>
                        Job Openings{' '}
                        <Image height="20" width="20" src="/assets/icons/Edit.svg" alt="pen-icon" />
                    </h4>
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
                    <ul className={styles.postList}>
                        {postArray.map((value, ind) => (
                            <Link href="career/view-job" className={styles.listItem} key={ind}>
                                <div className={styles.title}>
                                    <h5>{value.title}</h5>
                                    <p>Posted {value.date}</p>
                                </div>
                                <div className={styles.info}>
                                    <div className="flex align-items-center">
                                        <Image
                                            src="/assets/Settings/Resume.svg"
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
                                            src="/assets/Settings/Place Marker.svg"
                                            height="19"
                                            width="19"
                                            alt="Place Marker"
                                        />
                                        <span className={`${styles.span} white-space-nowrap`}>
                                            {value.location}
                                        </span>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Image
                                            src="/assets/Settings/Permanent Job.svg"
                                            height="19"
                                            width="19"
                                            alt="Permanent Job"
                                        />
                                        <span className={`${styles.span} white-space-nowrap`}>
                                            {value.jobType}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        <div className={styles.more}>
                            <p>+</p>
                            <span></span>
                        </div>
                    </ul>
                    <Image
                        className={styles.logo}
                        src={'/assets/talency-logo.svg'}
                        height="50"
                        width="130"
                        alt="talency-logo"
                    />
                </div>
            </div>
            <Sidebar
                visible={visibleRight}
                position="right"
                className={styles.sidebar}
                onHide={() => setVisibleRight(false)}
            >
                <form className={styles.form} onSubmit={handleSubmit(submitHandler)}>
                    {/* Resume */}
                    <header>
                        <h4>Edit Header</h4>
                    </header>
                    <div className={styles.companyLogo}>
                        <label htmlFor="companyLogo">Upload Company Logo:</label>
                        <p>One of the following formats: .png, .jpeg.</p>
                        <input
                            id="companyLogo"
                            type="file"
                            accept="image/png, image/jpeg"
                            {...register('companyLogo', {
                                required: 'companyLogo is required',
                            })}
                        />
                        {/* {errors.companyLogo && <p>{errors.companyLogo.message}</p>} */}
                    </div>
                    <h4>Header Section</h4>
                    <div className={styles.switch}>
                        <label htmlFor="">Show Social Network Icons</label>
                        <InputSwitch checked={checked} onChange={(e) => setChecked(e.value)} />
                    </div>
                    <div className={styles.socialInputWraper}>
                        <span className="flex align-items-center">
                            <i className="pi pi-facebook"></i>
                            <label htmlFor="facebook" className="font-semibold">
                                Facebook
                            </label>
                        </span>
                        <input
                            placeholder="https://"
                            id="facebook"
                            {...register('facebook', {
                                required: 'Facebook Account link is required',
                            })}
                        />
                        {/* {errors.facebook && <p>{errors.facebook.message}</p>} */}
                    </div>
                    <div className={styles.socialInputWraper}>
                        <span className="flex align-items-center">
                            <i className="pi pi-instagram"></i>
                            <label htmlFor="instagram" className="font-semibold">
                                Instagram
                            </label>
                        </span>
                        <input
                            placeholder="https://"
                            id="instagram"
                            {...register('instagram', {
                                required: 'Instagram Account link is required',
                            })}
                        />
                        {/* {errors.instagram && <p>{errors.instagram.message}</p>} */}
                    </div>
                    <div className={styles.socialInputWraper}>
                        <span className="flex align-items-center">
                            <i className="pi pi-linkedin"></i>
                            <label htmlFor="linkedin" className="font-semibold">
                                Linkedin
                            </label>
                        </span>
                        <input
                            placeholder="https://"
                            id="linkedin"
                            {...register('linkedin', {
                                required: 'Linkedin Account link is required',
                            })}
                        />
                        {/* {errors.linkedin && <p>{errors.linkedin.message}</p>} */}
                    </div>
                    {/* <div className={styles.socialInputWraper}>
                        <label htmlFor=""> Add more</label>
                    </div> */}
                    {/* Submit Button */}
                    <button type="submit">Submit Application</button>
                </form>
            </Sidebar>
        </>
    );
};

export default Career;
