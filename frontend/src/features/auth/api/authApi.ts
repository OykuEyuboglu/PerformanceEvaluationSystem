import axiosInstance from '../../../api/axiosInstance'
import type {
    LoginRequestDto,
    LoginResponseDto,
} from '../../../shared/types/auth'

export const login = async (
    data: LoginRequestDto
): Promise<LoginResponseDto> => {
    const response = await axiosInstance.post<LoginResponseDto>(
        '/auth/login',
        data
    )

    return response.data
}