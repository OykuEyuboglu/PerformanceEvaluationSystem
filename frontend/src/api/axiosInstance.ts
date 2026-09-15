import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

axiosInstance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token

    if (token) {
        config.headers.set(
            'Authorization',
            `Bearer ${token}`
        )
    }

    return config
})

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status

        const isLoginRequest =
            error.config?.url?.includes('/auth/login')

        if (status === 401 && !isLoginRequest) {
            useAuthStore.getState().expireSession()
            window.location.href = '/login'
        }

        return Promise.reject(error)
    }
)

export default axiosInstance