import axiosInstance from '../../api/axiosInstance'
import type { JobPositionDto } from '../types/jobPosition'

export async function getJobPositions(): Promise<JobPositionDto[]> {
    const response = await axiosInstance.get<JobPositionDto[]>('/jobpositions')
    return response.data
}