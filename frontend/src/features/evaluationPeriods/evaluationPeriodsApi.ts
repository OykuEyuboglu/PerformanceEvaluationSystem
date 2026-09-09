import axiosInstance from '../../api/axiosInstance'
import type { EvaluationPeriod, CreateEvaluationPeriodDto, UpdateEvaluationPeriodDto } from './types'

export async function getEvaluationPeriods(): Promise<EvaluationPeriod[]> {
    const res = await axiosInstance.get<EvaluationPeriod[]>('/evaluationperiods')
    return res.data
}

export async function createEvaluationPeriod(dto: CreateEvaluationPeriodDto): Promise<EvaluationPeriod> {
    const res = await axiosInstance.post<EvaluationPeriod>('/evaluationperiods', dto)
    return res.data
}

export async function updateEvaluationPeriod(id: number, dto: UpdateEvaluationPeriodDto): Promise<EvaluationPeriod> {
    const res = await axiosInstance.put<EvaluationPeriod>(`/evaluationperiods/${id}`, dto)
    return res.data
}

export async function deleteEvaluationPeriod(id: number): Promise<void> {
    await axiosInstance.delete(`/evaluationperiods/${id}`)
}