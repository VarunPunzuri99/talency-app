import styles from './index.module.scss';
import { useState, useRef, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import OtpInput from 'react-otp-input';
import { Toast } from 'primereact/toast';
import api, { fetchGeocodeData, updateUserProfile } from '@/services/api.service';
import Link from 'next/link';
import { InputText } from 'primereact/inputtext';
import Cookies from 'universal-cookie';
import Image from 'next/image';
import { Role, SourceType } from '@/services/types';
import { useRouter } from 'next/router';


export default function Signup() {
    const toast = useRef(null);
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [verificationError, setVerificationError] = useState('');
    const [countryList, setCountryList] = useState([]);
    const [stateList, setStateList] = useState([]);
    const [userId, setUserId] = useState(null)
    const cookies = new Cookies();

    const onPostalCodeChange = useCallback(
        async (e, field) => {
            const postalCode = e.target.value;
            field.onChange(postalCode);

            if (postalCode.length >= 6) {
                try {
                    const response = await fetchGeocodeData(postalCode);
                    // console.log("API Response:", response);

                    if (response.status === "OK") {
                        const addressComponents = response.results[0].address_components;

                        // Extract country
                        const countryComponent = addressComponents.find((comp) =>
                            comp.types.includes("country")
                        );
                        if (countryComponent) {
                            setValue("country", "")
                            const countryName = countryComponent.long_name;
                            setCountryList([{ label: countryName, value: countryName }]);
                        }

                        // Extract state
                        const stateComponent = addressComponents.find((comp) =>
                            comp.types.includes("administrative_area_level_1")
                        );

                        if (stateComponent) {
                            const stateName = stateComponent.long_name;
                            setStateList([{ label: stateName, value: stateName }]);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching geocode data:", error);
                }
            }
        },
        [] // Empty dependency array ensures the function is created once
    );

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const { register, handleSubmit, control, formState: { errors, isValid, isDirty }, setValue, getValues } = useForm({
        mode: 'onChange',
    });


    const onLoginSubmit = async (data) => {
        console.log('userData', data)
        setEmail(data?.email);
        try {
            setLoading(true);

            await api.registerUser({
                ...data,
                source: SourceType.LANDING_PAGE,
                roles: [Role.User, Role.Recruiter]
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

    const handleVerifyOtp = async () => {
        try {
            setLoading(true);
            const response: any = await api.verifyUserByOtp({ "verification": otp });
            console.log('response', response)
            setLoading(false);

            console.log('verification response', response)

            if (response?.access_token) {
                const token = response?.access_token;
                // Array of roles
                cookies.set('talency_id_token', token, {
                    path: '/',
                });
            }
            if (response?._id) {
                setUserId(response._id)
            }

            if (response.done === true) {
                // Proceed to the next step on successful verification
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

    const handleResend = async () => {
        try {
            setLoading(true);
            const response: any = await api.resendVerificationEmail({ email });
            setLoading(false);

            console.log('resend-email', response)

            if (response.statusCode === 200) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Email Resent',
                    detail: 'Verification email has been resent. Please check your inbox.',
                    life: 3000,
                });
            } else {
                setVerificationError('Failed to resend verification email. Please try again.');
            }
        } catch (error) {
            setLoading(false);
            setVerificationError(error.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

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
                            <h2>Freelancer Registration</h2>
                            <form onSubmit={handleSubmit(onLoginSubmit)}>
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

                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        maxLength={50}
                                        {...register('firstName', {
                                            required: 'First Name is required'
                                        })}
                                    />
                                    {errors.firstName && typeof errors.firstName.message === 'string' && (
                                        <small className="p-error">{errors.firstName.message}</small>
                                    )}

                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        maxLength={50}
                                        {...register('lastName', {
                                            required: 'Last Name is required'
                                        })}
                                    />
                                    {errors.lastName && typeof errors.lastName.message === 'string' && (
                                        <small className="p-error">{errors.lastName.message}</small>
                                    )}

                                    <div className={styles.password_field}>
                                        <div className={styles.password_input_container}>
                                            <InputText
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Password"
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

                                    <div className={styles.check_box}>
                                        <Controller
                                            name="checked"
                                            control={control}
                                            rules={{
                                                required: 'Accept is required.',
                                            }}
                                            render={({ field }) => (
                                                <>
                                                    <Checkbox
                                                        inputId={field.name}
                                                        checked={field.value}
                                                        inputRef={field.ref}
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.checked,
                                                            )
                                                        }
                                                    />
                                                </>
                                            )}
                                        />
                                        I agree to all the terms & condition.
                                    </div>
                                    <button
                                        disabled={
                                            loading || !isDirty || !isValid
                                        }
                                        type="submit"
                                    >
                                        Register
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
                            <div className={styles.resend_container}>
                                <div className={styles.did_not_receive}>
                                    Didn’t receive an email? <span onClick={handleResend}>Resend</span>
                                </div>
                            </div>

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
                        <div className={styles.isVerified}>
                            <h2>Email Verification</h2>
                            <img src="/assets/login/mail.svg" alt="banner" />
                            <h3>Email Address Verified</h3>
                            <button onClick={() => setStep(4)}>Next</button>
                        </div>
                    )}
                    {step === 4 && (
                        <div className={styles.countrySelect}>
                            {/* Postal Code Input */}
                            <div className={styles.countryField}>
                                <label>
                                    Enter postal code <span className={styles.requiredMark}>*</span>
                                </label>
                                <Controller
                                    name="postalCode"
                                    control={control}
                                    rules={{ required: 'Postal code is required.' }}
                                    render={({ field }) => (
                                        <input
                                            id={field.name}
                                            value={field.value}
                                            ref={field.ref}
                                            className={styles.input}
                                            onChange={(e) => onPostalCodeChange(e, field)}
                                            placeholder="Enter postal code"
                                        />
                                    )}
                                />
                            </div>

                            {/* Country Dropdown */}
                            <div className={styles.countryField}>
                                <label>
                                    Select Country <span className={styles.requiredMark}>*</span>
                                </label>
                                <Controller
                                    name="country"
                                    control={control}
                                    rules={{ required: 'Country is required.' }}
                                    render={({ field }) => (
                                        <Dropdown
                                            id={field.name}
                                            value={field.value}
                                            optionLabel="label" // Match the key used in `countryList`
                                            options={countryList}
                                            filter
                                            focusInputRef={field.ref}
                                            onChange={(e) => {
                                                field.onChange(e.value);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            {/* State Dropdown */}
                            <div className={styles.stateField}>
                                <label>
                                    Province/State <span className={styles.requiredMark}>*</span>
                                </label>
                                <Controller
                                    name="state"
                                    control={control}
                                    rules={{ required: 'State is required.' }}
                                    render={({ field }) => (
                                        <Dropdown
                                            id={field.name}
                                            value={field.value}
                                            optionLabel="label"
                                            options={stateList}
                                            filter
                                            focusInputRef={field.ref}
                                            onChange={(e) => {
                                                field.onChange(e.value);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            {/* Proceed Button */}
                            <button
                                className={styles.proceedButton}
                                disabled={
                                    !getValues('postalCode') || !getValues('country') || !getValues('state')
                                }
                                onClick={async () => {
                                    try {
                                        const formData = getValues();

                                        const requestData = {
                                            postalCode: formData.postalCode,
                                            country: formData.country,
                                            state: formData.state
                                        }
                                        console.log(requestData)

                                        const userUpdateResponse = await updateUserProfile(userId, requestData);

                                        if (userUpdateResponse) {
                                            router.push('/auth/login')
                                        }
                                    } catch (error) {
                                        console.error("Error updating user/org:", error);
                                    }
                                }}
                            >
                                Proceed
                            </button>
                        </div>
                    )}

                    {step == 5 && (
                        <div className={styles.six}>
                            <Image
                                src="/assets/icons/approve.svg"
                                alt="approval"
                                height={50}
                                width={50}
                            />
                            <h5 className={styles.heading}>
                                Approval Required
                            </h5>
                            <h4 className={styles.approval_text}>
                                Approval Pending By Talency
                            </h4>
                        </div>
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
