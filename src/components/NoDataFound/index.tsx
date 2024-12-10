import React from 'react';
import Image from 'next/image';
import styles from './inde.module.scss';

export default function NoDataFound() {
    return (
        <div className={styles.wrapper}>
            <h4 className='flex flex-item-center'>No data found.</h4>
            <Image
                fill={true}
                alt="no data found"
                src="/assets/noDataFound/noDataFound.svg"
            />
        </div>
    );
}
