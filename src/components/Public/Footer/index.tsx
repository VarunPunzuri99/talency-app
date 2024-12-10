import React from 'react';
import Image from 'next/image';
import style from './index.module.scss';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className={style.footer}>
            <div className="container">
                <p>Copyright Telency</p>
                <Image
                    src="/assets/dashboard/logo.svg"
                    alt="logo"
                    height="40"
                    width="100"
                />
                <div className={style.termsCondition}>
                    <Link href="privacy-and-policy" prefetch={false}>
                        Privacy Policy
                    </Link>
                    <Link href="terms-and-condition" prefetch={false}>
                        Terms & Conditions
                    </Link>
                </div>
            </div>
        </footer>
    );
}
