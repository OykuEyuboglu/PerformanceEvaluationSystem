import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'
import { useAuthStore } from '../../../store/authStore'

vi.mock('@mui/icons-material', () => ({
    SettingsOutlined: () => null,
    EmailOutlined: () => null,
    LockOutlined: () => null,
    Visibility: () => null,
    VisibilityOff: () => null,
}))

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>(
        'react-router-dom'
    )

    return {
        ...actual,
        useNavigate: () => navigateMock,
    }
})

vi.mock('../authApi', () => ({
    login: vi.fn(),
}))

import { login } from '../authApi'

const mockedLogin = vi.mocked(login)

function renderLoginPage() {
    return render(
        <MemoryRouter>
            <LoginPage />
        </MemoryRouter>
    )
}

describe('LoginPage', () => {
    beforeEach(() => {
        mockedLogin.mockReset()
        navigateMock.mockReset()

        useAuthStore.getState().logout()
        useAuthStore.getState().clearSessionExpired()

        window.localStorage.clear()
    })

    it('email ve şifre alanlarını ve giriş butonunu render etmeli', () => {
        renderLoginPage()

        expect(
            screen.getByLabelText(/e-posta/i)
        ).toBeInTheDocument()

        expect(
            screen.getByLabelText(/şifre/i)
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: /giriş yap/i })
        ).toBeInTheDocument()
    })

    it('boş form gönderilirse doğrulama hatalarını göstermeli', async () => {
        const user = userEvent.setup()

        renderLoginPage()

        await user.click(
            screen.getByRole('button', { name: /giriş yap/i })
        )

        expect(
            await screen.findByText(/email boş olamaz/i)
        ).toBeInTheDocument()

        expect(
            await screen.findByText(/şifre boş olamaz/i)
        ).toBeInTheDocument()

        expect(mockedLogin).not.toHaveBeenCalled()
    })

    it('geçersiz email formatı girilirse hata göstermeli', async () => {
        const user = userEvent.setup()

        renderLoginPage()

        await user.type(
            screen.getByLabelText(/e-posta/i),
            'gecersiz-email'
        )

        await user.type(
            screen.getByLabelText(/şifre/i),
            'sifre123'
        )

        await user.click(
            screen.getByRole('button', { name: /giriş yap/i })
        )

        expect(
            await screen.findByText(
                /geçerli bir e-posta adresi girin/i
            )
        ).toBeInTheDocument()

        expect(mockedLogin).not.toHaveBeenCalled()
    })

    it('geçerli bilgilerle gönderildiğinde login çağrılmalı, oturum açılmalı ve dashboarda yönlendirmeli', async () => {
        const fakeUser = {
            id: 1,
            firstName: 'AYSE',
            lastName: 'YILMAZ',
            email: 'ayse@example.com',
            role: 'Employee',
            isActive: true,
            departmentName: 'IT',
            jobPositionName: 'Yazılım Geliştirici',
        }

        mockedLogin.mockResolvedValueOnce({
            token: 'fake-jwt-token',
            expiresAt: new Date().toISOString(),
            user: fakeUser as any,
        })

        const user = userEvent.setup()

        renderLoginPage()

        await user.type(
            screen.getByLabelText(/e-posta/i),
            'ayse@example.com'
        )

        await user.type(
            screen.getByLabelText(/şifre/i),
            'GecerliSifre123'
        )

        await user.click(
            screen.getByRole('button', { name: /giriş yap/i })
        )

        await waitFor(() => {
            expect(mockedLogin).toHaveBeenCalledWith({
                email: 'ayse@example.com',
                password: 'GecerliSifre123',
            })
        })

        await waitFor(() => {
            expect(navigateMock).toHaveBeenCalledWith('/dashboard')
        })

        expect(
            useAuthStore.getState().isAuthenticated
        ).toBe(true)

        expect(
            useAuthStore.getState().token
        ).toBe('fake-jwt-token')
    })

    it('sunucudan hata mesajı gelirse bu mesajı göstermeli', async () => {
        mockedLogin.mockRejectedValueOnce({
            response: {
                data: {
                    message: 'Kullanıcı bulunamadı.',
                },
            },
        })

        const user = userEvent.setup()

        renderLoginPage()

        await user.type(
            screen.getByLabelText(/e-posta/i),
            'ayse@example.com'
        )

        await user.type(
            screen.getByLabelText(/şifre/i),
            'YanlisSifre123'
        )

        await user.click(
            screen.getByRole('button', { name: /giriş yap/i })
        )

        expect(
            await screen.findByText('Kullanıcı bulunamadı.')
        ).toBeInTheDocument()

        expect(
            useAuthStore.getState().isAuthenticated
        ).toBe(false)

        expect(navigateMock).not.toHaveBeenCalled()
    })

    it('sunucudan mesaj gelmezse varsayılan hata mesajını göstermeli', async () => {
        mockedLogin.mockRejectedValueOnce(
            new Error('network error')
        )

        const user = userEvent.setup()

        renderLoginPage()

        await user.type(
            screen.getByLabelText(/e-posta/i),
            'ayse@example.com'
        )

        await user.type(
            screen.getByLabelText(/şifre/i),
            'YanlisSifre123'
        )

        await user.click(
            screen.getByRole('button', { name: /giriş yap/i })
        )

        expect(
            await screen.findByText(/e-posta veya şifre hatalı/i)
        ).toBeInTheDocument()
    })

    it('şifreyi göster/gizle butonu input tipini değiştirmeli', async () => {
        const user = userEvent.setup()

        renderLoginPage()

        const passwordInput = screen.getByLabelText(/şifre/i)

        expect(passwordInput).toHaveAttribute(
            'type',
            'password'
        )

        const toggleButton = screen.getByRole('button', {
            name: '',
        })

        await user.click(toggleButton)

        expect(passwordInput).toHaveAttribute(
            'type',
            'text'
        )
    })

    it('istek devam ederken giriş butonu devre dışı bırakılmalı', async () => {
        let resolveLogin: (value: any) => void = () => { }

        mockedLogin.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolveLogin = resolve
                })
        )

        const user = userEvent.setup()

        renderLoginPage()

        await user.type(
            screen.getByLabelText(/e-posta/i),
            'ayse@example.com'
        )

        await user.type(
            screen.getByLabelText(/şifre/i),
            'GecerliSifre123'
        )

        const submitButton = screen.getByRole('button', {
            name: /giriş yap/i,
        })

        await user.click(submitButton)

        await waitFor(() => {
            expect(submitButton).toBeDisabled()
        })

        resolveLogin({
            token: 'x',
            expiresAt: new Date().toISOString(),
            user: {} as any,
        })
    })
})