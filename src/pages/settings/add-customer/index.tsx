import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import { Tooltip } from "primereact/tooltip";

import styles from "./styles.module.scss";


export default function AddCustomer() {
    const router = useRouter();
    return (
        <>
            <ToastContainer />

            <Tooltip target=".bradCrumb" />

            <div
                className={styles.goBackArrow}
                onClick={() => router.back()}
                data-pr-tooltip="Go back to previous page"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '1rem' }}
            >
                <i className="pi pi-arrow-left" style={{ fontSize: '1rem', marginRight: '0.5rem' }}></i>
                <span>Back</span>
            </div>

            

        </>
    )
}