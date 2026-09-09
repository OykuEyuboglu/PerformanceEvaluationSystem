export interface EvaluationPeriod {
    id: number
    name: string
    startDate: string
    endDate: string
}

export interface CreateEvaluationPeriodDto {
    name: string
    startDate: string
    endDate: string
}

export interface UpdateEvaluationPeriodDto {
    name: string
    startDate: string
    endDate: string
}