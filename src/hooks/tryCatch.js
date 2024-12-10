import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
const toastStyles = {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light',
}
async function tryCatch(fnc, callBackFunction, finallyFnc) {
    try {
        await fnc(toast);
    } catch (e) {
        if (callBackFunction) {
            try {
                await callBackFunction(toast, e);
            } catch (error) {
                if (typeof error == 'object') {
                    toast.error(error?.response?.data || 'Something Wrong', toastStyles);
                } else {
                    toast.error(error || 'Something Wrong', toastStyles);
                }
            }
        } else {
            toast.error(e.message || e?.response?.data || 'Something Wrong', toastStyles);
        }
    } finally {
        if (finallyFnc) {
            await finallyFnc(toast);
        }
    }
}

const Toast = () => {
    return <ToastContainer />;
};

export { tryCatch, Toast };
