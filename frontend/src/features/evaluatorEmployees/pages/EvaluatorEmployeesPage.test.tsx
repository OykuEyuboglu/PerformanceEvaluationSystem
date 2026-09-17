import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EvaluatorEmployeesPage from './EvaluatorEmployeesPage'
import type { UserDto } from '../../users/types'

vi.mock('../../users/usersApi', () => ({
    getUsers: vi.fn(),
}))

vi.mock('../evaluatorEmployeesApi', () => ({
    getTeamByEvaluator: vi.fn(),
    assignEmployee: vi.fn(),
    removeAssignment: vi.fn(),
}))

vi.mock('@mui/icons-material', () => ({
    Add: () => <span data-testid="add-icon" />,
    Edit: () => <span data-testid="edit-icon" />,
    Delete: () => <span data-testid="delete-icon" />,
    Groups: () => <span data-testid="groups-icon" />,
    PersonAdd: () => <span data-testid="person-add-icon" />,
    Search: () => <span data-testid="search-icon" />,
    DragIndicator: () => <span data-testid="drag-indicator-icon" />,
    PeopleAltOutlined: () => (
        <span data-testid="people-alt-icon" />
    ),
    SupervisorAccountOutlined: () => (
        <span data-testid="supervisor-account-icon" />
    ),
    GroupOutlined: () => (
        <span data-testid="group-outlined-icon" />
    ),
}))

import { getUsers } from '../../users/usersApi'
import {
    getTeamByEvaluator,
    assignEmployee,
    removeAssignment,
} from '../evaluatorEmployeesApi'

const mockedGetUsers = vi.mocked(getUsers)
const mockedGetTeam = vi.mocked(getTeamByEvaluator)
const mockedAssign = vi.mocked(assignEmployee)
const mockedRemove = vi.mocked(removeAssignment)

const evaluator: UserDto = {
    id: 1,
    firstName: 'Deniz',
    lastName: 'Kaya',
    email: 'deniz@example.com',
    role: 'Evaluator',
    isActive: true,
    departmentName: 'IT',
}

const activeEmployee: UserDto = {
    id: 2,
    firstName: 'Ayşe',
    lastName: 'Yılmaz',
    email: 'ayse@example.com',
    role: 'Employee',
    isActive: true,
    departmentName: 'IT',
    jobPositionName: 'Yazılım Geliştirici',
}

const inactiveEmployee: UserDto = {
    id: 3,
    firstName: 'Pasif',
    lastName: 'Çalışan',
    email: 'pasif@example.com',
    role: 'Employee',
    isActive: false,
    departmentName: 'IT',
}

function setupDefaultMocks() {
    mockedGetUsers.mockResolvedValue([
        evaluator,
        activeEmployee,
        inactiveEmployee,
    ])

    mockedGetTeam.mockResolvedValue([])

    mockedAssign.mockResolvedValue({} as any)

    mockedRemove.mockResolvedValue(undefined)
}

async function selectEvaluator(
    user: ReturnType<typeof userEvent.setup>,
    fullName: string,
) {
    await user.click(await screen.findByText(fullName))
}

describe('EvaluatorEmployeesPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        setupDefaultMocks()
    })

    it('değerlendirici seçilmeden önce yönlendirme mesajı göstermeli', async () => {
        render(<EvaluatorEmployeesPage />)

        expect(
            await screen.findByText('Bir değerlendirici seç.'),
        ).toBeInTheDocument()
    })

    it('değerlendirici seçilince ekibi yükleyip boşsa uygun mesajı göstermeli', async () => {
        const user = userEvent.setup()

        render(<EvaluatorEmployeesPage />)

        await selectEvaluator(user, 'Deniz Kaya')

        await waitFor(() => {
            expect(mockedGetTeam).toHaveBeenCalledWith(1)
        })

        expect(
            await screen.findByText('Henüz ekip üyesi yok'),
        ).toBeInTheDocument()

        expect(screen.getByText('0 çalışan')).toBeInTheDocument()
    })

    it('sadece aktif çalışanlar atama için seçilebilir listede olmalı', async () => {
        const user = userEvent.setup()

        render(<EvaluatorEmployeesPage />)

        await selectEvaluator(user, 'Deniz Kaya')

        await screen.findByText('Henüz ekip üyesi yok')

        const addInput = screen.getByPlaceholderText(
            'Çalışan adı, e-posta veya departman ara...',
        )

        await user.click(addInput)

        expect(
            await screen.findByRole('option', {
                name: /ayşe yılmaz/i,
            }),
        ).toBeInTheDocument()

        expect(
            screen.queryByRole('option', {
                name: /pasif çalışan/i,
            }),
        ).not.toBeInTheDocument()
    })

    it('çalışan seçip Ekle butonuna basınca assignEmployee çağrılıp ekip yenilenmeli', async () => {
        mockedGetTeam
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([
                {
                    id: 100,
                    evaluatorId: 1,
                    evaluatorName: 'Deniz Kaya',
                    employeeId: 2,
                    employeeName: 'Ayşe Yılmaz',
                    employeeJobPositionId: 1,
                    employeeJobPositionName: 'Yazılım Geliştirici',
                },
            ])

        const user = userEvent.setup()

        render(<EvaluatorEmployeesPage />)

        await selectEvaluator(user, 'Deniz Kaya')

        await screen.findByText('Henüz ekip üyesi yok')

        const addInput = screen.getByPlaceholderText(
            'Çalışan adı, e-posta veya departman ara...',
        )

        await user.click(addInput)

        const option = await screen.findByRole('option', {
            name: /ayşe yılmaz/i,
        })

        await user.click(option)

        await user.click(
            screen.getByRole('button', {
                name: /^ekle$/i,
            }),
        )

        await waitFor(() => {
            expect(mockedAssign).toHaveBeenCalledWith({
                evaluatorId: 1,
                employeeId: 2,
            })
        })

        expect(
            await screen.findByText('1 çalışan ekibe eklendi.'),
        ).toBeInTheDocument()

        expect(mockedGetTeam).toHaveBeenCalledTimes(2)
    })

    it('hiç çalışan seçilmeden Ekle butonu devre dışı olmalı', async () => {
        const user = userEvent.setup()

        render(<EvaluatorEmployeesPage />)

        await selectEvaluator(user, 'Deniz Kaya')

        await screen.findByText('Henüz ekip üyesi yok')

        expect(
            screen.getByRole('button', {
                name: /^ekle$/i,
            }),
        ).toBeDisabled()
    })

    it('ekip üyesini çıkarma onay diyaloğu üzerinden removeAssignment çağırmalı', async () => {
        mockedGetTeam.mockResolvedValue([
            {
                id: 100,
                evaluatorId: 1,
                evaluatorName: 'Deniz Kaya',
                employeeId: 2,
                employeeName: 'Ayşe Yılmaz',
                employeeJobPositionId: 1,
                employeeJobPositionName: 'Yazılım Geliştirici',
            },
        ])

        const user = userEvent.setup()

        render(<EvaluatorEmployeesPage />)

        await selectEvaluator(user, 'Deniz Kaya')

        await screen.findByText('Ayşe Yılmaz')

        const deleteIcon = screen.getByTestId('delete-icon')

        const deleteButton = deleteIcon.closest('button')

        expect(deleteButton).not.toBeNull()

        await user.click(deleteButton as HTMLButtonElement)

        expect(
            await screen.findByText('Ekipten Çıkar'),
        ).toBeInTheDocument()

        await user.click(
            screen.getByRole('button', {
                name: /^çıkar$/i,
            }),
        )

        await waitFor(() => {
            expect(mockedRemove).toHaveBeenCalledWith(1, 2)
        })

        expect(
            await screen.findByText('Çalışan ekipten çıkarıldı.'),
        ).toBeInTheDocument()
    })

    it('değerlendirici arama kutusu listeyi isme göre filtrelemeli', async () => {
        mockedGetUsers.mockResolvedValue([
            evaluator,
            {
                ...evaluator,
                id: 4,
                firstName: 'Elif',
                lastName: 'Demir',
                email: 'elif@example.com',
            },
            activeEmployee,
        ])

        const user = userEvent.setup()

        render(<EvaluatorEmployeesPage />)

        await screen.findByText('Deniz Kaya')

        expect(
            screen.getByText('Elif Demir'),
        ).toBeInTheDocument()

        await user.type(
            screen.getByPlaceholderText(
                'İsim, departman veya e-posta ara...',
            ),
            'elif',
        )

        expect(
            screen.queryByText('Deniz Kaya'),
        ).not.toBeInTheDocument()

        expect(
            screen.getByText('Elif Demir'),
        ).toBeInTheDocument()
    })

    it('atama sırasında API hatası olursa hata mesajı göstermeli', async () => {
        mockedAssign.mockRejectedValueOnce({
            response: {
                data: {
                    message: 'Atama başarısız oldu.',
                },
            },
        })

        const user = userEvent.setup()

        render(<EvaluatorEmployeesPage />)

        await selectEvaluator(user, 'Deniz Kaya')

        await screen.findByText('Henüz ekip üyesi yok')

        await user.click(
            screen.getByPlaceholderText(
                'Çalışan adı, e-posta veya departman ara...',
            ),
        )

        const option = await screen.findByRole('option', {
            name: /ayşe yılmaz/i,
        })

        await user.click(option)

        await user.click(
            screen.getByRole('button', {
                name: /^ekle$/i,
            }),
        )

        expect(
            await screen.findByText('Atama başarısız oldu.'),
        ).toBeInTheDocument()
    })
})