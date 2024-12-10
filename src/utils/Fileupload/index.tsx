import React, { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './index.module.scss'; // SCSS styles for the dashed border and layout
import { ToastContainer, toast } from 'react-toastify';
import { Button } from '@/primereact';

const FileUploadPreview = ({
  defaultImage,
  accept = "image/jpeg, image/png",
  onUpload,
  onRemove,
  uploadedFileUrl,
  disabled = false,
  setFilePreviewUrl,
}) => {
  const [filePreviewUrl, setLocalFilePreviewUrl] = useState(uploadedFileUrl || defaultImage);
  const fileUploadRef = useRef(null);

  const handleFileChange = (event) => {
    console.log("File input changed", event);
    const file = event.target.files[0];
    console.log(event)
    if (file) {
      const isValidType = accept.split(',').some(type => file.type === type.trim());
      if (!isValidType) {
        toast.error('Unsupported file type. Please upload a JPEG or PNG image.'); // Show error toast
        return; // Exit the function
      }
      const fileUrl = URL.createObjectURL(file); // Create a preview URL
      setLocalFilePreviewUrl(fileUrl); // Set the file preview URL
      onUpload(file); // Call the upload handler to upload the file
      setFilePreviewUrl(fileUrl);
    }
  };

  const handleRemove = () => {
    // setFilePreviewUrl(defaultImage); // Reset to default image
    setLocalFilePreviewUrl(defaultImage);
    if (fileUploadRef.current) {
      fileUploadRef.current.value = ''; // Clear the file input
    }
    onRemove();
    setFilePreviewUrl(null); 
  };

  const triggerFileInput = () => {
    if (fileUploadRef.current) {
      fileUploadRef.current.click();
    }
  };

  return (
    <div className={styles.fileUploadContainer}>
      {/* <ToastContainer /> */}
      <div className={styles.filePreview}>
        {filePreviewUrl ?
        //   (
        //   <Image src={filePreviewUrl} alt="Uploaded file" width={100} height={100} />
          // )
          (
            <div className={styles.imageContainer}>
              <Image 
                src={filePreviewUrl} 
                alt="File preview" 
                width={100} 
                height={100} 
              />
              {filePreviewUrl !== defaultImage && (
                <Button
                  icon="pi pi-times"
                  className={`p-button-outlined p-button-danger p-button-sm  ${styles.button_sm} ${styles.removeButton}`}
                  onClick={handleRemove}
                  tooltip="Remove Image"
                  tooltipOptions={{ position: 'bottom' }}
                  style={{ width: '10px', height: '20px', fontSize: '10px' }} 
                />
              )}
            </div>
          )
          : (
          <p>No file selected</p>
        )}
      </div>

      <div className={styles.fileInput}>
        <input
          ref={fileUploadRef}
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={(e) => {
            handleFileChange(e);
          }}
          className={styles.input}
          style={{ display: 'none' }}
        />

        <div className={styles.dashedBox} onClick={triggerFileInput}>
          <p>click to select file </p>
        </div>

      </div>

      {/* <div className={styles.actions}>
        {filePreviewUrl && filePreviewUrl !== defaultImage && (
          <button type="button" onClick={handleRemove} className={styles.removeBtn}>
            Remove
          </button>
        )}
      </div> */}
    </div>
  );
};

export default FileUploadPreview;
