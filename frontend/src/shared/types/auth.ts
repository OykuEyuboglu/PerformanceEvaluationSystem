import type { UserDto } from './user'

export interface LoginRequestDto {
    email: string
    password: string
}

export interface LoginResponseDto {
    token: string
    expiresAt: string
    user: UserDto
}