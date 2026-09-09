import axiosInstance from '../../api/axiosInstance'
import type { EvaluatorEmployeeDto, AssignEvaluatorEmployeeDto } from './types'

export async function getTeamByEvaluator(evaluatorId: number): Promise<EvaluatorEmployeeDto[]> {
    const res = await axiosInstance.get<EvaluatorEmployeeDto[]>(`/evaluatorEmployees/${evaluatorId}`)
    return res.data
}

export async function assignEmployee(dto: AssignEvaluatorEmployeeDto): Promise<EvaluatorEmployeeDto> {
    const res = await axiosInstance.post<EvaluatorEmployeeDto>('/evaluatorEmployees', dto)
    return res.data
}

export async function removeAssignment(evaluatorId: number, employeeId: number): Promise<void> {
    await axiosInstance.delete(`/evaluatorEmployees/${evaluatorId}/${employeeId}`)
}