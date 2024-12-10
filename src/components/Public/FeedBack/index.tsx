import React from 'react';
import styles from './index.module.scss';
import { InputText } from 'primereact/inputtext';

const FeedBack = () => {
    return (
        <div className={styles.feedback}>
            <h3>Subscribe to Newsletter</h3>
            <form action="#" className={styles.form}>
                <InputText className="" type="text" placeholder="Full Name" />
                <InputText
                    className=" "
                    type="text"
                    placeholder="Email Address"
                />
                <InputText
                    className=""
                    type="text"
                    placeholder="Your message..."
                />
                <button>Subscribe</button>
            </form>
            <h6>GET IN TOUCH</h6>
            <p>support@talency.co</p>
            <div className={styles.socialAccounts}>
                <span>Share with</span>
                <br />
                <i className="pi pi-instagram"></i>
                <i className="pi pi-facebook"></i>
                <i className="pi pi-linkedin"></i>
                <i className="pi pi-twitter"></i>
            </div>
        </div>
    );
};

export default FeedBack;
