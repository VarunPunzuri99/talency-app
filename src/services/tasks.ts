import { api } from "./api.service";

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




// tasks

export function addTask(data) {
    return api.post(`tasks`, data);
}

export function addSubTask(parentTaskId: string, data) {
    return api.post(`tasks/${parentTaskId}`, data);
}

export function getAllTasks(page: number, limit: number) {
    return api.get(`tasks/all`, {
        params: {
            page: page,
            limit: limit
        }
    })
}

export function getTodayTasks(filter: string, page: number, limit: number) {
    return api.get(`tasks/date-filter`, {
        params: {
            filter: filter,
            page: page,
            limit: limit
        }
    })
}

export function getUpcomingTasks(filter: string, page: number, limit: number) {
    return api.get(`tasks/date-filter`, {
        params: {
            filter: filter,
            page: page,
            limit: limit
        }
    })
}

export function getTaskById(taskId: string) {
    return api.get(`tasks/${taskId}`);
}

export function getSubTaskById(taskId: string) {
    return api.get(`tasks/${taskId}/sub-tasks`);
}
export function updateTaskAssignee(taskId: string, body) {
    return api.patch(`tasks/${taskId}/update-assignee`, body);
}

export function updateTaskStatus(taskId: string, body) {
    return api.patch(`tasks/${taskId}/update-status`, body);
}

export function updateTask(taskId: string, data) {
    return api.patch(`tasks/${taskId}`, data);
}

export function getTaskComments(taskId: string) {
    return api.get(`tasks/${taskId}/comments`);
}

export function addTaskComments(taskId: string, body) {
    return api.post(`tasks/${taskId}/comments`, body);
}

export function hardDeleteTask(taskId: string) {
    return api.delete(`tasks/${taskId}`);
}



export async function getAllMemberAssignedJobs(memberId: string) {
    try {
        const response: any = await api.get(`tasks/members/${memberId}/all-assigned`);
        return response;
    } catch (error: any) {
        console.error('Error fetching all assigned jobs to member:', error.message);
        throw new Error(`Error assigning a job to member`, error?.message)
    }
}


export async function getJobAssignCount(jobId: string) {
    try {
        const response: any = await api.get(`tasks/analytics`, {
          params: {
            jobId: jobId
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


  export async function getAllVendorAssignedJobs(vendorId: string) {
    try {
        const response: any = await api.get(`tasks/vendors/${vendorId}/all-assigned`);
        return response;
    } catch (error: any) {
        console.error('Error fetching all assigned jobs to vendor:', error.message);
        throw new Error(`Error fetching all assigned jobs to vendor`, error?.message);
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