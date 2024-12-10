import Link from 'next/link';
import Image from 'next/image';
import styles from './index.module.scss';
import TitleBar from '@/components/TitleBar';
import { Dropdown } from 'primereact/dropdown';
import { getSalesDashboard, getSalesDashboardContact, setToken } from '@/services/api.service';
import { useAppSelector } from '@/redux'

export const getServerSideProps = async ({ req }) => {
    setToken(req)
    const results = {
        accounts: { data: [], error: '' },
        contacts: { data: [], error: '' },
        tasks: { data: [], error: '' },
    };
    try {
        results.contacts.data = await getSalesDashboardContact();
    } catch (error: unknown) {
        if (error instanceof Error) {
            results.contacts.error = error.message;
        }
    }
    try {
        results.tasks.data = await getSalesDashboard('customer-org');
    } catch (error: unknown) {
        if (error instanceof Error) {
            results.tasks.error = error.message;
        }
    }
    try {
        results.accounts.data = await getSalesDashboard('account-org');
    } catch (error: unknown) {
        if (error instanceof Error) {
            results.accounts.error = error.message;
        }
    }

    return {
        props: {
            accountsCount: results.accounts.data,
            contactsCount: results.contacts.data,
            tasksCount: results.tasks.data,
            errors: {
                accountsCount: results.accounts.error,
                contactsCount: results.contacts.error,
                tasksCount: results.tasks.error,

            }
        }
    };

}

export default function Dashboard({ accountsCount, contactsCount, tasksCount }) {
    const state = useAppSelector(state => state)
    console.log(state)
    return (
        <>
            <TitleBar title="Sales Dashboard">
                <Dropdown
                    optionLabel="name"
                    placeholder="Filter by"
                    className="w-full"
                />
            </TitleBar>
            <section className={styles.wrapper}>
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <div className={styles.inner_card}>
                            <Image
                                src="/assets/dashboard/user.svg"
                                alt="banner"
                                height={93}
                                width={93}
                            />
                            <div>
                                <p>Accounts</p>
                                <h2>{accountsCount.count}</h2>
                            </div>
                        </div>
                        <div className={styles.view_button}>
                            <Link href="/sales/accounts" prefetch={false}>
                                View
                            </Link>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.inner_card}>
                            <Image
                                src="/assets/dashboard/contacts.svg"
                                alt="banner"
                                height={93}
                                width={93}
                            />
                            <div>
                                <p>Total Contacts</p>
                                <h2>{contactsCount.count}</h2>
                            </div>
                        </div>
                        <div className={styles.view_button}>
                            <Link href="/sales/contacts" prefetch={false}>
                                View
                            </Link>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.inner_card}>
                            <Image
                                src="/assets/dashboard/subtasks.svg"
                                alt="banner"
                                height={93}
                                width={93}
                            />
                            <div>
                                <p>Today’s Tasks</p>
                                <h2>{tasksCount.count}</h2>
                            </div>
                        </div>
                        <div className={styles.view_button}>
                            <Link href="/sales/tasks" prefetch={false}>
                                View
                            </Link>
                        </div>
                    </div>
                </div>
                <div className={styles.grid_second}>
                    <div className={styles.card}>
                        <div className={styles.card_header}>
                            <Image
                                src="/assets/dashboard/job.svg"
                                alt="banner"
                                height={20}
                                width={20}
                            />
                            <span>Jobs</span>
                        </div>
                        <h2></h2>
                        <div className={styles.progress}>
                            <span>%</span>
                            than last month
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.card_header}>
                            <Image
                                src="/assets/dashboard/open.svg"
                                alt="banner"
                                height={20}
                                width={20}
                            />
                            <span>Open</span>
                        </div>
                        <h2></h2>
                        <div className={styles.progress}>
                            <span>%</span>
                            than last month
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.card_header}>
                            <Image
                                src="/assets/dashboard/communicate.svg"
                                alt="banner"
                                height={20}
                                width={20}
                            />
                            <span>Interviews</span>
                        </div>
                        <h2></h2>
                        <div className={styles.progress}>
                            <span>%</span>
                            than last month
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.card_header}>
                            <Image
                                src="/assets/dashboard/approve.svg"
                                alt="banner"
                                height={20}
                                width={20}
                            />
                            <span>Closures</span>
                        </div>
                        <h2></h2>
                        <div className={styles.progress}>
                            <span>%</span>
                            than last month
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.card_header}>
                            <Image
                                src="/assets/dashboard/onboarding.svg"
                                alt="banner"
                                height={20}
                                width={20}
                            />
                            <span>Onboarding&apos;s</span>
                        </div>
                        <h2></h2>
                        <div className={styles.progress}>
                            <span>%</span>
                            than last month
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
