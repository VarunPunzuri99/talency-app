import React from 'react';
import Head from 'next/head';
import Loader from '@/components/Loader';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Provider } from 'react-redux';
import { store } from '@/redux';

import 'react-toastify/dist/ReactToastify.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export default function App({ Component, pageProps }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const routes = ['auth', 'client', 'job-seeker', 'freelancer', 'start-meet'];
    const newDesignSystems = ['mail-client-design', 'meet', 'meet-end', 'start-meet', 'join']
    
    useEffect(() => {
        console.log(router, 'router')
        if (newDesignSystems.includes(router.pathname.split("/")[2]) || newDesignSystems.includes(router.pathname.split("/")[1])) {
            import('../styles/global.css');
        } else {
            import('../styles/globals.scss');
            import('react-toastify/dist/ReactToastify.css');
            import('primeicons/primeicons.css');
            import('/node_modules/primeflex/primeflex.css');
            import('primereact/resources/themes/lara-light-cyan/theme.css');
        }

        const start = () => setLoading(true);
        const end = () => setLoading(false);
        router.events.on('routeChangeStart', start);
        router.events.on('routeChangeComplete', end);
        router.events.on('routeChangeError', end);
        return () => {
            router.events.off('routeChangeStart', start);
            router.events.off('routeChangeComplete', end);
            router.events.off('routeChangeError', end);
        };
    }, [router.events]);

    if (
        routes.find((x) => router.asPath.split('/')[1] == x) ||
        router.pathname == '/'
    ) {
        return (
            <>
                <Head>
                    <title>Talency</title>
                </Head>
                <Component {...pageProps} />
            </>
        );
    } else {
        return (
            <>
                <Head>
                    <title>Talency</title>
                </Head>
                <Provider store={store}>
                    {
                        router?.query?.iframe === 'true' ? (
                            <>
                                {loading ? <Loader /> : <Component {...pageProps} />}
                            </>
                        ) : (
                            <Layout>
                                {loading ? <Loader /> : <Component {...pageProps} />}
                            </Layout>
                        )
                    }
                </Provider>
            </>
        );
    }
}
