import Image from 'next/image';
import React from 'react';
import style from './style.module.scss';
import 'primeicons/primeicons.css';
import Testimonials from '@/components/Public/Testimonials';
import FeedBack from '@/components/Public/FeedBack';
import Header from '@/components/Public/Header';
import Footer from '@/components/Public/Footer';
import { useRouter } from 'next/router';

const Job_seeker = () => {
    const tabsData = [
        {
            stars: 3,
            companyLogoSrc: '/assets/landing/job_seeker/amazon.png',
            jobTitle: 'Product Designer',
            location: 'Hyderabad, India.',
            experience: 'Experience: 3 years to 8 years',
        },
        {
            stars: 5,
            companyLogoSrc: '/assets/landing/job_seeker/amazon.png',
            jobTitle: 'Product Designer',
            location: 'Hyderabad, India.',
            experience: 'Experience: 3 years to 8 years',
        },
        {
            stars: 4,
            companyLogoSrc: '/assets/landing/job_seeker/amazon.png',
            jobTitle: 'Product Designer',
            location: 'Hyderabad, India.',
            experience: 'Experience: 3 years to 8 years',
        },
    ];

    const statsData = [
        {
            number: 3,
            label: 'Countries',
            iconSrc: '/assets/landing/job_seeker/earth.png',
        },
        {
            number: 333,
            label: 'Companies',
            iconSrc: '/assets/landing/job_seeker/building.png',
        },
        {
            number: 4733,
            label: 'Current Jobs',
            iconSrc: '/assets/landing/job_seeker/New Job white.png',
        },
        {
            number: 712,
            label: 'Recruiters',
            iconSrc: '/assets/landing/job_seeker/male.png',
        },
    ];

    const jobOpportunities = [
        {
            imageSrc: '/assets/landing/job_seeker/New Job.png',
            heading: 'Discover Job Opportunities',
            description:
                'Explore a wealth of hot and skill-matched job vacancies at your fingertips.',
        },
        {
            imageSrc: '/assets/landing/job_seeker/Walking.png',
            heading: 'Local Job Drives and Walk-Ins',
            description:
                'Find in-person networking events in your area to connect with potential employers.',
        },
        {
            imageSrc: '/assets/landing/job_seeker/Manufacturing.png',
            heading: 'Stay Informed with Industry Insights',
            description:
                'Access real-time trends and insights specific to your skill set and industry.',
        },
        {
            imageSrc: '/assets/landing/job_seeker/Reading.png',
            heading: 'Skill Development and Learning Paths',
            description:
                'Explore a wealth of hot and skill-matched job vacancies at your fingertips.',
        },
        {
            imageSrc: '/assets/landing/job_seeker/Google Alerts.png',
            heading: 'Personalized Job Alerts and Resume Optimization',
            description:
                'Receive job alerts tailored to your preferences and ensure your resume stands out.',
        },
        {
            imageSrc: '/assets/landing/job_seeker/Receive Cash.png',
            heading: 'Secure Your 100% Joining Bonus',
            description:
                'Enjoy a guaranteed joining bonus when you land your dream job through our platform.',
        },
    ];

    const router = useRouter();

    return (
        <div className={style.job_seeker}>
            {/* Todo */}
            <Header
            // linkColor="white" 
            // btn_BG="var(--bg-color-2)" 
            // btnColor="var(--bg-color-3)"
            />
            <div className={style.heroSection}>
                <div className={style.heroText}>
                    <h3>Career Boost: Hot Jobs, Insights, Skills, Bonuses. Act Now!</h3>
                    <p>
                        Discover hot & skill-matched job opportunities, industry insights, and
                        personalised skill development paths. Get hired with a 100% joining bonus.
                    </p>
                    <button onClick={() => router.push('/auth/freelancer')}>
                        Join Today! <img src="/assets/landing/job_seeker/Rectangle.png" alt="icon" />
                    </button>
                </div>
                <div className={style.heroGraphic}>
                    <Image
                        className={style.sideImage}
                        src="/assets/landing/job_seeker/People search-bro 1.png"
                        height="300"
                        width="300"
                        alt="img"
                    />
                    {tabsData.map((tab, index) => (
                        <div className={style.tab} key={index}>
                            <div className={style.companyInfo}>
                                <div className={style.stars}>
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <i
                                            key={i}
                                            className={`pi ${i < tab.stars ? 'pi-star-fill' : 'pi-star'
                                                }`}
                                            style={{ color: 'yellow' }}
                                        ></i>
                                    ))}
                                </div>
                                <Image src={tab.companyLogoSrc} height="30" width="60" alt="img" />
                                <h5>{tab.jobTitle}</h5>
                                <p>{`${tab.location} ${tab.experience}`}</p>
                            </div>
                            <div className={style.base}>
                                <div className={style.circle}>
                                    {index > 0 && <div className={style.shadow}></div>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className={style.textStats}>
                    <div className={style.heroText2}>
                        <h3>Revolutionize Your Job Search with Our Comprehensive Platform</h3>
                        <p>
                            Are you tired of the traditional job hunt? Discover a new way to find
                            your dream job with our cutting-edge platform. Access hot and
                            skill-matched job vacancies in real-time, explore local drives and
                            walk-ins, stay updated on industry insights, and follow personalized
                            skill development paths. Receive job alerts tailored to your
                            preferences, optimize your resume, and enjoy a 100% joining bonus when
                            you secure your next opportunity. Join us today and let us empower your
                            career journey like never before. Your success story starts here.
                        </p>
                    </div>
                    <section className={style.stats}>
                        {statsData.map((stat, index) => (
                            <div className={style.info_box} key={index}>
                                <div className={style.text}>
                                    <h5>{stat.number}</h5>
                                    <p>{stat.label}</p>
                                </div>
                                <Image src={stat.iconSrc} height="68" width="68" alt={stat.label} />
                            </div>
                        ))}
                    </section>
                    <button>Learn More</button>
                </div>
            </div>
            <div className={style.freeLancersDetails}>
                <h3>Unlock Career Success: Discover, Learn, and Join Today!</h3>
                <p>Your Success, Our Priority</p>
                <img src="/assets/landing/job_seeker/Group 8.png" alt="img" />
                <br />
                <button onClick={() => router.push('/auth/candidate')}>Start Your Journey</button>
            </div>
            <div className={style.works}>
                <h3>The Path to Your Success</h3>
                <div className={style.details}>
                    {jobOpportunities.map((job, index) => (
                        <div className={style.box} key={index}>
                            <Image src={job.imageSrc} height="80" width="80" alt="img" />
                            <div className={style.text}>
                                <h5>{job.heading}</h5>
                                <p>{job.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button>Learn More</button>
            </div>
            <Testimonials />
            <FeedBack />
            {/* Todo: Check Style implementation */}
            {/* <FeedBack bg="#E56846" color="white" /> */}
            <Footer />
        </div>
    );
};

export default Job_seeker;
