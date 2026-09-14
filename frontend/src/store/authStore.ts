import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserDto } from '../features/users/types'

interface AuthState {
    token: string | null
    user: UserDto | null
    isAuthenticated: boolean
    sessionExpired: boolean

    login: (token: string, user: UserDto) => void
    logout: () => void
    expireSession: () => void
    clearSessionExpired: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            sessionExpired: false,

            login: (token, user) =>
                set({
                    token,
                    user,
                    isAuthenticated: true,
                    sessionExpired: false,
                }),

            logout: () =>
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                }),

            expireSession: () =>
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                    sessionExpired: true,
                }),

            clearSessionExpired: () =>
                set({
                    sessionExpired: false,
                }),
        }),
        { name: 'auth-storage' }
    )
)