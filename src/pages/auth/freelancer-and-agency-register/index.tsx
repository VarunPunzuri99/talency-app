import styles from './index.module.scss';
import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { RadioButton } from 'primereact/radiobutton';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import OtpInput from 'react-otp-input';
import { Toast } from 'primereact/toast';
import api, { addOrg, updateOrg, updateUserProfile } from '@/services/api.service';
import Link from 'next/link';
import { InputText } from 'primereact/inputtext';
import { UploadButton } from '@/utils/uploadBtn';
import Cookies from 'universal-cookie';
import { getOrgIdFromToken, getUserIdFromToken } from '@/utils/tokenUtils';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import Image from 'next/image';


export default function Signup() {
    const toast = useRef(null);
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [isFreeLancing, setIsFreeLancing] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [verificationError, setVerificationError] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const [countryList, setCountryList] = useState([]);
    const [stateList, setStateList] = useState([]);
    const [identifiers, setIdentifiers] = useState([]);
    const [files, setFiles] = useState({});
    const cookies = new Cookies();
    const [selectedFile, setSelectedFile] = useState(null);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    const formatFileSize = (size) => {
        if (size < 1024) return size + ' bytes';
        else if (size < 1048576) return (size / 1024).toFixed(2) + ' KB';
        else if (size < 1073741824) return (size / 1048576).toFixed(2) + ' MB';
        else return (size / 1073741824).toFixed(2) + ' GB';
    };

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response: any = await api.getAllActiveCountries();
                setCountryList(response);
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        };
        fetchCountries();
    }, []);

    useEffect(() => {
        const fetchStates = async () => {
            if (selectedCountry && selectedCountry._id) {
                try {
                    const response: any = await api.getActiveStatesByCountryId(selectedCountry._id);
                    setStateList(response);
                    console.log('stateResponse', response)
                } catch (error) {
                    console.error('Error fetching states:', error);
                }
            }
        };
        if (selectedCountry) {
            fetchStates();
        }
    }, [selectedCountry]);

    useEffect(() => {
        const fetchIdentifiers = async () => {
            if (selectedCountry && selectedCountry._id && selectedState && selectedState._id) {
                try {
                    const regionResponse: any = await api.getRegionByCountryAndState(
                        selectedCountry._id,
                        selectedState._id
                    );

                    if (regionResponse && regionResponse._id) {
                        const regionId = regionResponse._id;
                        const identifiersResponse: any = await api.getIdentifiersByRegionId(regionId);
                        const filteredIdentifiers = identifiersResponse.filter(
                            (id) => id.isType === (isFreeLancing ? 'Individual' : 'Company')
                        );
                        console.log(`${isFreeLancing ? 'Individual' : 'Company'} identifiers`, filteredIdentifiers);
                        setIdentifiers(filteredIdentifiers);
                    } else {
                        setIdentifiers([]);
                    }
                } catch (error) {
                    setIdentifiers([]);
                    console.error('Error fetching identifiers:', error);
                    //   toast.error(errorMessage);
                }
            }
        };
        fetchIdentifiers();
    }, [selectedCountry, selectedState, isFreeLancing]);


    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isValid, isDirty },
    } = useForm({
        mode: 'onChange',
    });

    const {
        handleSubmit: handleOnboardingSubmit,
        control: onboardingControl,
    } = useForm({
        mode: 'onChange',
    });


    const onLoginSubmit = async (data) => {
        console.log('userData', data)
        setEmail(data?.email);
        try {
            setLoading(true);
            if (isFreeLancing) {
                await api.registerUser({
                    ...data,
                    source: 'landingPage',
                    roles: ['freelancer']
                });
            } else {

                console.log('agencyData', data);
                const requestBody = {
                    title: data.companyName,
                    "source": "landingPage",
                    "orgType": "agency-org",
                    "createAdminUser": true,
                    createUserDto: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        password: data.password,
                        roles: ['agency-org-admin'],
                        "source": "landingPage",
                    }
                }
                console.log('requestBody', requestBody)
                await addOrg(requestBody);
            }
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
            console.log('otp', otp)
            setLoading(false);

            console.log('verification response', response)

            if (response?.access_token) {
                const token = response?.access_token;
                // Array of roles
                cookies.set('talency_id_token', token, {
                    path: '/',
                });

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

    const submitOnboardingDetails = async (data) => {

        // const identifiersWithFiles = identifiers.filter(
        //     (identifier) => {
        //         if (files.hasOwnProperty(identifier._id)) {
        //             return files[identifier._id] instanceof File;
        //         }
        //         return false;
        //     }
        // );

        const identifiersWithFiles = identifiers.filter((identifier) => {
            if (Object.prototype.hasOwnProperty.call(files, identifier._id)) {
                return files[identifier._id] instanceof File;
            }
            return false;
        });
        
        const identifierIds = identifiersWithFiles.map(
            (identifier) => identifier._id
        );

        const newFileUploads = identifierIds.map(
            (identifierId) => files[identifierId]
        );

        let fileMetadatas = [];
        if (Object.values(files).length) {
            fileMetadatas = await api.uploadFilesWithIdentifiers(newFileUploads, identifierIds) as any;
        }

        const fileMetadataMap = new Map();

        fileMetadatas.forEach((metadata) => {
            fileMetadataMap.set(metadata.identifier, metadata);
        });

        const onboardingData = {
            // user: getUserIdFromToken(),
            ...(isFreeLancing ? { user: getUserIdFromToken() } : { org: getOrgIdFromToken() }),
            entityType: isFreeLancing ? 'Individual' : 'Company',
            identifiers: identifiers.map((identifier, index) => {
                const fileMetadata = fileMetadataMap.get(identifier._id);

                const identifierData: any = {
                    identifier: identifier._id,
                    value: data.onboarding[index]?.value || ''
                };

                if (files[identifier._id] && files[identifier._id].metadataId) {
                    identifierData.attachmentUrls = files[identifier._id].metadataId;
                }

                if (fileMetadata) {
                    identifierData.attachmentUrls = fileMetadata._id;
                }
                return identifierData;
            })
        };

        console.log('onboardingData', onboardingData)
        // router.push('/sales/dashboard');
        try {
           const response= await api.createOnboarding(onboardingData);
            console.log('Onboarding details submitted successfully!');
            if (response)
                setStep(6);
        } catch (error) {
            console.error('Failed to submit onboarding details:', error);
        }
    };

    const handlePreview = async (file, isNewFile) => {
        try {
            console.log(isNewFile)
            if (isNewFile) {

                const fileUrl = URL.createObjectURL(file);
                setSelectedFile({
                    locationUrl: fileUrl,
                    originalName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                });
                setIsPreviewVisible(true);
            } else {
                const fetchedFile = await api.getFileMetadataById(file.metadataId);
                setSelectedFile(fetchedFile);
                setIsPreviewVisible(true);
            }
        } catch (error) {
            console.error('Error fetching file:', error);
        }
    };

    const hidePreview = () => {
        setIsPreviewVisible(false);
        setSelectedFile(null);
    };

    const renderFilePreview = () => {
        if (!selectedFile || !selectedFile.locationUrl) {
            return <p>No file selected</p>;
        }

        const fileType = selectedFile?.fileType?.toLowerCase();
        const allowedFormats = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'txt'];

        if (fileType === 'application/pdf') {
            return (
                <iframe
                    src={selectedFile.locationUrl}
                    title="PDF Document View"
                    width="100%"
                    height="400px"
                    style={{ border: 'none' }}
                >
                    This is a PDF document view.
                </iframe>
            );
        } else if (fileType === 'image/png' || fileType === 'image/jpg' || fileType === 'image/jpeg') {
            return (
                <img
                    src={selectedFile.locationUrl}
                    alt="Image preview"
                    width="100%"
                    style={{ maxHeight: '400px', objectFit: 'contain' }}
                // onError={(e) => {
                //   e.target.src = 'path/to/placeholder-image.png'; // Provide a placeholder image path
                //   e.target.alt = 'Placeholder image'; // Fallback text
                // }}
                />
            );
        } else if (fileType === 'text/plain') {
            // Read and display text content for .txt files
            return (
                <iframe
                    src={selectedFile.locationUrl}
                    title="Text File View"
                    width="100%"
                    height="400px"
                    style={{ border: 'none', whiteSpace: 'pre-wrap' }}
                >
                    This is a Text file view.
                </iframe>
            );
        } else if (allowedFormats.some(format => fileType.includes(format))) {
            const officeViewerURL = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(selectedFile.locationUrl)}`;
            return (
                <iframe
                    src={officeViewerURL}
                    title="Office Document View"
                    width="100%"
                    height="400px"
                    style={{ border: 'none' }}
                >
                    This is an Office document view.
                </iframe>
            );
        } else {
            return <p>Unsupported file type</p>;
        }
    };


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
                            <h2>Freelancers/Agencies Registration Form</h2>
                            <form onSubmit={handleSubmit(onLoginSubmit)}>
                                <div className={styles.input_section}>
                                    <div className={styles.select_type}>
                                        <div className="flex align-items-center">
                                            <RadioButton
                                                id="Freelancer"
                                                name="Freelancer"
                                                value="isFreeLancing"
                                                onChange={() =>
                                                    setIsFreeLancing(true)
                                                }
                                                checked={isFreeLancing}
                                            />
                                            <label
                                                htmlFor="Freelancer"
                                                className="ml-2"
                                            >
                                                Freelancer
                                            </label>
                                        </div>
                                        <div className="flex align-items-center">
                                            <RadioButton
                                                id="Recruitment"
                                                name="Recruitment Agency"
                                                value="Recruitment"
                                                onChange={() =>
                                                    setIsFreeLancing(false)
                                                }
                                                checked={!isFreeLancing}
                                            />
                                            <label
                                                htmlFor="Recruitment"
                                                className="ml-2"
                                            >
                                                Recruitment Agency
                                            </label>
                                        </div>
                                    </div>
                                    <div className="hr"></div>

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

                                    {!isFreeLancing && (
                                        <>
                                            <input
                                            type="text"
                                                placeholder="Company Name"
                                                maxLength={50}
                                            {...register('companyName', {
                                                required: 'Company Name is required'
                                            })}
                                            />
                                            {errors.companyName && typeof errors.companyName.message === 'string' && (
                                        <small className="p-error">{errors.companyName.message}</small>
                                    )}
                                        </>
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
                                            value={selectedCountry}
                                            optionLabel="countryName"
                                            options={countryList}
                                            filter
                                            focusInputRef={field.ref}
                                            onChange={(e) => {
                                                setSelectedState(null);
                                                setSelectedCountry(e.value);
                                                field.onChange(e.value);
                                            }}
                                        />
                                    )}
                                />
                                {/* {getFormErrorMessage('country')} */}
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
                                            value={selectedState}
                                            optionLabel="stateName"
                                            options={stateList}
                                            filter
                                            focusInputRef={field.ref}
                                            onChange={(e) => {
                                                setSelectedState(e.value);
                                                field.onChange(e.value);
                                            }}
                                        />
                                    )}
                                />
                                {/* {getFormErrorMessage('state')} */}
                            </div>

                            {/* Proceed Button */}
                            <button
                                className={styles.proceedButton}
                                onClick={async () => {
                                    // Send the country and state to the backend first
                                    try {
                                        const userId = getUserIdFromToken();
                                        const orgId = getOrgIdFromToken();
                                        console.log('userId', userId)
                                        console.log('orgId', orgId);
                                        const requestData = {
                                            country: selectedCountry._id,
                                            state: selectedState._id
                                        }
                                        const userUpdateResponse = await updateUserProfile(userId, requestData);
                                        let orgUpdateResponse = null;
                                        if (orgId) {
                                            // If an orgId exists, update the organization with country and state
                                            orgUpdateResponse= await updateOrg(orgId, requestData);
                                        } 
                                        if (userUpdateResponse && (!orgId || orgUpdateResponse)) {
                                            setStep(5);
                                        }
                                    } catch (error) {
                                        console.error('Error fetching identifiers:', error);
                                    }
                                }}
                            >
                                Proceed
                            </button>
                        </div>
                    )}

                    {step === 5 && (
                        <>
                            <form onSubmit={handleOnboardingSubmit(submitOnboardingDetails)}>
                                {identifiers.map((identifier, index) => (
                                    <div key={identifier._id} className={styles.formField}>
                                        <label>
                                            {identifier.name}
                                            <span className={styles.requiredMark}>*</span>
                                        </label>
                                        <Controller
                                            control={onboardingControl}
                                            name={`onboarding[${index}].value`}
                                            defaultValue={files[identifier._id]?.name || ''}
                                            rules={{ required: `${identifier.name} is required` }}
                                            render={({ field }) => (
                                                <>
                                                    <div className={styles.inputWrapper}>
                                                        <InputText {...field} maxLength={25} />
                                                        {/* {getFormErrorMessage(`onboarding[${index}].value`)} */}
                                                        {identifier.isUpload && (
                                                            <div className={styles.uploadWrapper}>
                                                                <UploadButton
                                                                    name={identifier._id}
                                                                    setFiles={setFiles}
                                                                />
                                                            </div>
                                                        )}
                                                        {files[identifier._id] && (
                                                            <>
                                                                <span
                                                                    className={styles.fileName}
                                                                    data-text={files[identifier._id]?.name}
                                                                    onClick={() =>
                                                                        handlePreview(files[identifier._id], !!files[identifier._id]?.size)
                                                                    }
                                                                    style={{ cursor: 'pointer' }}
                                                                >
                                                                    {files[identifier._id].name}
                                                                </span>
                                                                <i
                                                                    className={`pi pi-trash ${styles.deleteIcon}`}
                                                                    onClick={() => {
                                                                        setFiles((prevFiles) => {
                                                                            const newFiles = { ...prevFiles };
                                                                            delete newFiles[identifier._id];
                                                                            return newFiles;
                                                                        });
                                                                    }}
                                                                />
                                                            </>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        />
                                    </div>
                                ))}

                                <div className={styles.footer}>
                                    <Button
                                        type="submit"
                                        label={loading ? 'Submitting...' : 'Submit Onboarding'}
                                        disabled={loading}
                                    />
                                </div>
                            </form>
                        </>
                    )}

                        {step == 6 && (
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

            <Dialog
                header="File Preview"
                visible={isPreviewVisible}
                style={{ width: '80vw' }}
                onHide={hidePreview}
            >
                {selectedFile ? (
                    <div className={styles['document-view']}>
                        <div className={styles['document-content']}>
                            {renderFilePreview()}
                        </div>
                        <div className={styles['document-details']}>
                            <h4 className='underline'>Details</h4>
                            <Divider />
                            <p><strong>Original Name:</strong> {selectedFile.originalName}</p>
                            <p><strong>File Type:</strong> {selectedFile.fileType}</p>
                            <p><strong>File Size:</strong> {formatFileSize(selectedFile.fileSize)}</p>
                        </div>
                    </div>
                ) : (
                    <p>No file selected for preview</p>
                )}
            </Dialog>

        </>
    );
}
