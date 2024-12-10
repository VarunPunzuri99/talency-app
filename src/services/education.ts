import { api } from "./api.service";


export async function createEducation(data: any) {
    try {
        const response: any = await api.post(`education-qualifications`, data);
        return response;
    } catch (error: any) {
        console.error('Error creating educational qualification:', error.message);
        throw new Error(`Error creating educational qualification:`, error?.message)
    }
}

export async function deleteEducation(educationQualificationId: string) {
    try {
        const response: any = await api.delete(`education-qualifications/${educationQualificationId}/hard-delete`);
        return response;
    } catch (error: any) {
        console.error('Error creating educational qualification:', error.message);
        throw new Error(`Error creating educational qualification:`, error?.message)
    }
}

export async function updateEducation(educationQualificationId: string, body: any) {
    try {
        const response: any = await api.patch(`education-qualifications/${educationQualificationId}`, body);
        return response;
    } catch (error: any) {
        console.error('Error updating educational qualification:', error.message);
        throw new Error(`Error updating educational qualification:`, error?.message)
    }
}