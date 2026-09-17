import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    render,
    screen,
    within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { EvaluationDto } from '../types'

import MyEvaluationsPage from './MyEvaluationsPage'

vi.mock('../evaluationsApi', () => ({
    getMyEvaluations: vi.fn(),
}))

vi.mock('@mui/icons-material', () => ({
    Search: () => (
        <span data-testid="search-icon" />
    ),
    TrendingUp: () => (
        <span data-testid="trending-icon" />
    ),
}))

vi.mock('@mui/x-charts/LineChart', () => ({
    LineChart: () => (
        <div data-testid="line-chart">
            Performance Chart
        </div>
    ),
}))

vi.mock('../components/EvaluationDetailDialog', () => ({
    default: ({
        open,
        evaluation,
        onClose,
    }: {
        open: boolean
        evaluation: EvaluationDto | null
        onClose: () => void
    }) =>
        open ? (
            <div data-testid="evaluation-detail-dialog">
                <span>
                    {evaluation?.evaluationPeriodName}
                </span>

                <button onClick={onClose}>
                    Detay Kapat
                </button>
            </div>
        ) : null,
}))

import { getMyEvaluations } from '../evaluationsApi'

const mockedGetMyEvaluations =
    vi.mocked(getMyEvaluations)

const evaluations = [
    {
        id: 1,
        employeeId: 10,
        employeeName: 'Test Çalışan',
        evaluatorId: 20,
        evaluatorName: 'Ahmet Yılmaz',
        evaluationPeriodName: '2026 Q1',
        createdAt: '2026-01-15T10:00:00',
        totalScore: 3.5,
        status: 'Submitted',
        details: [],
    },
    {
        id: 2,
        employeeId: 10,
        employeeName: 'Test Çalışan',
        evaluatorId: 21,
        evaluatorName: 'Mehmet Kaya',
        evaluationPeriodName: '2026 Q2',
        createdAt: '2026-04-15T10:00:00',
        totalScore: 4.1,
        status: 'Approved',
        details: [],
    },
    {
        id: 3,
        employeeId: 10,
        employeeName: 'Test Çalışan',
        evaluatorId: 22,
        evaluatorName: 'Ayşe Demir',
        evaluationPeriodName: '2026 Q3',
        createdAt: '2026-07-15T10:00:00',
        totalScore: 4.5,
        status: 'Approved',
        details: [],
    },
    {
        id: 4,
        employeeId: 10,
        employeeName: 'Test Çalışan',
        evaluatorId: 23,
        evaluatorName: 'Ali Veli',
        evaluationPeriodName: '2025 Q4',
        createdAt: '2025-12-15T10:00:00',
        totalScore: 3.2,
        status: 'Submitted',
        details: [],
    },
    {
        id: 5,
        employeeId: 10,
        employeeName: 'Test Çalışan',
        evaluatorId: 24,
        evaluatorName: 'Zeynep Arslan',
        evaluationPeriodName: '2025 Q3',
        createdAt: '2025-09-15T10:00:00',
        totalScore: 4.0,
        status: 'Approved',
        details: [],
    },
    {
        id: 6,
        employeeId: 10,
        employeeName: 'Test Çalışan',
        evaluatorId: 25,
        evaluatorName: 'Can Demir',
        evaluationPeriodName: '2025 Q2',
        createdAt: '2025-06-15T10:00:00',
        totalScore: 3.8,
        status: 'Approved',
        details: [],
    },
] satisfies EvaluationDto[]

describe('MyEvaluationsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        mockedGetMyEvaluations.mockResolvedValue(
            evaluations,
        )
    })

    it('loading durumunda progress göstermeli', () => {
        mockedGetMyEvaluations.mockReturnValue(
            new Promise(() => { }),
        )

        render(<MyEvaluationsPage />)

        expect(
            screen.getByRole('progressbar'),
        ).toBeInTheDocument()
    })

    it('değerlendirmeleri göstermeli', async () => {
        render(<MyEvaluationsPage />)

        expect(
            await screen.findByText('2026 Q3'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('2026 Q2'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('2026 Q1'),
        ).toBeInTheDocument()
    })

    it('performans başlığını göstermeli', async () => {
        render(<MyEvaluationsPage />)

        expect(
            await screen.findByText('Performansım'),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Geçmiş değerlendirmelerin ve puan gelişimin.',
            ),
        ).toBeInTheDocument()
    })

    it('puan gelişimi grafiğini göstermeli', async () => {
        render(<MyEvaluationsPage />)

        expect(
            await screen.findByTestId('line-chart'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Puan Gelişimi'),
        ).toBeInTheDocument()
    })

    it('değerlendirme geçmişini göstermeli', async () => {
        render(<MyEvaluationsPage />)

        expect(
            await screen.findByText(
                'Değerlendirme Geçmişi',
            ),
        ).toBeInTheDocument()

        const period = await screen.findByText(
            '2026 Q3',
        )

        expect(period).toBeInTheDocument()

        const periodContainer =
            period.closest('[class*="MuiBox-root"]')

        expect(periodContainer).not.toBeNull()

        expect(
            within(periodContainer as HTMLElement).getByText(
                /Değerlendiren:\s*Ayşe Demir/,
            ),
        ).toBeInTheDocument()
    })

    it('değerlendirme durumlarını göstermeli', async () => {
        render(<MyEvaluationsPage />)

        await screen.findByText('2026 Q3')

        expect(
            screen.getAllByText('Onaylandı').length,
        ).toBe(3)

        expect(
            screen.getAllByText('Gönderildi').length,
        ).toBe(2)
    })

    it('puanları doğru formatta göstermeli', async () => {
        render(<MyEvaluationsPage />)

        expect(
            await screen.findByText('4.50 / 5'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('4.10 / 5'),
        ).toBeInTheDocument()
    })

    it('arama ile değerlendirmeleri filtrelemeli', async () => {
        const user = userEvent.setup()

        render(<MyEvaluationsPage />)

        await screen.findByText('2026 Q3')

        const searchInput =
            screen.getByPlaceholderText(
                'Dönem veya değerlendirici ara...',
            )

        await user.type(
            searchInput,
            'Ayşe',
        )

        expect(
            screen.getByText('2026 Q3'),
        ).toBeInTheDocument()

        expect(
            screen.queryByText('2026 Q2'),
        ).not.toBeInTheDocument()

        expect(
            screen.queryByText('2026 Q1'),
        ).not.toBeInTheDocument()
    })

    it('değerlendirici adına göre arama yapmalı', async () => {
        const user = userEvent.setup()

        render(<MyEvaluationsPage />)

        await screen.findByText('2026 Q3')

        const searchInput =
            screen.getByPlaceholderText(
                'Dönem veya değerlendirici ara...',
            )

        await user.type(
            searchInput,
            'Mehmet',
        )

        expect(
            screen.getByText('2026 Q2'),
        ).toBeInTheDocument()

        expect(
            screen.queryByText('2026 Q3'),
        ).not.toBeInTheDocument()
    })

    it('arama sonucu bulunamadığında mesaj göstermeli', async () => {
        const user = userEvent.setup()

        render(<MyEvaluationsPage />)

        await screen.findByText('2026 Q3')

        const searchInput =
            screen.getByPlaceholderText(
                'Dönem veya değerlendirici ara...',
            )

        await user.type(
            searchInput,
            'olmayan kayıt',
        )

        expect(
            screen.getByText(
                'Değerlendirme bulunamadı',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Arama kriterini değiştirerek tekrar deneyebilirsin.',
            ),
        ).toBeInTheDocument()
    })

    it('5 kayıttan fazla olduğunda pagination göstermeli', async () => {
        render(<MyEvaluationsPage />)

        await screen.findByText('2026 Q3')

        expect(
            screen.getByRole('navigation'),
        ).toBeInTheDocument()
    })

    it('pagination ile sonraki sayfaya geçebilmeli', async () => {
        const user = userEvent.setup()

        render(<MyEvaluationsPage />)

        await screen.findByText('2026 Q3')

        const nextButton =
            screen.getByRole('button', {
                name: /go to next page/i,
            })

        await user.click(nextButton)

        expect(
            await screen.findByText('2025 Q2'),
        ).toBeInTheDocument()

        expect(
            screen.queryByText('2026 Q3'),
        ).not.toBeInTheDocument()
    })

    it('değerlendirmeye tıklanınca detay dialogunu açmalı', async () => {
        const user = userEvent.setup()

        render(<MyEvaluationsPage />)

        await screen.findByText('2026 Q3')

        await user.click(
            screen.getByText('2026 Q3'),
        )

        expect(
            screen.getByTestId(
                'evaluation-detail-dialog',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByTestId(
                'evaluation-detail-dialog',
            ),
        ).toHaveTextContent('2026 Q3')
    })

    it('detay dialogu kapatılabilmeli', async () => {
        const user = userEvent.setup()

        render(<MyEvaluationsPage />)

        await screen.findByText('2026 Q3')

        await user.click(
            screen.getByText('2026 Q3'),
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Detay Kapat',
            }),
        )

        expect(
            screen.queryByTestId(
                'evaluation-detail-dialog',
            ),
        ).not.toBeInTheDocument()
    })

    it('değerlendirme bulunmadığında boş durum göstermeli', async () => {
        mockedGetMyEvaluations.mockResolvedValue([])

        render(<MyEvaluationsPage />)

        expect(
            await screen.findByText(
                'Henüz bir değerlendirmen bulunmuyor.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.queryByText(
                'Puan Gelişimi',
            ),
        ).not.toBeInTheDocument()
    })
})