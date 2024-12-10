import { api } from "./api.service";
import { Stage } from "./types";

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