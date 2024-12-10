import React from 'react';
import Link from 'next/link';
import style from './index.module.scss';
import { Button } from 'primereact/button';
import { useRouter } from 'next/router';

export default function Header() {

    const router = useRouter();

    return (
        <header className={`${style.header} container`}>
            <Link href="/" prefetch={false}>
                <img src="/assets/dashboard/logo.svg" alt="icon" />
            </Link>
            <div className={style.links}>
                <Link href="" prefetch={false}>
                    About
                </Link>
                <Link href="" prefetch={false}>
                    Services
                </Link>
                <Link href="" prefetch={false}>
                    Contact
                </Link>
            </div>
            <div className={style.auth_and_lang}>
                <Button label={'Login'} rounded outlined onClick={() => router.push('/auth/login')} />
                <Button label={'En'} rounded outlined />
            </div>
        </header>
    );
}
