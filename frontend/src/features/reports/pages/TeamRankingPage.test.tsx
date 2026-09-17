import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TeamRankingPage from './TeamRankingPage'

import { getEvaluationPeriods } from '../../evaluationPeriods/evaluationPeriodsApi'
import {
    getTeamRanking,
    exportTeamRankingExcel,
} from '../../dashboard/dashboardApi'

import type { EvaluationPeriod } from '../../evaluationPeriods/types'
import type { EmployeeRanking } from '../../dashboard/dashboardApi'

/* -------------------------------------------------------------------------- */
/* ICON MOCKS                                                                 */
/* -------------------------------------------------------------------------- */

vi.mock('@mui/icons-material', () => ({
    ArrowBack: () => <span data-testid="arrow-back-icon" />,
    Download: () => <span data-testid="download-icon" />,
    Search: () => <span data-testid="search-icon" />,
    EmojiEvents: () => <span data-testid="emoji-events-icon" />,
    Insights: () => <span data-testid="insights-icon" />,
}))

/* -------------------------------------------------------------------------- */
/* API MOCKS                                                                  */
/* -------------------------------------------------------------------------- */

vi.mock('../../evaluationPeriods/evaluationPeriodsApi', () => ({
    getEvaluationPeriods: vi.fn(),
}))

vi.mock('../../dashboard/dashboardApi', () => ({
    getTeamRanking: vi.fn(),
    exportTeamRankingExcel: vi.fn(),
}))

const mockedGetEvaluationPeriods = vi.mocked(getEvaluationPeriods)
const mockedGetTeamRanking = vi.mocked(getTeamRanking)
const mockedExportTeamRankingExcel = vi.mocked(exportTeamRankingExcel)

/* -------------------------------------------------------------------------- */
/* TEST THEME                                                                 */
/* -------------------------------------------------------------------------- */

const testTheme = createTheme()

Object.assign(testTheme.palette, {
    avatar: {
        light: '#F5B301',
        dark: '#C68E00',
    },
})

/* -------------------------------------------------------------------------- */
/* TEST DATA                                                                  */
/* -------------------------------------------------------------------------- */

const mockPeriods: EvaluationPeriod[] = [
    {
        id: 1,
        name: '2026 Q3',
        startDate: '2026-07-01',
        endDate: '2026-09-30',
    },
    {
        id: 2,
        name: '2026 Q2',
        startDate: '2026-04-01',
        endDate: '2026-06-30',
    },
]

const mockRanking: EmployeeRanking[] = [
    {
        rank: 1,
        employeeId: 101,
        employeeName: 'Ali Yılmaz',
        departmentName: 'Bilgi Teknolojileri',
        jobPositionName: 'Software Developer',
        averageScore: 4.75,
        evaluationCount: 3,
    },
    {
        rank: 2,
        employeeId: 102,
        employeeName: 'Ayşe Demir',
        departmentName: 'Bilgi Teknolojileri',
        jobPositionName: 'QA Engineer',
        averageScore: 4.5,
        evaluationCount: 2,
    },
    {
        rank: 3,
        employeeId: 103,
        employeeName: 'Mehmet Kaya',
        departmentName: 'Bilgi Teknolojileri',
        jobPositionName: 'Business Analyst',
        averageScore: 4.25,
        evaluationCount: 4,
    },
    {
        rank: 4,
        employeeId: 104,
        employeeName: 'Zeynep Çelik',
        departmentName: 'Bilgi Teknolojileri',
        jobPositionName: 'Software Developer',
        averageScore: 3.75,
        evaluationCount: 1,
    },
]

const mockSecondPeriodRanking: EmployeeRanking[] = [
    {
        rank: 1,
        employeeId: 201,
        employeeName: 'Can Öztürk',
        departmentName: 'Bilgi Teknolojileri',
        jobPositionName: 'QA Engineer',
        averageScore: 4.9,
        evaluationCount: 5,
    },
]

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function renderPage() {
    return render(
        <MemoryRouter>
            <ThemeProvider theme={testTheme}>
                <TeamRankingPage />
            </ThemeProvider>
        </MemoryRouter>,
    )
}

async function waitForInitialLoad() {
    await waitFor(() => {
        expect(mockedGetEvaluationPeriods).toHaveBeenCalledTimes(1)
        expect(mockedGetTeamRanking).toHaveBeenCalledWith(1)
    })
}

function getRankingTable() {
    return screen.getByRole('table')
}

function getRankingRows() {
    return within(getRankingTable())
        .getAllByRole('row')
        .slice(1)
}

function getTableRowByEmployee(name: string) {
    return getRankingRows().find((row) =>
        row.textContent?.includes(name),
    )
}

async function selectPeriod(periodName: string) {
    const select = screen.getByRole('combobox', {
        name: /Değerlendirme Dönemi/i,
    })

    fireEvent.mouseDown(select)

    const option = await screen.findByRole('option', {
        name: new RegExp(periodName),
    })

    fireEvent.click(option)
}

/* -------------------------------------------------------------------------- */
/* TESTS                                                                      */
/* -------------------------------------------------------------------------- */

describe('TeamRankingPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        mockedGetEvaluationPeriods.mockResolvedValue(mockPeriods)

        mockedGetTeamRanking.mockImplementation(async (periodId) => {
            if (periodId === 2) {
                return mockSecondPeriodRanking
            }

            return mockRanking
        })

        mockedExportTeamRankingExcel.mockResolvedValue(undefined)
    })

    /* ====================================================================== */
    /* INITIAL LOAD                                                           */
    /* ====================================================================== */

    it('sayfa başlığını göstermeli', async () => {
        renderPage()

        expect(
            await screen.findByText('Ekip Sıralaması'),
        ).toBeInTheDocument()
    })

    it('değerlendirme dönemlerini yüklemeli', async () => {
        renderPage()

        await waitForInitialLoad()

        expect(
            mockedGetEvaluationPeriods,
        ).toHaveBeenCalledTimes(1)

        expect(
            screen.getAllByText('2026 Q3').length,
        ).toBeGreaterThan(0)

        const select = screen.getByRole('combobox', {
            name: /Değerlendirme Dönemi/i,
        })

        fireEvent.mouseDown(select)

        expect(
            await screen.findByRole('option', {
                name: /2026 Q2/,
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('option', {
                name: /2026 Q3/,
            }),
        ).toBeInTheDocument()
    })

    it('varsayılan dönem için ranking verisini yüklemeli', async () => {
        renderPage()

        await waitForInitialLoad()

        expect(
            mockedGetTeamRanking,
        ).toHaveBeenCalledTimes(1)

        expect(
            mockedGetTeamRanking,
        ).toHaveBeenCalledWith(1)
    })

    /* ====================================================================== */
    /* RANKING DATA                                                           */
    /* ====================================================================== */

    it('çalışanları listelemeli', async () => {
        renderPage()

        await waitForInitialLoad()

        const rows = getRankingRows()

        expect(rows).toHaveLength(4)

        expect(getTableRowByEmployee('Ali Yılmaz')).toBeTruthy()
        expect(getTableRowByEmployee('Ayşe Demir')).toBeTruthy()
        expect(getTableRowByEmployee('Mehmet Kaya')).toBeTruthy()
        expect(getTableRowByEmployee('Zeynep Çelik')).toBeTruthy()
    })

    it('pozisyon bilgilerini göstermeli', async () => {
        renderPage()

        await waitForInitialLoad()

        const table = getRankingTable()

        expect(
            within(table).getAllByText('Software Developer'),
        ).toHaveLength(2)

        expect(
            within(table).getByText('QA Engineer'),
        ).toBeInTheDocument()

        expect(
            within(table).getByText('Business Analyst'),
        ).toBeInTheDocument()
    })

    it('skorları iki ondalık basamakla göstermeli', async () => {
        renderPage()

        await waitForInitialLoad()

        const table = getRankingTable()

        expect(
            within(table).getByText('4.75 / 5'),
        ).toBeInTheDocument()

        expect(
            within(table).getByText('4.50 / 5'),
        ).toBeInTheDocument()

        expect(
            within(table).getByText('4.25 / 5'),
        ).toBeInTheDocument()

        expect(
            within(table).getByText('3.75 / 5'),
        ).toBeInTheDocument()
    })

    /* ====================================================================== */
    /* TOP 3                                                                  */
    /* ====================================================================== */

    it('İlk 3 bölümünü göstermeli', async () => {
        renderPage()

        await waitForInitialLoad()

        expect(
            screen.getByText('İlk 3'),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Seçilen dönemin en yüksek skorları.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getAllByText('Ali Yılmaz'),
        ).toHaveLength(2)

        expect(
            screen.getAllByText('Ayşe Demir'),
        ).toHaveLength(2)

        expect(
            screen.getAllByText('Mehmet Kaya'),
        ).toHaveLength(2)

        expect(
            screen.getAllByText('Zeynep Çelik'),
        ).toHaveLength(1)
    })

    /* ====================================================================== */
    /* KPI                                                                     */
    /* ====================================================================== */

    it('değerlendirilen çalışan sayısını göstermeli', async () => {
        renderPage()

        await waitForInitialLoad()

        expect(
            screen.getByText('DEĞERLENDİRİLEN'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('4', {
                selector: 'p',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText('çalışan'),
        ).toBeInTheDocument()
    })

    it('ekip ortalamasını doğru hesaplayıp göstermeli', async () => {
        renderPage()

        await waitForInitialLoad()

        expect(
            screen.getByText('EKİP ORTALAMASI'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('4.31'),
        ).toBeInTheDocument()
    })

    it('seçili dönemin adını göstermeli', async () => {
        renderPage()

        await waitForInitialLoad()

        expect(
            screen.getByText('DÖNEM'),
        ).toBeInTheDocument()

        expect(
            screen.getAllByText('2026 Q3').length,
        ).toBeGreaterThan(0)
    })

    /* ====================================================================== */
    /* SEARCH                                                                  */
    /* ====================================================================== */

    it('arama alanını göstermeli', async () => {
        renderPage()

        await waitForInitialLoad()

        expect(
            screen.getByPlaceholderText(
                'Çalışan veya pozisyon ara...',
            ),
        ).toBeInTheDocument()
    })

    it('çalışan adına göre filtreleme yapmalı', async () => {
        renderPage()

        await waitForInitialLoad()

        const searchInput =
            screen.getByPlaceholderText(
                'Çalışan veya pozisyon ara...',
            )

        fireEvent.change(searchInput, {
            target: {
                value: 'Ali',
            },
        })

        await waitFor(() => {
            const rows = getRankingRows()

            expect(rows).toHaveLength(1)
            expect(rows[0]).toHaveTextContent('Ali Yılmaz')
            expect(rows[0]).toHaveTextContent('Software Developer')
            expect(rows[0]).toHaveTextContent('4.75 / 5')
        })
    })

    it('pozisyona göre filtreleme yapmalı', async () => {
        renderPage()

        await waitForInitialLoad()

        const searchInput =
            screen.getByPlaceholderText(
                'Çalışan veya pozisyon ara...',
            )

        fireEvent.change(searchInput, {
            target: {
                value: 'QA Engineer',
            },
        })

        await waitFor(() => {
            const rows = getRankingRows()

            expect(rows).toHaveLength(1)
            expect(rows[0]).toHaveTextContent('Ayşe Demir')
            expect(rows[0]).toHaveTextContent('QA Engineer')
        })
    })

    it('arama metninin başındaki ve sonundaki boşlukları yok saymalı', async () => {
        renderPage()

        await waitForInitialLoad()

        const searchInput =
            screen.getByPlaceholderText(
                'Çalışan veya pozisyon ara...',
            )

        fireEvent.change(searchInput, {
            target: {
                value: '  Ali  ',
            },
        })

        await waitFor(() => {
            const rows = getRankingRows()

            expect(rows).toHaveLength(1)
            expect(rows[0]).toHaveTextContent('Ali Yılmaz')
        })
    })

    it('eşleşmeyen aramada boş durum göstermeli', async () => {
        renderPage()

        await waitForInitialLoad()

        const searchInput =
            screen.getByPlaceholderText(
                'Çalışan veya pozisyon ara...',
            )

        fireEvent.change(searchInput, {
            target: {
                value: 'Olmayan Çalışan',
            },
        })

        expect(
            await screen.findByText('Sonuç bulunamadı.'),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Seçilen dönem veya arama kriteri için gösterilecek kayıt yok.',
            ),
        ).toBeInTheDocument()
    })

    /* ====================================================================== */
    /* PERIOD                                                                  */
    /* ====================================================================== */

    it('dönem değiştirildiğinde yeni ranking yüklemeli', async () => {
        renderPage()

        await waitForInitialLoad()

        await selectPeriod('2026 Q2')

        await waitFor(() => {
            expect(
                mockedGetTeamRanking,
            ).toHaveBeenCalledWith(2)
        })

        const rows = getRankingRows()

        expect(rows).toHaveLength(1)
        expect(rows[0]).toHaveTextContent('Can Öztürk')
        expect(rows[0]).toHaveTextContent('QA Engineer')
        expect(rows[0]).toHaveTextContent('4.90 / 5')
    })

    /* ====================================================================== */
    /* SORTING                                                                 */
    /* ====================================================================== */

    it('sıra kolonuna tıklanınca azalan sıralamaya geçmeli', async () => {
        renderPage()

        await waitForInitialLoad()

        const rankHeader =
            screen.getByRole('columnheader', {
                name: /Sıra/i,
            })

        const rankButton =
            within(rankHeader).getByRole('button')

        fireEvent.click(rankButton)

        await waitFor(() => {
            const rows = getRankingRows()

            expect(rows[0]).toHaveTextContent('Zeynep Çelik')
            expect(rows[1]).toHaveTextContent('Mehmet Kaya')
            expect(rows[2]).toHaveTextContent('Ayşe Demir')
            expect(rows[3]).toHaveTextContent('Ali Yılmaz')
        })
    })

    it('sıra kolonuna tekrar tıklanınca artan sıralamaya dönmeli', async () => {
        renderPage()

        await waitForInitialLoad()

        const rankHeader =
            screen.getByRole('columnheader', {
                name: /Sıra/i,
            })

        const rankButton =
            within(rankHeader).getByRole('button')

        fireEvent.click(rankButton)

        await waitFor(() => {
            expect(
                getRankingRows()[0],
            ).toHaveTextContent('Zeynep Çelik')
        })

        fireEvent.click(rankButton)

        await waitFor(() => {
            const rows = getRankingRows()

            expect(rows[0]).toHaveTextContent('Ali Yılmaz')
            expect(rows[1]).toHaveTextContent('Ayşe Demir')
            expect(rows[2]).toHaveTextContent('Mehmet Kaya')
            expect(rows[3]).toHaveTextContent('Zeynep Çelik')
        })
    })

    it('çalışan adına göre artan sıralama yapmalı', async () => {
        renderPage()

        await waitForInitialLoad()

        const employeeHeader =
            screen.getByRole('columnheader', {
                name: /Çalışan/i,
            })

        const employeeButton =
            within(employeeHeader).getByRole('button')

        fireEvent.click(employeeButton)

        await waitFor(() => {
            const rows = getRankingRows()

            expect(rows[0]).toHaveTextContent('Ali Yılmaz')
            expect(rows[1]).toHaveTextContent('Ayşe Demir')
            expect(rows[2]).toHaveTextContent('Mehmet Kaya')
            expect(rows[3]).toHaveTextContent('Zeynep Çelik')
        })
    })

    it('çalışan adına tekrar tıklanınca azalan sıralama yapmalı', async () => {
        renderPage()

        await waitForInitialLoad()

        const employeeHeader =
            screen.getByRole('columnheader', {
                name: /Çalışan/i,
            })

        const employeeButton =
            within(employeeHeader).getByRole('button')

        fireEvent.click(employeeButton)

        await waitFor(() => {
            expect(
                getRankingRows()[0],
            ).toHaveTextContent('Ali Yılmaz')
        })

        fireEvent.click(employeeButton)

        await waitFor(() => {
            const rows = getRankingRows()

            expect(rows[0]).toHaveTextContent('Zeynep Çelik')
            expect(rows[1]).toHaveTextContent('Mehmet Kaya')
            expect(rows[2]).toHaveTextContent('Ayşe Demir')
            expect(rows[3]).toHaveTextContent('Ali Yılmaz')
        })
    })

    it('ortalama skora göre azalan sıralama yapmalı', async () => {
        renderPage()

        await waitForInitialLoad()

        const averageHeader =
            screen.getByRole('columnheader', {
                name: /Ortalama/i,
            })

        const averageButton =
            within(averageHeader).getByRole('button')

        fireEvent.click(averageButton)

        await waitFor(() => {
            const rows = getRankingRows()

            expect(rows[0]).toHaveTextContent('Ali Yılmaz')
            expect(rows[1]).toHaveTextContent('Ayşe Demir')
            expect(rows[2]).toHaveTextContent('Mehmet Kaya')
            expect(rows[3]).toHaveTextContent('Zeynep Çelik')
        })
    })

    it('ortalama skora tekrar tıklanınca artan sıralama yapmalı', async () => {
        renderPage()

        await waitForInitialLoad()

        const averageHeader =
            screen.getByRole('columnheader', {
                name: /Ortalama/i,
            })

        const averageButton =
            within(averageHeader).getByRole('button')

        fireEvent.click(averageButton)

        await waitFor(() => {
            expect(
                getRankingRows()[0],
            ).toHaveTextContent('Ali Yılmaz')
        })

        fireEvent.click(averageButton)

        await waitFor(() => {
            const rows = getRankingRows()

            expect(rows[0]).toHaveTextContent('Zeynep Çelik')
            expect(rows[1]).toHaveTextContent('Mehmet Kaya')
            expect(rows[2]).toHaveTextContent('Ayşe Demir')
            expect(rows[3]).toHaveTextContent('Ali Yılmaz')
        })
    })

    it('değerlendirme sayısına göre azalan sıralama yapmalı', async () => {
        renderPage()

        await waitForInitialLoad()

        const evaluationHeader =
            screen.getByRole('columnheader', {
                name: /Değerlendirme/i,
            })

        const evaluationButton =
            within(evaluationHeader).getByRole('button')

        fireEvent.click(evaluationButton)

        await waitFor(() => {
            const rows = getRankingRows()

            expect(rows[0]).toHaveTextContent('Mehmet Kaya')
            expect(rows[1]).toHaveTextContent('Ali Yılmaz')
            expect(rows[2]).toHaveTextContent('Ayşe Demir')
            expect(rows[3]).toHaveTextContent('Zeynep Çelik')
        })
    })

    it('değerlendirme sayısına tekrar tıklanınca artan sıralama yapmalı', async () => {
        renderPage()

        await waitForInitialLoad()

        const evaluationHeader =
            screen.getByRole('columnheader', {
                name: /Değerlendirme/i,
            })

        const evaluationButton =
            within(evaluationHeader).getByRole('button')

        fireEvent.click(evaluationButton)

        await waitFor(() => {
            expect(
                getRankingRows()[0],
            ).toHaveTextContent('Mehmet Kaya')
        })

        fireEvent.click(evaluationButton)

        await waitFor(() => {
            const rows = getRankingRows()

            expect(rows[0]).toHaveTextContent('Zeynep Çelik')
            expect(rows[1]).toHaveTextContent('Ayşe Demir')
            expect(rows[2]).toHaveTextContent('Ali Yılmaz')
            expect(rows[3]).toHaveTextContent('Mehmet Kaya')
        })
    })

    /* ====================================================================== */
    /* EXPORT                                                                  */
    /* ====================================================================== */

    it('Excel butonunu göstermeli', async () => {
        renderPage()

        await waitForInitialLoad()

        expect(
            screen.getByRole('button', {
                name: 'Excel',
            }),
        ).toBeInTheDocument()
    })

    it('Excel butonuna basıldığında seçili dönem için export çağırmalı', async () => {
        renderPage()

        await waitForInitialLoad()

        const excelButton =
            screen.getByRole('button', {
                name: 'Excel',
            })

        fireEvent.click(excelButton)

        await waitFor(() => {
            expect(
                mockedExportTeamRankingExcel,
            ).toHaveBeenCalledTimes(1)

            expect(
                mockedExportTeamRankingExcel,
            ).toHaveBeenCalledWith(1)
        })
    })

    it('dönem değiştirildikten sonra Excel export yeni dönem ile çağrılmalı', async () => {
        renderPage()

        await waitForInitialLoad()

        await selectPeriod('2026 Q2')

        await waitFor(() => {
            expect(
                mockedGetTeamRanking,
            ).toHaveBeenCalledWith(2)
        })

        const excelButton =
            screen.getByRole('button', {
                name: 'Excel',
            })

        fireEvent.click(excelButton)

        await waitFor(() => {
            expect(
                mockedExportTeamRankingExcel,
            ).toHaveBeenCalledWith(2)
        })
    })

    it('export sırasında buton disabled olmalı ve loading metni göstermeli', async () => {
        let resolveExport!: () => void

        mockedExportTeamRankingExcel.mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    resolveExport = resolve
                }),
        )

        renderPage()

        await waitForInitialLoad()

        const excelButton =
            screen.getByRole('button', {
                name: 'Excel',
            })

        fireEvent.click(excelButton)

        const loadingButton =
            await screen.findByRole('button', {
                name: 'Hazırlanıyor...',
            })

        expect(loadingButton).toBeDisabled()

        resolveExport()

        await waitFor(() => {
            const button =
                screen.getByRole('button', {
                    name: 'Excel',
                })

            expect(button).not.toBeDisabled()
        })
    })

    /* ====================================================================== */
    /* EMPTY / ERROR                                                           */
    /* ====================================================================== */

    it('ranking boş geldiğinde sonuç bulunamadı mesajı göstermeli', async () => {
        mockedGetTeamRanking.mockResolvedValueOnce([])

        renderPage()

        await waitFor(() => {
            expect(
                mockedGetTeamRanking,
            ).toHaveBeenCalledWith(1)
        })

        expect(
            await screen.findByText(
                'Sonuç bulunamadı.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Seçilen dönem veya arama kriteri için gösterilecek kayıt yok.',
            ),
        ).toBeInTheDocument()
    })

    it('ranking API hata verdiğinde sonuç bulunamadı mesajı göstermeli', async () => {
        mockedGetTeamRanking.mockRejectedValueOnce(
            new Error('API error'),
        )

        renderPage()

        await waitFor(() => {
            expect(
                mockedGetTeamRanking,
            ).toHaveBeenCalledWith(1)
        })

        expect(
            await screen.findByText(
                'Sonuç bulunamadı.',
            ),
        ).toBeInTheDocument()
    })
})