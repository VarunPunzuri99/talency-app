import axios from 'axios';
import Cookies from 'universal-cookie';
import 'react-toastify/dist/ReactToastify.css';
import { Assessment, candidateOffer, Contact, FileMetadata, GetAllJobsParams, Interview, JobApplication, Stage, Workflow } from './types';
import { toast } from 'react-toastify';

const cookies = new Cookies();

let serverToken = null;

// Using environment variables
// const baseURL = process.env.BASE_URL;

// Old 146.190.10.231:8080

// http://localhost:3002/api/

// https://apis.gana.talency.in/api/

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API,
    timeout: 200000,
});

api.interceptors.request.use(
    async (config) => {
        const token = cookies.get('talency_id_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            config.headers.Authorization = `Bearer ${serverToken}`;
        }
        console.log(`Request URL: ${config.baseURL}${config.url}`, config.params);

        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    function (response) {
        return response.data;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// Auth API CALLS


export async function getCurrentUser() {
    try {
        const response: any = await api.get('auth/logged-in-user');
        console.log('res', response)
        return response;
    } catch (error: any) {
        console.error('Error fetching current user:', error.message);
        throw new Error(`Error while fetching current user: ${error?.message}`);
    }
}

//Email

export async function getMailboxFolders() {
    try {
        const response: any = await api.get(`/user-inbox-config/mailbox-folders`);
        console.log('res', response)
        return response;
    } catch (error: any) {
        console.error('Error getting email folders:', error.message);
        throw new Error(`Error getting email folders: ${error?.message}`);
    }
}

export async function getMailsFromFolders() {
    try {
        const response: any = await api.get(`/user-inbox-config/mailbox-folders`);
        console.log('res', response)
        return response;
    } catch (error: any) {
        console.error('Error while getting the mails:', error.message);
        throw new Error(`Error while getting the  mails: ${error?.message}`);
    }
}


export async function getMailsByFolders(folder: string) {
    try {
        const response: any = await api.get(`/user-inbox-config/fetch-emails-by-folder/${folder}`);
        console.log('res', response)
        return response;
    } catch (error: any) {
        console.error('Error while getting the folder mails:', error.message);
        throw new Error(`Error while getting the folder mails: ${error?.message}`);
    }
}

export async function getUnreadCount(folder: string) {
    try {
        const response: any = await api.get(`/user-inbox-config/folder-unread-count/${folder}`);
        console.log('res', response)
        return response;
    } catch (error: any) {
        console.error('Error fetching count of folders:', error.message);
        throw new Error(`Error while fetching count of folders: ${error?.message}`);
    }
}

export async function mailFolders(data: any) {
    try {
        const response: any = await api.post(`/user-inbox-config/create-folder`, data);
        return response;
    } catch (error) {
        throw new Error(`Error while creating a folder`, error?.message)
    }
}


export async function sendEmail(data: any) {
    try {
        const response: any = await api.post('email-config/send', data);
        return response;
    } catch (error) {
        throw new Error(`Error while sending mail`, error?.message)
    }
}

export async function replyEmail(data: any) {
    try {
        const response: any = await api.post('user-inbox-config/reply', data);
        return response;
    } catch (error) {
        throw new Error(`Error while replying mail`, error?.message)
    }
}

export async function forwardEmail(data: any) {
    try {
        const response: any = await api.post('user-inbox-config/forward', data);
        return response;
    } catch (error) {
        throw new Error(`Error while forwarding mail`, error?.message)
    }
}

export async function moveTrashMail(folder: string, uid: string) {
    try {
        const response: any = await api.post(`user-inbox-config/delete-email-to-trash/${uid}/${folder}`);
        return response;
    } catch (error) {
        throw new Error(`Error while moving to trash`, error?.message)
    }
}

export async function deleteMail(uid: string) {
    try {
        const response: any = await api.delete(`user-inbox-config/permanently-delete-email/${uid}`);
        return response;
    } catch (error) {
        throw new Error(`Error while deleting Mail`, error?.message)
    }
}

export async function getUnSeenMails(folder: string) {
    try {
        const response: any = await api.get(`/user-inbox-config/folder-unread-count/${folder}`);
        console.log('res', response)
        return response;
    } catch (error: any) {
        console.error('Error fetching unseen mails:', error.message);
        throw new Error(`Error while fetching unseen mails: ${error?.message}`);
    }
}

export async function markSeen(folder: string, uid: string) {
    try {
        const response: any = await api.patch(`/user-inbox-config/folder/${folder}/mark-seen/${uid}`);
        console.log('res', response)
        return response;
    } catch (error: any) {
        console.error('Error fetching seen mails:', error.message);
        throw new Error(`Error while fetching seen mails: ${error?.message}`);
    }
}

export async function markUnSeen(folder: string, uid: string) {
    try {
        const response: any = await api.patch(`/user-inbox-config/folder/${folder}/mark-unseen/${uid}`);
        console.log('res', response)
        return response;
    } catch (error: any) {
        console.error('Error fetching unseen mails:', error.message);
        throw new Error(`Error while fetching unseen mails: ${error?.message}`);
    }
}

export async function searchMail(folder: string, searchTerm: string) {
    try {
        const response = await api.get(`/user-inbox-config/search-emails/${folder}`, {
            params: { searchTerm }
        });
        return response;
    } catch (error: any) {
        console.error('Error while searching email:', error.message);
        throw new Error(`Error while searching email: ${error?.message}`);
    }
}

export async function moveEmails(data: {
    sourceFolder: string;
    destinationFolder: string;
    emailUIDs: string[];
}): Promise<void> {
    const { sourceFolder, destinationFolder, emailUIDs } = data;

    try {
        await api.post(`/user-inbox-config/move-emails`, {
            sourceFolder,
            destinationFolder,
            emailUIDs,
        });

        console.log("Emails moved successfully");
    } catch (error) {
        console.error("Failed to move emails:", error?.response?.data || error.message);
        throw error;
    }
}






//  Contacts 
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
export async function getDepartmentsWorkflow(orgId, businessId) {
    try {
        const response = await api.get('workflows/filter', {
            params: {
                orgId: orgId,
                businessUnitId: businessId,
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
                dateFilter: 'upcoming',
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

//  Stages API Calls

export async function createStage(body: Stage) {
    try {
        const response: any = await api.post('stages', body);
        return response;
    } catch (error) {
        throw new Error(`Error while creating stage`, error?.message)
    }
}

export async function updateStage(id: string, body: Partial<Stage>) {
    try {
        const response: any = await api.patch(`stages/${id}`, body);
        return response;
    } catch (error) {
        throw new Error(`Error while updating stage`, error?.message)
    }
}

export async function deleteStage(id: string) {
    try {
        const response: any = await api.delete(`stages/${id}`);
        return response;
    } catch (error) {
        throw new Error(`Error while deleting stage`, error?.message)
    }
}

export async function getStage(id: string) {
    try {
        const response: any = await api.get(`stages/${id}`);
        return response;
    } catch (error) {
        throw new Error(`Error while fetching stage`, error?.message)
    }
}

export async function getAccountTypes() {
    try {
        const response: any = await api.get(`account-types`);
        return response;
    } catch (error) {
        throw new Error(`Error while getting account-type`, error?.message)
    }
}

// Workflow API Calls


export async function createWorkflow(body: Workflow) {
    try {
        const response: any = await api.post('workflows', body);
        return response;
    } catch (error) {
        throw new Error(`Error while creating workflow`, error?.message)
    }
}

export async function getWorkflowById(id: string) {
    try {
        const response: any = await api.get(`workflows/${id}`);
        return response;
    } catch (error) {
        throw new Error(`Error while retrieving workflow`, error?.message)
    }
}
export async function filterWorkflowsByOrgId(orgId: string) {
    try {
        const response = await api.get(`workflows/filter`, {
            params: {
                orgId: orgId
            }
        });
        console.log('res', response)
        return response;
    } catch (error) {
        throw new Error(`Error while retrieving workflow`, error?.message)
    }
}

export async function updateWorkflow(id: string, body: Workflow) {
    try {
        const response: any = await api.patch(`workflows/${id}`, body);
        return response;
    } catch (error) {
        throw new Error(`Error while updating workflow`, error?.message)
    }
}

export async function createStageInWorkflow(id: string, body: Stage) {
    try {
        const response: any = await api.patch(`workflows/${id}/stage`, body);
        return response;
    } catch (error) {
        throw new Error(`Error while updating workflow`, error?.message)
    }
}

// Assessment

export async function scheduleAssessment(body: Assessment) {
    try {
        const response: any = await api.post('assessments', body);
        return response;
    } catch (error) {
        throw new Error(`Error while scheduling a assessment`, error?.message)
    }
}

// Offer 

export async function submitOffer(body: candidateOffer) {
    try {
        const response: any = await api.post('offers', body);
        return response;
    } catch (error) {
        throw new Error(`Error while sending offer to candidate`, error?.message)
    }
}

//reject
export async function rejectCandidate(jobApplicationId: string) {
    try {
        const response = await api.patch(`/interviews/reject`, null, {
            params: { jobApplicationId },
        });
        return response;

    } catch (error: any) {
        throw new Error(`Error while rejecting offer to candidate: ${error?.message || error}`);
    }
}

export async function candidateShowUp(jobApplicationId: string) {
    try {
        const response = await api.patch(`/interviews/show-up`, null, {
            params: { jobApplicationId },
        });
        return response;

    } catch (error: any) {
        throw new Error(`Error while interview showup changes to candidate: ${error?.message || error}`);
    }
}


export async function offerAccepted(jobApplicationId: string) {
    try {
        const response = await api.patch(`/offers/accept-offer`, null, {
            params: { jobApplicationId },
        });
        return response;

    } catch (error: any) {
        throw new Error(`Error while accepting offer: ${error?.message || error}`);
    }
}

export async function onBoarded(jobApplicationId: string) {
    try {
        const response = await api.patch(`/offers/onBoarded`, null, {
            params: { jobApplicationId },
        });
        return response;

    } catch (error: any) {
        throw new Error(`Error while onBording a candidate: ${error?.message || error}`);
    }
}



export async function documentReminder(jobApplicationId: string) {
    try {
        const response = await api.get(`offers/document-reminder`, {
            params: { jobApplicationId },
        });
        return response;

    } catch (error: any) {
        throw new Error(`Error while documents sending reminder to candidate: ${error?.message || error}`);
    }
}


export async function generateTrackerEmailContent(body) {
    try {
        const response: any = await api.post('workflows/send-tracker-email-content', body);
        return response;
    } catch (error: any) {
        throw new Error(`Failed to generate tracker email content: ${error?.message || 'Unknown error'}`);
    }
}

export async function remindOfferAcceptance(jobApplicationId: string) {
    try {
        const response: any = await api.get(`offers/acceptance-reminder`, {
            params: { jobApplicationId },
        });
        return response;
    } catch (error: any) {
        throw new Error(`Error while sending the offer acceptance reminder: ${error?.message}`);
    }
}

// Interview API CALLS

export async function scheduleInterview(body: Interview) {
    try {
        const response: any = await api.post('interviews', body);
        return response;
    } catch (error) {
        throw new Error(`Error while scheduling a interview`, error?.message)
    }
}

export async function cancelInterview(jobApplicationId: string) {
    try {
        const response: any = await api.get(`interviews/cancel`, {
            params: { jobApplicationId },
        });
        return response;
    } catch (error: any) {
        throw new Error(`Error while canceling the interview: ${error?.message}`);
    }
}

export async function remindInterview(jobApplicationId: string) {
    try {
        const response: any = await api.get(`interviews/remind`, {
            params: { jobApplicationId },
        });
        return response;
    } catch (error: any) {
        throw new Error(`Error while sending the interview reminder: ${error?.message}`);
    }
}

//user-inbox 


// Function to fetch emails by folder for a given user inbox config ID
export async function fetchEmailsByFolder(userInboxConfigId: string) {
    try {
        const response: any = await api.get(`user-inbox-config/${userInboxConfigId}/fetch-emails-by-folder`);
        return response.data; // Assuming the API returns emails under `data`
    } catch (error) {
        throw new Error(`Error while fetching emails: ${error?.message}`);
    }
}



// Job Application API Calls


export async function updateJobApplication(id: string, body: Partial<JobApplication>) {
    try {
        const response: any = await api.patch(`job-application-forms/${id}`, body);
        return response;
    } catch (error) {
        throw new Error(`Error while updating job application`, error?.message)
    }
}



export async function getAllIndustries(): Promise<any[]> {
    try {
        const response: any = await api.get('industries', {
        });
        return response;
    } catch (error: any) {
        // console.error('Error fetching industries:', error.message);
        throw new Error(`Error while fetching industries`, error?.message)
        // return []; // Return an empty array or handle error appropriately
    }
}

export async function getCountries(): Promise<any[]> {
    try {
        const response: any = await api.get('countries/all', {
        });
        return response;
    } catch (error: any) {
        throw new Error(`Error while fetching countries`, error?.message)
    }
}


export async function getStatesByCountryName(countryId: string) {
    try {
        const response: any = await api.get(`countries/${countryId}/states`);
        return response;
    } catch (error: any) {
        console.error('Error fetching country by id:', error.message);
        throw new Error(`Error while fetching country by id`, error?.message)
    }
}


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


export async function getAllVendorsOfOrg(orgId: string) {
    try {
        const response: any = await api.get(`orgs/${orgId}/vendors`);
        return response;
    } catch (error: any) {
        console.error('Error fetching orgs:', error.message);
        throw new Error(`Error while fetching orgs`, error?.message)

        // return []; // Return an empty array or handle error appropriately
    }
}

// export async function getVendorsOfOrg(orgId: string): Promise<any[]> {
//     try {
//         const response: any = await api.get('orgs', {
//             params: {
//                 page: page,
//                 limit: limit
//             }
//         });
//         return response;
//     } catch (error: any) {
//         console.error('Error fetching orgs:', error.message);
//         throw new Error(`Error while fetching orgs`, error?.message)

//         // return []; // Return an empty array or handle error appropriately
//     }
// }


// export async function getVendorsOfOrg(orgId: string): Promise<any[]> {
//     try {
//         const response: any = await api.get('orgs', {
//             params: {
//                 page: page,
//                 limit: limit
//             }
//         });
//         return response;
//     } catch (error: any) {
//         console.error('Error fetching orgs:', error.message);
//         throw new Error(`Error while fetching orgs`, error?.message)

//         // return []; // Return an empty array or handle error appropriately
//     }
// }

// export async function getVendorsOfOrg(orgId: string): Promise<any[]> {
//     try {
//         const response: any = await api.get('orgs', {
//             params: {
//                 page: page,
//                 limit: limit
//             }
//         });
//         return response;
//     } catch (error: any) {
//         console.error('Error fetching orgs:', error.message);
//         throw new Error(`Error while fetching orgs`, error?.message)

//         // return []; // Return an empty array or handle error appropriately
//     }
// }


// export async function getVendorsOfOrg(orgId: string): Promise<any[]> {
//     try {
//         const response: any = await api.get('orgs', {
//             params: {
//                 page: page,
//                 limit: limit
//             }
//         });
//         return response;
//     } catch (error: any) {
//         console.error('Error fetching orgs:', error.message);
//         throw new Error(`Error while fetching orgs`, error?.message)

//         // return []; // Return an empty array or handle error appropriately
//     }
// }

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

export async function bulkDeleteOrgMembers(orgId: string, memberIds: string[]) {
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

export async function bulkChangeStatus(data: any) {
    try {
        const response: any = await api.patch(`orgs/bulk-status`, data);
        toast.success('Bulk status completed')
        return response;
    } catch (error: any) {
        console.error('Error deleting orgs:', error.message);
        throw new Error(`Error deleting orgs: ${error?.message}`)
    }
}

export async function getFilterContacts(params: { name?: string, industryId?: string, accountId?: string, designation?: string, referredBy?: string, page?: number, limit?: number }): Promise<any[]> {
    try {
        const response: any = await api.get('contacts', { params });
        return response;
    } catch (error: any) {
        console.error('Error fetching orgs:', error.message);
        throw new Error(`Error while fetching orgs`, error?.message)

    }
}

export async function rejectCandidateFromWorkflow(id: string, isRejected: boolean) {
    try {
        const response: any = await api.patch(`job-application-forms/${id}/update-status`, { isRejected: isRejected });
        return response;
    } catch (error) {
        throw new Error(`Error while updating job application`, error?.message)
    }
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

export async function contactsBulkChangeStatus(data: any) {
    try {
        const response: any = await api.patch(`contacts/bulk-status`, data);
        return response;
    } catch (error: any) {
        console.error('Error changing status:', error.message);
        throw new Error(`Error changing status: ${error?.message}`)
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

// export async function assignJobToMember(memberId: string, body: any) {
//     try {
//         const response: any = await api.post(`tasks/members/${memberId}/assign`, body);
//         return response;
//     } catch (error: any) {
//         console.error('Error assigning a job to member:', error.message);
//         throw new Error(`Error assigning a job to member`, error?.message)
//     }
// }

export async function getAllMemberAssignedJobs(memberId: string) {
    try {
        // Change to get all allocations for an assignee
        const response: any = await api.get(`job-allocations/assignees/${memberId}/all`);
        console.log('Assigned jobs response:', response);
        return response;
    } catch (error: any) {
        console.error('Error fetching all assigned jobs to member:', error.message);
        throw error; // Pass the original error up
    }
}

export async function getAllMemberAssignedJobsByDueDate(
    memberId: string,
    dueDate: string,
    page: number = 1,
    limit: number = 10
) {
    try {
        // Change to get all allocations for an assignee
        const response: any = await api.get(`job-allocations/assignees/${memberId}/by-date-filter`,
            {
                params: {
                    dueDate,
                    page,
                    limit
                }
            });
        console.log('Assigned jobs response:', response);
        return response;
    } catch (error: any) {
        console.error('Error fetching all assigned jobs to member:', error.message);
        throw error; // Pass the original error up
    }
}

export async function updateAssignedJobAllocation(allocationId: string, body: any) {
    try {
        const response: any = await api.patch(`job-allocations/assignees/${allocationId}`, body);
        return response;
    } catch (error: any) {
        console.error('Error fetching all assigned jobs to member:', error.message);
        throw new Error(`Error assigning a job to member`, error?.message)
    }
}

export async function updateAllAssignedJobAllocation(jobId: string, body: any) {
    try {
        const response: any = await api.patch(`job-allocations/jobs/${jobId}`, body);
        return response;
    } catch (error: any) {
        console.error('Error updating all allocations of a job:', error.message);
        throw new Error(`Error updating all allocations of a job`, error?.message)
    }
}

export async function deleteAssignedJobAllocation(allocationId: string) {
    try {
        const response: any = await api.delete(`job-allocations/${allocationId}/soft-delete`);
        return response;
    } catch (error: any) {
        console.error('Error deleting all assigned jobs to member:', error.message);
        throw new Error(`Error deleting a job to member`, error?.message)
    }
}

export async function assignJobToMember(body: any) {
    try {
        const response: any = await api.post(`job-allocations/assignees`, body);
        return response;
    } catch (error: any) {
        console.error('Error fetching all assigned jobs to member:', error.message);
        throw new Error(`Error assigning a job to member`, error?.message)
    }
}

export async function createJobAllocation(body: any) {
    try {
        const response: any = await api.post(`job-allocations`, body);
        return response;
    } catch (error: any) {
        console.error('Error while creating job allocation:', error.message);
        throw new Error(`Error while creating job allocation`, error?.message)
    }
}

export async function getJobAllocation(jobAllocationId: string) {
    try {
        const response: any = await api.get(`job-allocations/${jobAllocationId}`);
        return response;
    } catch (error: any) {
        console.error('Error while fetching job allocation:', error.message);
        throw new Error(`Error while fetching job allocation`, error?.message)
    }
}

export async function createAssigneeJobAllocation(body: any) {
    try {
        const response: any = await api.post(`job-allocations/assignees`, body);
        return response;
    } catch (error: any) {
        console.error('Error while creating job allocation:', error.message);
        throw new Error(`Error while creating job allocation`, error?.message)
    }
}

export async function getBaseJobAllocation(jobId: string) {
    try {
        const response: any = await api.get(`job-allocations/jobs/${jobId}`);
        return response;
    } catch (error: any) {
        console.error('Error while creating job allocation:', error);
        throw error;
    }
}

export async function getBaseJobAllocationByAssigneeId(assigneeId: string) {
    try {
        const response: any = await api.get(`job-allocations/assignees/${assigneeId}`);
        return response;
    } catch (error: any) {
        console.error('Error while creating job allocation:', error.message);
        throw new Error(`Error while creating job allocation`, error?.message)
    }
}

export async function updateJobAllocation(jobApplicationId: string, body: any) {
    try {
        const response: any = await api.patch(`job-allocations/${jobApplicationId}`, body);
        return response;
    } catch (error: any) {
        console.error('Error while updating job allocation:', error.message);
        throw new Error(`Error while updating job allocation`, error?.message)
    }
}

export async function removeAssignedJob(memberId: string) {
    try {
        const response: any = await api.get(`job-allocations/assignees/${memberId}`);
        return response;
    } catch (error: any) {
        console.error('Error fetching all assigned jobs to member:', error.message);
        throw new Error(`Error assigning a job to member`, error?.message)
    }
}

// Needs testing 
export async function getAssignedJobs(memberId: string, jobId: string) {
    try {
        const response: any = await api.get(`tasks/members/${memberId}}assigned`, {
            params: {
                jobId: jobId
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching assigned jobs for the member and job:', error.message);
        throw new Error(`Error fetching assigned jobs for the specified member and job`, error?.message);
    }
}


export async function unAssignJobToMember(memberId: string, jobId: string) {
    try {
        const response: any = await api.delete(`tasks/members/${memberId}/unassign`, {
            params: {
                jobId: jobId
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error unassigning a job to member:', error.message);
        throw new Error(`Error unassigning a job to member`, error?.message)
    }
}

export async function assignJobToVendor(vendorId: string, body: any) {
    try {
        const response: any = await api.post(`tasks/vendors/${vendorId}/assign`, body);
        return response;
    } catch (error: any) {
        console.error('Error assigning a job to vendor:', error.message);
        throw new Error(`Error assigning a job to vendor`, error?.message)
    }
}

export async function getAllVendorAssignedJobs(vendorId: string) {
    try {
        const response: any = await api.get(`tasks/vendors/${vendorId}/all-assigned`);
        return response;
    } catch (error: any) {
        console.error('Error fetching all assigned jobs to vendor:', error.message);
        throw new Error(`Error fetching all assigned jobs to vendor`, error?.message);
    }
}

export async function getJobAssignCount(jobId: string) {
    try {
        const response: any = await api.get(`job/analytics`, {
            params: {
                job: jobId
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching job assign count:', error.message);
        throw new Error(`Error fetching job assign count`, error?.message);
    }
}

export async function getAssignedJobsForVendor(vendorId: string, jobId: string) {
    try {
        const response: any = await api.get(`tasks/vendors/${vendorId}/assigned`, {
            params: {
                jobId: jobId,
            },
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching assigned job for vendor:', error.message);
        throw new Error(`Error fetching assigned job for the specified vendor and job`, error?.message);
    }
}

export async function unAssignJobFromVendor(vendorId: string, jobId: string) {
    try {
        const response: any = await api.delete(`tasks/vendors/${vendorId}/unassign`, {
            params: {
                jobId: jobId,
            },
        });
        return response;
    } catch (error: any) {
        console.error('Error unassigning job from vendor:', error.message);
        throw new Error(`Error unassigning job from vendor`, error?.message);
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

export async function getMembersByOrg(orgId: string, page?: number, limit?: number, searchTerm?: string, departmentTreeId?: string) {
    try {
        const params: any = {
            ...(searchTerm && { searchTerm }),
            ...(page !== undefined && { page }),
            ...(limit !== undefined && { limit }),
            ...(departmentTreeId && { departmentTreeId })
        };
        const response: any = api.get(`orgs/${orgId}/members`, { params });
        return response;
    } catch (error) {
        console.error('Error fetching members by org:', error.message);
        throw new Error(`Error while fetching members by org`, error?.message)
    }

}

export async function getMembersByOrgAndDepartment(orgId: string, page?: number, limit?: number, searchTerm?: string, departmentTreeId?: string) {
    try {
        const params: any = {
            ...(searchTerm && { searchTerm }),
            ...(page !== undefined && { page }),
            ...(limit !== undefined && { limit }),
            ...(departmentTreeId && { departmentTreeId })
        };
        return api.get(`orgs/${orgId}/all-members`, { params });
    } catch (error) {
        console.error('Error fetching members by org:', error.message);
        throw new Error(`Error while fetching members by org`, error?.message)
    }

}

export async function createWorkExperience(data: any) {
    try {
        const response: any = await api.post(`work-experiences`, data);
        return response;
    } catch (error: any) {
        console.error('Error creating work experience:', error.message);
        throw new Error(`Error creating work experience:`, error?.message)
    }
}

export async function deleteWorkExperience(workExperienceId: string) {
    try {
        const response: any = await api.delete(`work-experiences/${workExperienceId}/hard-delete`);
        return response;
    } catch (error: any) {
        console.error('Error deleting work experience:', error.message);
        throw new Error(`Error deleting work experience:`, error?.message)
    }
}

export async function updateWorkExperience(workExperienceId: string, data: any) {
    try {
        const response: any = await api.patch(`work-experiences/${workExperienceId}`, data);
        return response;
    } catch (error: any) {
        console.error('Error updating work experience:', error.message);
        throw new Error(`Error updating work experience:`, error?.message)
    }
}

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

export async function deleteSkill(skillId: string) {
    try {
        const response: any = await api.delete(`evaluation-forms/${skillId}/hard-delete`);
        return response;
    } catch (error: any) {
        console.error('Error deleting a skill:', error.message);
        throw new Error(`Error deleting a skill:`, error?.message)
    }
}

export async function updateSkill(skillId: string, data: any) {
    try {
        const response: any = await api.patch(`evaluation-forms/${skillId}`, data);
        return response;
    } catch (error: any) {
        console.error('Error updating a skill:', error.message);
        throw new Error(`Error updating a skill:`, error?.message)
    }
}

export async function createSkill(data: any) {
    try {
        const response: any = await api.post(`evaluation-forms`, data);
        return response;
    } catch (error: any) {
        console.error('Error creating a skill:', error.message);
        throw new Error(`Error creating a skill:`, error?.message)
    }
}

//Jobs application

export async function jobApplicationPost(data: any) {
    try {
        const response: any = api.post(`job-application-forms`, data);
        return response;
    } catch (error: any) {
        console.error('Error creating Job:', error.message);
        throw new Error(`Error creating Job`, error?.message)
    }
}


// USERS API CALLS

// This is role based endpoint. For now using this endpoint with admin role to display assign to in contacts.
export async function getAllUsers() {
    try {
        const response: any = await api.get(`users`);
        return response;
    } catch (error: any) {
        console.error('Error fetching a user:', error.message);
        throw new Error(`Error while fetching a user.`, error?.message)
    }
}

export async function getAllUsersByOrgAndBU(orgId: string, businessUnitId: string) {
    try {
        const response: any = await api.get(`users/filter/user`, {
            params: {
                org: orgId,
                businessUnit: businessUnitId
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching a user:', error.message);
        throw new Error(`Error while fetching a user.`, error?.message)
    }
}

export async function login(email: string, password: string) {
    try {
        const response: any = await api.post(`auth/login`, {
            email: email,
            password: password
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching login details:', error.message);
        throw new Error(`Error while fetching login details`, error?.message)
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

export async function searchTasks(taskName: string) {
    try {
        const response = await api.post('tasks/search', null, {
            params: { name: taskName },
        });
        console.log(taskName);
        return response;
    } catch (error: any) {
        console.error('Error fetching task by name:', error.message);
        throw new Error(`Error while fetching task by name: ${error?.message}`);
    }
}

export async function searchMembers(orgId: string, searchTerm: string) {
    try {
        const response = await api.get(`orgs/${orgId}/members`, {
            params: { searchTerm: searchTerm },
        });
        console.log(searchTerm);
        return response;
    } catch (error: any) {
        console.error('Error fetching members by name:', error.message);
        throw new Error(`Error while fetching members by name: ${error?.message}`);
    }
}

export async function getTeamMembersOfLead(orgId: string, businessUnitId: string, leadId: string) {
    try {
        const response: any = await api.get(`orgs/${orgId}/business-units/${businessUnitId}/team-members`, {
            params: { leadId: leadId },
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching members by name:', error.message);
        throw new Error(`Error while fetching members by name: ${error?.message}`);
    }
}

export async function searchJob(jobTitle: string) {
    try {
        const response = await api.post('jobs/search', null, {
            params: { name: jobTitle },
        });
        console.log(jobTitle);
        return response;
    } catch (error: any) {
        console.error('Error fetching job by title:', error.message);
        throw new Error(`Error while fetching job by title: ${error?.message}`);
    }
}

export async function getFilteredUsers(org?: string, businessUnit?: string, page: number = 1, limit: number = 10) {
    return await api.get('users/filter/user', {
        params: {
            org,
            businessUnit,
            page,
            limit
        }
    });
}

export async function getMember(orgId: string, memberId: string) {
    try {
        return await api.get(`orgs/${orgId}/members/${memberId}`)
    } catch (error) {
        console.error('Error fetching department member', error.message);
        throw new Error(`Error while fetching department member: ${error?.message}`);
    }

}


export async function fetchGeocodeData(address: string) {
    try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/geocode/json`;
        const response = await axios.get(url, {
            params: {
                address,
                key: apiKey,
            },
        });

        if (response.data.status !== "OK") {
            throw new Error(`Error from Google API: ${response.data.status}`);
        }

        return response.data;
    } catch (error: any) {
        console.error("Failed to fetch geocode data:", error.message);
        throw new Error(error.response?.data?.error_message || "An unexpected error occurred.");
    }
}

export async function getTasksTodayActivities(contactId, orgId, page = 1, limit = 10) {
    try {
        const response = await api.get('tasks', {
            params: {
                // dateFilter: 'today',
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

export async function getTasksUpcomingActivitiesOrg(orgId, page = 1, limit = 10) {
    try {
        const response = await api.get('tasks', {
            params: {
                // dateFilter: 'upcoming',
                orgId: orgId,
                page: page,
                limit: limit,
            },
        });
        return response;
    } catch (error) {
        console.error('Error fetching upcoming\'s activities:', error.message);
        throw new Error(`Error while fetching upcoming's activities: ${error?.message}`);
    }
}


export async function logout() {
    // Clear the token from cookies
    if (typeof window !== 'undefined') {
        cookies.remove('talency_id_token', { path: '/' });
        localStorage.removeItem('token');
        // Redirect to login page
        window.location.href = '/auth/login';
    }
}

//Activity 

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

// export async function getDepartmentTree(orgId: string) {
//     try {
//         return await api.get(`business-units/${orgId}/tree`)
//     } catch (error) {
//         console.error('Error fetching department tree',error.message)
//         throw new Error(`Error while fetching department tree structure`,error.message)
//     }

// }

export async function getDepartmentTree(orgId: string, type?: string) {
    const endpoint = type
        ? `business-units/${orgId}/tree?type=${type}`
        : `business-units/${orgId}/tree`;
    return api.get(endpoint)
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
        console.log("activity response:", response)
        console.log("activity response with data:", response.data)
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

export async function getDepartmentMembers(orgId: string, deptId: string) {
    try {
        const response: any = await api.get(`orgs/${orgId}/business-units/${deptId}/members`);
        console.log(response);
        return response;
    } catch (error: any) {
        console.error('Error fetching contacts by id:', error.message);
        throw new Error(`Error while fetching contacts by id`, error?.message)
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

export async function getContactsOfAccount(accountId: string, page?: number, limit?: number) {
    try {
        const response: any = await api.get(`contacts`, {
            params: {
                accountId: accountId,
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

// export async function getDepartmentMembers(orgId:string,deptId:string) {
//     return api.get(`orgs/${orgId}/business-units/${deptId}/members`)
// }

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

export async function updateUser(userId: string, data: any) {
    try {
        const response: any = await api.patch(`users/${userId}`, data);
        return response;
    } catch (error: any) {
        console.error('Error updating a user:', error.message);
        throw new Error(`Error updating a user:`, error?.message)
    }
}

export async function updateUserProfile(userId: string, data: any) {
    try {
        const response: any = await api.patch(`users/${userId}/profile`, data);
        return response;
    } catch (error: any) {
        console.error('Error updating a user profile:', error.message);
        throw new Error(`Error updating a user profile:`, error?.message)
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

//Email template builder 

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


export async function getEmailTemplates(params?: { templateName?: string, page?: number, limit?: number }) {
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

export async function getEmailTemplatesCount() {
    try {
        const response: any = await api.get(`email-template/templates-count`);
        return response;
    } catch (error: any) {
        console.error('Error fetching email template count:', error.message);
        throw new Error(`Error while fetching email template count: ${error?.message}`);
    }
}

//Placeholders

export async function getAllPlaceholders(params?: { emailTemplateId?: string; isDefault?: boolean; templateName?: string }) {
    try {
        const response: any = await api.get(`orgs/placeholders`, {
            params: {
                emailTemplate: params?.emailTemplateId,
                isDefault: params?.isDefault,
                templateName: params?.templateName
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching placeholders', error.message);
        throw new Error(`Error fetching placeholders: ${error?.message}`);
    }
}

// Dynamic feilds for job applications

export async function getDynamicFields(orgId?: string) {
    try {
        const response: any = await api.get(`job-application-forms/dynamic-fields`, {
            params: {
                orgId: orgId,
                isJobApplicationField: true
            }
        });
        return response;
    } catch (error: any) {
        console.error('Error fetching dynamic feilds in job application ', error.message);
        throw new Error(`Error fetching placeholders `, error?.message)
    }
}

export async function createDynamicField(data: any) {
    try {
        const response: any = api.post(`job-application-forms/dynamic-fields`, data);
        return response;
    } catch (error: any) {
        console.error('Error creating dynamic field:', error.message);
        throw new Error(`Error creating dynamic field`, error?.message)
    }
}


export async function updateDynamicField(fieldId: string, data: any) {
    try {
        const response: any = await api.patch(`job-application-forms/dynamic-fields/${fieldId}`, data);
        return response;
    } catch (error: any) {
        console.error('Error updating dynamic field:', error.message);
        throw new Error(`Error updating dynamic field: ${error?.message}`);
    }
}

export async function deleteDynamicField(fieldId: string) {
    try {
        const response: any = await api.delete(`job-application-forms/dynamic-fields/${fieldId}`);
        return response;
    } catch (error) {
        console.error('Error deleting dynamic field:', error);
        throw error;
    }
}

export async function uploadFiles(files: File[]): Promise<FileMetadata[]> {
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
        console.log("File upload response:", response);
        // Directly use the response as it is already the array of FileMetadata
        const fileMetadatas = response || [];
        console.log("filemetadata", fileMetadatas);

        return fileMetadatas as FileMetadata[];

    } catch (error) {
        console.error('Error uploading files:', error);
        throw error;
    }
}



//Testing 


const ApiCall = {
    // common
    getAllUsers() {
        return api.get('users');
    },

    // ----- Auth Start
    registerUser(body) {
        return api.post('auth/register', body);
    },

    verifyUserByOtp(body) {
        return api.post('auth/verify-email-otp', body);
    },

    resendVerificationEmail(body) {
        return api.post('auth/resend-verification-email', body)
    },

    forgotPassword(body) {
        return api.post('auth/forgot-password', body);
    },

    verifyOtpAfterForgotPassword(body) {
        return api.post('auth/forgot-password-verify-otp', body);
    },

    updatePasswordAfterForget(body) {
        return api.patch('auth/update-password', body);
    },

    //Current Loggedin User

    getCurrentUser() {
        return api.get('auth/logged-in-user');
    },

    getFilteredUsers(org?: string, businessUnit?: string, page: number = 1, limit: number = 10) {
        return api.get('users/filter/user', {
            params: {
                org,
                businessUnit,
                page,
                limit
            }
        });
    },

    async getActiveUsers(page: number = 1, limit: number = 25, role?: string) {
        try {
            const params: { page: number; limit: number; role?: string } = {
                page,
                limit,
            };

            if (role) {
                params.role = role;
            }

            const response = await api.get('users/active', { params });
            return response;
        } catch (error) {
            console.error('Error fetching active users:', error);
            throw error;
        }
    },

    getUserById(userId) {
        api.get(`users/${userId}`)
    },


    //Accounts

    getOrgsByType(orgType: string, page?: number, limit?: number) {
        return api.get(`orgs/filter/org-type`, {
            params: {
                orgType: orgType,
                page: page,
                limit: limit
            }
        })
    },

    getAllIndustries() {
        return api.get('industries');
    },

    // ----- Auth End

    //Org
    getOrgByID(orgId) {
        return api.get(`orgs/${orgId}`);
    },

    getOrgBySearch(title) {
        return api.get(`/orgs/search`, {
            params: { title }

        });
    },


    updateAccountAssignee(orgId: string, body) {
        return api.patch(`orgs/${orgId}/assign-to`, body);
    },

    updateAccountStatus(orgId: string, body) {
        return api.patch(`orgs/${orgId}/status`, body);
    },


    //countries

    getCountries() {
        return api.get('countries/active', {});
    },

    getAllActiveCountries() {
        return api.get(`countries/all`);
    },

    getCountryById(countryId) {
        return api.get(`countries/${countryId}`);
    },

    getCountryBySearch(name) {
        const params = {};
        if (name && name.trim() !== "") {
            // params.name = name.trim();
        }
        console.log('params:', params);
        return api.post(`countries/search`, null, { params });
    },

    getActiveStatesByCountryId(countryId) {
        return api.get(`countries/${countryId}/states`);
    },

    getRegionByCountryAndState(countryId, stateId) {
        return api.get(`region/country/${countryId}/state/${stateId}`)
    },

    getIdentifiersByRegionId(regionId) {
        return api.get(`identifiers/${regionId}/find-all-by-region`);
    },

    // getStatesByCountryName(countryId) {
    //     return api.get(`countries/${countryId}/states`);
    // },

    // Contacts 

    getAllContacts(page?: number, limit?: number) {
        return api.get(`contacts`, {
            params: {
                page: page,
                limit: limit
            }
        })
    },


    getTodayActivity(contactId: string) {
        return api.get(`/sales/account/v1/getTodaysActivities/${contactId}`);
    },
    getUpcomingActivity(accountId) {
        return api.get(`/sales/account/v1/getUpComingActivities/${accountId}`);
    },


    getContactById(id: string) {
        return api.get(`contacts/${id}`);
    },
    // searchContact(contactName: string) {
    //     return api.get(`sales/contacts/search`, {
    //         params: contactName
    //     } );
    // },


    getContactsByAccountId(accountOrgId, page, limit) {
        return api.get(`contacts`, {
            params: {
                accountId: accountOrgId,
                page: page,
                limit: limit
            }
        })
    },

    addContact(data: Contact) {
        return api.post('contacts', data);
    },

    updateContact(id: string, data: Contact) {
        return api.patch(`contacts/${id}`, data);
    },

    updateContactAssignee(contactId: string, body) {
        return api.patch(`contacts/${contactId}/assign-to`, body);
    },

    updateContactStatus(contactId: string, body) {
        return api.patch(`contacts/${contactId}/status`, body);
    },

    softDeleteContact(contactId: string) {
        return api.delete(`contacts/${contactId}/soft-delete`);
    },

    hardDeleteContact(contactId: string) {
        return api.delete(`contacts/${contactId}/hard-delete`);
    },

    //Tasks 

    addTask(data) {
        return api.post(`tasks`, data);
    },

    addSubTask(parentTaskId: string, data) {
        return api.post(`tasks/${parentTaskId}`, data);
    },

    getAllTasks(page: number, limit: number) {
        return api.get(`tasks/all`, {
            params: {
                page: page,
                limit: limit
            }
        })
    },

    getTodayTasks(filter: string, page: number, limit: number) {
        return api.get(`tasks/date-filter`, {
            params: {
                filter: filter,
                page: page,
                limit: limit
            }
        })
    },

    getUpcomingTasks(filter: string, page: number, limit: number) {
        return api.get(`tasks/date-filter`, {
            params: {
                filter: filter,
                page: page,
                limit: limit
            }
        })
    },

    getTaskById(taskId: string) {
        return api.get(`tasks/${taskId}`);
    },

    getSubTaskById(taskId: string) {
        return api.get(`tasks/${taskId}/sub-tasks`);
    },

    updateTaskAssignee(taskId: string, body) {
        return api.patch(`tasks/${taskId}/update-assignee`, body);
    },

    updateTaskStatus(taskId: string, body) {
        return api.patch(`tasks/${taskId}/update-status`, body);
    },

    updateTask(taskId: string, data) {
        return api.patch(`tasks/${taskId}`, data);
    },

    getTaskComments(taskId: string) {
        return api.get(`tasks/${taskId}/comments`);
    },

    addTaskComments(taskId: string, body) {
        return api.post(`tasks/${taskId}/comments`, body);
    },

    hardDeleteTask(taskId: string) {
        return api.delete(`tasks/${taskId}`);
    },


    //Messages endpoints

    getSentMessages() {
        return api.get(`messages/sent`);
    },

    getInboxMessages() {
        return api.get(`messages/inbox`);
    },

    getDeletedMessages() {
        return api.get(`messages/soft-delete`);
    },

    getStarredMessages() {
        return api.get(`messages/starred`);
    },

    getMessageById(messageId) {
        return api.get(`messages/${messageId}`);
    },

    sendMessage(body) {
        return api.post(`messages`, body);
    },

    starMessage(messageId, userId) {
        return api.post(`messages/${messageId}/star`, { userId })
    },

    unstarMessage(messageId, userId) {
        return api.patch(`messages/${messageId}/star`, { userId })
    },

    deleteMessageForme(messageId, userId) {
        return api.delete(`messages/${messageId}/soft-delete/me`, { data: userId })
    },

    deleteMessageForAll(messageId, userId) {
        return api.delete(`messages/${messageId}/soft-delete/all`, { data: userId })
    },

    markMessageAsRead(messageId, recipientId) {
        return api.patch(`messages/${messageId}/read`, null, { params: { recipientId } });
    },

    markMessageAsUnread(messageId, recipientId) {
        return api.patch(`messages/${messageId}/unread`, null, { params: { recipientId } });
    },

    //File Upload

    async uploadFiles(files) {
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
    },

    async uploadFilesWithIdentifiers(files, identifierIds = []) {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        const queryParams = new URLSearchParams();
        identifierIds.forEach(id => queryParams.append('identifierIds', id));
        const queryString = queryParams.toString();

        try {
            const response = await api.post(`file-uploads/multiple${queryString ? `?${queryString}` : ''}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const fileMetadatas = response;
            return fileMetadatas;
        } catch (error) {
            console.error('Error uploading files:', error);
            throw error;
        }
    },

    //Job

    getJobsCount() {
        return api.get(`jobs/jobs-count`);
    },


    getAllJobs(params: GetAllJobsParams) {
        return api.get(`jobs/all`, {
            params: params,
        });
    },

    getJobById(jobId: string) {
        return api.get(`jobs/${jobId}`);
    },

    updateJobStatus(jobId: string, body) {
        return api.patch(`jobs/${jobId}/update-status`, body);
    },


    softDeleteJob(jobId: string) {
        return api.delete(`jobs/${jobId}/soft-delete`);
    },

    bulkSoftDeleteJobs(jobIds: string[]) {
        return api.delete(`jobs/bulk-delete`, {
            data: jobIds
        });
    },

    bulkUpdateJobStatus(data: any) {
        return api.patch(`jobs/bulk-status-update`, data);
    },

    // Job applications

    getJobApplication(jobApplicationId: string) {
        return api.get(`job-application-forms/${jobApplicationId}`);
    },

    getJobApplicationsByJobId(id: string) {
        return api.get(`job-application-forms`, {
            params: {
                jobId: id
            }
        })
    },

    getJobApplicationsCount(id: string) {
        return api.get(`job-application-forms/count`, {
            params: {
                jobId: id
            }
        })
    },

    getJobApplicationsCountByRecruiter(id: string, recruiterId) {
        return api.get(`job-application-forms/recruiter-count`, {
            params: {
                jobId: id,
                recruiterId: recruiterId,
            }
        })
    },

    getUserJobApplicationForJob(jobId: string) {
        return api.get(`job-application-forms/${jobId}/user-application`);
    },

    jobApplicationPost(data) {
        return api.post(`job-application-forms`, data);
    },

    updateJobApplication(jobApplicationId: string, data: any) {
        return api.patch(`job-application-forms/${jobApplicationId}`, data);
    },

    jobPost(data) {
        return api.post(`jobs`, data);
    },

    jobDraft(data) {
        return api.post(`jobs/draft`, data);
    },

    updateJob(jobId: string, data) {
        return api.patch(`jobs/${jobId}`, data);
    },

    getJobLocations() {
        return api.get(`job-locations`);
    },

    rejectCandidateFromWorkflow(id: string, isRejected: boolean) {
        return api.patch(`job-application-forms/${id}/update-status`, { isRejected: isRejected })
    },

    updateStageOfJobApplication(jobApplicationId: string, newStageId: string) {
        return api.patch(`job-application-forms/${jobApplicationId}/update-stage`, null, {
            params: {
                stageId: newStageId
            }
        })
    },

    //   Workflow
    createStageInWorkflow(id: string, body: Stage) {
        return api.patch(`workflows/${id}/stage`, body);
    },

    getAllDepartments(params: { page?: number; limit?: number; orgId?: string, type?: string }) {
        return api.get('business-units', { params });
    },

    getDepartment(departmentId: string) {
        return api.get(`business-units/${departmentId}`)
    },

    editDepartment(departmentId: string, data) {
        return api.patch(`business-units/${departmentId}`, data)
    },

    deleteDepartment(departmentId: string) {
        return api.delete(`business-units/${departmentId}/soft-delete`)
    },

    addDepartment(data) {
        return api.post(`business-units`, data)
    },

    getDepartmentTree(orgId: string, type?: string) {
        const endpoint = type
            ? `business-units/${orgId}/tree?type=${type}`
            : `business-units/${orgId}/tree`;
        return api.get(endpoint)
    },

    moveDepartmentToRoot(movingId: string, orgId: string) {
        return api.patch(`business-units/${movingId}/move-to-root/${orgId}`)
    },

    moveDepartmentToDestination(movingId: string, destinationId: string) {
        console.log('movingId', movingId);
        console.log('destinationId', destinationId)
        return api.patch(`business-units/${movingId}/move-to/${destinationId}`)
    },

    mergeDepartment(movingId: string, destinationId: string) {
        return api.patch(`business-units/${movingId}/merge/${destinationId}`)
    },

    getPlaceholders(orgId?: string) {
        return api.get(`orgs/placeholders`, {
            params: { orgId }
        })
    },

    getDepartmentMembers(orgId: string, deptId: string) {
        return api.get(`orgs/${orgId}/business-units/${deptId}/members`)
    },

    getUsersByBusinessUnitType(queryParams: { type: string; orgId?: string; page?: number; limit?: number }) {
        return api.get('business-units/users-by-business-unit-type', { params: queryParams });
    },

    addPlaceholder(data) {
        return api.post(`orgs/placeholders`, data)
    },

    editPlaceholder(placeholderId: string, data) {
        return api.patch(`orgs/placeholders/${placeholderId}`, data)
    },

    deletePlaceholder(placeholderId: string) {
        return api.delete(`orgs/placeholders/${placeholderId}`)
    },

    getPlaceholder(placeholderId: string) {
        return api.get(`orgs/placeholders/${placeholderId}`)
    },

    addMember(orgId: string, data) {
        return api.post(`orgs/${orgId}/members`, data)
    },

    getMembers(orgId: string, businessUnitId: string, searchTerm?: string) {
        const params: any = {
            ...(searchTerm && { searchTerm })
        };
        return api.get(`orgs/${orgId}/business-units/${businessUnitId}/members`, { params });
    },

    // getMembersByOrg(orgId: string, searchTerm?: string) {
    //     const params = searchTerm ? { searchTerm } : {};
    //     return api.get(`orgs/${orgId}/members`, { params });
    // },

    getMember(orgId: string, memberId: string) {
        return api.get(`orgs/${orgId}/members/${memberId}`)
    },

    updateMember(orgId: string, memberId: string, data) {
        return api.patch(`orgs/${orgId}/members/${memberId}`, data)
    },

    deleteMember(orgId: string, memberId: string) {
        return api.delete(`orgs/${orgId}/members/${memberId}/soft-delete`)
    },

    hardDeleteMember(orgId: string, memberId: string) {
        return api.delete(`orgs/${orgId}/members/${memberId}/hard-delete`)
    },

    getFileMetadataById(fileId) {
        return api.get(`file-uploads/${fileId}/metadata`)
    },

    createOnboarding(data) {
        console.log(data)
        return api.post(`onboardings`, data)
    },


};


export async function userChangePassword(data: any) {
    console.log('Request data:', data)
    try {
        const response: any = await api.patch(`auth/change-password`, {
            userId: data.userId,
            password: data.password
        }
        );

        if (!response?.data) {
            console.warn('Warning: API returned an undefined response.');
            throw new Error('Unexpected response from the server.');
        }
        return response;
    } catch (error: any) {
        console.error('Error details:', error); // Log complete error object.
        console.error('Error response:', error?.response); // Log server response, if available.
        throw new Error(error?.response?.data?.message || 'Failed to change password');
    }
}


export const setToken = (req) => {
    const cookies = new Cookies(req.headers.cookie);
    serverToken = cookies.get('talency_id_token');
    return serverToken;
};

export default ApiCall;






