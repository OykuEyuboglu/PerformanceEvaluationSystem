
import axiosInstance from '../../../api/axiosInstance'
import type {
    UserDto,
    CreateUserDto,
    UpdateUserDto,
    UpdatePatchUserDto,
} from '../../../shared/types/user'

export async function getUsers(): Promise<UserDto[]> {
    const response = await axiosInstance.get<UserDto[]>('/user')
    return response.data
}

export async function createUser(dto: CreateUserDto): Promise<UserDto> {
    const response = await axiosInstance.post<UserDto>('/user', dto)
    return response.data
}

export async function updateUser(id: number, dto: UpdateUserDto): Promise<UserDto> {
    const response = await axiosInstance.put<UserDto>(`/user/${id}`, dto)
    return response.data
}

export async function patchUser(id: number, dto: UpdatePatchUserDto): Promise<UserDto> {
    const response = await axiosInstance.patch<UserDto>(`/user/${id}`, dto)
    return response.data
}

export async function deleteUser(id: number): Promise<void> {
    await axiosInstance.delete(`/user/${id}`)
}