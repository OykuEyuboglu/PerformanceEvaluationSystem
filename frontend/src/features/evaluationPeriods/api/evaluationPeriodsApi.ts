import axiosInstance from '../../../api/axiosInstance'

export interface EvaluationPeriod {
    id: number
    name: string
    startDate: string
    endDate: string
}

export async function getEvaluationPeriods(): Promise<EvaluationPeriod[]> {
    const response = await axiosInstance.get<EvaluationPeriod[]>(
        '/EvaluationPeriods'
    )

    return response.data
}