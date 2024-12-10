import { api } from "./api.service";
import { Stage, Workflow } from "./types";

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


