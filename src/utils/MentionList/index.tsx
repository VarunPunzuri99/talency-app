import styles from './index.module.scss';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

const MentionList = forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    // console.log("MentionList rendered with items:", props.items);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command({ id: item });
        }
    };

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
        selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }) => {
            if (event.key === 'ArrowUp') {
                upHandler();
                return true;
            }
            if (event.key === 'ArrowDown') {
                downHandler();
                return true;
            }
            if (event.key === 'Enter') {
                enterHandler();
                return true;
            }
            return false;
        },
    }));

    return (
        <div className={styles.dropdown}>
            {props.items.length ? (
                props.items.map((item: any, index: number) => (
                    <button
                        className={index === selectedIndex ? `${styles['is-selected']} ${styles.button}` : styles.button}
                        key={index}
                        onClick={() => selectItem(index)}
                    >
                        {item}
                    </button>
                ))
            ) : (
                <div className={styles.item}>No result</div>
            )}
        </div>
    );
});

// Assign display name here
MentionList.displayName = 'MentionList';

export default MentionList;