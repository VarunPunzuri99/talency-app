
//Activity 

import { api } from "./api.service";

export async function getTodayActivities(contactId, orgId, page = 1, limit = 10) {
    try {
        const response = await api.get('activities', {
            params: {
                dateFilter: 'today',
                contactId: contactId,
                orgId: orgId,
                page: page,
                limit: limit,
            },
        });
        return response;
    } catch (error) {
        console.error('Error fetching today\'s activities:', error.message);
        throw new Error(`Error while fetching today's activities: ${error?.message}`);
    }
}

export async function getUpcomingActivitiesOrg(orgId, page = 1, limit = 10) {
    try {
        const response = await api.get('activities', {
            params: {
                dateFilter: 'upcoming',
                orgId: orgId,
                page: page,
                limit: limit,
            },
        });
        return response;
    } catch (error) {
        console.error('Error fetching upcomings\'s activities:', error.message);
        throw new Error(`Error while fetching upcoming's activities: ${error?.message}`);
    }
}

export async function getTodayActivitiesOrg(orgId, page = 1, limit = 10) {
    try {
        const response = await api.get('activities', {
            params: {
                dateFilter: 'today',
                orgId: orgId,
                page: page,
                limit: limit,
            },
        });
        return response;
    } catch (error) {
        console.error('Error fetching today\'s activities:', error.message);
        throw new Error(`Error while fetching today's activities: ${error?.message}`);
    }
}

export async function getTaskActivity(taskId, page = 1, limit = 10) {
    try {
        const response = await api.get('activities', {
            params: {
                taskId: taskId,
                page: page,
                limit: limit,
            },
        });
        return response;
    } catch (error) {
        console.error('Error fetching task activities:', error.message);
        throw new Error(`Error while fetching activities: ${error?.message}`);
    }
}


export async function getTodayActivitiesOfContacts(contactId, page = 1, limit = 10) {
    try {
        const response = await api.get('activities', {
            params: {
                dateFilter: 'today',
                contactId: contactId,
                page: page,
                limit: limit,
            },
        });
        return response;
    } catch (error) {
        console.error('Error fetching today\'s activities:', error.message);
        throw new Error(`Error while fetching today's activities: ${error?.message}`);
    }
}

export async function getUpComingActivitiesOfContacts(contactId, page = 1, limit = 10) {
    try {
        const response = await api.get('activities', {
            params: {
                dateFilter: 'today',
                contactId: contactId,
                page: page,
                limit: limit,
            },
        });
        return response;
    } catch (error) {
        console.error('Error fetching today\'s activities:', error.message);
        throw new Error(`Error while fetching today's activities: ${error?.message}`);
    }
}
