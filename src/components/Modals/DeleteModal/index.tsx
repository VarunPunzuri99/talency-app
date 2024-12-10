import { useState, useEffect, useRef } from 'react';
import styles from './index.module.scss';
import { Dialog } from 'primereact/dialog';
import { useRouter } from 'next/router';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import  ApiCall from '@/services/api.service';
import {  Toast } from '@/hooks/tryCatch';
import { FileUpload } from 'primereact/fileupload';

export default function DeleteModal({
  visible,
  setVisible,
  title,
  item,
  modalType,
}) {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [, setFile] = useState(null);
  const category = router.asPath.split('/')[1];
  const [loading, setLoading] = useState(false);
  const [, setFileIds] = useState([]);
  const [, setFilesStatus] = useState({});
  const fileUploadRef = useRef(null);
  const [mediaList, ] = useState([]);
  useEffect(() => {
    if (item) {
      console.log('DeleteModal item updated:', item); // Log item when it updates
    }
  }, [item]);

  useEffect(() => {
    if (fileUploadRef.current) {
      fileUploadRef.current.setUploadedFiles(mediaList);
    }
  }, [mediaList]);

  const customUploadHandler = async ({ files }) => {
    const fileStatus = {};
    try {
      const response = await ApiCall.uploadFiles(files);
      console.log(response);
      const uploadedFiles = response.map(file => {
        fileStatus[file.uniqueName] = 'Uploaded';
        return {
          ...file,
          name: file.originalName,
          size: file.fileSize,
          status: 'Uploaded'
        };
      });
      const uploadedFileIds = response.map(file => file._id);
      setFileIds(uploadedFileIds);
      // console.log('Files uploaded successfully:', response);

      // Update the status of uploaded files
      setFilesStatus(fileStatus);

      console.log(fileUploadRef)

      if (fileUploadRef.current) {
        fileUploadRef.current.clear();
        fileUploadRef.current.setUploadedFiles(uploadedFiles);
      }

    } catch (error) {
      console.error('Error during file upload:', error);

      files.forEach(file => {
        fileStatus[file.uniqueName] = 'Failed';
      });
      setFilesStatus(fileStatus);

    }
  };


  const deleteButtonClicked = async (event) => {
    console.log(event)
    console.log('sldjf')
       
    try {
      setLoading(true);
      setVisible(false);
      setFile(null);
      // const response = await rejectCandidateFromWorkflow(item?._id, true);
      router.reload();
    } catch (error) {
      console.error('Error rejecting a candidate:', error);
      // Toast('Error deleting'); // Display toast or handle error state
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast />
      <Dialog
        className={styles.delete_modal}
        header={title || `Are you sure to ${modalType} ${category}?`}
        visible={visible}
        style={{ minWidth: '30vw' }}
        onHide={() => setVisible(false)}
      >
        <label>Comments</label>
        <InputTextarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          autoResize
        />
        <FileUpload
          ref={fileUploadRef}
          name="files"
          customUpload
          uploadHandler={customUploadHandler}
          multiple
          accept="image/*,application/pdf,.msword,.vnd.openxmlformats-officedocument.wordprocessingml.document,.vnd.ms-excel,.vnd.openxmlformats-officedocument.spreadsheetml.sheet,.plain,.json,.webp,.webm,.wmv,.mp4,.avi,.mov,.mkv,.ppt,.pptx,.csv"
          maxFileSize={10000000} // 10MB limit
          emptyTemplate={<p className="m-0">Drag and drop files here to upload.</p>}
        />
        <Button
          disabled={loading || value?.length === 0}
          label={modalType}
          onClick={(event) => deleteButtonClicked(event)}
        />
      </Dialog>
    </>
  );
}
