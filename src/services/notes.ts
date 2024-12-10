
import { api } from "./api.service";


//Notes


export async function getNotesByAccountId(orgId: string, page?: number, limit?: number) {
    try {
        const response: any = await api.get(`notes/find-by-org-and-contact`, {
            params: {
                orgId: orgId,
                page: page,
                limit: limit
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching notes by id:', error.message);
        throw new Error(`Error while fetching notes by id`, error?.message)
    }
}


export async function getNotesByContactId(contactId: string, page?: number, limit?: number) {
    try {
        const response: any = await api.get(`notes/find-by-org-and-contact`, {
            params: {
                contactId: contactId,
                page: page,
                limit: limit
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching notes by  id:', error.message);
        throw new Error(`Error while fetching notes by id`, error?.message)
    }
}

export async function addNote(data: any) {
    try {
        const response: any = await api.post(`notes`, data);
        return response;
    } catch (error: any) {
        console.error('Error creating note:', error.message);
        throw new Error(`Error creating note:`, error?.message)
    }
}

export async function editNote(noteId: string, data: any) {
    try {
        const response: any = await api.patch(`notes/${noteId}`, data);
        return response;
    } catch (error: any) {
        console.error('Error updating a note:', error.message);
        throw new Error(`Error updating a note:`, error?.message)
    }
}

export async function deleteNote(noteId: string) {
    try {
        const response: any = await api.delete(`notes/${noteId}/hard-delete`)
        return response
    } catch (error) {
        console.error('Error deleting note:', error);
        throw error;
    }
}

export async function getTasksByAccountId(orgId: string, filter: string, page?: number, limit?: number) {
    try {
        const response: any = await api.get(`tasks/find-by-org-and-contact`, {
            params: {
                orgId: orgId,
                filter: filter,
                page: page,
                limit: limit
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching tasks by id:', error.message);
        throw new Error(`Error while fetching tasks by id`, error?.message)
    }
}

export async function getTasksByContactId(contactId: string, filter: string, page?: number, limit?: number) {
    try {
        const response: any = await api.get(`tasks/find-by-org-and-contact`, {
            params: {
                contactId: contactId,
                filter: filter,
                page: page,
                limit: limit
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching tasks by id:', error.message);
        throw new Error(`Error while fetching tasks by id`, error?.message)
    }
}

export async function getContactsOfAccount(accountOrgId: string, page?: number, limit?: number) {
    try {
        const response: any = await api.get(`contacts/filter`, {
            params: {
                accountOrgId: accountOrgId,
                page: page,
                limit: limit
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching contacts by id:', error.message);
        throw new Error(`Error while fetching contacts by id`, error?.message)
    }
}

export async function getFilterContacts(params: { name?: string, industryId?: string, accountId?: string, designation?: string, referredBy?: string, page?: number, limit?: number }): Promise<any[]> {
    try {
        const response: any = await api.get('contacts', { params });
        return response;
    } catch (error: any) {
        console.error('Error fetching orgs:', error.message);
        throw new Error('Error while fetching orgs, error?.message')

    }
}

export async function getJobsByOrg(postingOrg: string, page?: number, limit?: number) {
    try {
        const response: any = await api.get(`jobs/all`, {
            params: {
                postingOrg: postingOrg,
                page: page,
                limit: limit
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching jobs by id:', error.message);
        throw new Error(`Error while fetching jobs by id`, error?.message)
    }
}

export async function addOrg(data: any) {
    try {
        const response: any = await api.post(`orgs`, data);
        return response;
    } catch (error: any) {
        console.error('Error creating  a org:', error.message);
        throw new Error(`Error creating a org:`, error?.message)
    }
}

export async function updateOrg(orgId: string, data: any) {
    try {
        const response: any = await api.patch(`orgs/${orgId}`, data);
        return response;
    } catch (error: any) {
        console.error('Error updating a org:', error.message);
        throw new Error(`Error updating a org:`, error?.message)
    }
}

export async function deleteOrg(orgId: string) {
    try {
        const response: any = await api.delete(`orgs/${orgId}/soft-delete`)
        return response
    } catch (error) {
        console.error('Error deleting org:', error);
        throw error;
    }
}