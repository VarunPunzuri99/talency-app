import styles from './index.module.scss';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import TitleBar from '@/components/TitleBar';

export default function EmailSetting() {
    return (
        <>
            <TitleBar title="Settings" />
            <div className={styles.wrapper}>
                <div className={`${styles.grid} gap-3`}>
                    <div>
                        <label>From Name</label>
                        <InputText placeholder="name" />
                    </div>
                    <div>
                        <label>From Email</label>
                        <InputText placeholder="email address" />
                    </div>
                    <div>
                        <label>Host Name</label>
                        <InputText placeholder="smtp.example.com" />
                    </div>
                    <div>
                        <label>Port</label>
                        <InputText placeholder="3 - digit port number" />
                    </div>
                    <div>
                        <label>Pop3 Host Url</label>
                        <InputText placeholder="3 - digit port number" />
                    </div>
                    <div>
                        <label>Pop3 Port</label>
                        <InputText placeholder="3 - digit port number" />
                    </div>
                    {/* <div className={styles.heading}>CREDENTIALS</div> */}
                    <div className={styles.headline}>
                        <h4>CREDENTIALS</h4>
                        <span></span>
                    </div>
                    <div>
                        <label>User name</label>
                        <InputText placeholder="user name" />
                    </div>
                    <div>
                        <label>Password</label>
                        <InputText placeholder="*******" />
                    </div>
                    <div
                        className={`${styles.heading} ${styles.with_background}`}
                    >
                        Check your host accepts SSL Connections (True or False).
                    </div>
                    <div className="flex gap-2 align-items-center">
                        {/* Todo */}
                        Enable SSL <InputSwitch checked={false} /> 
                    </div>
                </div>
                <div className={styles.footer}>
                    <Button label={'Test Connection'} />
                    <Button label={'Save Setting'} className="secondary" />
                </div>
            </div>
        </>
    );
}
