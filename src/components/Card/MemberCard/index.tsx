import { Menu } from 'primereact/menu';
import { useRouter } from 'next/router';
import styles from '@/styles/shared/Cards/account_client.module.scss';
import React, { useRef, useState } from 'react';
import NoDataFound from '../../NoDataFound';
import { ToastContainer } from 'react-toastify';
import { Checkbox } from '@/primereact';
import { Tag } from 'primereact/tag';

export default function MemberCard({ data, selectedIds, setSelectedIds, onDeleteOptionClick  }) {
    const router = useRouter();
    const menuRight = useRef(null);
    const [selectedItem, setSelectedItem] = useState(null);

    console.log('data',data)

    const items = [
        {
            label: 'Edit',
            command: () => {
                router.push(`/settings/members/add?id=${selectedItem._id}`);
            },
        },
        {
            label: 'Delete',
            command: () => {
                onDeleteOptionClick(selectedItem);
            },
        },
    ];

    const moreOptionClicked = (e, item) => {
        e.preventDefault();
        e.stopPropagation();
        menuRight.current.toggle(e);
        setSelectedItem(item);
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
                {data?.map((item) => {
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
                                    style={{ cursor: 'pointer' }}
                                />
                            </div>
                                <div className={styles.box}><strong>{item.firstName ? item.firstName?.substring(0, 1) : item.fullName?.substring(0, 1)}</strong></div>
                            <div className={styles.name}>
                                <strong>
                                {item.firstName} {item.lastName}
                                    {item.firstName ? "" : item.fullName}
                                    </strong>
                            </div>
                            <div className={styles.email}>
                                {item.email}
                            </div>
                            <div className={styles.department}>
                                {item.businessUnit? `${item.businessUnit.label} department`: ""}
                            </div>
                            <div className={styles.reportingTo}>
                                {item.reportingTo ? `Reporting to: ${item.reportingTo.firstName}` : ""}
                            </div>
                            {/* <div className={styles.roles}>
                                Roles: {item.roles.join(', ')}
                            </div> */}
                            <div className={styles.roles}  style={{ marginBottom: '1rem' }}>
                                <span>Roles: </span>
                                {item.roles.map((role, index) => (
                                    <Tag key={index} value={role} className={styles.roleTag} style={{ marginRight: '0.5rem' }} />
                                ))}
                            </div>

                        </div>
                    );
                })}
            </section>
            {data?.length == 0 && <NoDataFound />}

        </>
    );
}
