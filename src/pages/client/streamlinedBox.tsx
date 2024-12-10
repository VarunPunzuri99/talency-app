import Image from 'next/image';
import style from './stlneBox.module.scss';
import { useState } from 'react';

const StreamlinedBox = () => {
    const [activeItemId, setActiveItemId] = useState(2); // Set the initial active item id
    const [animationActive, setAnimationActive] = useState(false);
    const sidebarItems = [
        { name: 'People', id: 1 },
        { name: 'Payroll', id: 2 },
        { name: 'Benefit', id: 3 },
        { name: 'Payment', id: 4 },
        { name: 'Time Off', id: 5 },
        { name: 'App', id: 6 },
        { name: 'Devices', id: 7 },
    ];

    const startAnimation = () => {
        setAnimationActive(true);
        setTimeout(() => setAnimationActive(false), 1000);
    };
    const handleItemClick = (itemId) => {
        startAnimation();
        setActiveItemId(itemId);
    };
    const itemsData = [
        {
            imageSrc: '/assets/first/person.png',
            name: 'Bob Johnson',
            role: 'Marketing Specialist',
            status: 'success',
            amount: '$4,200',
        },
        {
            imageSrc: '/assets/first/person.png',
            name: 'Jane Smith',
            role: 'Software Engineer',
            status: 'pending',
            amount: '$2,500',
        },
        {
            imageSrc: '/assets/first/person.png',
            name: 'John Doe',
            role: 'Project Manager',
            status: 'unpaid',
            amount: '$3,300',
        },
    ];
    return (
        <div className={style.streamlinedBox}>
            <div className={style.sidebar}>
                {sidebarItems.map((item) => (
                    <p
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={activeItemId === item.id ? style.active : ''}
                    >
                        {item.name}
                    </p>
                ))}
            </div>
            <div className={style.overview}>
                <div
                    className={`${style.chart} ${
                        animationActive ? style.chartAnimation : ''
                    }`}
                >
                    <h5>Payment Status</h5>
                    <p>
                        <span>121</span> Employees
                    </p>
                    <div className={style.bar}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <ul className={style.values}>
                        <li>
                            <p>
                                <strong>68%</strong> <br />
                                successfully
                            </p>
                        </li>
                        <li>
                            <p>
                                <strong>17% </strong> <br /> Pending
                            </p>
                        </li>
                        <li>
                            <p>
                                <strong>15% </strong> <br /> Unpaid
                            </p>
                        </li>
                    </ul>
                </div>
                {/* <div className={style.latest}> */}
                <div
                    className={`${style.latest} ${
                        animationActive ? style.chartAnimation : ''
                    }`}
                >
                    <div className={style.header}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div className={style.item_list}></div>
                    <div className={style.head}>
                        <h5>Latest {sidebarItems[activeItemId - 1].name}</h5>
                        <p>View All</p>
                    </div>
                    <ul className={style.list}>
                        {itemsData.map((item, index) => (
                            <li className={style.item} key={index}>
                                <div className={style.left}>
                                    <Image
                                        height="20"
                                        width="20"
                                        src={item.imageSrc}
                                        alt="img"
                                    />
                                    <div className={style.name}>
                                        <h6>{item.name}</h6>
                                        <p>{item.role}</p>
                                    </div>
                                </div>
                                <div className={style.right}>
                                    <p
                                        className={`${style.status} ${
                                            style[item.status]
                                        }`}
                                    >
                                        {item.status.charAt(0).toUpperCase() +
                                            item.status.slice(1)}
                                    </p>
                                    <p>{item.amount}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className={style.item_details}>
                <h5 className={animationActive ? style.slideInFromBottom : ''}>
                    {sidebarItems[activeItemId - 1].name}
                </h5>
                <p className={animationActive ? style.slideInFromBottom2 : ''}>
                    Automate {sidebarItems[activeItemId - 1].name} and execute
                    salary payments in a few clicks. Get real time insights into
                    headcount costs and reduce payroll mistakes by keeping HR
                    and payroll data in one place.
                </p>
            </div>
        </div>
    );
};

export default StreamlinedBox;
