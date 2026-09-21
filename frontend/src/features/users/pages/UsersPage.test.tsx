import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UserDto } from '../types'

import UsersPage from './UsersPage'

vi.mock('../usersApi', () => ({
    getUsers: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    patchUser: vi.fn(),
    deleteUser: vi.fn(),
}))

vi.mock('../../../shared/api/departmentsApi', () => ({
    getDepartments: vi.fn(),
}))

vi.mock('../../../shared/api/jobPositionsApi', () => ({
    getJobPositions: vi.fn(),
}))

vi.mock('../../../shared/i18n/LanguageContext', () => ({
    useLanguage: () => ({
        language: 'tr',
    }),
}))

vi.mock('@mui/icons-material', () => ({
    Add: () => <span data-testid="add-icon" />,
    Edit: () => <span data-testid="edit-icon" />,
    Delete: () => <span data-testid="delete-icon" />,
    FilterList: () => (
        <span data-testid="filter-icon" />
    ),
    Search: () => (
        <span data-testid="search-icon" />
    ),
    PeopleAlt: () => (
        <span data-testid="people-icon" />
    ),
    PersonOff: () => (
        <span data-testid="person-off-icon" />
    ),
    AdminPanelSettings: () => (
        <span data-testid="admin-icon" />
    ),
    Group: () => (
        <span data-testid="group-icon" />
    ),
}))

vi.mock('@mui/x-data-grid/locales', () => ({
    trTR: {
        components: {
            MuiDataGrid: {
                defaultProps: {
                    localeText: {},
                },
            },
        },
    },
    enUS: {
        components: {
            MuiDataGrid: {
                defaultProps: {
                    localeText: {},
                },
            },
        },
    },
}))

vi.mock('@mui/x-data-grid', () => ({
    DataGrid: ({
        rows,
        columns,
    }: {
        rows: UserDto[]
        columns: any[]
    }) => (
        <div data-testid="data-grid">
            {rows.map((row) => (
                <div
                    key={row.id}
                    data-testid={`row-${row.id}`}
                >
                    {columns.map((column) => {
                        let value =
                            row[
                            column.field as keyof UserDto
                            ]

                        if (column.valueGetter) {
                            value = column.valueGetter(
                                value,
                                row,
                            )
                        }

                        return (
                            <div
                                key={column.field}
                                data-testid={`cell-${row.id}-${column.field}`}
                            >
                                {column.renderCell
                                    ? column.renderCell({
                                        row,
                                        value,
                                        field:
                                            column.field,
                                    })
                                    : String(
                                        value ?? '',
                                    )}
                            </div>
                        )
                    })}
                </div>
            ))}
        </div>
    ),
}))

vi.mock('../components/UserFormDialog', () => ({
    default: ({
        open,
        mode,
        onClose,
        onSubmit,
    }: {
        open: boolean
        mode: 'create' | 'edit'
        onClose: () => void
        onSubmit: (values: any) => void
    }) =>
        open ? (
            <div data-testid="user-form-dialog">
                <span data-testid="dialog-mode">
                    {mode}
                </span>

                <button onClick={onClose}>
                    Dialog Kapat
                </button>

                <button
                    onClick={() =>
                        onSubmit({
                            firstName: 'Yeni',
                            lastName: 'Kullanıcı',
                            email: 'yeni@test.com',
                            password: 'Password123!',
                            role: 'Employee',
                            departmentId: 1,
                            jobPositionId: 1,
                            isActive: true,
                        })
                    }
                >
                    Form Kaydet
                </button>
            </div>
        ) : null,
}))

vi.mock('../../../shared/components/ConfirmDialog', () => ({
    default: ({
        open,
        title,
        description,
        onConfirm,
        onCancel,
    }: {
        open: boolean
        title: string
        description: string
        onConfirm: () => void
        onCancel: () => void
    }) =>
        open ? (
            <div data-testid="confirm-dialog">
                <h2>{title}</h2>

                <p>{description}</p>

                <button onClick={onConfirm}>
                    Sil
                </button>

                <button onClick={onCancel}>
                    Vazgeç
                </button>
            </div>
        ) : null,
}))

import {
    getUsers,
    createUser,
    updateUser,
    patchUser,
    deleteUser,
} from '../usersApi'

import { getDepartments } from '../../../shared/api/departmentsApi'
import { getJobPositions } from '../../../shared/api/jobPositionsApi'

const mockedGetUsers = vi.mocked(getUsers)
const mockedCreateUser = vi.mocked(createUser)
const mockedUpdateUser = vi.mocked(updateUser)
const mockedPatchUser = vi.mocked(patchUser)
const mockedDeleteUser = vi.mocked(deleteUser)
const mockedGetDepartments = vi.mocked(getDepartments)
const mockedGetJobPositions = vi.mocked(getJobPositions)

const users = [
    {
        id: 1,
        firstName: 'Ali',
        lastName: 'Yılmaz',
        email: 'ali@test.com',
        role: 'Admin',
        departmentName: 'IT',
        jobPositionName: 'Yazılım Geliştirici',
        isActive: true,
    },
    {
        id: 2,
        firstName: 'Ayşe',
        lastName: 'Demir',
        email: 'ayse@test.com',
        role: 'Evaluator',
        departmentName: 'IT',
        jobPositionName: 'QA Uzmanı',
        isActive: true,
    },
    {
        id: 3,
        firstName: 'Mehmet',
        lastName: 'Kaya',
        email: 'mehmet@test.com',
        role: 'Employee',
        departmentName: 'HR',
        jobPositionName: 'İş Analisti',
        isActive: false,
    },
] satisfies UserDto[]

function setupMocks() {
    mockedGetUsers.mockResolvedValue(users)

    mockedGetDepartments.mockResolvedValue([
        {
            id: 1,
            name: 'IT',
        },
        {
            id: 2,
            name: 'HR',
        },
    ])

    mockedGetJobPositions.mockResolvedValue([
        {
            id: 1,
            name: 'Yazılım Geliştirici',
            departmentId: 1,
        },
        {
            id: 2,
            name: 'QA Uzmanı',
            departmentId: 1,
        },
    ])

    mockedCreateUser.mockResolvedValue({
        ...users[0],
        id: 4,
    })

    mockedUpdateUser.mockResolvedValue({
        ...users[0],
    })

    mockedPatchUser.mockResolvedValue({
        ...users[0],
        isActive: false,
    })

    mockedDeleteUser.mockResolvedValue(undefined)
}

describe('UsersPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        setupMocks()
    })

    it('loading sırasında kullanıcıları göstermemeli', async () => {
        let resolveUsers:
            | ((value: UserDto[]) => void)
            | undefined

        const usersPromise = new Promise<UserDto[]>(
            (resolve) => {
                resolveUsers = resolve
            },
        )

        mockedGetUsers.mockReturnValue(
            usersPromise,
        )

        render(<UsersPage />)

        expect(
            screen.queryByText('Ali Yılmaz'),
        ).not.toBeInTheDocument()

        expect(
            screen.queryByText('Ayşe Demir'),
        ).not.toBeInTheDocument()

        expect(
            screen.queryByText('Mehmet Kaya'),
        ).not.toBeInTheDocument()

        resolveUsers?.(users)

        expect(
            await screen.findByText('Ali Yılmaz'),
        ).toBeInTheDocument()
    })

    it('kullanıcıları listelemeli', async () => {
        render(<UsersPage />)

        expect(
            await screen.findByText('Ali Yılmaz'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Ayşe Demir'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Mehmet Kaya'),
        ).toBeInTheDocument()
    })

    it('istatistikleri doğru göstermeli', async () => {
        render(<UsersPage />)

        await screen.findByText('Ali Yılmaz')

        expect(
            screen.getByText('Toplam Kullanıcı'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Aktif Kullanıcı'),
        ).toBeInTheDocument()

        expect(
            screen.getAllByText('Yönetici').length,
        ).toBeGreaterThan(0)

        expect(
            screen.getByText('Pasif Kullanıcı'),
        ).toBeInTheDocument()

        expect(
            screen.getAllByText('3').length,
        ).toBeGreaterThan(0)

        expect(
            screen.getAllByText('2').length,
        ).toBeGreaterThan(0)
    })

    it('Yeni Kullanıcı dialogunu açmalı', async () => {
        const user = userEvent.setup()

        render(<UsersPage />)

        await screen.findByText('Ali Yılmaz')

        await user.click(
            screen.getByRole('button', {
                name: /yeni kullanıcı/i,
            }),
        )

        expect(
            screen.getByTestId(
                'user-form-dialog',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByTestId('dialog-mode'),
        ).toHaveTextContent('create')
    })

    it('yeni kullanıcı oluşturmalı', async () => {
        const user = userEvent.setup()

        render(<UsersPage />)

        await screen.findByText('Ali Yılmaz')

        await user.click(
            screen.getByRole('button', {
                name: /yeni kullanıcı/i,
            }),
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Form Kaydet',
            }),
        )

        await waitFor(() => {
            expect(
                mockedCreateUser,
            ).toHaveBeenCalledWith({
                firstName: 'Yeni',
                lastName: 'Kullanıcı',
                email: 'yeni@test.com',
                password: 'Password123!',
                role: 'Employee',
                departmentId: 1,
                jobPositionId: 1,
            })
        })

        expect(
            await screen.findByText(
                'Kullanıcı oluşturuldu.',
            ),
        ).toBeInTheDocument()
    })

    it('düzenle butonu edit dialogunu açmalı', async () => {
        const user = userEvent.setup()

        render(<UsersPage />)

        await screen.findByText('Ali Yılmaz')

        const editButtons =
            screen.getAllByTestId('edit-icon')

        expect(editButtons.length).toBe(3)

        await user.click(
            editButtons[0].closest(
                'button',
            ) as HTMLButtonElement,
        )

        expect(
            screen.getByTestId(
                'user-form-dialog',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByTestId('dialog-mode'),
        ).toHaveTextContent('edit')
    })

    it('kullanıcıyı güncellemeli', async () => {
        const user = userEvent.setup()

        render(<UsersPage />)

        await screen.findByText('Ali Yılmaz')

        const editButtons =
            screen.getAllByTestId('edit-icon')

        await user.click(
            editButtons[0].closest(
                'button',
            ) as HTMLButtonElement,
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Form Kaydet',
            }),
        )

        await waitFor(() => {
            expect(
                mockedUpdateUser,
            ).toHaveBeenCalledWith(
                1,
                {
                    firstName: 'Yeni',
                    lastName: 'Kullanıcı',
                    role: 'Employee',
                    departmentId: 1,
                    jobPositionId: 1,
                    isActive: true,
                },
            )
        })

        expect(
            await screen.findByText(
                'Kullanıcı güncellendi.',
            ),
        ).toBeInTheDocument()
    })

    it('aktiflik durumunu değiştirmeli', async () => {
        const user = userEvent.setup()

        render(<UsersPage />)

        await screen.findByText('Ali Yılmaz')

        const switches =
            screen.getAllByRole('switch')

        expect(switches.length).toBe(3)

        await user.click(switches[0])

        await waitFor(() => {
            expect(
                mockedPatchUser,
            ).toHaveBeenCalledWith(
                1,
                {
                    isActive: false,
                },
            )
        })
    })

    it('aktiflik güncelleme hatasını göstermeli', async () => {
        const user = userEvent.setup()

        mockedPatchUser.mockRejectedValueOnce(
            new Error('API error'),
        )

        render(<UsersPage />)

        await screen.findByText('Ali Yılmaz')

        const switches =
            screen.getAllByRole('switch')

        expect(switches.length).toBe(3)

        await user.click(switches[0])

        expect(
            await screen.findByText(
                'Durum güncellenemedi.',
            ),
        ).toBeInTheDocument()
    })

    it('arama ile kullanıcıları filtrelemeli', async () => {
        const user = userEvent.setup()

        render(<UsersPage />)

        await screen.findByText('Ali Yılmaz')

        const searchInput =
            screen.getByPlaceholderText(
                /ad, e-posta, departman veya pozisyon ara/i,
            )

        await user.type(
            searchInput,
            'Ayşe',
        )

        expect(
            screen.getByText('Ayşe Demir'),
        ).toBeInTheDocument()

        expect(
            screen.queryByText('Ali Yılmaz'),
        ).not.toBeInTheDocument()

        expect(
            screen.queryByText('Mehmet Kaya'),
        ).not.toBeInTheDocument()
    })

    it('departman üzerinden arama yapmalı', async () => {
        const user = userEvent.setup()

        render(<UsersPage />)

        await screen.findByText('Ali Yılmaz')

        const searchInput =
            screen.getByPlaceholderText(
                /ad, e-posta, departman veya pozisyon ara/i,
            )

        await user.type(
            searchInput,
            'HR',
        )

        expect(
            screen.getByText('Mehmet Kaya'),
        ).toBeInTheDocument()

        expect(
            screen.queryByText('Ali Yılmaz'),
        ).not.toBeInTheDocument()
    })

    it('filtre menüsünü açmalı', async () => {
        const user = userEvent.setup()

        render(<UsersPage />)

        await screen.findByText('Ali Yılmaz')

        await user.click(
            screen.getByRole('button', {
                name: /filtrele/i,
            }),
        )

        expect(
            screen.getByText(
                'Kullanıcıları Filtrele',
            ),
        ).toBeInTheDocument()
    })

    it('kullanıcı silme dialogunu açmalı', async () => {
        const user = userEvent.setup()

        render(<UsersPage />)

        await screen.findByText('Ali Yılmaz')

        const deleteIcons =
            screen.getAllByTestId('delete-icon')

        expect(deleteIcons.length).toBe(3)

        const deleteButtons =
            deleteIcons
                .map((icon) =>
                    icon.closest('button'),
                )
                .filter(
                    (
                        button,
                    ): button is HTMLButtonElement =>
                        button instanceof
                        HTMLButtonElement &&
                        !button.disabled,
                )

        expect(
            deleteButtons.length,
        ).toBe(2)

        await user.click(deleteButtons[0])

        expect(
            await screen.findByText(
                'Kullanıcıyı Sil',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByTestId(
                'confirm-dialog',
            ),
        ).toBeInTheDocument()
    })

    it('kullanıcı silme işlemini gerçekleştirmeli', async () => {
        const user = userEvent.setup()

        render(<UsersPage />)

        await screen.findByText('Ali Yılmaz')

        const deleteIcons =
            screen.getAllByTestId('delete-icon')

        const deleteButtons =
            deleteIcons
                .map((icon) =>
                    icon.closest('button'),
                )
                .filter(
                    (
                        button,
                    ): button is HTMLButtonElement =>
                        button instanceof
                        HTMLButtonElement &&
                        !button.disabled,
                )

        await user.click(deleteButtons[0])

        const confirmDialog =
            await screen.findByTestId(
                'confirm-dialog',
            )

        await user.click(
            within(confirmDialog).getByRole(
                'button',
                {
                    name: /^sil$/i,
                },
            ),
        )

        await waitFor(() => {
            expect(
                mockedDeleteUser,
            ).toHaveBeenCalledWith(1)
        })

        expect(
            await screen.findByText(
                'Kullanıcı silindi.',
            ),
        ).toBeInTheDocument()
    })

    it('kullanıcı silme hatasını göstermeli', async () => {
        const user = userEvent.setup()

        mockedDeleteUser.mockRejectedValueOnce({
            response: {
                data: {
                    message:
                        'Kullanıcı silinemedi.',
                },
            },
        })

        render(<UsersPage />)

        await screen.findByText('Ali Yılmaz')

        const deleteIcons =
            screen.getAllByTestId('delete-icon')

        const deleteButtons =
            deleteIcons
                .map((icon) =>
                    icon.closest('button'),
                )
                .filter(
                    (
                        button,
                    ): button is HTMLButtonElement =>
                        button instanceof
                        HTMLButtonElement &&
                        !button.disabled,
                )

        await user.click(deleteButtons[0])

        const confirmDialog =
            await screen.findByTestId(
                'confirm-dialog',
            )

        await user.click(
            within(confirmDialog).getByRole(
                'button',
                {
                    name: /^sil$/i,
                },
            ),
        )

        expect(
            await screen.findByText(
                'Kullanıcı silinemedi.',
            ),
        ).toBeInTheDocument()
    })

    it('silme dialogunda Vazgeç çalışmalı', async () => {
        const user = userEvent.setup()

        render(<UsersPage />)

        await screen.findByText('Ali Yılmaz')

        const deleteIcons =
            screen.getAllByTestId('delete-icon')

        const deleteButtons =
            deleteIcons
                .map((icon) =>
                    icon.closest('button'),
                )
                .filter(
                    (
                        button,
                    ): button is HTMLButtonElement =>
                        button instanceof
                        HTMLButtonElement &&
                        !button.disabled,
                )

        await user.click(deleteButtons[0])

        const confirmDialog =
            await screen.findByTestId(
                'confirm-dialog',
            )

        await user.click(
            within(confirmDialog).getByRole(
                'button',
                {
                    name: 'Vazgeç',
                },
            ),
        )

        expect(
            screen.queryByTestId(
                'confirm-dialog',
            ),
        ).not.toBeInTheDocument()

        expect(
            screen.queryByText(
                'Kullanıcıyı Sil',
            ),
        ).not.toBeInTheDocument()

        expect(
            mockedDeleteUser,
        ).not.toHaveBeenCalled()
    })
})