import Image from 'next/image';
import React from 'react';
import style from './style.module.scss';
import 'primeicons/primeicons.css';
import FeedBack from '@/components/Public/FeedBack';

import Header from '@/components/Public/Header';
import Footer from '@/components/Public/Footer';
import { useRouter } from 'next/router';

const Freelancer = () => {
    const tabsData = [
        {
            imageSrc: '/assets/landing/freelancer/man.png',
            alt: 'Man',
        },
        {
            imageSrc: '/assets/landing/freelancer/money.png',
            alt: 'Money',
        },
        {
            imageSrc: '/assets/landing/freelancer/target.png',
            alt: 'Target',
        },
        {
            imageSrc: '/assets/landing/freelancer/resume.png',
            alt: 'Resume',
        },
        {
            imageSrc: '/assets/landing/freelancer/location.png',
            alt: 'Location',
        },
        {
            imageSrc: '/assets/landing/freelancer/earth.png',
            alt: 'Earth',
        },
    ];

    const statsData = [
        {
            number: 3,
            label: 'Countries',
            iconSrc: '/assets/landing/freelancer/earth.png',
        },
        {
            number: 333,
            label: 'Companies',
            iconSrc: '/assets/landing/agencies-logo 1.png',
        },
        {
            number: 4733,
            label: 'Current Jobs',
            iconSrc: '/assets/landing/freelancer/New Job.png',
        },
        {
            number: 712,
            label: 'Recruiters',
            iconSrc: '/assets/landing/Recruiter 1.png',
        },
    ];

    const detailsData = [
        {
            iconSrc: '/assets/landing/freelancer/Online page.png',
            title: 'Find Top Profiles',
            description:
                'Discover standout profiles in your search for excellence with "Find Top Profiles" – your gateway to the best.',
        },
        {
            iconSrc: '/assets/landing/freelancer/Selecting team.png',
            title: 'Profile Onboarding',
            description:
                'Effortlessly onboard with "Profile Onboarding" – your seamless entry point into our platform. Get started with ease.',
        },
        {
            iconSrc: '/assets/landing/freelancer/Banknote.png',
            title: 'Earn On Onboarding',
            description:
                'Start Earning from Onboarding: Jumpstart your journey and unlock rewards as you join our platform. Get more for signing up!',
        },
    ];

    const testimonialsData = [
        {
            stars: 5,
            imageSrc: '/assets/landing/freelancer/person.png',
            name: 'Martha Cole',
            testimonial:
                '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor” Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam impedit recusandae omnis sequi quis culpa ipsam. Laborum eum qui porro consequuntur recusandae possimus, earum aliquid illum eaque, natus est! Ipsum voluptas assumenda eaque?',
        },
        {
            stars: 4,
            imageSrc: '/assets/landing/freelancer/person.png',
            name: 'John hert',
            testimonial:
                '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor”',
        },
        {
            stars: 2,
            imageSrc: '/assets/landing/freelancer/person.png',
            name: 'Rebert Jr',
            testimonial:
                '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor”',
        },
        {
            stars: 1,
            imageSrc: '/assets/landing/freelancer/person.png',
            name: 'Kayn will',
            testimonial:
                '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor”',
        },
    ];

    const router = useRouter();

    return (
        <div className={style.freelancer}>
            {/* Todo */}
            <Header
                // linkColor="var(--bg-color-3)"
                // btn_BG="var(--bg-color-2)"
                // btnColor="var(--bg-color-3)"
            />
            <div className={style.heroText}>
                <h3>Transforming Freelancer: Your Gateway to Global Income Anytime, Anywhere</h3>
                <p>
                    Discover the ideal freelance platform for work-from-home opportunities, perfect
                    for moms, students,
                    <br /> and professionals. Earn in different currencies today!
                </p>
                <button onClick={()=>router.push('/auth/freelancer')}>
                    Join Today! <img src="/assets/landing/job_seeker/Rectangle.png" alt="icon" />
                </button>
            </div>
            <div className={style.heroSection}>
                <div className={style.heroGraphic}>
                    {tabsData.map((tab, index) => (
                        <div className={style.tab} key={index}>
                            <div className={style.base}>
                                <img src={tab.imageSrc} alt={tab.alt} />
                                <div className={style.circle}>
                                    <div className={style.shadow}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className={style.heroText}>
                    <h3>Empower Your Freelance Journey with Us</h3>
                    <p>
                        At our platform, we&apos;re dedicated to empowering freelancers like you. We
                        understand that your life is unique, and your work should be too. That&apos;s why
                        we offer a supportive environment where you can thrive. Work from the
                        comfort of your home, set your own schedule, and tailor your career to your
                        needs. Whether you&apos;re a mom, a student, or a seasoned professional, you&apos;ll
                        find opportunities to learn, grow, and earn. Plus, with international job
                        postings, you can boost your income in different currencies. Join us and
                        take control of your freelance future today.
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
                <div className={style.button}>
                    <button>Learn More</button>
                </div>
            </div>
            <div className={style.freeLancersDetails}>
                <h3>Earn as a Freelancer: Turn Recruitment into Income</h3>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua.
                </p>
                <button onClick={()=>router.push('/auth/freelancer')}>Sign Up Today!</button>
                <br />
                <img src="/assets/landing/freelancer/laptop.png" alt="icon" />
            </div>
            <div className={style.works}>
                <h3>How it works?</h3>
                <div className={style.details}>
                    {detailsData.map((detail, index) => (
                        <div className={style.box} key={index}>
                            <Image
                                src={detail.iconSrc}
                                height="200"
                                width="200"
                                alt={detail.title}
                            />
                            <div className={style.text}>
                                <h5>{detail.title}</h5>
                                <p>{detail.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button>Learn More</button>
            </div>
            <div className={style.Testimonials}>
                <h3>Testimonials</h3>
                <div className={style.list}>
                    {testimonialsData.map((testimonial, index) => (
                        <div className={style.item} key={index}>
                            <div className={style.stars}>
                                {Array.from({ length: 5 }, (_, i) => (
                                    <i
                                        key={i}
                                        className={`pi ${
                                            i < testimonial.stars ? 'pi-star-fill' : 'pi-star'
                                        }`}
                                        style={{ color: 'yellow' }}
                                    ></i>
                                ))}
                            </div>
                            <Image
                                src={testimonial.imageSrc}
                                height="100"
                                width="100"
                                alt={testimonial.name}
                            />
                            <h5>{testimonial.name}</h5>
                            <p>{testimonial.testimonial}</p>
                        </div>
                    ))}
                </div>
            </div>
            {/* Todo: Type '{ style: { readonly [key: string]: string; }; }' is not assignable to type 'IntrinsicAttributes'.
            Property 'style' does not exist on type 'IntrinsicAttributes'.ts(2322)
            */}
            <FeedBack />
            <Footer />
        </div>
    );
};

export default Freelancer;
