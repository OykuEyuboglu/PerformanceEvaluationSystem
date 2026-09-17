import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'
import type { UserDto } from '../features/users/types'

const mockUser: UserDto = {
    id: 1,
    firstName: 'Deniz',
    lastName: 'Kaya',
    email: 'deniz@example.com',
    role: 'Evaluator',
    isActive: true,
    departmentName: 'IT',
    jobPositionName: 'Yazılım Geliştirici',
}

describe('authStore', () => {
    beforeEach(() => {
        useAuthStore.getState().logout()
        useAuthStore.getState().clearSessionExpired()
    })

    it('başlangıçta kullanıcı giriş yapmamış olmalı', () => {
        const state = useAuthStore.getState()

        expect(state.token).toBeNull()
        expect(state.user).toBeNull()
        expect(state.isAuthenticated).toBe(false)
        expect(state.sessionExpired).toBe(false)
    })

    it('login çağrıldığında authentication bilgilerini doğru şekilde kaydetmeli', () => {
        const state = useAuthStore.getState()

        state.login('test-token', mockUser)

        const updatedState = useAuthStore.getState()

        expect(updatedState.token).toBe('test-token')
        expect(updatedState.user).toEqual(mockUser)
        expect(updatedState.isAuthenticated).toBe(true)
        expect(updatedState.sessionExpired).toBe(false)
    })

    it('login sonrasında kullanıcı bilgileri korunmalı', () => {
        useAuthStore
            .getState()
            .login('abc123', mockUser)

        const state = useAuthStore.getState()

        expect(state.user?.id).toBe(1)
        expect(state.user?.firstName).toBe('Deniz')
        expect(state.user?.lastName).toBe('Kaya')
        expect(state.user?.email).toBe('deniz@example.com')
        expect(state.user?.role).toBe('Evaluator')
    })

    it('logout çağrıldığında tüm authentication bilgilerini temizlemeli', () => {
        useAuthStore
            .getState()
            .login('test-token', mockUser)

        useAuthStore.getState().logout()

        const state = useAuthStore.getState()

        expect(state.token).toBeNull()
        expect(state.user).toBeNull()
        expect(state.isAuthenticated).toBe(false)
        expect(state.sessionExpired).toBe(false)
    })

    it('expireSession çağrıldığında kullanıcı oturumunu sonlandırmalı', () => {
        useAuthStore
            .getState()
            .login('expired-token', mockUser)

        useAuthStore.getState().expireSession()

        const state = useAuthStore.getState()

        expect(state.token).toBeNull()
        expect(state.user).toBeNull()
        expect(state.isAuthenticated).toBe(false)
        expect(state.sessionExpired).toBe(true)
    })

    it('expireSession sonrasında sessionExpired true olmalı', () => {
        useAuthStore.getState().expireSession()

        expect(
            useAuthStore.getState().sessionExpired
        ).toBe(true)
    })

    it('clearSessionExpired çağrıldığında expiry bildirimi temizlenmeli', () => {
        useAuthStore.getState().expireSession()

        expect(
            useAuthStore.getState().sessionExpired
        ).toBe(true)

        useAuthStore
            .getState()
            .clearSessionExpired()

        expect(
            useAuthStore.getState().sessionExpired
        ).toBe(false)
    })

    it('yeni login yapıldığında sessionExpired tekrar false olmalı', () => {
        useAuthStore.getState().expireSession()

        expect(
            useAuthStore.getState().sessionExpired
        ).toBe(true)

        useAuthStore
            .getState()
            .login('new-token', mockUser)

        const state = useAuthStore.getState()

        expect(state.token).toBe('new-token')
        expect(state.user).toEqual(mockUser)
        expect(state.isAuthenticated).toBe(true)
        expect(state.sessionExpired).toBe(false)
    })
})