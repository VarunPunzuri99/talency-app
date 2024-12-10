import { api } from "./api.service";
import { FileMetadata } from "./types";

export async function uploadFile(file) {
    try {
        const response: any = await api.post('file-uploads', file);
        // console.log(response);
        return response
    }
    catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}


export async function uploadFiles(files) {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });

    try {
        const response = await api.post('file-uploads/multiple', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        // console.log(response);
        const fileMetadatas = response as unknown as FileMetadata[];
        return fileMetadatas;
    } catch (error) {
        console.error('Error uploading files:', error);
        throw error;
    }
}


export async function getFileMetadataById(fileId) {
    console.log(fileId)
    try {
        const response: any = await api.get(`file-uploads/${fileId}/metadata`);
        console.log(response);
        return response; // Assuming the response data contains the file metadata
    } catch (error) {
        console.error('Error getting files:', error);
        throw error;
    }
}

