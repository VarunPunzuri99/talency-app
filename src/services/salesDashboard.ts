import { api } from "./api.service";


// SalesDashboard

export async function getSalesDashboard(orgType: string,) {
    try {
        const response: any = await api.get(`orgs/org-type/count`, {
            params: {
                orgType: orgType,
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching sales dashboard data:', error.message);
        throw new Error(`Error while fetching sales dashboard data`, error?.message)
    }
}


export async function getSalesDashboardTasks(filter: string) {
    try {
        const response: any = await api.get(`tasks/count-by-status`, {
            params: {
                filter: filter
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching sales dashboard data for tasks:', error.message);
        throw new Error(`Error while fetching sales dashboard data forr tasks`, error?.message)
    }
}

export async function getSalesDashboardContact() {
    try {
        const response: any = await api.get(`contacts/count`)
        return response;
    } catch (error: any) {
        console.error('Error fetching sales dashboard contact data:', error.message);
        throw new Error(`Error while fetching sales dashboard contact data`, error?.message)
    }
}