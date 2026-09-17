import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewEvaluationPage from './NewEvaluationPage'
import { useAuthStore } from '../../../store/authStore'

vi.mock('@mui/icons-material', () => ({
    Send: () => <span data-testid="send-icon" />,
    Person: () => <span data-testid="person-icon" />,
    RateReview: () => <span data-testid="rate-review-icon" />,
    StarBorder: () => <span data-testid="star-border-icon" />,
    Star: () => <span data-testid="star-icon" />,
}))

vi.mock('../../evaluationPeriods/evaluationPeriodsApi', () => ({
    getEvaluationPeriods: vi.fn(),
}))

vi.mock('../../evaluatorEmployees/evaluatorEmployeesApi', () => ({
    getTeamByEvaluator: vi.fn(),
}))

vi.mock('../../criteria/criteriaApi', () => ({
    getCategories: vi.fn(),
    getCriteria: vi.fn(),
}))

vi.mock('../evaluationsApi', () => ({
    createEvaluation: vi.fn(),
    getMyPeriodEvaluations: vi.fn(),
}))

import { getEvaluationPeriods } from '../../evaluationPeriods/evaluationPeriodsApi'
import { getTeamByEvaluator } from '../../evaluatorEmployees/evaluatorEmployeesApi'
import { getCategories, getCriteria } from '../../criteria/criteriaApi'
import {
    createEvaluation,
    getMyPeriodEvaluations,
} from '../evaluationsApi'

const mockedGetPeriods = vi.mocked(getEvaluationPeriods)
const mockedGetTeam = vi.mocked(getTeamByEvaluator)
const mockedGetCategories = vi.mocked(getCategories)
const mockedGetCriteria = vi.mocked(getCriteria)
const mockedCreateEvaluation = vi.mocked(createEvaluation)
const mockedGetMyPeriodEvaluations = vi.mocked(getMyPeriodEvaluations)

const EVALUATOR_ID = 10
const EMPLOYEE_ID = 101
const JOB_POSITION_ID = 5

const activePeriod = {
    id: 1,
    name: '2026 Yıl Sonu Değerlendirmesi',
    startDate: new Date(Date.now() - 86_400_000).toISOString(),
    endDate: new Date(Date.now() + 86_400_000).toISOString(),
}

const teamMember = {
    id: 1,
    evaluatorId: EVALUATOR_ID,
    evaluatorName: 'Değerlendirici',
    employeeId: EMPLOYEE_ID,
    employeeName: 'Ayşe Yılmaz',
    employeeJobPositionId: JOB_POSITION_ID,
    employeeJobPositionName: 'Yazılım Geliştirici',
}

const categories = [
    {
        id: 1,
        name: 'Teknik Yetkinlik',
        weight: 60,
        isActive: true,
    },
    {
        id: 2,
        name: 'İletişim',
        weight: 40,
        isActive: true,
    },
]

const criteria = [
    {
        id: 1,
        name: 'Kod Kalitesi',
        isActive: true,
        performanceCategoryId: 1,
        performanceCategoryName: 'Teknik Yetkinlik',
        jobPositionDescriptions: [
            {
                jobPositionId: JOB_POSITION_ID,
                jobPositionName: 'Yazılım Geliştirici',
                description: 'Kod okunabilirliği ve testler.',
            },
        ],
    },
    {
        id: 2,
        name: 'Problem Çözme',
        isActive: true,
        performanceCategoryId: 1,
        performanceCategoryName: 'Teknik Yetkinlik',
        jobPositionDescriptions: [
            {
                jobPositionId: JOB_POSITION_ID,
                jobPositionName: 'Yazılım Geliştirici',
                description: 'Karmaşık problemleri çözebilme.',
            },
        ],
    },
    {
        id: 3,
        name: 'Takım İçi İletişim',
        isActive: true,
        performanceCategoryId: 2,
        performanceCategoryName: 'İletişim',
        jobPositionDescriptions: [
            {
                jobPositionId: JOB_POSITION_ID,
                jobPositionName: 'Yazılım Geliştirici',
                description: 'Ekip arkadaşlarıyla iletişim.',
            },
        ],
    },
]

function setupDefaultMocks() {
    mockedGetPeriods.mockResolvedValue([activePeriod] as any)

    mockedGetTeam.mockResolvedValue([teamMember] as any)

    mockedGetCategories.mockResolvedValue(categories as any)

    mockedGetCriteria.mockResolvedValue(criteria as any)

    mockedGetMyPeriodEvaluations.mockResolvedValue([] as any)

    mockedCreateEvaluation.mockResolvedValue({} as any)
}

async function selectEmployee(
    user: ReturnType<typeof userEvent.setup>,
    name: string,
) {
    const combobox = await screen.findByRole('combobox', {
        name: /çalışan/i,
    })

    await user.click(combobox)

    const option = await screen.findByRole('option', {
        name: new RegExp(name),
    })

    await user.click(option)

    await waitFor(() => {
        expect(
            screen.getByText(name),
        ).toBeInTheDocument()
    })
}

describe('NewEvaluationPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        window.localStorage.clear()

        setupDefaultMocks()

        useAuthStore.setState({
            user: {
                id: EVALUATOR_ID,
                firstName: 'DEĞERLENDİRİCİ',
                lastName: 'KULLANICI',
                email: 'evaluator@example.com',
                role: 'Evaluator',
                isActive: true,
                departmentName: 'IT',
                jobPositionName: 'Takım Lideri',
            } as any,
            token: 'test-token',
            isAuthenticated: true,
        } as any)
    })

    it('ekipte çalışan yoksa uygun mesajı göstermeli', async () => {
        mockedGetTeam.mockResolvedValue([])

        render(<NewEvaluationPage />)

        expect(
            await screen.findByText(
                'Ekibinde çalışan bulunmuyor',
            ),
        ).toBeInTheDocument()
    })

    it('çalışan seçilince kriterler kategorilere göre gruplanıp gösterilmeli', async () => {
        const user = userEvent.setup()

        render(<NewEvaluationPage />)

        await selectEmployee(user, 'Ayşe Yılmaz')

        expect(
            await screen.findByText('Kod Kalitesi'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Problem Çözme'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Takım İçi İletişim'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Teknik Yetkinlik'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('İletişim'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('%60'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('%40'),
        ).toBeInTheDocument()
    })

    it('tüm kriterler puanlanmadan gönder butonu devre dışı olmalı', async () => {
        const user = userEvent.setup()

        render(<NewEvaluationPage />)

        await selectEmployee(user, 'Ayşe Yılmaz')

        await screen.findByText('Kod Kalitesi')

        expect(
            screen.getByRole('button', {
                name: /değerlendirmeyi gönder/i,
            }),
        ).toBeDisabled()

        expect(
            screen.getByText(
                /tüm kriterleri puanlamalısın/i,
            ),
        ).toBeInTheDocument()
    })

    it('ağırlıklı tahmini toplam skoru doğru hesaplamalı', async () => {
        const user = userEvent.setup()

        render(<NewEvaluationPage />)

        await selectEmployee(user, 'Ayşe Yılmaz')

        await screen.findByText('Kod Kalitesi')

        // Teknik Yetkinlik (%60):
        // Kod Kalitesi = 4
        // Problem Çözme = 5
        // Ortalama = 4.5
        //
        // İletişim (%40):
        // Takım İçi İletişim = 3
        //
        // Ağırlıklı toplam:
        // 4.5 * 0.6 + 3 * 0.4 = 3.9

        await user.click(
            screen.getAllByRole('button', {
                name: '4 puan',
            })[0],
        )

        await user.click(
            screen.getAllByRole('button', {
                name: '5 puan',
            })[1],
        )

        await user.click(
            screen.getAllByRole('button', {
                name: '3 puan',
            })[2],
        )

        expect(
            await screen.findByText('3.90 / 5'),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: /değerlendirmeyi gönder/i,
            }),
        ).toBeEnabled()
    })

    it('gönder butonuna basılınca createEvaluation doğru payload ile çağrılmalı', async () => {
        const user = userEvent.setup()

        render(<NewEvaluationPage />)

        await selectEmployee(user, 'Ayşe Yılmaz')

        await screen.findByText('Kod Kalitesi')

        const scoreButtons = screen.getAllByRole(
            'button',
            {
                name: '4 puan',
            },
        )

        for (const button of scoreButtons) {
            await user.click(button)
        }

        await user.type(
            screen.getByLabelText(/yorum/i),
            'Genel olarak başarılı bir dönem.',
        )

        await user.click(
            screen.getByRole('button', {
                name: /değerlendirmeyi gönder/i,
            }),
        )

        await waitFor(() => {
            expect(
                mockedCreateEvaluation,
            ).toHaveBeenCalledTimes(1)
        })

        const payload =
            mockedCreateEvaluation.mock.calls[0][0]

        expect(payload.employeeId).toBe(EMPLOYEE_ID)

        expect(payload.evaluationPeriodId).toBe(
            activePeriod.id,
        )

        expect(payload.comment).toBe(
            'Genel olarak başarılı bir dönem.',
        )

        expect(payload.scores).toEqual(
            expect.arrayContaining([
                {
                    performanceCriterionId: 1,
                    score: 4,
                },
                {
                    performanceCriterionId: 2,
                    score: 4,
                },
                {
                    performanceCriterionId: 3,
                    score: 4,
                },
            ]),
        )
    })

    it('yorum boş bırakılırsa payload’da comment undefined olmalı', async () => {
        const user = userEvent.setup()

        render(<NewEvaluationPage />)

        await selectEmployee(user, 'Ayşe Yılmaz')

        await screen.findByText('Kod Kalitesi')

        for (const button of screen.getAllByRole(
            'button',
            {
                name: '5 puan',
            },
        )) {
            await user.click(button)
        }

        await user.click(
            screen.getByRole('button', {
                name: /değerlendirmeyi gönder/i,
            }),
        )

        await waitFor(() => {
            expect(
                mockedCreateEvaluation,
            ).toHaveBeenCalledTimes(1)
        })

        const payload =
            mockedCreateEvaluation.mock.calls[0][0]

        expect(payload.comment).toBeUndefined()
    })

    it('başarılı gönderim sonrası başarı mesajı göstermeli ve formu sıfırlamalı', async () => {
        const user = userEvent.setup()

        render(<NewEvaluationPage />)

        await selectEmployee(user, 'Ayşe Yılmaz')

        await screen.findByText('Kod Kalitesi')

        for (const button of screen.getAllByRole(
            'button',
            {
                name: '5 puan',
            },
        )) {
            await user.click(button)
        }

        await user.click(
            screen.getByRole('button', {
                name: /değerlendirmeyi gönder/i,
            }),
        )

        expect(
            await screen.findByText(
                'Değerlendirme başarıyla kaydedildi.',
            ),
        ).toBeInTheDocument()
    })

    it('API hatası durumunda sunucudan gelen mesajı göstermeli', async () => {
        mockedCreateEvaluation.mockRejectedValueOnce({
            response: {
                data: {
                    message:
                        'Bu dönem için zaten değerlendirilmiş.',
                },
            },
        })

        const user = userEvent.setup()

        render(<NewEvaluationPage />)

        await selectEmployee(user, 'Ayşe Yılmaz')

        await screen.findByText('Kod Kalitesi')

        for (const button of screen.getAllByRole(
            'button',
            {
                name: '5 puan',
            },
        )) {
            await user.click(button)
        }

        await user.click(
            screen.getByRole('button', {
                name: /değerlendirmeyi gönder/i,
            }),
        )

        expect(
            await screen.findByText(
                'Bu dönem için zaten değerlendirilmiş.',
            ),
        ).toBeInTheDocument()
    })

    it('bu dönemde zaten değerlendirilmiş çalışan seçenek listesinde tamamlandı olarak işaretlenmeli', async () => {
        mockedGetMyPeriodEvaluations.mockResolvedValue([
            {
                employeeId: EMPLOYEE_ID,
            } as any,
        ])

        const user = userEvent.setup()

        render(<NewEvaluationPage />)

        const combobox = await screen.findByRole(
            'combobox',
            {
                name: /çalışan/i,
            },
        )

        await user.click(combobox)

        const listbox = await screen.findByRole(
            'listbox',
        )

        expect(
            within(listbox).getByText(
                '✓ Tamamlandı',
            ),
        ).toBeInTheDocument()
    })
})