import axiosInstance from '../../api/axiosInstance'
import type { DepartmentDto } from '../types/department'

export async function getDepartments(): Promise<DepartmentDto[]> {
    const response = await axiosInstance.get<DepartmentDto[]>('/departments')
    return response.data
}
