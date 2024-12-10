import Image from 'next/image';
import React from 'react';
import style from './style.module.scss';
import 'primeicons/primeicons.css';
import StreamlinedBox from './streamlinedBox';
import { Button } from 'primereact/button';
import Header from '@/components/Public/Header';
import Footer from '@/components/Public/Footer';
import { useRouter } from 'next/router';

const Index = () => {
    const testimonialsData = [
        {
            stars: 5,
            imageSrc: '/assets/landing/freelancer/person.png',
            name: 'Martha Cole',
            quote: '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor” Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam impedit recusandae omnis sequi quis culpa ipsam. Laborum eum qui porro consequuntur recusandae possimus, earum aliquid illum eaque, natus est! Ipsum voluptas assumenda eaque?',
        },
        {
            stars: 4,
            imageSrc: '/assets/landing/freelancer/person.png',
            name: 'John Cole',
            quote: '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor”',
        },
        {
            stars: 5,
            imageSrc: '/assets/landing/freelancer/person.png',
            name: 'Martha Cole',
            quote: '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor”',
        },
        {
            stars: 4,
            imageSrc: '/assets/landing/freelancer/person.png',
            name: 'Martha Cole',
            quote: '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor”',
        },
        {
            stars: 4,
            imageSrc: '/assets/landing/freelancer/person.png',
            name: 'John Cole',
            quote: '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor”',
        },

        {
            stars: 4,
            imageSrc: '/assets/landing/freelancer/person.png',
            name: 'Martha Cole',
            quote: '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor”',
        },
    ];

    const statsData = [
        {
            value: 3,
            label: 'Countries',
            imageSrc: '/assets/job_seeker/earth.png',
        },
        {
            value: 333,
            label: 'Companies',
            imageSrc: '/assets/job_seeker/building.png',
        },
        {
            value: 4733,
            label: 'Current Jobs',
            imageSrc: '/assets/job_seeker/New Job white.png',
        },
        {
            value: 712,
            label: 'Recruiters',
            imageSrc: '/assets/job_seeker/male.png',
        },
        {
            value: 12,
            label: 'Selections',
            imageSrc: '/assets/landing/client/Hire Me.png',
        },
        {
            value: 52,
            label: 'Languages',
            imageSrc: '/assets/landing/client/language.png',
        },
    ];

    const faqData = [
        {
            id: 1,
            question: 'What is the difference between A and B?',
            answer: 'Lorem ipsum is typically a corrupted version of "De finibus bonorum et malorum", a 1st century BC text by the Roman.',
        },
        {
            id: 2,
            question: 'How can I get started with React?',
            answer: 'To get started with React, you need to install Node.js and npm, create a new React app using Create React App, and then start building your components.',
        },
        {
            id: 3,
            question: 'What are the benefits of using CSS modules?',
            answer: 'CSS modules help in localizing styles, preventing style conflicts, and making it easier to manage styles in large projects.',
        },
        {
            id: 4,
            question: 'What is the difference between A and B?',
            answer: 'Lorem ipsum is typically a corrupted version of "De finibus bonorum et malorum", a 1st century BC text by the Roman.',
        },
        {
            id: 5,
            question: 'How can I get started with React?',
            answer: 'To get started with React, you need to install Node.js and npm, create a new React app using Create React App, and then start building your components.',
        },
        {
            id: 6,
            question: 'What are the benefits of using CSS modules?',
            answer: 'CSS modules help in localizing styles, preventing style conflicts, and making it easier to manage styles in large projects.',
        },
    ];

    const router = useRouter();

    return (
        <div className={style.client}>
            <Header
            // linkColor="var(--bg-color-3)"
            // btn_BG="var(--bg-color-3)"
            // btnColor="white"
            />
            <div className={style.heroSection}>
                <div className={style.text_graphic}>
                    <div className={style.heroText}>
                        <h3>
                            The easier way to attract, hire, and retain top
                            talent
                        </h3>
                        <p>
                            Modern applicant tracking software and unlimited
                            help from our team means you&apos;ll attract the right
                            candidates, select the best, and wow your new hires.
                        </p>
                        <Button label="Get started" severity="secondary" onClick={() => router.push('/auth/client')} />
                    </div>
                    <Image
                        src="/assets/landing/client/Data_extraction.png"
                        alt="img"
                        height="400"
                        width="600"
                    />
                </div>
                <div className={style.textStats}>
                    <div className={style.heroText2}>
                        <h3>
                            AI-Enhanced Talent Sourcing for Seamless Client
                            Recruitment
                        </h3>
                        <p>
                            At talency.co, we make the hiring process seamless
                            and efficient for our clients. Our innovative
                            approach leverages AI analysis to provide you with
                            top talent profiles,
                        </p>
                    </div>
                    <section className={style.stats}>
                        {statsData.map((stat, index) => (
                            <div className={style.info_box} key={index}>
                                <div className={style.text}>
                                    <h5>{stat.value}</h5>
                                    <p>{stat.label}</p>
                                </div>
                                <Image
                                    src={stat.imageSrc}
                                    height="68"
                                    width="68"
                                    alt="img"
                                />
                            </div>
                        ))}
                    </section>
                    <button>Learn More</button>
                </div>
            </div>
            <div className={style.freeLancersDetails}>
                <h3>Streamlined Client Talent Services</h3>
                <p>
                    AI-Driven Recruitment, Vendor Management, Marketing, and
                    Onboarding Solutions for Optimal Efficiency.
                </p>
                <StreamlinedBox />
            </div>
            <div className={style.Testimonials}>
                <h3>Testimonials</h3>
                <div className={style.list}>
                    {testimonialsData.map((testimonial, index) => (
                        <div className={style.item} key={index}>
                            <div className={style.stars}>
                                {Array.from({ length: testimonial.stars }).map(
                                    (_, starIndex) => (
                                        <i
                                            key={starIndex}
                                            className="pi pi-star-fill"
                                            style={{ color: 'yellow' }}
                                        ></i>
                                    )
                                )}
                                {Array.from({
                                    length: 5 - testimonial.stars,
                                }).map((_, starIndex) => (
                                    <i
                                        key={starIndex + testimonial.stars}
                                        className="pi pi-star"
                                        style={{ color: 'yellow' }}
                                    ></i>
                                ))}
                            </div>
                            <Image
                                src={testimonial.imageSrc}
                                height="100"
                                width="100"
                                alt="img"
                            />
                            <h5>{testimonial.name}</h5>
                            <p>{testimonial.quote}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className={style.questions}>
                <div className={style.heading}>
                    <h3>Frequently ask question</h3>
                    <p>
                        Lorem ipsum is typically a corrupted version of &apos;De
                        finibus bonorum et malorum&apos;, a 1st century BC text by
                        the Roman allison.
                    </p>
                    <Button
                        label="Goes to FAQ’s"
                        icon="pi pi-external-link"
                        severity="secondary"
                    />
                </div>
                <div className={style.query}>
                    {faqData.map((faq) => (
                        <details key={faq.id}>
                            <summary>{faq.question}</summary>
                            <p>{faq.answer}</p>
                        </details>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Index;
