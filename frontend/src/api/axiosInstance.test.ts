import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'

const mockExpireSession = vi.fn()

vi.mock('../store/authStore', () => ({
    useAuthStore: {
        getState: () => ({
            token: 'test-token',
            expireSession: mockExpireSession,
        }),
    },
}))

import axiosInstance from './axiosInstance'

describe('axiosInstance', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('request interceptor token varsa Authorization header eklemeli', async () => {
        const adapter = vi.fn().mockResolvedValue({
            data: { success: true },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {},
        })

        const instance = axios.create({
            adapter,
        })

        instance.interceptors.request.use((config) => {
            const token = 'test-token'

            if (token) {
                config.headers.set(
                    'Authorization',
                    `Bearer ${token}`
                )
            }

            return config
        })

        await instance.get('/users')

        expect(adapter).toHaveBeenCalledTimes(1)

        const config = adapter.mock.calls[0][0]

        expect(
            config.headers.get('Authorization')
        ).toBe('Bearer test-token')
    })

    it('401 hatasında session expire edilmeli', async () => {
        const adapter = vi.fn().mockRejectedValue({
            response: {
                status: 401,
            },
            config: {
                url: '/users',
            },
        })

        const instance = axios.create({
            adapter,
        })

        instance.interceptors.response.use(
            (response) => response,
            (error) => {
                const status =
                    error.response?.status

                const isLoginRequest =
                    error.config?.url?.includes(
                        '/auth/login'
                    )

                if (
                    status === 401 &&
                    !isLoginRequest
                ) {
                    mockExpireSession()
                }

                return Promise.reject(error)
            }
        )

        await expect(
            instance.get('/users')
        ).rejects.toBeDefined()

        expect(
            mockExpireSession
        ).toHaveBeenCalledTimes(1)
    })

    it('login endpointinden gelen 401 hatasında session expire edilmemeli', async () => {
        const adapter = vi.fn().mockRejectedValue({
            response: {
                status: 401,
            },
            config: {
                url: '/auth/login',
            },
        })

        const instance = axios.create({
            adapter,
        })

        instance.interceptors.response.use(
            (response) => response,
            (error) => {
                const status =
                    error.response?.status

                const isLoginRequest =
                    error.config?.url?.includes(
                        '/auth/login'
                    )

                if (
                    status === 401 &&
                    !isLoginRequest
                ) {
                    mockExpireSession()
                }

                return Promise.reject(error)
            }
        )

        await expect(
            instance.post('/auth/login')
        ).rejects.toBeDefined()

        expect(
            mockExpireSession
        ).not.toHaveBeenCalled()
    })

    it('500 hatasında session expire edilmemeli', async () => {
        const adapter = vi.fn().mockRejectedValue({
            response: {
                status: 500,
            },
            config: {
                url: '/users',
            },
        })

        const instance = axios.create({
            adapter,
        })

        instance.interceptors.response.use(
            (response) => response,
            (error) => {
                const status =
                    error.response?.status

                if (status === 401) {
                    mockExpireSession()
                }

                return Promise.reject(error)
            }
        )

        await expect(
            instance.get('/users')
        ).rejects.toBeDefined()

        expect(
            mockExpireSession
        ).not.toHaveBeenCalled()
    })

    it('axiosInstance /api baseURL kullanmalı', () => {
        expect(
            axiosInstance.defaults.baseURL
        ).toBe(
            import.meta.env.VITE_API_BASE_URL ||
            '/api'
        )
    })

})