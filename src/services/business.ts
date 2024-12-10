import { api } from "./api.service"

export async function getAllDepartments(page = 1, rowsPerPage = 30, orgId) {
    return api.get(`business-units`, {
        params: {
            page,
            limit: rowsPerPage,
            orgId
        }
    })
}

export async function getDepartment(departmentId: string) {
    return api.get(`business-units/${departmentId}`)
}
export async function editDepartment(departmentId: string, data) {
    return api.patch(`business-units/${departmentId}`, data)
}

export async function deleteDepartment(departmentId: string) {
    return api.delete(`business-units/${departmentId}/soft-delete`)
}

export async function addDepartment(data) {
    return api.post(`business-units`, data)
}

export async function getDepartmentTree(orgId: string) {
    return api.get(`business-units/${orgId}/tree`)
}

export async function moveDepartmentToRoot(movingId: string, orgId: string) {
    return api.patch(`business-units/${movingId}/move-to-root/${orgId}`)
}

export async function moveDepartmentToDestination(movingId: string, destinationKey: string) {
    return api.patch(`business-units/${movingId}/move-to/${destinationKey}`)
}

export async function mergeDepartment(movingId: string, destinationKey: string) {
    return api.patch(`business-units/${movingId}/merge/${destinationKey}`)
}

