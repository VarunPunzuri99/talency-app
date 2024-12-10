import React, { useEffect, useState } from 'react';
import styles from '@/styles/shared/Jobs/dashborad.module.scss';
import { TabView, TabPanel } from 'primereact/tabview';
import { Chart } from 'primereact/chart';
import Link from 'next/link';
import api, { setToken } from '@/services/api.service';

export const getServerSideProps = async ({ req }) => {
    setToken(req);

    try {
        // Call the API and ensure the type is inferred correctly
        const countObj = await api.getJobsCount();
        // console.log(countObj)
        return {
            props: {
                countObj: countObj
            }
        };
    } catch (error) {
        console.error('Error fetching job count:', error);
        return {
            props: {
                countObj: {
                    jobsCount: 0,
                    jobsOpenCount: 0
                }
            }
        };
    }
}


export default function Jobs({ countObj }) {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const data = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Monady',
                    data: [540, 325, 702, 620, 300, 200, 400],
                    backgroundColor: [
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                    ],
                    borderColor: [
                        'rgb(255, 159, 64)',
                        'rgb(75, 192, 192)',
                        'rgb(54, 162, 235)',
                        'rgb(153, 102, 255)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
        const options = {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        };

        setChartData(data);
        setChartOptions(options);
    }, []);
    return (
        <>
            <div className={styles.job_section}>
                <div>
                    <Link href="/jobs/lists">
                        {countObj.jobsCount} <span>Total Jobs</span>
                        <i className="pi pi-angle-right" />
                    </Link>
                </div>
                <div>
                    <Link href="/jobs/lists">
                        25 <span>Total Interviews</span>
                        <i className="pi pi-angle-right" />
                    </Link>
                </div>
                <div>
                    <Link href="/jobs/lists">
                        4 <span>Applications</span>
                        <i className="pi pi-angle-right" />
                    </Link>
                </div>
                <div className={styles.job_statics}>
                    <div className={styles.statics_header}>
                        <div className={styles.left_section}>
                            <h2>Job Statistics</h2>
                            <p>Showing Job Statistic Jul 01 - 30</p>
                        </div>
                        <div className={styles.right_section}>
                            <button className={styles.active}>Week</button>
                            <button>Month</button>
                            <button>Year</button>
                        </div>
                    </div>
                    <TabView className={styles.tabs}>
                        <TabPanel header="Overview">
                            <div className={styles.tab_content}>
                                <div className={styles.chart}>
                                    <Chart
                                        type="bar"
                                        data={chartData}
                                        options={chartOptions}
                                    />
                                </div>
                                <div>
                                    <div className={styles.card}>
                                        <div className={styles.title}>
                                            Job Views
                                        </div>
                                        <div className={styles.count}>
                                            2,342
                                        </div>
                                        <div className={styles.status}>
                                            This week
                                        </div>
                                    </div>
                                    <div className={styles.card}>
                                        <div className={styles.title}>
                                            Job Views
                                        </div>
                                        <div className={styles.count}>
                                            2,342
                                        </div>
                                        <div className={styles.status}>
                                            This week
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel header="Jobs View">
                            <Chart
                                type="bar"
                                data={chartData}
                                options={chartOptions}
                            />
                        </TabPanel>
                        <TabPanel header="Jobs Applied">
                            <Chart
                                type="bar"
                                data={chartData}
                                options={chartOptions}
                            />
                        </TabPanel>
                    </TabView>
                </div>
                <div className={styles.open_job}>
                    <div className={styles.card_title}>Jobs Open</div>
                    <div className={styles.desc}>
                        <span>{countObj.jobsOpen}</span>
                        Jobs Opned
                    </div>
                </div>
                <div className={styles.application_summary}>
                    <div className={styles.card_title}>Applications</div>
                    <div className={styles.desc}>
                        <span>67</span>
                        Jobs Opned
                    </div>
                </div>
                <div className={styles.job_update}> Jobs Update </div>
            </div>
        </>
    );
}
