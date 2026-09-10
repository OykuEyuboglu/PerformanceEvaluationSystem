import axiosInstance from '../../api/axiosInstance'

export interface EmployeeRanking {
    rank: number
    employeeId: number
    employeeName: string
    departmentName: string
    jobPositionName: string
    averageScore: number
    evaluationCount: number
}

export async function getDepartmentRanking(evaluationPeriodId: number): Promise<EmployeeRanking[]> {
    const response = await axiosInstance.get<EmployeeRanking[]>('/reports/department-ranking', {
        params: { evaluationPeriodId },
    })
    return response.data
}

export async function getTeamRanking(evaluationPeriodId: number): Promise<EmployeeRanking[]> {
    const response = await axiosInstance.get<EmployeeRanking[]>('/reports/team-ranking', {
        params: { evaluationPeriodId },
    })
    return response.data
}

export async function exportDepartmentRankingExcel(
    evaluationPeriodId: number
): Promise<void> {
    const response = await axiosInstance.get(
        `/Reports/department-ranking/export`,
        {
            params: {
                evaluationPeriodId,
            },
            responseType: 'blob',
        }
    )

    const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const url =
        window.URL.createObjectURL(blob)

    const link =
        document.createElement('a')

    link.href = url

    link.download =
        `Departman_Siralamasi_${evaluationPeriodId}.xlsx`

    document.body.appendChild(link)

    link.click()

    link.remove()

    window.URL.revokeObjectURL(url)
}

export async function exportTeamRankingExcel(evaluationPeriodId: number): Promise<void> {
    const response = await axiosInstance.get('/reports/team-ranking/export', {
        params: { evaluationPeriodId },
        responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Ekip_Siralamasi_${evaluationPeriodId}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
}