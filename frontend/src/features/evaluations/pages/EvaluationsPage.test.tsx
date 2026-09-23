import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
} from 'vitest'

import {
    render,
    screen,
    waitFor,
    within,
    fireEvent,
} from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import EvaluationsPage from './EvaluationsPage'

vi.mock('@mui/icons-material', () => ({
    Search: () => (
        <span data-testid="search-icon" />
    ),

    AssessmentOutlined: () => (
        <span data-testid="assessment-icon" />
    ),

    CheckCircleOutlined: () => (
        <span data-testid="check-circle-icon" />
    ),

    TrendingUpOutlined: () => (
        <span data-testid="trending-icon" />
    ),

    VisibilityOutlined: () => (
        <span data-testid="visibility-icon" />
    ),
}))

vi.mock('../evaluationsApi', () => ({
    getAllEvaluations: vi.fn(),
    approveEvaluation: vi.fn(),
    approveBulk: vi.fn(),
    getEvaluationById: vi.fn(),
}))

vi.mock(
    '../../evaluationPeriods/evaluationPeriodsApi',
    () => ({
        getEvaluationPeriods: vi.fn(),
    }),
)

vi.mock(
    '../components/EvaluationDetailDialog',
    () => ({
        default: ({
            open,
            evaluation,
            onClose,
            onApprove,
            approving,
            canApprove,
        }: any) => {
            if (!open) return null

            return (
                <div data-testid="evaluation-detail-dialog">
                    <h2>
                        {evaluation?.employeeName} —{' '}
                        {evaluation?.evaluationPeriodName}
                    </h2>

                    <div>
                        {Number(
                            evaluation?.totalScore,
                        ).toFixed(2)}{' '}
                        / 5
                    </div>

                    {canApprove &&
                        evaluation?.status ===
                        'Submitted' && (
                            <button
                                type="button"
                                onClick={() =>
                                    onApprove?.(
                                        evaluation.id,
                                    )
                                }
                                disabled={approving}
                            >
                                {approving
                                    ? 'Onaylanıyor...'
                                    : 'Onayla'}
                            </button>
                        )}

                    <button
                        type="button"
                        onClick={onClose}
                    >
                        Kapat
                    </button>
                </div>
            )
        },
    }),
)

vi.mock('@mui/x-data-grid', () => ({
    DataGrid: ({
        rows,
        columns,
        loading,
        onRowClick,
        rowSelectionModel,
        onRowSelectionModelChange,
    }: any) => {
        if (loading) {
            return (
                <div data-testid="data-grid-loading">
                    Loading...
                </div>
            )
        }

        if (!rows.length) {
            return (
                <div data-testid="data-grid-empty">
                    Gösterilecek değerlendirme bulunamadı.
                </div>
            )
        }

        const isSelected = (id: number) => {
            if (
                rowSelectionModel?.type ===
                'include'
            ) {
                return rowSelectionModel.ids.has(id)
            }

            return !rowSelectionModel.ids.has(id)
        }

        const toggleSelection = (id: number) => {
            const ids = new Set(
                rowSelectionModel?.ids ?? [],
            )

            if (ids.has(id)) {
                ids.delete(id)
            } else {
                ids.add(id)
            }

            onRowSelectionModelChange?.({
                type: 'include',
                ids,
            })
        }

        return (
            <div data-testid="data-grid">
                <div data-testid="data-grid-headers">
                    {columns.map(
                        (column: any) => (
                            <div
                                key={column.field}
                                role="columnheader"
                            >
                                {
                                    column.headerName
                                }
                            </div>
                        ),
                    )}
                </div>

                <div data-testid="data-grid-rows">
                    {rows.map(
                        (row: any) => (
                            <div
                                key={row.id}
                                role="row"
                                data-testid={`row-${row.id}`}
                                onClick={() =>
                                    onRowClick?.({
                                        row,
                                    })
                                }
                            >
                                <input
                                    type="checkbox"
                                    aria-label={`Seç ${row.employeeName}`}
                                    checked={isSelected(
                                        row.id,
                                    )}
                                    onClick={(
                                        event,
                                    ) =>
                                        event.stopPropagation()
                                    }
                                    onChange={() =>
                                        toggleSelection(
                                            row.id,
                                        )
                                    }
                                />

                                {columns.map(
                                    (
                                        column: any,
                                    ) => {
                                        const value =
                                            row[
                                            column
                                                .field
                                            ]

                                        return (
                                            <div
                                                key={
                                                    column.field
                                                }
                                                data-testid={`cell-${row.id}-${column.field}`}
                                            >
                                                {column.renderCell
                                                    ? column.renderCell(
                                                        {
                                                            row,
                                                            value,
                                                            field:
                                                                column.field,
                                                        },
                                                    )
                                                    : String(
                                                        value ??
                                                        '',
                                                    )}
                                            </div>
                                        )
                                    },
                                )}
                            </div>
                        ),
                    )}
                </div>
            </div>
        )
    },

    useGridApiRef: () => ({
        current: {},
    }),
}))

import {
    getAllEvaluations,
    approveEvaluation,
    approveBulk,
    getEvaluationById,
} from '../evaluationsApi'

import {
    getEvaluationPeriods,
} from '../../evaluationPeriods/evaluationPeriodsApi'

const mockedGetAll =
    vi.mocked(getAllEvaluations)

const mockedApprove =
    vi.mocked(approveEvaluation)

const mockedApproveBulk =
    vi.mocked(approveBulk)

const mockedGetById =
    vi.mocked(getEvaluationById)

const mockedGetPeriods =
    vi.mocked(getEvaluationPeriods)

const periods = [
    {
        id: 1,
        name: '2026 Q1',
        startDate: '2026-01-01',
        endDate: '2026-03-31',
    },
    {
        id: 2,
        name: '2026 Q2',
        startDate: '2026-04-01',
        endDate: '2026-06-30',
    },
]

const submittedEvaluation = {
    id: 1,
    employeeId: 101,
    employeeName: 'Ayşe Yılmaz',
    evaluatorId: 10,
    evaluatorName: 'Deniz Kaya',
    evaluationPeriodName: '2026 Q1',
    comment: 'Genel olarak iyi.',
    totalScore: 4.2,
    status: 'Submitted',
    createdAt: '2026-03-01T00:00:00',
    details: [
        {
            performanceCriterionId: 1,
            criterionName: 'Kod Kalitesi',
            categoryName: 'Teknik Yetkinlik',
            score: 4,
        },
    ],
}

const approvedEvaluation = {
    id: 2,
    employeeId: 102,
    employeeName: 'Mehmet Demir',
    evaluatorId: 10,
    evaluatorName: 'Deniz Kaya',
    evaluationPeriodName: '2026 Q2',
    comment: null,
    totalScore: 3.5,
    status: 'Approved',
    createdAt: '2026-06-01T00:00:00',
    details: [
        {
            performanceCriterionId: 2,
            criterionName: 'Problem Çözme',
            categoryName: 'Teknik Yetkinlik',
            score: 3.5,
        },
    ],
}
function setupDefaultMocks() {
    mockedGetAll.mockImplementation(
        async (
            periodId?: number,
            page = 1,
            pageSize = 10,
        ) => {
            const allEvaluations =
                periodId === 1
                    ? [submittedEvaluation]
                    : periodId === 2
                        ? [approvedEvaluation]
                        : [
                            submittedEvaluation,
                            approvedEvaluation,
                        ]

            const start =
                (page - 1) * pageSize

            const items =
                allEvaluations.slice(
                    start,
                    start + pageSize,
                )

            return {
                items,
                page,
                pageSize,
                totalCount:
                    allEvaluations.length,
                totalPages:
                    Math.ceil(
                        allEvaluations.length /
                        pageSize,
                    ),
            } as any
        },
    )

    mockedGetPeriods.mockResolvedValue(
        periods as any,
    )

    mockedGetById.mockImplementation(
        async (id: number) =>
            [
                submittedEvaluation,
                approvedEvaluation,
            ].find(
                (evaluation) =>
                    evaluation.id === id,
            ) as any,
    )

    mockedApprove.mockResolvedValue({
        ...submittedEvaluation,
        status: 'Approved',
    } as any)

    mockedApproveBulk.mockResolvedValue({
        approvedCount: 1,
    })
}

function renderPage(
    initialEntries: string[] = ['/'],
) {
    return render(
        <MemoryRouter
            initialEntries={initialEntries}
        >
            <EvaluationsPage />
        </MemoryRouter>,
    )
}

function findRowContaining(
    text: string,
): HTMLElement {
    const cell =
        screen.getByText(text)

    const row =
        cell.closest('[role="row"]')

    if (!row) {
        throw new Error(
            `"${text}" içeren grid satırı bulunamadı.`,
        )
    }

    return row as HTMLElement
}

async function selectPeriod(
    periodName: string,
) {
    const select =
        screen.getByRole(
            'combobox',
            {
                name: /değerlendirme dönemi/i,
            },
        )

    fireEvent.mouseDown(select)

    const option =
        await screen.findByRole(
            'option',
            {
                name: periodName,
            },
        )

    fireEvent.click(option)

    await waitFor(() => {
        expect(select).toHaveTextContent(
            periodName,
        )
    })
}

describe('EvaluationsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        setupDefaultMocks()
    })

    it('değerlendirmeleri ve dönemleri yükleyip listelemeli', async () => {
        renderPage()

        expect(
            await screen.findByText(
                'Ayşe Yılmaz',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Mehmet Demir',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                '2 kayıt listeleniyor',
            ),
        ).toBeInTheDocument()

        expect(
            mockedGetAll,
        ).toHaveBeenCalledWith(
            undefined,
            1,
            10,
        )

        expect(
            mockedGetPeriods,
        ).toHaveBeenCalledTimes(1)
    })

    it('KPI kartlarını doğru hesaplamalı', async () => {
        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        expect(
            screen.getByText(
                'Toplam Değerlendirme',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                '3.85 / 5',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                '50% onay oranı',
            ),
        ).toBeInTheDocument()
    })

    it('arama kutusu çalışan adına göre filtrelemeli', async () => {
        const user =
            userEvent.setup()

        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        const input =
            screen.getByPlaceholderText(
                'Çalışan, değerlendirici veya dönem ara...',
            )

        await user.type(
            input,
            'mehmet',
        )

        await waitFor(() => {
            expect(
                screen.queryByText(
                    'Ayşe Yılmaz',
                ),
            ).not.toBeInTheDocument()

            expect(
                screen.getByText(
                    'Mehmet Demir',
                ),
            ).toBeInTheDocument()

            expect(
                screen.getByText(
                    '2 kayıt listeleniyor',
                ),
            ).toBeInTheDocument()
        })
    })

    it('arama değerlendirici adına göre filtrelemeli', async () => {
        const user =
            userEvent.setup()

        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        const input =
            screen.getByPlaceholderText(
                'Çalışan, değerlendirici veya dönem ara...',
            )

        await user.type(
            input,
            'Deniz',
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Ayşe Yılmaz',
                ),
            ).toBeInTheDocument()

            expect(
                screen.getByText(
                    'Mehmet Demir',
                ),
            ).toBeInTheDocument()

            expect(
                screen.getByText(
                    '2 kayıt listeleniyor',
                ),
            ).toBeInTheDocument()
        })
    })

    it('arama dönem adına göre filtrelemeli', async () => {
        const user =
            userEvent.setup()

        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        const input =
            screen.getByPlaceholderText(
                'Çalışan, değerlendirici veya dönem ara...',
            )

        await user.type(
            input,
            '2026 Q2',
        )

        await waitFor(() => {
            expect(
                screen.queryByText(
                    'Ayşe Yılmaz',
                ),
            ).not.toBeInTheDocument()

            expect(
                screen.getByText(
                    'Mehmet Demir',
                ),
            ).toBeInTheDocument()

            expect(
                screen.getByText(
                    '2 kayıt listeleniyor',
                ),
            ).toBeInTheDocument()
        })
    })

    it('arama başındaki ve sonundaki boşlukları yok saymalı', async () => {
        const user =
            userEvent.setup()

        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        const input =
            screen.getByPlaceholderText(
                'Çalışan, değerlendirici veya dönem ara...',
            )

        await user.type(
            input,
            '  Mehmet  ',
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Mehmet Demir',
                ),
            ).toBeInTheDocument()

            expect(
                screen.getByText(
                    '2 kayıt listeleniyor',
                ),
            ).toBeInTheDocument()
        })
    })

    it('dönem filtresi seçilince sadece o döneme ait kayıtları göstermeli', async () => {
        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        await selectPeriod(
            '2026 Q1',
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Ayşe Yılmaz',
                ),
            ).toBeInTheDocument()

            expect(
                screen.queryByText(
                    'Mehmet Demir',
                ),
            ).not.toBeInTheDocument()

            expect(
                screen.getByText(
                    '1 kayıt listeleniyor',
                ),
            ).toBeInTheDocument()
        })
    })

    it('URL’deki periodId parametresi ilgili dönemi otomatik seçmeli', async () => {
        renderPage([
            '/?periodId=2',
        ])

        expect(
            await screen.findByText(
                'Mehmet Demir',
            ),
        ).toBeInTheDocument()

        expect(
            screen.queryByText(
                'Ayşe Yılmaz',
            ),
        ).not.toBeInTheDocument()

        expect(
            screen.getByRole(
                'combobox',
                {
                    name: /değerlendirme dönemi/i,
                },
            ),
        ).toHaveTextContent(
            '2026 Q2',
        )

        expect(
            screen.getByText(
                '1 kayıt listeleniyor',
            ),
        ).toBeInTheDocument()
    })

    it('geçersiz periodId geldiğinde tüm dönemlerde kalmalı', async () => {
        renderPage([
            '/?periodId=999',
        ])

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        expect(
            screen.getByRole(
                'combobox',
                {
                    name: /değerlendirme dönemi/i,
                },
            ),
        ).toHaveTextContent(
            'Tüm Dönemler',
        )

        expect(
            screen.getByText(
                '2 kayıt listeleniyor',
            ),
        ).toBeInTheDocument()
    })

    it('satıra tıklayınca detay dialogu açılmalı', async () => {
        const user =
            userEvent.setup()

        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        await user.click(
            findRowContaining(
                'Ayşe Yılmaz',
            ),
        )

        await waitFor(() => {
            expect(
                mockedGetById,
            ).toHaveBeenCalledWith(1)
        })

        expect(
            await screen.findByTestId(
                'evaluation-detail-dialog',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Ayşe Yılmaz — 2026 Q1',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                '4.20 / 5',
            ),
        ).toBeInTheDocument()
    })

    it('detay dialogu kapatılabilmeli', async () => {
        const user =
            userEvent.setup()

        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        await user.click(
            findRowContaining(
                'Ayşe Yılmaz',
            ),
        )

        expect(
            await screen.findByTestId(
                'evaluation-detail-dialog',
            ),
        ).toBeInTheDocument()

        await user.click(
            screen.getByRole(
                'button',
                {
                    name: 'Kapat',
                },
            ),
        )

        expect(
            screen.queryByTestId(
                'evaluation-detail-dialog',
            ),
        ).not.toBeInTheDocument()
    })

    it('gönderilmiş değerlendirmeyi detaydan onaylayabilmeli', async () => {
        const user =
            userEvent.setup()

        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        await user.click(
            findRowContaining(
                'Ayşe Yılmaz',
            ),
        )

        await screen.findByTestId(
            'evaluation-detail-dialog',
        )

        await user.click(
            screen.getByRole(
                'button',
                {
                    name: /^onayla$/i,
                },
            ),
        )

        await waitFor(() => {
            expect(
                mockedApprove,
            ).toHaveBeenCalledWith(1)
        })
    })

    it('tekli onay sonrası değerlendirme durumunu güncellemeli', async () => {
        const user =
            userEvent.setup()

        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        await user.click(
            findRowContaining(
                'Ayşe Yılmaz',
            ),
        )

        await screen.findByTestId(
            'evaluation-detail-dialog',
        )

        await user.click(
            screen.getByRole(
                'button',
                {
                    name: /^onayla$/i,
                },
            ),
        )

        await waitFor(() => {
            expect(
                mockedApprove,
            ).toHaveBeenCalledWith(1)
        })

        expect(
            screen.getByTestId(
                'evaluation-detail-dialog',
            ),
        ).toHaveTextContent(
            'Ayşe Yılmaz — 2026 Q1',
        )

        expect(
            screen.queryByRole(
                'button',
                {
                    name: /^onayla$/i,
                },
            ),
        ).not.toBeInTheDocument()
    })

    it('gönderilmiş satır seçilince toplu onay butonu göstermeli', async () => {
        const user =
            userEvent.setup()

        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        const row =
            findRowContaining(
                'Ayşe Yılmaz',
            )

        await user.click(
            within(row).getByRole(
                'checkbox',
            ),
        )

        expect(
            await screen.findByRole(
                'button',
                {
                    name: /seçilenleri onayla \(1\)/i,
                },
            ),
        ).toBeInTheDocument()
    })

    it('onaylanmış satır seçilince toplu onay butonu göstermemeli', async () => {
        const user =
            userEvent.setup()

        renderPage()

        await screen.findByText(
            'Mehmet Demir',
        )

        const row =
            findRowContaining(
                'Mehmet Demir',
            )

        await user.click(
            within(row).getByRole(
                'checkbox',
            ),
        )

        await waitFor(() => {
            expect(
                screen.queryByRole(
                    'button',
                    {
                        name: /seçilenleri onayla/i,
                    },
                ),
            ).not.toBeInTheDocument()
        })
    })

    it('birden fazla değerlendirme seçilebilmeli', async () => {
        const user =
            userEvent.setup()

        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        await user.click(
            within(
                findRowContaining(
                    'Ayşe Yılmaz',
                ),
            ).getByRole('checkbox'),
        )

        expect(
            screen.getByRole(
                'button',
                {
                    name: /seçilenleri onayla \(1\)/i,
                },
            ),
        ).toBeInTheDocument()
    })

    it('toplu onay butonuna basınca confirmation dialogu açmalı', async () => {
        const user =
            userEvent.setup()

        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        await user.click(
            within(
                findRowContaining(
                    'Ayşe Yılmaz',
                ),
            ).getByRole('checkbox'),
        )

        await user.click(
            await screen.findByRole(
                'button',
                {
                    name: /seçilenleri onayla \(1\)/i,
                },
            ),
        )

        expect(
            await screen.findByText(
                'Değerlendirmeleri Onayla',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                /Seçilen 1 değerlendirmeyi onaylamak/,
            ),
        ).toBeInTheDocument()
    })

    it('toplu onayı approveBulk API ile göndermeli', async () => {
        const user =
            userEvent.setup()

        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        await user.click(
            within(
                findRowContaining(
                    'Ayşe Yılmaz',
                ),
            ).getByRole('checkbox'),
        )

        await user.click(
            await screen.findByRole(
                'button',
                {
                    name: /seçilenleri onayla \(1\)/i,
                },
            ),
        )

        expect(
            await screen.findByText(
                'Değerlendirmeleri Onayla',
            ),
        ).toBeInTheDocument()

        await user.click(
            screen.getByRole(
                'button',
                {
                    name: /^onayla$/i,
                },
            ),
        )

        await waitFor(() => {
            expect(
                mockedApproveBulk,
            ).toHaveBeenCalledWith([1])
        })
    })

    it('toplu onay başarılı olduğunda başarı mesajı göstermeli', async () => {
        mockedApproveBulk.mockResolvedValueOnce(
            {
                approvedCount: 1,
            },
        )

        const user =
            userEvent.setup()

        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        await user.click(
            within(
                findRowContaining(
                    'Ayşe Yılmaz',
                ),
            ).getByRole('checkbox'),
        )

        await user.click(
            await screen.findByRole(
                'button',
                {
                    name: /seçilenleri onayla \(1\)/i,
                },
            ),
        )

        await user.click(
            screen.getByRole(
                'button',
                {
                    name: /^onayla$/i,
                },
            ),
        )

        expect(
            await screen.findByText(
                '1 değerlendirme onaylandı.',
            ),
        ).toBeInTheDocument()
    })

    it('toplu onay API hatasında hata mesajı göstermeli', async () => {
        mockedApproveBulk.mockRejectedValueOnce(
            new Error(
                'Bulk approval error',
            ),
        )

        const user =
            userEvent.setup()

        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        await user.click(
            within(
                findRowContaining(
                    'Ayşe Yılmaz',
                ),
            ).getByRole('checkbox'),
        )

        await user.click(
            await screen.findByRole(
                'button',
                {
                    name: /seçilenleri onayla \(1\)/i,
                },
            ),
        )

        await user.click(
            screen.getByRole(
                'button',
                {
                    name: /^onayla$/i,
                },
            ),
        )

        expect(
            await screen.findByText(
                'Toplu onaylama sırasında hata oluştu.',
            ),
        ).toBeInTheDocument()
    })

    it('detay yüklenemezse hata mesajı göstermeli', async () => {
        mockedGetById.mockRejectedValueOnce(
            new Error(
                'network error',
            ),
        )

        const user =
            userEvent.setup()

        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        await user.click(
            findRowContaining(
                'Ayşe Yılmaz',
            ),
        )

        expect(
            await screen.findByText(
                'Detay yüklenemedi.',
            ),
        ).toBeInTheDocument()
    })

    it('boş değerlendirme listesinde sonuç bulunamadı göstermeli', async () => {
        mockedGetAll.mockResolvedValueOnce({
            items: [],
            page: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 0,
        })

        renderPage()

        expect(
            await screen.findByTestId(
                'data-grid-empty',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                '0 kayıt listeleniyor',
            ),
        ).toBeInTheDocument()
    })

    it('yükleme sırasında DataGrid loading göstermeli', async () => {
        let resolveRequest:
            | ((value: any) => void)
            | undefined

        mockedGetAll.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRequest = resolve
                }),
        )

        renderPage()

        expect(
            screen.getByTestId(
                'data-grid-loading',
            ),
        ).toBeInTheDocument()

        resolveRequest?.({
            items: [
                submittedEvaluation,
                approvedEvaluation,
            ],
            page: 1,
            pageSize: 10,
            totalCount: 2,
            totalPages: 1,
        })

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Ayşe Yılmaz',
                ),
            ).toBeInTheDocument()
        })
    })

    it('period filtresi değiştiğinde filtrelenmiş KPI değerlerini güncellemeli', async () => {
        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        await selectPeriod(
            '2026 Q2',
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    '1 kayıt listeleniyor',
                ),
            ).toBeInTheDocument()

            expect(
                screen.getByText(
                    '3.50 / 5',
                ),
            ).toBeInTheDocument()

            expect(
                screen.getByText(
                    '100% onay oranı',
                ),
            ).toBeInTheDocument()
        })
    })

    it('değerlendirme kayıtlarında çalışan ve değerlendirici bilgilerini göstermeli', async () => {
        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        expect(
            screen.getAllByText(
                'Deniz Kaya',
            ),
        ).toHaveLength(2)

        expect(
            screen.getByText(
                '2026 Q1',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                '2026 Q2',
            ),
        ).toBeInTheDocument()
    })

    it('DataGrid satırına detay butonu ile tıklanabilmeli', async () => {
        const user =
            userEvent.setup()

        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        const row =
            findRowContaining(
                'Ayşe Yılmaz',
            )

        const detailCell =
            within(row).getByTestId(
                'cell-1-actions',
            )

        const button =
            within(detailCell).getByRole(
                'button',
            )

        await user.click(button)

        await waitFor(() => {
            expect(
                mockedGetById,
            ).toHaveBeenCalledWith(1)
        })
    })

    it('seçim kaldırıldığında toplu onay butonu kaybolmalı', async () => {
        const user =
            userEvent.setup()

        renderPage()

        await screen.findByText(
            'Ayşe Yılmaz',
        )

        const checkbox =
            within(
                findRowContaining(
                    'Ayşe Yılmaz',
                ),
            ).getByRole('checkbox')

        await user.click(checkbox)

        expect(
            await screen.findByRole(
                'button',
                {
                    name: /seçilenleri onayla \(1\)/i,
                },
            ),
        ).toBeInTheDocument()

        await user.click(checkbox)

        await waitFor(() => {
            expect(
                screen.queryByRole(
                    'button',
                    {
                        name: /seçilenleri onayla/i,
                    },
                ),
            ).not.toBeInTheDocument()
        })
    })
})
