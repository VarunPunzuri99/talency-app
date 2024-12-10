import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import styles from './index.module.scss';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { Toast } from 'primereact/toast';
import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Lists() {
    const menuRight = useRef(null);

    const toast = useRef(null);

    const items = [
        {
            label: 'Options',
            items: [
                {
                    label: 'Update',
                    icon: 'pi pi-refresh',
                    command: () => {
                        toast.current.show({
                            severity: 'success',
                            summary: 'Updated',
                            detail: 'Data Updated',
                            life: 3000,
                        });
                    },
                },
                {
                    label: 'Delete',
                    icon: 'pi pi-times',
                    command: () => {
                        toast.current.show({
                            severity: 'warn',
                            summary: 'Delete',
                            detail: 'Data Deleted',
                            life: 3000,
                        });
                    },
                },
            ],
        },
        {
            label: 'Navigate',
            items: [
                {
                    label: 'React Website',
                    icon: 'pi pi-external-link',
                    url: 'https://reactjs.org/',
                },
                {
                    label: 'Router',
                    icon: 'pi pi-upload',
                    command: (e) => {
                        //router.push('/fileupload');
                    },
                },
            ],
        },
    ];

    function defaultClick(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    return (
        <>
            <Toast ref={toast}></Toast>
            <Menu
                model={items}
                popup
                ref={menuRight}
                id="popup_menu_right"
                popupAlignment="right"
            />
            <div className={styles.header}>
                <div className={styles.title}>Jobs</div>
                <Button  >
                    <Link href={"/jobs/add"} className='text-white'>
                        Create Job
                    </Link>
                </Button>
            </div>
            <div className={styles.filters}>
                <div className={styles.right_section}>
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText placeholder="Search" />
                    </span>
                    <span className="p-float-label">
                        <Dropdown
                            inputId="dd-city"
                            value={''}
                            // onChange={(e) => setSelectedCity(e.value)}
                            options={[]}
                            optionLabel="name"
                            className="w-full md:w-14rem"
                        />
                        <label htmlFor="dd-city">Select a Department</label>
                    </span>

                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText placeholder="Search by location" />
                    </span>

                    <span className="p-float-label">
                        <Dropdown
                            inputId="dd-city"
                            value={''}
                            // onChange={(e) => setSelectedCity(e.value)}
                            options={[]}
                            optionLabel="name"
                            className="w-full md:w-14rem"
                        />
                        <label htmlFor="dd-city">Status</label>
                    </span>
                </div>
            </div>
            <div className={styles.filters}>
                <div className={styles.left_section}>
                    <span className="p-float-label">
                        <Dropdown
                            inputId="dd-city"
                            value={''}
                            // onChange={(e) => setSelectedCity(e.value)}
                            options={[]}
                            optionLabel="name"
                            className="w-full md:w-14rem"
                        />
                        <label htmlFor="dd-city">Bulk Items</label>
                    </span>
                    <Button label="Apply" />
                </div>
                <div className={styles.right_section}>
                    1 - 10 of 18900
                    <i className={`pi pi-list ${styles.icons}`} />
                    <i className={`pi pi-th-large ${styles.icons}`} />
                </div>
            </div>
            <div className={styles.jobs_lists}>
                <div className={styles.show_result}>Showing 245 Jobs</div>
                {Array.from({ length: 4 }).map((x, index) => (
                    <Link href="jobs/1" className={styles.card}>
                        <div className={styles.first_row}>
                            <div className={styles.left_section}>
                                <div className={styles.job_details}>
                                    <Image
                                        src="/assets/icons/google.svg"
                                        height={50}
                                        width={100}
                                        alt="icon"
                                    />
                                    <div className={styles.title}>
                                        <h2>Software Engineer </h2>
                                        <p>Google India Private Limited </p>
                                    </div>
                                </div>
                                <ul className={styles.job_jd}>
                                    <li>
                                        <Image
                                            src="/assets/icons/PlaceMarker.svg"
                                            height={20}
                                            width={50}
                                            alt="icon"
                                        />
                                        Hyderabad, India.
                                    </li>
                                    <li>
                                        <Image
                                            src="/assets/icons/Resume.svg"
                                            height={20}
                                            width={50}
                                            alt="icon"
                                        />
                                        Experience: 3 years to 8 years
                                    </li>
                                    <li>
                                        <Image
                                            src="/assets/icons/Cash.svg"
                                            height={20}
                                            width={50}
                                            alt="icon"
                                        />
                                        5,00,000 - 10,00,000
                                    </li>
                                    <li>
                                        <Image
                                            src="/assets/icons/DevelopmentSkill.svg"
                                            height={20}
                                            width={50}
                                            alt="icon"
                                        />
                                        Primary Skills: Java, Python, NodeJS,
                                        <br />
                                        li, Communication, Front end programming
                                    </li>
                                    <li>
                                        <Image
                                            src="/assets/icons/PermanentJob.svg"
                                            height={20}
                                            width={50}
                                            alt="icon"
                                        />
                                        Full Time
                                    </li>
                                </ul>
                            </div>
                            <div className={styles.right_section}>
                                <div className={styles.posted}>
                                    <div>
                                        Posted on 12 July 2023
                                        <span>Codinglimits Private Limied</span>
                                    </div>
                                    <i
                                        className="pi pi-ellipsis-v"
                                        onClick={(event) => {
                                            defaultClick(event);
                                            menuRight.current.toggle(event);
                                        }}
                                    />
                                </div>
                                <div className="tag active">open</div>
                            </div>
                        </div>
                        <div className={styles.second_row}>
                            <div className={styles.left_section}>
                                <div className={styles.box}>
                                    <h5>Sourced</h5>
                                    <p>23</p>
                                </div>
                                <div className={styles.box}>
                                    <h5>Applied</h5>
                                    <p>23</p>
                                </div>
                                <div className={styles.box}>
                                    <h5>Phone Screening</h5>
                                    <p>23</p>
                                </div>
                                <div className={styles.box}>
                                    <h5>Offer</h5>
                                    <p>23</p>
                                </div>
                                <div className={styles.box}>
                                    <h5>Onboarded</h5>
                                    <p>23</p>
                                </div>
                                <div className={styles.box}>
                                    <h5>Decline</h5>
                                    <p>23</p>
                                </div>
                            </div>
                            <div className={styles.right_section}>
                                {/* <Button
                                    onClick={(e) => defaultClick(e)}
                                    className="surface-300 outline-0 border-0 font-semibold text-600"
                                >
                                    Workflow
                                </Button> */}
                                <Button onClick={(e) => defaultClick(e)}
                                    className="surface-300 outline-0 border-0 font-semibold text-600" >

                                    <Link href={`/jobs/lists/${index}/workflow`} className='text-color'>
                                        Workflow
                                    </Link>
                                </Button>
                                <Button
                                    onClick={(e) => defaultClick(e)}
                                    className="surface-300 outline-0 border-0 font-semibold text-600"
                                >
                                    Share
                                </Button>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
}
