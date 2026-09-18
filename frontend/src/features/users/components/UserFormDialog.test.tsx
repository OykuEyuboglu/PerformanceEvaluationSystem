import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    render,
    screen,
    within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'

import UserFormDialog, {
    type UserFormValues,
} from './UserFormDialog'

import { LanguageProvider } from '../../../shared/i18n/LanguageContext'

import type { DepartmentDto } from '../../../shared/types/department'
import type { JobPositionDto } from '../../../shared/types/jobPosition'
import type { UserDto } from '../types'

vi.mock('@mui/icons-material', () => ({
    SettingsOverscan: () => null,
    PersonOutlined: () => null,
    BadgeOutlined: () => null,
    LockOutlined: () => null,
    BusinessOutlined: () => null,
    Visibility: () => null,
    VisibilityOff: () => null,
}))

const departments: DepartmentDto[] = [
    {
        id: 1,
        name: 'Bilgi Teknolojileri',
    },
    {
        id: 2,
        name: 'İnsan Kaynakları',
    },
]

const jobPositions: JobPositionDto[] = [
    {
        id: 1,
        name: 'Yazılım Geliştirici',
        departmentId: 1,
    },
    {
        id: 2,
        name: 'Analist',
        departmentId: 2,
    },
]

const existingUser: UserDto = {
    id: 7,
    firstName: 'Ayşe',
    lastName: 'Yılmaz',
    email: 'ayse@example.com',
    role: 'Employee',
    isActive: true,
    departmentName: 'Bilgi Teknolojileri',
    jobPositionName: 'Yazılım Geliştirici',
}

function renderDialog(
    overrides: Partial<
        ComponentProps<typeof UserFormDialog>
    > = {}
) {
    const onSubmit = vi.fn()
    const onClose = vi.fn()

    const utils = render(
        <LanguageProvider>
            <UserFormDialog
                open
                mode="create"
                departments={departments}
                jobPositions={jobPositions}
                submitting={false}
                onSubmit={onSubmit}
                onClose={onClose}
                {...overrides}
            />
        </LanguageProvider>
    )

    return {
        ...utils,
        onSubmit,
        onClose,
    }
}

async function selectMuiOption(
    user: ReturnType<typeof userEvent.setup>,
    labelText: string,
    optionName: string | RegExp
) {
    const combobox = screen.getByRole('combobox', {
        name: labelText,
    })

    await user.click(combobox)

    const listbox = await screen.findByRole(
        'listbox'
    )

    const option = within(listbox).getByRole(
        'option',
        {
            name: optionName,
        }
    )

    await user.click(option)
}

describe('UserFormDialog', () => {
    beforeEach(() => {
        window.localStorage.clear()
    })

    it('create modunda temel alanları render etmeli', () => {
        renderDialog()

        expect(
            screen.getByLabelText(/^ad$/i)
        ).toBeInTheDocument()

        expect(
            screen.getByLabelText(/^soyad$/i)
        ).toBeInTheDocument()

        expect(
            screen.getByLabelText(/e-posta/i)
        ).toBeInTheDocument()

        expect(
            screen.getByLabelText(/şifre/i)
        ).toBeInTheDocument()

        expect(
            screen.getByRole('combobox', {
                name: /rol/i,
            })
        ).toBeInTheDocument()

        expect(
            screen.getByRole('combobox', {
                name: /departman/i,
            })
        ).toBeInTheDocument()

        expect(
            screen.getByRole('combobox', {
                name: /pozisyon/i,
            })
        ).toBeInTheDocument()

        expect(
            screen.queryByText(
                /kullanıcı durumu/i
            )
        ).not.toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: /oluştur/i,
            })
        ).toBeInTheDocument()
    })

    it('edit modunda mevcut kullanıcı bilgileriyle doldurulmalı ve email salt-okunur olmalı', () => {
        renderDialog({
            mode: 'edit',
            initialData: existingUser,
        })

        expect(
            screen.getByDisplayValue('Ayşe')
        ).toBeInTheDocument()

        expect(
            screen.getByDisplayValue('Yılmaz')
        ).toBeInTheDocument()

        expect(
            screen.queryByLabelText(/e-posta/i)
        ).not.toBeInTheDocument()

        expect(
            screen.getByText('ayse@example.com')
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                /kullanıcı durumu/i
            )
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: /güncelle/i,
            })
        ).toBeInTheDocument()
    })

    it('boş create formu gönderilirse zorunlu alan hatalarını göstermeli', async () => {
        const user = userEvent.setup()
        const { onSubmit } = renderDialog()

        await user.click(
            screen.getByRole('button', {
                name: /oluştur/i,
            })
        )

        expect(
            await screen.findByText(
                'Ad gereklidir'
            )
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Soyad gereklidir'
            )
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Email gereklidir'
            )
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Şifre gereklidir'
            )
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Departman seçin'
            )
        ).toBeInTheDocument()

        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('büyük harf içermeyen şifre için ilgili kural hatasını göstermeli', async () => {
        const user = userEvent.setup()
        const { onSubmit } = renderDialog()

        await user.type(
            screen.getByLabelText(/^ad$/i),
            'Mehmet'
        )

        await user.type(
            screen.getByLabelText(/^soyad$/i),
            'Demir'
        )

        await user.type(
            screen.getByLabelText(/e-posta/i),
            'mehmet@example.com'
        )

        await user.type(
            screen.getByLabelText(/şifre/i),
            'sifre123!'
        )

        await user.click(
            screen.getByRole('button', {
                name: /oluştur/i,
            })
        )

        expect(
            await screen.findByText(
                'Şifre en az bir büyük harf içermeli'
            )
        ).toBeInTheDocument()

        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('geçerli verilerle gönderildiğinde onSubmit doğru değerlerle çağrılmalı', async () => {
        const user = userEvent.setup()
        const { onSubmit } = renderDialog()

        await user.type(
            screen.getByLabelText(/^ad$/i),
            'Mehmet'
        )

        await user.type(
            screen.getByLabelText(/^soyad$/i),
            'Demir'
        )

        await user.type(
            screen.getByLabelText(/e-posta/i),
            'mehmet@example.com'
        )

        await user.type(
            screen.getByLabelText(/şifre/i),
            'Sifre123!'
        )

        await selectMuiOption(
            user,
            'Rol',
            /değerlendirici/i
        )

        await selectMuiOption(
            user,
            'Departman',
            /bilgi teknolojileri/i
        )

        await user.click(
            screen.getByRole('button', {
                name: /oluştur/i,
            })
        )

        expect(
            onSubmit
        ).toHaveBeenCalledTimes(1)

        const submitted =
            onSubmit.mock.calls[0][0] as UserFormValues

        expect(
            submitted.firstName
        ).toBe('Mehmet')

        expect(
            submitted.lastName
        ).toBe('Demir')

        expect(
            submitted.email
        ).toBe('mehmet@example.com')

        expect(
            submitted.password
        ).toBe('Sifre123!')

        expect(
            submitted.role
        ).toBe('Evaluator')

        expect(
            submitted.departmentId
        ).toBe(1)
    })

    it('vazgeç butonuna tıklanınca onClose çağrılmalı', async () => {
        const user = userEvent.setup()
        const { onClose } = renderDialog()

        await user.click(
            screen.getByRole('button', {
                name: /vazgeç/i,
            })
        )

        expect(
            onClose
        ).toHaveBeenCalledTimes(1)
    })

    it('submitting=true iken kaydet butonu devre dışı olmalı ve metin değişmeli', () => {
        renderDialog({
            submitting: true,
        })

        const submitButton =
            screen.getByRole('button', {
                name: /kaydediliyor/i,
            })

        expect(
            submitButton
        ).toBeDisabled()
    })

    it('open=false iken dialog içeriği görünmemeli', () => {
        renderDialog({
            open: false,
        })

        expect(
            screen.queryByText(
                'Yeni Kullanıcı'
            )
        ).not.toBeInTheDocument()
    })
})