import React, { useState } from 'react';
import styles from './styles.module.scss';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { Sidebar } from 'primereact/sidebar';

// Todo: Check commented code. uncomment and check issues.

const Job = () => {
    const [visibleRight, setVisibleRight] = useState(false);
    const {
        handleSubmit,
        register,
    } = useForm();
    const submitHandler = () => {
        // onSubmit(data);
    };
    return (
        <>
            <div className={styles.jobContainer}>
                <header className={styles.jobHeader}>
                    <Image
                        src="/assets/landing/dash/AI-diode 1.png"
                        height="100"
                        width="100"
                        alt="icon"
                    />
                    <Image
                        src="/assets/landing/dash/AI-diode 2.png"
                        height="100"
                        width="100"
                        alt="icon"
                    />
                    <div className={styles.jobInfo}>
                        <h2 className={styles.jobTitle}>
                            Software Engineer <i className="pi pi-share-alt"></i>
                        </h2>
                        <p className={styles.companyName}>Google India Private Limited</p>
                        <div className={styles.additionalInfo}>
                            <span className={styles.location}>
                                <Image
                                    src={'/assets/Settings/P_Job-white.svg'}
                                    height="20"
                                    width="20"
                                    alt="location"
                                />
                                Hyderabad, Telangana
                            </span>
                            <span className={styles.employmentType}>
                                <Image
                                    src={'/assets/Settings/PlaceMarkerWhite.svg'}
                                    height="20"
                                    width="20"
                                    alt="emp"
                                />
                                Full Time
                            </span>
                        </div>
                        <h2 className={styles.careersHeader}>Careers at Codinglimits Pvt Ltd.</h2>
                    </div>
                </header>
                <div className={styles.main}>
                    <button className={styles.back}>
                        <i className="pi pi-arrow-left"></i>
                    </button>
                    <div className={styles.jobAbout}>
                        <h4>About a Job</h4>
                        <p>
                            To my dear coders, Welcome to your employee-only experience. Bringing
                            the ideas to a reality that shapes future businesses and achieves the
                            greatest ambitions. Our guiding principle behind our work believes that
                            the best technology and expertise with a proper methodology ensures the
                            best and meaningful outcomes.
                        </p>
                    </div>
                    <div className={styles.Requirements}>
                        <h4>Requirements</h4>
                        <ul>
                            <li>
                                Craft and develop new features and solutions that support customer
                                use cases in existing and new software products.
                            </li>
                            <li>
                                Work in an agile team environment that practices continuous
                                improvement when planning, estimating and building software.
                            </li>
                            <li>
                                Deliver on sprint commitments by working proactively with
                                collaborators to identify and navigate obstacles.
                            </li>
                            <li>
                                Build hard-working software with an evolving set of tools across
                                several technology stacks and participate in the stewardship of our
                                development process.
                            </li>
                            <li>
                                Collaborate with multi-functional project teams including
                                Architects, QA, Product Management, and others to delight our
                                clients.
                            </li>
                        </ul>
                    </div>
                    <div className={styles.Required}>
                        <h4>Required</h4>
                        <ul>
                            <li>Passionate about understanding our clients.</li>
                            <li>
                                Proactive, creative and self-directed with a dedication to
                                excellence.
                            </li>
                            <li>
                                Committed to continuous learning and the craft of software
                                development.
                            </li>
                            <li>
                                Effective analysis and troubleshooting skills, and persistence in
                                solving problems.
                            </li>
                            <li>Active interest and participation in DevOps as a culture.</li>
                            <li>
                                Excellent written and oral communication skills, and participation
                                in a culture of writing things down.
                            </li>
                        </ul>
                    </div>
                    <button className={styles.apply} onClick={() => setVisibleRight(true)}>
                        Apply for this job
                    </button>
                    <Image
                        className={styles.logo}
                        src={'/assets/talency-logo.svg'}
                        height="50"
                        width="130"
                        alt="telency-logo"
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
                        <h4>Application</h4>
                    </header>
                    <div className={styles.resume}>
                        <label>Import resume from:</label>
                        <p>One of the following formats: .pdf, .doc, .docx, .odt, or .rtf.</p>
                        <input
                            type="file"
                            {...register('resume', {
                                required: 'Resume is required',
                            })}
                        />
                        {/* {errors.resume && <p>{errors.resume.message}</p>} */}
                    </div>
                    <h4>Personal Information</h4>
                    {/* Full Name */}

                    <div className={styles.inputFieldandLabel}>
                        <label>Full Name:</label>
                        <input
                            {...register('fullName', {
                                required: 'Full Name is required',
                            })}
                        />
                        {/* {errors.fullName && <p>{errors.fullName.message}</p>} */}
                    </div>

                    {/* Email */}
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                    message: 'Invalid email address',
                                },
                            })}
                        />
                        {/* {errors.email && <p>{errors.email.message}</p>} */}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label>Phone Number:</label>
                        <input
                            {...register('phoneNumber', {
                                required: 'Phone Number is required',
                            })}
                        />
                        {/* {errors.phoneNumber && <p>{errors.phoneNumber.message}</p>} */}
                    </div>

                    {/* Address */}
                    <div>
                        <label>Address:</label>
                        <textarea className={styles.address} {...register('address')} />
                    </div>

                    {/* City */}
                    <div>
                        <label>City:</label>
                        <input {...register('city')} />
                    </div>

                    {/* State/Province */}
                    <div>
                        <label>State/Province:</label>
                        <input {...register('stateProvince')} />
                    </div>

                    {/* Postal Code */}
                    <div>
                        <label>Postal Code:</label>
                        <input {...register('postalCode')} />
                    </div>

                    {/* Country */}
                    <div>
                        <label>Country:</label>
                        <input {...register('country')} />
                    </div>

                    {/* Image */}
                    <div className={styles.ImageDiv}>
                        <label>Image:</label>
                        <input type="file" {...register('image')} />
                    </div>

                    {/* Submit Button */}
                    <button type="submit">Submit Application</button>
                </form>
            </Sidebar>
        </>
    );
};

export default Job;
