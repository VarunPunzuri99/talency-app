import Link from 'next/link';
import { Menu } from 'primereact/menu';
import { useRouter } from 'next/router';
import styles from '@/styles/shared/Cards/account_client.module.scss';
import { Button } from 'primereact/button';
import React, { useRef, useState } from 'react';
import MoveToModal from '../../Modals/MoveTo';
import NoDataFound from '../../NoDataFound';
import ChangeStatusModal from '../../Modals/ChangeStatus';
import { ToastContainer } from 'react-toastify';
import { OrgStatus } from '@/services/types';
import { Checkbox } from '@/primereact';

export default function ClientCard({ data, selectedIds, setSelectedIds }) {
    const router = useRouter();
    const menuRight = useRef(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [moveToVisible, setMoveToVisible] = useState(false);
    const [changeStatusVisible, setChangeStatusVisible] = useState(false);

    const orgStatus = [
        { label: 'Qualified', value: OrgStatus.QUALIFIED },
        { label: 'Prospect', value: OrgStatus.PROSPECT },
        { label: 'Dormant', value: OrgStatus.DORMANT },
        { label: 'Customer', value: OrgStatus.CUSTOMER },
        { label: 'Dead', value: OrgStatus.DEAD },
    ];

    const items = [
        {
            label: 'Edit',
            command: () => {
                router.push(`/sales/clients/add?id=${selectedItem._id}`);
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
            label: 'Task',
            command: () => { },
        },
        {
            label: 'Email',
            command: () => { },
        },
    ];

    const moreOptionClicked = (e, item) => {
        e.preventDefault();
        e.stopPropagation();
        menuRight.current.toggle(e);
        setSelectedItem(item);
    };

    const jobsClicked = (e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push("/jobs/lists")
    };

    const contactsClicked = (e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push("/sales/clients")

    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    return (
        <>
            <ToastContainer />
            <Menu
                model={items}
                popup
                ref={menuRight}
                id="popup_menu_right"
                popupAlignment="right"
            />
            <section className={styles.wrapper}>
                {data?.map((item, i) => {
                    const primaryAddress = item.contactAddress?.[0] || {};
                    const cityName = primaryAddress.city || 'N/A';
                    const countryName = item?.country?.countryName || 'N/A';
                    const stateName = item?.state?.stateName || 'N/A';
                    return (
                        <div key={item._id} className={styles.card}>
                            <div className={styles.icons}>
                                <Checkbox
                                    checked={selectedIds.includes(item._id)}
                                    onChange={() => toggleSelect(item._id)}
                                />
                                <i
                                    onClick={(e) => moreOptionClicked(e, item)}
                                    className={`pi  pi-ellipsis-v `}
                                />
                            </div>
                            <Link
                                key={i}
                                href={`/sales/clients/${item?._id}`}
                                prefetch={false}
                            >
                                <div className={styles.box}>{item.title?.substring(0, 1)}</div></Link>
                            <div className={styles.name}>
                                <i
                                    className={`pi ${item?.favourite ? ' pi-star-fill  text-yellow-400' : 'pi-star' }`}
                                />
                                {item.title}
                            </div>
                            <div className={styles.address}>
                                {countryName}, {stateName}, {cityName}
                            </div>

                            <div className={styles.button_wrapper}>
                                <Button label="Jobs" onClick={(e) => jobsClicked(e)} />
                                <Button
                                    label="Contacts"
                                    onClick={(e) => contactsClicked(e)}
                                />
                            </div>
                        </div>
                    );
                })}
            </section>
            {data?.length == 0 && <NoDataFound />}

            {changeStatusVisible && (
                <ChangeStatusModal
                    statusEnum={orgStatus}
                    account={selectedItem}
                    visible={changeStatusVisible}
                    setVisible={setChangeStatusVisible}
                />
            )}

            {moveToVisible && (
                <MoveToModal
                    account={selectedItem}
                    visible={moveToVisible}
                    setVisible={setMoveToVisible}
                // decodedData={decodedData}
                />
            )}
        </>
    );
}
