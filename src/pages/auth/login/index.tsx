import Link from 'next/link';
import { login } from '@/services/api.service';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'universal-cookie';
import { Button } from 'primereact/button';
import styles from './index.module.scss';
import { useForm } from 'react-hook-form';
import { tryCatch, Toast } from '@/hooks/tryCatch';
import { toast } from 'react-toastify';


export default function Login() {
    const router = useRouter();
    const cookies = new Cookies();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
    } = useForm({
        defaultValues: {
            email: 'noorsana24042002@gmail.com',
            password: 'string123456',
        },
    });


    const onLoginSubmit = (data) => {
        tryCatch(
            async () => {
                setLoading(true);
                const res = await login(data.email, data.password);//not required  remenber me
                console.log("res...................",res) 
                console.log(res)
                // const talency_access_token = localStorage.setItem('talency_id_token', res.access_token);
                if (res?.access_token) {
                    const token = res?.access_token;
                    // Array of roles
                    cookies.set('talency_id_token', token, {
                        path: '/',
                    });

                    // console.log()
                    // checking country, state is set by user or not
                    //no need
                    // const decodedData = jwtDecode(token);
                    // let userRole = '';
                    // if (decodedData.freelancer > 0) {
                    //     userRole = 'freelancer';
                    // }
                    // if (decodedData.company > 0) {
                    //     userRole = 'company';
                    // }
                    // if (decodedData.agency > 0) {
                    //     userRole = 'agency';
                    // }
                    // if (decodedData.admin > 0) {
                    //     userRole = 'admin';
                    // }
                    // if (decodedData.SalesRep > 0) {
                    //     userRole = 'sales-rep';
                    // }
                    // if (decodedData.user > 0) {
                    //     userRole = 'user';
                    // }
                    const message = '🎉 Logged in successfully! Redirecting....';
                    toast.success(message);

                    // Redirect based on roles
                    //  if (roles.includes('company')) {
                    //     router.push('/sales/dashboard');
                    // } else if (roles.includes('freelancer')) {
                    //     router.push('/jobs/lists');
                    // } else if (roles.includes('sales')) {
                    //     router.push('/sales/dashboard');
                    // } else if (roles.includes('agency')) {
                    //     router.push('/agency/dashboard');
                    // } else {
                    //     router.push('/jobs/dashboard');
                    // }

                    // Todo: Create a default page for users
                    router.push('/sales/dashboard');
                }



                // const userDetails = await api.getUserDetailsByUserId(res.data.id);
                // console.log(res.data)
                // const isProfileIncomplete = userDetails.data[userRole]?.country === null;

                // const message = isProfileIncomplete
                //     ? 'Profile completion is essential. Kindly provide your basic information. Redirecting....'
                //     : '🎉 Logged in successfully! Redirecting....';

                // const path = isProfileIncomplete
                //     ? '/auth/signup'
                //     : userRole === 'freelancer'
                //     ? '/jobs/lists'
                //     : '/sales/dashboard';
                // toast[isProfileIncomplete ? 'warning' : 'success'](message);
                // setTimeout(() => router.push(path), 1500);
            },
            false,
            () => {
                setLoading(false);
            }
        );
    };

    // useEffect(() => {
    //     if (token) {
    //         const decodedData = jwtDecode(token);
    //         if (decodedData) {
    //             router.push('/jobs/dashboard');
    //         }
    //     }
    // }, []);

    return (
        <>
            <Toast />
            <div className={styles.grid}>
                <div className={styles.left_column}>
                    <img src="/assets/login/banner.svg" alt="banner" />
                </div>
                <div className={styles.right_column}>
                    <img src="/assets/icons/logo.svg" alt="banner" />
                    <form onSubmit={handleSubmit(onLoginSubmit)}>
                        <input
                            // type="email"
                            {...register('email', {
                                required: true,
                                // pattern: /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/i,
                            })}
                            placeholder="Email Address"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            {...register('password', {
                                required: true,
                            })}
                        />
                        <Button
                            label="Submit"
                            loading={loading}
                            className="secondary"
                        // disabled={!isDirty || !isValid}
                        />
                    </form>

                    <div className={styles.already_have_account}>
                        Don’t have an account? <Link href="/auth/freelancer">Sign Up</Link>
                    </div>

                    {/* <Link
                        href="/auth/forget-password"
                        style={{ display: 'block', textAlign: 'right', color: 'black', marginTop: '10px' }}
                    >
                        Forget password?
                    </Link> */}
                    <div className={styles.already_have_account}>
                        <Link href="/auth/forget-password">
                            Forget password?
                        </Link>
                    </div>

                    <div className={styles.footer}>
                        <div className={styles.copy_right}>Copyright | Talency 2024</div>
                    </div>
                </div>
            </div>
        </>
    );
}
