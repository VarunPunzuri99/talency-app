import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
export interface IframeModalProps {
    path: string;
    setOpen: (e: any) => void;
    open: boolean;
    title?: string;
    setIsDone: (e: any) => void;
}

export const IframeModal: React.FC<IframeModalProps> = ({
    path,
    setOpen,
    open = false,
    title = '',
    setIsDone,
}) => {
    const [loading, setLoading] = useState(true)
    const iframeRaf = useRef(null)
    function handleIframeLoad() {
        setLoading(false)
          window.addEventListener('message', function(event) {
            if(event.data === 'done') {
                setOpen(false);
                setIsDone(true);
            }
          });
        
    }
    return (
        <>
            <Dialog header={title} visible={open} onHide={() => { if (!open) return; setOpen(false); }}
                style={{ width: '90vw', height: '80vh' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }}>
                {loading && <p style={{ width: '100%', textAlign: 'center'}}>Loading...</p>}
                <iframe 
                ref={iframeRaf}
                    src={`${path}?iframe=true`}
                    width="100%"
                    height='100%'
                    style={{ margin: '0 10px', }}
                    frameBorder="0"
                    onLoad={handleIframeLoad}
                />
            </Dialog>
        </>
    );
};
