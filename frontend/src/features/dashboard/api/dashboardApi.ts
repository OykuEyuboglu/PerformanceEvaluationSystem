import axiosInstance from '../../../api/axiosInstance'

export interface EmployeeRanking {
    rank: number
    employeeId: number
    employeeName: string
    departmentName: string
    jobPositionName: string
    averageScore: number
    evaluationCount: number
}

export async function getDepartmentRanking(
    evaluationPeriodId: number
): Promise<EmployeeRanking[]> {
    const response = await axiosInstance.get<EmployeeRanking[]>(
        '/Reports/department-ranking',
        {
            params: {
                evaluationPeriodId,
            },
        }
    )

    return response.data
}