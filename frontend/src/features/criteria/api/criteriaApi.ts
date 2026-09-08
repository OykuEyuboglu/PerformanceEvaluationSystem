import axiosInstance from '../../../api/axiosInstance'
import type {
    PerformanceCategoryDto,
    CreatePerformanceCategoryDto,
    UpdatePerformanceCategoryDto,
    PerformanceCriterionDto,
    CreatePerformanceCriterionDto,
    UpdatePerformanceCriterionDto,
} from '../types/criteria'

// Kategoriler
export async function getCategories(): Promise<PerformanceCategoryDto[]> {
    const res = await axiosInstance.get<PerformanceCategoryDto[]>('/criteria/categories')
    return res.data
}

export async function createCategory(dto: CreatePerformanceCategoryDto): Promise<PerformanceCategoryDto> {
    const res = await axiosInstance.post<PerformanceCategoryDto>('/criteria/categories', dto)
    return res.data
}

export async function updateCategory(id: number, dto: UpdatePerformanceCategoryDto): Promise<PerformanceCategoryDto> {
    const res = await axiosInstance.put<PerformanceCategoryDto>(`/criteria/categories/${id}`, dto)
    return res.data
}

export async function deleteCategory(id: number): Promise<void> {
    await axiosInstance.delete(`/criteria/categories/${id}`)
}

// Kriterler
export async function getCriteria(): Promise<PerformanceCriterionDto[]> {
    const res = await axiosInstance.get<PerformanceCriterionDto[]>('/criteria/criteria')
    return res.data
}

export async function createCriterion(dto: CreatePerformanceCriterionDto): Promise<PerformanceCriterionDto> {
    const res = await axiosInstance.post<PerformanceCriterionDto>('/criteria/criteria', dto)
    return res.data
}

export async function updateCriterion(id: number, dto: UpdatePerformanceCriterionDto): Promise<PerformanceCriterionDto> {
    const res = await axiosInstance.put<PerformanceCriterionDto>(`/criteria/criteria/${id}`, dto)
    return res.data
}

export async function deleteCriterion(id: number): Promise<void> {
    await axiosInstance.delete(`/criteria/criteria/${id}`)
}