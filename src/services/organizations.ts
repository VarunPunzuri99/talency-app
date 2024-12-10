import { api } from "./api.service";


// Organizations

export async function getAllOrgs(page?: number, limit?: number): Promise<any[]> {
    try {
        const response: any = await api.get('orgs', {
            params: {
                page: page,
                limit: limit
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching orgs:', error.message);
        throw new Error(`Error while fetching orgs`, error?.message)

        // return []; // Return an empty array or handle error appropriately
    }
}


export async function getFilterOrgs(params: { title?: string, industryId?: string, accountTypeId?: string, countryId?: string, orgType?: string, page?: number, limit?: number }): Promise<any[]> {
    try {
        const response: any = await api.get('orgs/all', { params });
        return response;
    } catch (error: any) {
        console.error('Error fetching orgs:', error.message);
        throw new Error(`Error while fetching orgs`, error?.message)

    }
}


export async function getOrgById(id: string) {
    try {
        const response: any = await api.get(`orgs/${id}`);
        return response;
    } catch (error: any) {
        console.error('Error fetching contact by id:', error.message);
        throw new Error(`Error while fetching contact by id`, error?.message)
    }
}

export async function getOrgByType(orgType: string, page?: number, limit?: number) {
    try {
        const response: any = await api.get(`orgs/filter/org-type`, {
            params: {
                orgType: orgType,
                page: page,
                limit: limit
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching org by id:', error.message);
        throw new Error(`Error while fetching org by id`, error?.message)
    }
}

export async function bulkDeleteOrgs(orgIds: string[]) {
    try {
        const response: any = await api.delete(`orgs/bulk-delete`, {
            data: orgIds
        });
        return response.data;
    } catch (error: any) {
        console.error('Error deleting orgs:', error.message);
        throw new Error(`Error deleting orgs: ${error?.message}`)
    }
}

export async function bulkChangeStatus(data: any) {
    try {
        const response: any = await api.patch(`orgs/bulk-status`, data);
        return response;
    } catch (error: any) {
        console.error('Error deleting orgs:', error.message);
        throw new Error(`Error deleting orgs: ${error?.message}`)
    }
}

export async function changeStatus(orgId: string, data: any) {
    try {
        const response: any = await api.patch(`orgs/${orgId}/status`, data);
        return response;
    } catch (error: any) {
        console.error('Error deleting orgs:', error.message);
        throw new Error(`Error deleting orgs: ${error?.message}`)
    }
}


export async function searchAccount(title: string) {
    try {
        const response = await api.post('orgs/search', null, {
            params: { title: title },
        });
        console.log(title);
        return response;
    } catch (error: any) {
        console.error('Error fetching account by title:', error.message);
        throw new Error(`Error while fetching account by title: ${error?.message}`);
    }
}


export async function getAllPlaceholders(orgId?: string) {
    try {
        const response: any = await api.get(`orgs/placeholders`, {
            params: {
                orgId: orgId
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching placeholders ', error.message);
        throw new Error(`Error fetching placeholders `, error?.message)
    }
}


export async function getPlaceholders(orgId?: string) {
    return api.get(`orgs/placeholders`, {
        params: { orgId }
    })
}

export async function addPlaceholder(data) {
    return api.post(`orgs/placeholders`, data)
}

export async function editPlaceholder(placeholderId: string, data) {
    return api.patch(`orgs/placeholders/${placeholderId}`, data)
}

export async function deletePlaceholder(placeholderId: string) {
    return api.delete(`orgs/placeholders/${placeholderId}`)
}

export async function getPlaceholder(placeholderId: string) {
    return api.get(`orgs/placeholders/${placeholderId}`)
}

// export async function addMember(orgId: string, data) {
//     return api.post(`orgs/${orgId}/members`, data)
// }

export async function getMembers(orgId: string, businessUnitId: string) {
    return api.get(`orgs/${orgId}/business-units/${businessUnitId}/members`);
}

export async function getMember(orgId: string, memberId: string) {
    return api.get(`orgs/${orgId}/members/${memberId}`)
}

export async function updateMember(orgId: string, memberId: string, data) {
    return api.patch(`orgs/${orgId}/members/${memberId}`, data)
}

export async function deleteMember(orgId: string, memberId: string) {
    return api.delete(`orgs/${orgId}/members/${memberId}/soft-delete`)
}

export async function hardDeleteMember(orgId: string, memberId: string) {
    return api.delete(`orgs/${orgId}/members/${memberId}/hard-delete`)
}





export async function bulkDeleteOrgMembers(orgId: string,memberIds: string[]) {
    try {
        const response: any = await api.delete(`orgs/${orgId}/members/bulk-delete`, {
            data: memberIds
        });
        return response;
    } catch (error: any) {
        console.error('Error deleting orgs:', error.message);
        throw new Error(`Error deleting orgs: ${error?.message}`)
    }
}