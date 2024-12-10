import styles from './index.module.scss';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import OtpInput from 'react-otp-input';
import { Toast } from 'primereact/toast';
import api from '@/services/api.service';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { InputText } from 'primereact/inputtext';



export default function Signup() {
    const toast = useRef(null);
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [verificationError, setVerificationError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const { register, handleSubmit, formState: { errors }, getValues } = useForm({
        mode: 'onChange',
    });


    const forgetPassword = async (data) => {
        console.log('userData', data)
        setEmail(data?.email);
        try {
            setLoading(true);

            await api.forgotPassword({
                email: data.email
            })
            toast.current.show({
                severity: 'info',
                summary: 'OTP SEND',
                life: 3150,
            });
            setStep(2);
        } catch (e) {
            setLoading(false);
            console.log('error', e)
            toast.current.show({
                severity: 'info',
                summary: 'Error',
                detail: Array.isArray(e?.response?.data?.message)
                    ? e?.response?.data?.message.map((msg) => msg.replace(/_/g, ' ')).join(', ')
                    : e?.response?.data?.message.replace(/_/g, ' '),
                life: 3150,
            });
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async (data) => {

        console.log('userData', data)
        setEmail(data?.email);
        try {
            setLoading(true);

            await api.updatePasswordAfterForget({
                email: data.email,
                password: data.password
            })
            toast.current.show({
                severity: 'info',
                summary: 'Password updated',
                life: 3150,
            });
            router.push('/auth/login')
        } catch (e) {
            setLoading(false);
            console.log('error', e)
            toast.current.show({
                severity: 'info',
                summary: 'Error',
                detail: Array.isArray(e?.response?.data?.message)
                    ? e?.response?.data?.message.map((msg) => msg.replace(/_/g, ' ')).join(', ')
                    : e?.response?.data?.message.replace(/_/g, ' '),
                life: 3150,
            });
        } finally {
            setLoading(false);
        }
    };


    const handleVerifyOtp = async () => {
        try {
            setLoading(true);
            const response: any = await api.verifyOtpAfterForgotPassword({
                email: email,
                verification: otp
            });
            console.log('otp', otp)
            setLoading(false);

            console.log('verification response', response)

            if (response) {
                setStep(3);
            } else {
                setVerificationError('Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.log('error', error);
            setLoading(false);
            setVerificationError(error.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

    // const handleResend = async () => {
    //     try {
    //         setLoading(true);
    //         const response: any = await api.resendVerificationEmail({ email });
    //         setLoading(false);

    //         console.log('resend-email', response)

    //         if (response.statusCode === 200) {
    //             toast.current.show({
    //                 severity: 'success',
    //                 summary: 'Email Resent',
    //                 detail: 'Verification email has been resent. Please check your inbox.',
    //                 life: 3000,
    //             });
    //         } else {
    //             setVerificationError('Failed to resend verification email. Please try again.');
    //         }
    //     } catch (error) {
    //         setLoading(false);
    //         setVerificationError(error.response?.data?.message || 'Something went wrong. Please try again.');
    //     }
    // };

    const router = useRouter();

    return (
        <>
            <Toast ref={toast} />
            <div className={styles.grid}>
                <div className={styles.left_column}>
                    <img src="/assets/login/banner.svg" alt="banner" />
                </div>

                <div className={styles.right_column}>
                    <img src="/assets/icons/logo.svg" alt="logo" />

                    {step == 1 && (
                        <>
                            {/* <h2>Freelancer Registration</h2> */}
                            <form onSubmit={handleSubmit(forgetPassword)}>
                                <div className={styles.input_section}>
                                    <input
                                        type="email"
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern:
                                                /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/i,
                                        })}
                                        placeholder="Email Address"
                                        maxLength={50}
                                    />
                                    {errors.email && typeof errors.email.message === 'string' && (
                                        <small className="p-error">{errors.email.message}</small>
                                    )}

                                    <button type="submit">
                                        Send OTP
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    {step == 2 && (
                        <div className={styles.email_verify_section}>
                            <h2>Email Verification</h2>
                            <img src="/assets/login/mail.svg" alt="verification banner" className={styles.verification_banner} />
                            <h2>Verify Your Email</h2>
                            <p>
                                We have sent a verification email to <strong>{email || 'example@company.com'}</strong>. Please verify
                                your email address by entering the OTP below.
                            </p>
                            <OtpInput
                                value={otp}
                                shouldAutoFocus={true}
                                onChange={setOtp}
                                numInputs={6}
                                renderSeparator={<span>-</span>}
                                renderInput={(props) => <input {...props} className={styles.otp_input} />}
                            />
                            {/* <div className={styles.resend_container}>
                                <div className={styles.did_not_receive}>
                                    Didn’t receive an email? <span onClick={handleResend}>Resend</span>
                                </div>
                            </div> */}

                            <button className={styles.verify_button} onClick={handleVerifyOtp} disabled={loading} >
                                {loading ? (
                                    <>
                                        Verifying...
                                        <span className={styles.loading_spinner}></span>
                                    </>
                                ) : (
                                    "Verify OTP"
                                )}
                            </button>

                            {verificationError && (
                                <p className={styles.error_message}>{verificationError}</p>
                            )}
                        </div>
                    )}

                    {step == 3 && (
                        <form onSubmit={handleSubmit(updatePassword)}>
                            <div className={styles.input_section}>
                                {/* New Password Field */}
                                <div className={styles.password_field}>
                                    <div className={styles.password_input_container}>
                                        <InputText
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter new password"
                                            className={errors?.password ? styles.invalid : ''}
                                            {...register('password', {
                                                required: 'Password is required',
                                                minLength: {
                                                    value: 8,
                                                    message: 'Password must be at least 8 characters long',
                                                },
                                                pattern: {
                                                    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
                                                    message:
                                                        'Password must contain at least one letter, one number, and be at least 8 characters',
                                                },
                                            })}
                                        />
                                        <span
                                            className={`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'} ${styles.eye_icon}`}
                                            onClick={togglePasswordVisibility}
                                        ></span>
                                    </div>
                                    {errors.password && typeof errors.password.message === 'string' && (
                                        <small className="p-error">{errors.password.message}</small>
                                    )}
                                </div>

                                {/* Repeat Password Field */}
                                <div className={styles.password_field}>
                                    <div className={styles.password_input_container}>
                                        <InputText
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Repeat new password"
                                            className={errors?.repeatPassword ? styles.invalid : ''}
                                            {...register('repeatPassword', {
                                                required: 'Please confirm your password',
                                                validate: (value) =>
                                                    value === getValues('password') || 'Passwords do not match',
                                            })}
                                        />
                                        <span
                                            className={`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'} ${styles.eye_icon}`}
                                            onClick={togglePasswordVisibility}
                                        ></span>
                                    </div>
                                    {errors.repeatPassword && typeof errors.repeatPassword.message === 'string' && (
                                        <small className="p-error">{errors.repeatPassword.message}</small>
                                    )}
                                </div>
                                <button type="submit">
                                    Save password
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 1 && <>
                        <div className={styles.already_have_account}>
                            Already have an account? {' '}
                            <Link href="/auth/login">Sign In</Link>
                        </div>
                        <div className={styles.copy_right}>
                            Copyright | Talency 2024
                        </div>
                    </>}
                </div>
            </div>
        </>
    );
}
