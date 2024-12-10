// import styles from './index.module.scss';
import Image from 'next/image';

export default function Loader() {
    return (
        <div className='loader'>
            <div className='image_box'>
                <Image src={'/assets/icons/logo.svg'} alt="Logo" fill={true} />
            </div>
            <div className='dots'></div>
        </div>
    );
}
