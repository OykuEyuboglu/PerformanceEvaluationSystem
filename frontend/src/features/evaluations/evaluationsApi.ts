import axiosInstance from '../../api/axiosInstance'
import type { EvaluationDto, CreateEvaluationDto } from './types'

export async function createEvaluation(dto: CreateEvaluationDto): Promise<EvaluationDto> {
    const res = await axiosInstance.post<EvaluationDto>('/evaluations', dto)
    return res.data
}


export async function getAllEvaluations(evaluationPeriodId?: number): Promise<EvaluationDto[]> {
    const res = await axiosInstance.get<EvaluationDto[]>('/evaluations', {
        params: evaluationPeriodId ? { evaluationPeriodId } : undefined,
    })
    return res.data
}

export async function getMyEvaluations(): Promise<EvaluationDto[]> {
    const res = await axiosInstance.get<EvaluationDto[]>('/evaluations/my')
    return res.data
}

export async function getEvaluationById(id: number): Promise<EvaluationDto> {
    const res = await axiosInstance.get<EvaluationDto>(`/evaluations/${id}`)
    return res.data
}

export async function getMyPeriodEvaluations(
    evaluationPeriodId: number
): Promise<EvaluationDto[]> {
    const res = await axiosInstance.get<EvaluationDto[]>(
        `/evaluations/my-period/${evaluationPeriodId}`
    )

    return res.data
}

export async function approveEvaluation(id: number): Promise<EvaluationDto> {
    const res = await axiosInstance.patch<EvaluationDto>(`/evaluations/${id}/approve`)
    return res.data
}

export async function approveBulk(ids: number[]): Promise<{ approvedCount: number }> {
    const res = await axiosInstance.patch<{ approvedCount: number }>('/evaluations/approve-bulk', { ids })
    return res.data
}