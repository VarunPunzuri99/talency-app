import React from 'react';
import styles from './index.module.scss';
import Link from 'next/link';

export default function Jobs(props) {
    return (
        <>
            <header className={styles.header}>Internal Team</header>

            <div className={styles.job_section}>
                <div>
                    <Link href="/internals/jobs">
                        39 <span>Total Jobs</span>
                        <i className="pi pi-angle-right" />
                    </Link>
                </div>
                <div>
                    <Link href="/internals/contacts">
                        25 <span>Internal Contacts</span>
                        <i className="pi pi-angle-right" />
                    </Link>
                </div>
                <div>
                    <Link href="/internals/recruitment-team">
                        4 <span>Recruitment Team</span>
                        <i className="pi pi-angle-right" />
                    </Link>
                </div>
                <div className={styles.job_statics}></div>
                <div className={styles.open_job}>
                    <Link href="/internals/vendor-team">
                        <span>12</span>
                        <div className={styles.card_title}>Vendor Team</div>
                        <i className="pi pi-angle-right"></i>
                    </Link>
                </div>
                <div className={styles.application_summary}>
                    <span></span>
                    <div className={styles.card_title}></div>
                    <i ></i>
                </div>
                <div className={styles.job_update}> Jobs Update </div>
            </div>
        </>
    );
}
