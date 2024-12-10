import React from 'react';
import styles from './styles.module.scss';
import Image from 'next/image';
import { InputText } from 'primereact/inputtext';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { InputSwitch } from 'primereact/inputswitch';
const Integrations = () => {
    const loremText =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

    const accordionArray = [
        {
            name: 'indeed',
            logo: '/assets/job/naukri.png',
            text: 'Indeed helps millions of job seekers and employers find the right fit for them every day.',
            confirmText: 'Confirm your company’s Indeed account',
            placeholder: 'Enter the company email address for indeed',
        },
        {
            name: 'linkedIn',
            logo: '/assets/job/linkedIn.png',
            text: 'Connect your Recruiter account, enable Recruiter System Connect, Apply with LinkedIn and Apply Connect.',
            confirmText: 'Confirm your company’s LinkedIn account',
            placeholder: 'Enter the company email address for linkedIn',
        },
        {
            name: 'naukri',
            logo: '/assets/job/naukri.png',
            text: 'Connect your Recruiter account, enable Recruiter System Connect, Apply with Naukri and Apply Connect.',
            confirmText: 'Confirm your company’s Naukri account',
            placeholder: 'Enter the company email address for naukri',
        },
        {
            name: 'monster',
            logo: '/assets/job/monster.png',
            text: 'Connect your Recruiter account, enable Recruiter System Connect, Apply with Monster and Apply Connect.',
            confirmText: 'Confirm your company’s Monster account',
            placeholder: 'Enter the company email address for monster',
        },
    ];

    return (
        <div className={styles.Integrations}>
            <h4 className={styles.heading}> Integrations</h4>
            <ul className={styles.main}>
                <li className={styles.listItem}>
                    <header className={styles.header}>
                        CALENDAR INTEGRATION
                    </header>
                    <div className="flex py-2 px-4 ">
                        <div className="w-8">
                            <h4>Choose Provider</h4>
                            <p>{loremText}</p>
                        </div>
                        <div className="w-3 flex flex-column gap-4 justify-content-center pt-2 align-items-end">
                            <label className="flex w-full align-items-center justify-content-center">
                                <Image
                                    height="50"
                                    width="50"
                                    src={'/assets/Settings/G-Suit.png'}
                                    alt="img"
                                />
                                <InputSwitch checked={false} />
                            </label>
                            <label className="flex w-full align-items-center justify-content-center">
                                <Image
                                    height="50"
                                    width="50"
                                    src={'/assets/Settings/microsoft.png'}
                                    alt="img"
                                />
                                <InputSwitch checked={false} />
                            </label>
                        </div>
                    </div>
                    <button className={styles.submit_button}>
                        Save Changes
                    </button>
                </li>
                <li className={styles.listItem}>
                    <header className={styles.header}>
                        VIDEO CONFERENCE INTEGRATION
                    </header>
                    <div className="flex py-2 px-4 ">
                        <div className="w-8">
                            <h4>Activate Video Integration</h4>
                            <p>{loremText}</p>
                        </div>
                        <div className="w-3 flex flex-column gap-4 justify-content-center pt-2 align-items-end">
                            <label className="flex w-full align-items-center justify-content-center">
                                <Image
                                    height="50"
                                    width="50"
                                    src={'/assets/Settings/zoom.png'}
                                    alt="img"
                                />
                                <InputSwitch checked={false} />
                            </label>
                            <label className="flex w-full align-items-center justify-content-center">
                                <Image
                                    height="50"
                                    width="50"
                                    src={'/assets/Settings/microsoft_team.png'}
                                    alt="img"
                                />
                                <InputSwitch checked={false} />
                            </label>
                            <label className="flex w-full align-items-center justify-content-center">
                                <Image
                                    height="50"
                                    width="50"
                                    src={'/assets/Settings/google_meet.png'}
                                    alt="img"
                                />
                                <InputSwitch checked={false} />
                            </label>
                        </div>
                    </div>
                    <button className={styles.submit_button}>
                        Save Changes
                    </button>
                </li>
                <li className={styles.listItem}>
                    <header className={styles.header}>
                        GOOGLE ANALYTICS INTEGRATION
                    </header>
                    <div className="flex py-2 px-4 justify-content-between ">
                        <div className="w-6">
                            <h4>Activate Video Integration</h4>
                            <p>{loremText}</p>
                        </div>
                        <div className="w-4 flex flex-column gap-4 justify-content-start pt-2">
                            <label>Google Analytics 4 measurement ID</label>
                            <InputText
                                className="w-8"
                                type="text"
                                placeholder="G-XXXXXXXX"
                            />
                        </div>
                    </div>
                    <button className={styles.submit_button}>
                        Save Changes
                    </button>
                </li>
                {/* Job boards */}
                <li className={styles.listItem}>
                    <header className={styles.header}>JOB BOARDS</header>
                    <div className="flex flex-column gap-4 py-2 px-4 ">
                        <div className="w-8">
                            <h4>Choose Platform</h4>
                            <p>{loremText}</p>
                        </div>
                        {/* Accordion */}
                        <div className={styles.accordionArray}>
                            <Accordion
                                activeIndex={0}
                                className="flex flex-column gap-4"
                                style={{ backgroundColor: ' #f7f6f6' }}
                            >
                                {accordionArray.map((value, i) => (
                                    <AccordionTab
                                        className="border-jartik-2"
                                        header={
                                            <div>
                                                <Image
                                                    height="20"
                                                    width="80"
                                                    src={value.logo}
                                                    alt={value.name}
                                                />
                                                <p>{value.text}</p>
                                            </div>
                                        }
                                        key={i}
                                    >
                                        <div className={styles.account}>
                                            <label>{value.confirmText}</label>
                                            <div className={styles.input}>
                                                <InputText
                                                    type="text"
                                                    placeholder={
                                                        value.placeholder
                                                    }
                                                />
                                                <button
                                                    className={
                                                        styles.confirmBtn
                                                    }
                                                >
                                                    Confirm Account
                                                </button>
                                            </div>
                                        </div>
                                    </AccordionTab>
                                ))}
                            </Accordion>
                        </div>

                        {/* Accordion */}
                    </div>
                    <button className={styles.submit_button}>
                        Save Changes
                    </button>
                </li>
                {/* Job boards */}
                <li className={styles.listItem}>
                    <header className={styles.header}>
                        HR INFORMATION SYSTEMS
                    </header>
                    <div className={styles.content}>
                        <textarea placeholder="HR INFORMATION SYSTEMS....."></textarea>
                    </div>
                    <button className={styles.submit_button}>
                        Save Changes
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default Integrations;
