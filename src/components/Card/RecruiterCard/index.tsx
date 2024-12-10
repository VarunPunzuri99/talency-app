import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'primereact/menu';
import { useRouter } from 'next/router';
import styles from './index.module.scss';
import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import EmailModal from '../../Modals/Email';
import MoveToModal from '../../Modals/MoveTo';
import NoDataFound from '../../NoDataFound';
import { BasicUser } from '@/services/types';
import { Checkbox } from 'primereact/checkbox';
import ChangeStatusModal from '../../Modals/ChangeStatus';

interface RecruiterCardProps {
    data?: BasicUser[],
    setData: Dispatch<SetStateAction<BasicUser[]>>;
    link?: string;
}

export default function RecruiterCard({ data = [], link }: RecruiterCardProps) {
    const router = useRouter();
    const menuRight = useRef<Menu>(null);
    const [selectedUser, setSelectedUser] = useState<BasicUser | null>(null);
    const [moveToVisible, setMoveToVisible] = useState(false);
    const [emailModalVisible, setEmailModalVisible] = useState(false);
    const [changeStatusVisible, setChangeStatusVisible] = useState(false);
    const [isStarred, ] = useState(true);

    const items = [
        {
            label: 'Edit',
            command: () => {
                if (selectedUser?._id) {
                    router.push(`${router.asPath}/add?id=${selectedUser._id}`);
                }
            },
        },
        {
            label: 'Move To',
            command: () => setMoveToVisible(true),
        },
        {
            label: 'Change Status',
            command: () => setChangeStatusVisible(true),
        },
        {
            label: 'Comments',
            command: () => { },
        },
        {
            label: 'Task',
            command: () => { },
        },
        {
            label: 'Email',
            command: () => setEmailModalVisible(true),
        },
    ];

    const stopBackgroundClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // const handleCallClick = (number: string | undefined) => {
    //     if (number) {
    //         window.location.href = `tel:${number}`;
    //     }
    // };

    const handleEmailClick = (email: string | undefined) => {
        if (email) {
            window.location.href = `mailto:${email}?subject=Hello&body=Hi%20there,`;
        }
    };

    // const handleWhatsAppClick = (number: string | undefined) => {
    //     if (number) {
    //         window.open(`//api.whatsapp.com/send?phone=${number}&text=Hi`);
    //     }
    // };

    // const favouriteClicked = (Recruiter: BasicUser) => {
    //     // Implement favourite functionality if needed
    // };


    return (
        <>
            <Menu
                model={items}
                popup
                ref={menuRight}
                id="popup_menu_right"
                popupAlignment="right"
            />
            <section className={styles.wrapper}>
                {data?.map((recruiter, i) => {
                    const contactEmail = recruiter?.contactDetails?.[0]?.contactEmail;
                    return (

                        <Link
                            href={
                                link
                                    ? link + '/' + recruiter?._id
                                    : `/internals/recruitment-team/${recruiter?._id}`
                            }
                            className={styles.card}
                            key={`Recruiter_card-${i}`}
                        >
                            <div className={styles.check_box}>
                                <Checkbox checked={false} />
                            </div>
                            <i
                                className={`pi pi-ellipsis-v ${styles.options_button}`}
                                onClick={(event) => {
                                    stopBackgroundClick(event);
                                    setSelectedUser(recruiter);
                                    menuRight.current.toggle(event);
                                }}
                            />

                            <div className={styles.box}>
                                {recruiter.fullName?.toUpperCase()?.substring(0, 1)}{' '}
                                {/* {recruiter.lastName?.toUpperCase()?.substring(0, 1)} */}
                            </div>
                            <div className={styles.name}>
                                {/* <i
                                className={`pi heart ${recruiter
                                    ? 'pi-heart-fill'
                                    : 'pi-heart'
                                    }`}
                                onClick={(e) => {
                                    stopBackgroundClick(e);
                                    favouriteClicked(recruiter);
                                }} */}
                                <Image src={isStarred ? "/assets/icons/coloredstar.svg" : "/assets/icons/star.svg"} height={20} width={20} alt="icon" />
                                {/* /> */}
                                {/* {Recruiter.salutation}  */}
                                {/* {recruiter.firstName}{' '} {recruiter.lastName} */}
                                {recruiter.fullName}
                                {/* {Recruiter.middleName}  */}
                            </div>
                            <div className={styles.address}>
                                {/* {`${Recruiter?.RecruiterAddress[0]?.apartment + Recruiter?.RecruiterAddress[0]?.street + 
                                Recruiter?.RecruiterAddress[0]?.city + Recruiter?.RecruiterAddress[0]?.country?.countryName }` || 'Location not Available'
                            } */}
                                {/* {`${Recruiter?.RecruiterAddress[0]?.city + ",  " +  Recruiter?.RecruiterAddress[0]?.country?.countryName}` || 'Location not available'} */}
                                {recruiter?.location}
                            </div>

                            <div className={styles.button_wrapper}>
                                <div className={styles.details}>Detail & Activity</div>
                                <div className={styles.action}>
                                    {/* <a
                                        href={`tel:${contactNumber}`}
                                        onClick={(e) => {
                                            stopBackgroundClick(e);
                                            handleCallClick(contactNumber);
                                        }}
                                    >
                                    </a> */}
                                    <Image
                                        alt="call"
                                        width={25}
                                        height={25}
                                        src="/assets/icons/Call.svg"
                                    />
                                    <Image
                                        width={25}
                                        height={25}
                                        alt="email"
                                        src="/assets/icons/Email2.svg"
                                        onClick={() => handleEmailClick(contactEmail)}
                                    />
                                    {/* <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => {
                                            stopBackgroundClick(e);
                                            handleWhatsAppClick(Recruiter?.RecruiterDetails?.[0]?.RecruiterNumber);
                                        }}
                                        href={`//api.whatsapp.com/send?phone=${Recruiter?.RecruiterDetails?.[0]?.RecruiterNumber}&text=Hi`}
                                    >
                                    </a> */}
                                    <Image
                                        alt="whatsapp"
                                        src="/assets/icons/WhatsApp.svg"
                                        height={25}
                                        width={25}
                                    />
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </section>
            {data?.length == 0 && <NoDataFound />}
            {emailModalVisible && (
                <EmailModal
                    visible={emailModalVisible}
                    setVisible={setEmailModalVisible}
                />
            )}
            {changeStatusVisible && (
                <ChangeStatusModal
                    visible={changeStatusVisible}
                    setVisible={setChangeStatusVisible}
                />
            )}
            {moveToVisible && (
                <MoveToModal
                    visible={moveToVisible}
                    setVisible={setMoveToVisible}
                />
            )}
        </>
    );
}