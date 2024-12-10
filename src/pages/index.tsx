/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import Link from 'next/link';

import Image from 'next/image';
import Cookies from 'universal-cookie';

import style from '@/styles/Home.module.scss';
import { useState, useEffect } from 'react';

// export const getServerSideProps = async () => {
//     let res;
//     try {
//         res = await Api.getMainDashboardData();
//         res = res.data;
//         return {
//             props: {
//                 res,
//                 error: { isError: false, message: "" }
//             }
//         };
//     } catch (error) {
//         console.error(error);
//         return {
//             props: { error: { isError: true, message: error.message } }
//         };
//     }
// };


const LandingPage = ({ res }) => {
    const cookies = new Cookies();
    const [login, setLogin] = useState(false);
    useEffect(() => {
        setLogin(cookies.get('talancy_id_token') ? true : false);
    }, []);
    const sectionsData = [
        {
            iconSrc: '/assets/landing/dash/gis_earth-o.png',
            label: 'Countries',
            value: res?.countryCount || 0,
        },
        {
            iconSrc: '/assets/landing/dash/clients 1.png',
            label: 'Clients',
            value: res?.clientCount || 0,
        },
        {
            iconSrc: '/assets/landing/dash/uil_language.png',
            label: 'Languages',
            value: res?.languageCount || 0,
        },
        {
            iconSrc: '/assets/landing/dash/Recruiter 1.png',
            label: 'Recruiter',
            value: res?.recruitersCount || 0,
        },
        {
            iconSrc: '/assets/landing/dash/selections-logo 1.png',
            label: 'Selections',
            value: res?.selectionsCount || 0,
        },
        {
            iconSrc: '/assets/landing/dash/agencies-logo 1.png',
            label: 'Agencies',
            value: res?.agenciesCount || 0,
        },
    ];



    // if (error.isError) {
    //     return <>
    //         <p>Error</p>
    //         <p>{error.message}</p>
    //     </>
    // }

    return (
        <div className={style.main}>
            <Link href={login ? 'sales/dashboard' : '/auth/login'} className={style.loginButton}>
                {login ? 'Dashboard' : 'Login'}
            </Link>
            <img
                className={style.leftDiode}
                src="/assets/landing/Left-AI-diode.svg"
                alt="Left Diode"
            />
            <img
                className={style.rightDiode}
                src="/assets/landing/Right-AI-diode.svg"
                alt="Right Diode"
            />
            <div className={style.logo}>
                <img src="/assets/dashboard/logo.svg" alt="icon" />
                <h3>How it works?</h3>
            </div>
            <div className={`container ${style.getStarted}`}>
                <section>
                    <h5>Clients</h5>
                    <Image
                        src="/assets/landing/dash/Building-bro 1.png"
                        alt="me"
                        width="200"
                        height="200"
                    />
                    <Link href={'/client'}>Get Started </Link>
                </section>
                <section className={style.gear}>
                    <Image
                        alt="me"
                        width="280"
                        height="280"
                        src="/assets/landing/dash/Group 7.png"
                    />
                </section>
                <section>
                    <h5>Freelancers</h5>
                    <Image
                        src="/assets/landing/dash/Freelancer-pana 1.png"
                        alt="me"
                        width="200"
                        height="200"
                    />
                    <Link href={'/freelancer'}>Get Started </Link>
                </section>
            </div>
            <section className={style.info}>
                <div className={style.job_seeker}>
                    <h5>Job Seekers</h5>
                    <Image
                        alt="me"
                        width="100"
                        height="100"
                        src="/assets/landing/dash/Group 1.png"
                    />
                    <Link href={'/job-seeker'}>Get Started</Link>
                </div>
                <div className={style.wrapper}>
                    {sectionsData.map((section, index) => (
                        <div key={index}>
                            <div className={style.image_box}>
                                <Image src={section.iconSrc} fill={true} alt="icon" />
                            </div>
                            <div className="text">
                                <p>{section.label}</p>
                                <h5>{section.value}</h5>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
