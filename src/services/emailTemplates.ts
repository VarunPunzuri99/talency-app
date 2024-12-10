import { api } from "./api.service";

export async function createEmailTemplate(data: any) {
    try {
        const response: any = api.post(`email-template`, data);
        return response;
    } catch (error: any) {
        console.error('Error creating email template:', error.message);
        throw new Error(`Error creating email template`, error?.message)
    }
}

export async function createEmailTemplateWithPlacholders(data: any) {
    try {
        const response: any = api.post(`email-template/placeholders`, data);
        return response;
    } catch (error: any) {
        console.error('Error creating email template:', error.message);
        throw new Error(`Error creating email template`, error?.message)
    }
}

export async function updateEmailTemplate(templateId: string, data: any) {
    try {
        const response: any = api.patch(`email-template/${templateId}`, data);
        return response;
    } catch (error: any) {
        console.error('Error updating email template:', error.message);
        throw new Error(`Error updating email template`, error?.message)
    }
}

export async function getEmailTemplateById(templateId: string) {
    try {
        // Assuming the API endpoint for fetching a single template looks like 'email-template/:id'
        const response: any = await api.get(`email-template/${templateId}`);
        return response;
    } catch (error: any) {
        console.error('Error fetching email template:', error.message);
        throw new Error(`Error while fetching email template: ${error?.message}`);
    }
}


export async function getEmailTemplates(params: { templateName?: string, page?: number, limit?: number }) {
    try {
        const response: any = await api.get('email-template/all', { params });
        return response;
    } catch (error: any) {
        console.error('Error fetching email templates:', error.message);
        throw new Error(`Error while fetching email templates: ${error?.message}`);
    }
}

export async function softDeleteEmailTemplate(templateId: string) {
    try {
        const response: any = await api.delete(`email-template/${templateId}/soft-delete`)
        return response
    } catch (error) {
        console.error('Error deleting email template:', error);
        throw error;
    }
}

export async function bulkDeleteEmailTemplates(templateIds: string[]) {
    try {
        const response: any = await api.delete(`email-template/bulk-delete`, {
            data: templateIds
        });
        return response.data;
    } catch (error: any) {
        console.error('Error deleting email templates:', error.message);
        throw new Error(`Error deleting email templates: ${error?.message}`);
    }
}