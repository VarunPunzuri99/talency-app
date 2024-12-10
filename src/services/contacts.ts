import { api } from "./api.service";
import { Contact} from './types';


//  Custom hooks for Contacts 

export async function getAllContacts(page?: number, limit?: number): Promise<Contact[]> {
    try {
        const response: any = await api.get('contacts', {
            params: {
                page: page,
                limit: limit
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching contacts:', error.message);
        throw new Error(`Error while fetching contacts: ${error?.message}`);
    }
}


export async function getContactById(id: string) {
    try {
        const response: any = await api.get(`contacts/${id}`);
        return response;
    } catch (error: any) {
        console.error('Error fetching contact by id:', error.message);
        throw new Error(`Error while fetching contact by id`, error?.message)

        // return []; // Return an empty array or handle error appropriately
    }
}


export async function searchContact(contactName: string) {
    try {
        const response = await api.post('contacts/search', null, {
            params: { name: contactName },
        });
        console.log(contactName);
        return response;
    } catch (error: any) {
        console.error('Error fetching contact by name:', error.message);
        throw new Error(`Error while fetching contact by name: ${error?.message}`);
    }
}



export async function getContactsByAccountId(accountOrgId, page, limit) {
    return api.get(`contacts/filter`, {
        params: {
            accountOrgId: accountOrgId,
            page: page,
            limit: limit
        }
    })
}




export async function addContact(data: Contact) {
    return api.post('contacts', data);
}

export async function updateContact(id: string, data: Contact) {
    return api.patch(`contacts/${id}`, data);
}

export async function updateContactAssignee(contactId: string, body) {
    return api.patch(`contacts/${contactId}/assign-to`, body);
}

export async function updateContactStatus(contactId: string, body) {
    return api.patch(`contacts/${contactId}/status`, body);
}

export async function softDeleteContact(contactId: string) {
    return api.delete(`contacts/${contactId}/soft-delete`);
}

 export async function hardDeleteContact(contactId: string) {
    return api.delete(`contacts/${contactId}/hard-delete`);
}

export async function bulkDeleteContacts(contactIds: string[]) {
    try {
        const response: any = await api.delete(`contacts/bulk-delete`, {
            data: contactIds
        });
        return response.data;
    } catch (error: any) {
        console.error('Error deleting contacts:', error.message);
        throw new Error(`Error deleting contacts: ${error?.message}`)
    }
  }


  export async function contactsBulkChangeStatus( data: any) {
    try {
        const response: any = await api.patch(`contacts/bulk-status`,data );
        return response;
    } catch (error: any) {
        console.error('Error changing status:', error.message);
        throw new Error(`Error changing status: ${error?.message}`)
    }
  }

