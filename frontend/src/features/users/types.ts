export type UserRole = 'Admin' | 'Evaluator' | 'Employee'

export interface UserDto {
    id: number
    firstName: string
    lastName: string
    email: string
    role: UserRole
    isActive: boolean
    departmentName: string
    jobPositionId?: number | null
    jobPositionName?: string | null
}

export interface CreateUserDto {
    firstName: string
    lastName: string
    email: string
    password: string
    role: UserRole
    departmentId: number
    jobPositionId?: number | null
}

export interface UpdateUserDto {
    firstName: string
    lastName: string
    role: UserRole
    departmentId: number
    jobPositionId?: number | null
    isActive: boolean
}

export interface UpdatePatchUserDto {
    firstName?: string
    lastName?: string
    role?: UserRole
    departmentId?: number
    jobPositionId?: number | null
    isActive?: boolean
}