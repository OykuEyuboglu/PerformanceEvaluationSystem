export interface PerformanceCategoryDto {
    id: number
    name: string
    weight: number
    isActive: boolean
}

export interface CreatePerformanceCategoryDto {
    name: string
    weight: number
}

export interface UpdatePerformanceCategoryDto {
    name: string
    weight: number
    isActive: boolean
}

export interface CriterionJobPositionDto {
    jobPositionId: number
    jobPositionName: string
    description: string
}

export interface CriterionJobPositionInputDto {
    jobPositionId: number
    description: string
}

export interface PerformanceCriterionDto {
    id: number
    name: string
    isActive: boolean
    performanceCategoryId: number
    performanceCategoryName: string
    jobPositionDescriptions: CriterionJobPositionDto[]
}

export interface CreatePerformanceCriterionDto {
    name: string
    performanceCategoryId: number
    jobPositionDescriptions: CriterionJobPositionInputDto[]
}

export interface UpdatePerformanceCriterionDto {
    name: string
    isActive: boolean
    jobPositionDescriptions: CriterionJobPositionInputDto[]
}