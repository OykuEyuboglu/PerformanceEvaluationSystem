import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import EvaluationPeriodsPage from './EvaluationPeriodsPage'

vi.mock('../evaluationPeriodsApi', () => ({
    getEvaluationPeriods: vi.fn(),
    createEvaluationPeriod: vi.fn(),
    updateEvaluationPeriod: vi.fn(),
    deleteEvaluationPeriod: vi.fn(),
}))

vi.mock('@mui/icons-material', () => ({
    Add: () => <span data-testid="add-icon" />,
    Edit: () => <span data-testid="edit-icon" />,
    Delete: () => <span data-testid="delete-icon" />,
    CalendarMonthOutlined: () => (
        <span data-testid="calendar-icon" />
    ),
    EventAvailableOutlined: () => (
        <span data-testid="event-available-icon" />
    ),
    EventOutlined: () => (
        <span data-testid="event-icon" />
    ),
    HistoryOutlined: () => (
        <span data-testid="history-icon" />
    ),
}))

vi.mock(
    '../components/EvaluationPeriodFormDialog',
    () => ({
        default: ({
            open,
            mode,
            onClose,
            onSubmit,
        }: {
            open: boolean
            mode: 'create' | 'edit'
            onClose: () => void
            onSubmit: (values: {
                name: string
                startDate: string
                endDate: string
            }) => void
        }) =>
            open ? (
                <div data-testid="evaluation-period-dialog">
                    <span data-testid="dialog-mode">
                        {mode}
                    </span>

                    <button onClick={onClose}>
                        Dialog Kapat
                    </button>

                    <button
                        onClick={() =>
                            onSubmit({
                                name:
                                    mode === 'create'
                                        ? 'Yeni Dönem'
                                        : 'Güncellenmiş Dönem',
                                startDate: '2026-09-01',
                                endDate: '2026-09-30',
                            })
                        }
                    >
                        Form Kaydet
                    </button>
                </div>
            ) : null,
    }),
)

vi.mock(
    '../../../shared/components/ConfirmDialog',
    () => ({
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
    }),
)

import {
    getEvaluationPeriods,
    createEvaluationPeriod,
    updateEvaluationPeriod,
    deleteEvaluationPeriod,
} from '../evaluationPeriodsApi'

const mockedGetEvaluationPeriods =
    vi.mocked(getEvaluationPeriods)

const mockedCreateEvaluationPeriod =
    vi.mocked(createEvaluationPeriod)

const mockedUpdateEvaluationPeriod =
    vi.mocked(updateEvaluationPeriod)

const mockedDeleteEvaluationPeriod =
    vi.mocked(deleteEvaluationPeriod)

const activePeriod = {
    id: 1,
    name: '2026 Q3',
    startDate: '2026-09-01T00:00:00',
    endDate: '2026-09-30T23:59:59',
}

const upcomingPeriod = {
    id: 2,
    name: '2026 Q4',
    startDate: '2026-10-01T00:00:00',
    endDate: '2026-12-31T23:59:59',
}

const completedPeriod = {
    id: 3,
    name: '2026 Q2',
    startDate: '2026-06-01T00:00:00',
    endDate: '2026-06-30T23:59:59',
}

function setupMocks() {
    mockedGetEvaluationPeriods.mockResolvedValue([
        completedPeriod,
        upcomingPeriod,
        activePeriod,
    ])

    mockedCreateEvaluationPeriod.mockResolvedValue({
        id: 4,
        name: 'Yeni Dönem',
        startDate: '2026-09-01T00:00:00',
        endDate: '2026-09-30T23:59:59',
    })

    mockedUpdateEvaluationPeriod.mockResolvedValue({
        ...activePeriod,
        name: 'Güncellenmiş Dönem',
    })

    mockedDeleteEvaluationPeriod.mockResolvedValue(
        undefined,
    )
}

describe('EvaluationPeriodsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        setupMocks()
    })

    it('loading göstergesi göstermeli', () => {
        mockedGetEvaluationPeriods.mockReturnValue(
            new Promise(() => { }),
        )

        render(<EvaluationPeriodsPage />)

        expect(
            screen.getByRole('progressbar'),
        ).toBeInTheDocument()
    })

    it('değerlendirme dönemlerini listelemeli', async () => {
        render(<EvaluationPeriodsPage />)

        expect(
            await screen.findByText('2026 Q3'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('2026 Q4'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('2026 Q2'),
        ).toBeInTheDocument()
    })

    it('istatistikleri doğru göstermeli', async () => {
        render(<EvaluationPeriodsPage />)

        await screen.findByText('2026 Q3')

        expect(
            screen.getAllByText('Aktif'),
        ).toHaveLength(2)

        expect(
            screen.getByText('Toplam Dönem'),
        ).toBeInTheDocument()

        expect(
            screen.getAllByText('Yaklaşan'),
        ).toHaveLength(2)

        expect(
            screen.getAllByText('Tamamlanan'),
        ).toHaveLength(1)

        const stats = screen.getAllByText('1')

        expect(stats.length).toBeGreaterThanOrEqual(3)
    })

    it('aktif dönem durumunu göstermeli', async () => {
        render(<EvaluationPeriodsPage />)

        await screen.findByText('2026 Q3')

        expect(
            screen.getAllByText('Aktif'),
        ).toHaveLength(2)
    })

    it('yaklaşan ve tamamlanan durumlarını göstermeli', async () => {
        render(<EvaluationPeriodsPage />)

        await screen.findByText('2026 Q3')

        expect(
            screen.getAllByText('Yaklaşan'),
        ).toHaveLength(2)

        expect(
            screen.getAllByText('Tamamlandı'),
        ).toHaveLength(1)
    })

    it('Yeni Dönem butonu dialogu açmalı', async () => {
        const user = userEvent.setup()

        render(<EvaluationPeriodsPage />)

        await screen.findByText('2026 Q3')

        await user.click(
            screen.getByRole('button', {
                name: /yeni dönem/i,
            }),
        )

        expect(
            screen.getByTestId(
                'evaluation-period-dialog',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByTestId('dialog-mode'),
        ).toHaveTextContent('create')
    })

    it('dialog kapatılabilmeli', async () => {
        const user = userEvent.setup()

        render(<EvaluationPeriodsPage />)

        await screen.findByText('2026 Q3')

        await user.click(
            screen.getByRole('button', {
                name: /yeni dönem/i,
            }),
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Dialog Kapat',
            }),
        )

        expect(
            screen.queryByTestId(
                'evaluation-period-dialog',
            ),
        ).not.toBeInTheDocument()
    })

    it('yeni dönem oluşturmalı', async () => {
        const user = userEvent.setup()

        render(<EvaluationPeriodsPage />)

        await screen.findByText('2026 Q3')

        await user.click(
            screen.getByRole('button', {
                name: /yeni dönem/i,
            }),
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Form Kaydet',
            }),
        )

        await waitFor(() => {
            expect(
                mockedCreateEvaluationPeriod,
            ).toHaveBeenCalledWith({
                name: 'Yeni Dönem',
                startDate: '2026-09-01',
                endDate: '2026-09-30',
            })
        })

        expect(
            await screen.findByText(
                'Dönem oluşturuldu.',
            ),
        ).toBeInTheDocument()
    })

    it('dönem oluşturma API hatasını göstermeli', async () => {
        const user = userEvent.setup()

        mockedCreateEvaluationPeriod.mockRejectedValueOnce({
            response: {
                data: {
                    message:
                        'Dönem oluşturulamadı.',
                },
            },
        })

        render(<EvaluationPeriodsPage />)

        await screen.findByText('2026 Q3')

        await user.click(
            screen.getByRole('button', {
                name: /yeni dönem/i,
            }),
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Form Kaydet',
            }),
        )

        expect(
            await screen.findByText(
                'Dönem oluşturulamadı.',
            ),
        ).toBeInTheDocument()
    })

    it('düzenle butonu edit dialogunu açmalı', async () => {
        const user = userEvent.setup()

        render(<EvaluationPeriodsPage />)

        await screen.findByText('2026 Q3')

        const editButtons =
            screen.getAllByTestId('edit-icon')

        expect(editButtons.length).toBeGreaterThan(0)

        await user.click(
            editButtons[0].closest(
                'button',
            ) as HTMLButtonElement,
        )

        expect(
            screen.getByTestId(
                'evaluation-period-dialog',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByTestId('dialog-mode'),
        ).toHaveTextContent('edit')
    })

    it('dönemi güncellemeli', async () => {
        const user = userEvent.setup()

        render(<EvaluationPeriodsPage />)

        await screen.findByText('2026 Q3')

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
                mockedUpdateEvaluationPeriod,
            ).toHaveBeenCalledWith(
                2,
                {
                    name: 'Güncellenmiş Dönem',
                    startDate: '2026-09-01',
                    endDate: '2026-09-30',
                },
            )
        })

        expect(
            await screen.findByText(
                'Dönem güncellendi.',
            ),
        ).toBeInTheDocument()
    })

    it('silme butonu onay dialogunu açmalı', async () => {
        const user = userEvent.setup()

        render(<EvaluationPeriodsPage />)

        await screen.findByText('2026 Q3')

        const deleteButtons =
            screen.getAllByTestId('delete-icon')

        await user.click(
            deleteButtons[0].closest(
                'button',
            ) as HTMLButtonElement,
        )

        expect(
            await screen.findByText('Dönemi Sil'),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                /dönemini silmek istediğine emin misin/i,
            ),
        ).toBeInTheDocument()
    })

    it('silme onaylandığında API çağrılmalı', async () => {
        const user = userEvent.setup()

        render(<EvaluationPeriodsPage />)

        await screen.findByText('2026 Q3')

        const deleteButtons =
            screen.getAllByTestId('delete-icon')

        await user.click(
            deleteButtons[0].closest(
                'button',
            ) as HTMLButtonElement,
        )

        await user.click(
            screen.getByRole('button', {
                name: /^sil$/i,
            }),
        )

        await waitFor(() => {
            expect(
                mockedDeleteEvaluationPeriod,
            ).toHaveBeenCalledWith(2)
        })

        expect(
            await screen.findByText(
                'Dönem silindi.',
            ),
        ).toBeInTheDocument()
    })

    it('silme API hatasını göstermeli', async () => {
        const user = userEvent.setup()

        mockedDeleteEvaluationPeriod.mockRejectedValueOnce({
            response: {
                data: {
                    message:
                        'Bu döneme ait değerlendirmeler var.',
                },
            },
        })

        render(<EvaluationPeriodsPage />)

        await screen.findByText('2026 Q3')

        const deleteButtons =
            screen.getAllByTestId('delete-icon')

        await user.click(
            deleteButtons[0].closest(
                'button',
            ) as HTMLButtonElement,
        )

        await user.click(
            screen.getByRole('button', {
                name: /^sil$/i,
            }),
        )

        expect(
            await screen.findByText(
                'Bu döneme ait değerlendirmeler var.',
            ),
        ).toBeInTheDocument()
    })

    it('silme dialogunda Vazgeç çalışmalı', async () => {
        const user = userEvent.setup()

        render(<EvaluationPeriodsPage />)

        await screen.findByText('2026 Q3')

        const deleteButtons =
            screen.getAllByTestId('delete-icon')

        await user.click(
            deleteButtons[0].closest(
                'button',
            ) as HTMLButtonElement,
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Vazgeç',
            }),
        )

        expect(
            screen.queryByText('Dönemi Sil'),
        ).not.toBeInTheDocument()

        expect(
            mockedDeleteEvaluationPeriod,
        ).not.toHaveBeenCalled()
    })
})