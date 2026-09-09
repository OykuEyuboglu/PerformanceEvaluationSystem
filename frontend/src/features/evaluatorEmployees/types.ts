export interface EvaluatorEmployeeDto {
    id: number
    evaluatorId: number
    evaluatorName: string
    employeeId: number
    employeeName: string
    employeeJobPositionId?: number | null
    employeeJobPositionName?: string | null
}

export interface AssignEvaluatorEmployeeDto {
    evaluatorId: number
    employeeId: number
}