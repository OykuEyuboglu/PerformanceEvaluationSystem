export interface EvaluatorEmployeeDto {
    id: number
    evaluatorId: number
    evaluatorName: string
    employeeId: number
    employeeName: string
}

export interface AssignEvaluatorEmployeeDto {
    evaluatorId: number
    employeeId: number
}