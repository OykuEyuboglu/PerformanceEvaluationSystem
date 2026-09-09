export interface EvaluationDetailDto {
    performanceCriterionId: number
    criterionName: string
    categoryName: string
    score: number
}

export interface EvaluationDto {
    id: number
    employeeId: number
    employeeName: string
    evaluatorId: number
    evaluatorName: string
    evaluationPeriodName: string
    comment?: string | null
    totalScore: number
    status: string
    createdAt: string
    details: EvaluationDetailDto[]
}

export interface EvaluationDetailInputDto {
    performanceCriterionId: number
    score: number
}

export interface CreateEvaluationDto {
    employeeId: number
    evaluationPeriodId: number
    comment?: string
    scores: EvaluationDetailInputDto[]
}