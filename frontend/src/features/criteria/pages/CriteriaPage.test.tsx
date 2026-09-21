import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CriteriaPage from './CriteriaPage'

vi.mock('../criteriaApi', () => ({
    getCategories: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
    getCriteria: vi.fn(),
    createCriterion: vi.fn(),
    updateCriterion: vi.fn(),
    deleteCriterion: vi.fn(),
}))

vi.mock('../../../shared/api/jobPositionsApi', () => ({
    getJobPositions: vi.fn(),
}))

vi.mock('@mui/icons-material', () => ({
    Add: () => <span data-testid="add-icon" />,
    Edit: () => <span data-testid="edit-icon" />,
    Delete: () => <span data-testid="delete-icon" />,
    ExpandMore: () => <span data-testid="expand-more-icon" />,
}))

vi.mock('../components/CategoryFormDialog', () => ({
    default: ({
        open,
        onClose,
    }: {
        open: boolean
        onClose: () => void
    }) =>
        open ? (
            <div data-testid="category-form-dialog">
                <button onClick={onClose}>Kategori Dialog Kapat</button>
            </div>
        ) : null,
}))

vi.mock('../components/CriterionFormDialog', () => ({
    default: ({
        open,
        onClose,
    }: {
        open: boolean
        onClose: () => void
    }) =>
        open ? (
            <div data-testid="criterion-form-dialog">
                <button onClick={onClose}>Kriter Dialog Kapat</button>
            </div>
        ) : null,
}))

import {
    getCategories,
    getCriteria,
    deleteCategory,
    deleteCriterion,
} from '../criteriaApi'

import { getJobPositions } from '../../../shared/api/jobPositionsApi'

const mockedGetCategories = vi.mocked(getCategories)
const mockedGetCriteria = vi.mocked(getCriteria)
const mockedDeleteCategory = vi.mocked(deleteCategory)
const mockedDeleteCriterion = vi.mocked(deleteCriterion)
const mockedGetJobPositions = vi.mocked(getJobPositions)

const category1 = {
    id: 1,
    name: 'Teknik Yetkinlik',
    weight: 40,
    isActive: true,
}

const category2 = {
    id: 2,
    name: 'Takım Çalışması',
    weight: 30,
    isActive: true,
}

const criterion1 = {
    id: 1,
    name: 'Kod Kalitesi',
    isActive: true,
    performanceCategoryId: 1,
    performanceCategoryName: 'Teknik Yetkinlik',
    jobPositionDescriptions: [
        {
            jobPositionId: 1,
            jobPositionName: 'Yazılım Geliştirici',
            description: 'Temiz ve sürdürülebilir kod yazar.',
        },
    ],
}

const criterion2 = {
    id: 2,
    name: 'Test Kalitesi',
    isActive: true,
    performanceCategoryId: 1,
    performanceCategoryName: 'Teknik Yetkinlik',
    jobPositionDescriptions: [
        {
            jobPositionId: 1,
            jobPositionName: 'Yazılım Geliştirici',
            description: 'Testleri düzenli yazar.',
        },
    ],
}

const criterion3 = {
    id: 3,
    name: 'Eski Kriter',
    isActive: false,
    performanceCategoryId: 2,
    performanceCategoryName: 'Takım Çalışması',
    jobPositionDescriptions: [],
}

function setupDefaultMocks() {
    mockedGetCategories.mockResolvedValue([
        category1,
        category2,
    ])

    mockedGetCriteria.mockResolvedValue([
        criterion1,
        criterion2,
        criterion3,
    ])

    mockedGetJobPositions.mockResolvedValue([
        {
            id: 1,
            name: 'Yazılım Geliştirici',
            departmentId: 1,
        },
    ])

    mockedDeleteCategory.mockResolvedValue(undefined)
    mockedDeleteCriterion.mockResolvedValue(undefined)
}

describe('CriteriaPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        setupDefaultMocks()
    })

    it('veriler yüklenirken loading göstergesi göstermeli', () => {
        mockedGetCategories.mockReturnValue(
            new Promise(() => { })
        )

        mockedGetCriteria.mockReturnValue(
            new Promise(() => { })
        )

        mockedGetJobPositions.mockReturnValue(
            new Promise(() => { })
        )

        render(<CriteriaPage />)

        expect(
            screen.getAllByRole('progressbar').length
        ).toBeGreaterThan(0)
    })

    it('kategorileri ve kriterleri listelemeli', async () => {
        render(<CriteriaPage />)

        expect(
            await screen.findByText('Teknik Yetkinlik')
        ).toBeInTheDocument()

        expect(
            screen.getByText('Takım Çalışması')
        ).toBeInTheDocument()

        expect(
            screen.getByText('Kod Kalitesi')
        ).toBeInTheDocument()

        expect(
            screen.getByText('Test Kalitesi')
        ).toBeInTheDocument()

        expect(
            screen.getByText('Eski Kriter')
        ).toBeInTheDocument()
    })

    it('istatistik kartlarında doğru değerleri göstermeli', async () => {
        render(<CriteriaPage />)

        await screen.findByText('Teknik Yetkinlik')

        expect(
            screen.getByText('Toplam kategori')
        ).toBeInTheDocument()

        expect(
            screen.getByText('Yayında olan kriter')
        ).toBeInTheDocument()

        expect(
            screen.getByText('Tanımlı kriter')
        ).toBeInTheDocument()

        const activeWeightLabel =
            screen.getByText('Aktif Ağırlık')

        expect(activeWeightLabel).toBeInTheDocument()

        expect(
            activeWeightLabel.parentElement
        ).toHaveTextContent('%70')
    })

    it('kategori bulunamadığında boş durum mesajı göstermeli', async () => {
        mockedGetCategories.mockResolvedValue([])
        mockedGetCriteria.mockResolvedValue([])
        mockedGetJobPositions.mockResolvedValue([])

        render(<CriteriaPage />)

        expect(
            await screen.findByText(
                'Henüz kategori eklenmemiş.'
            )
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'İlk performans kategorisini oluşturarak başlayabilirsiniz.'
            )
        ).toBeInTheDocument()
    })

    it('veri yükleme hatasında hata mesajı göstermeli', async () => {
        mockedGetCategories.mockRejectedValueOnce(
            new Error('API error')
        )

        render(<CriteriaPage />)

        expect(
            await screen.findByText(
                'Veriler yüklenirken hata oluştu.'
            )
        ).toBeInTheDocument()
    })

    it('Yeni Kategori butonuna basıldığında kategori dialogunu açmalı', async () => {
        const user = userEvent.setup()

        render(<CriteriaPage />)

        await screen.findByText('Teknik Yetkinlik')

        await user.click(
            screen.getByRole('button', {
                name: /yeni kategori/i,
            })
        )

        expect(
            screen.getByTestId('category-form-dialog')
        ).toBeInTheDocument()
    })

    it('Kriter Ekle butonuna basıldığında kriter dialogunu açmalı', async () => {
        const user = userEvent.setup()

        render(<CriteriaPage />)

        await screen.findByText('Teknik Yetkinlik')

        await user.click(
            screen.getAllByRole('button', {
                name: /kriter ekle/i,
            })[0]
        )

        expect(
            screen.getByTestId('criterion-form-dialog')
        ).toBeInTheDocument()
    })

    it('kategori silme butonuna basıldığında onay dialogu göstermeli', async () => {
        const user = userEvent.setup()

        render(<CriteriaPage />)

        await screen.findByText('Teknik Yetkinlik')

        const deleteButtons =
            screen.getAllByTestId('delete-icon')

        expect(deleteButtons.length).toBeGreaterThan(0)

        await user.click(
            deleteButtons[0].closest('button') as HTMLButtonElement
        )

        expect(
            await screen.findByText('Kategoriyi Sil')
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                '"Teknik Yetkinlik" kategorisini silmek istediğine emin misin? İçindeki kriterler etkilenebilir.'
            )
        ).toBeInTheDocument()
    })

    it('kategori silme onaylandığında deleteCategory çağrılmalı ve liste yenilenmeli', async () => {
        const user = userEvent.setup()

        render(<CriteriaPage />)

        await screen.findByText('Teknik Yetkinlik')

        const deleteButtons =
            screen.getAllByTestId('delete-icon')

        await user.click(
            deleteButtons[0].closest('button') as HTMLButtonElement
        )

        await user.click(
            screen.getByRole('button', {
                name: /^sil$/i,
            })
        )

        await waitFor(() => {
            expect(
                mockedDeleteCategory
            ).toHaveBeenCalledWith(1)
        })

        await waitFor(() => {
            expect(
                mockedGetCategories
            ).toHaveBeenCalledTimes(2)

            expect(
                mockedGetCriteria
            ).toHaveBeenCalledTimes(2)

            expect(
                mockedGetJobPositions
            ).toHaveBeenCalledTimes(2)
        })

        expect(
            await screen.findByText(
                'Kategori silindi.'
            )
        ).toBeInTheDocument()
    })

    it('kategori silme API hatasında hata mesajı göstermeli', async () => {
        const user = userEvent.setup()

        mockedDeleteCategory.mockRejectedValueOnce({
            response: {
                data: {
                    message: 'Kategori silinemedi.',
                },
            },
        })

        render(<CriteriaPage />)

        await screen.findByText('Teknik Yetkinlik')

        const deleteButtons =
            screen.getAllByTestId('delete-icon')

        await user.click(
            deleteButtons[0].closest('button') as HTMLButtonElement
        )

        await user.click(
            screen.getByRole('button', {
                name: /^sil$/i,
            })
        )

        expect(
            await screen.findByText(
                'Kategori silinemedi.'
            )
        ).toBeInTheDocument()
    })

    it('kategori silme dialogunda Vazgeç seçildiğinde dialog kapanmalı', async () => {
        const user = userEvent.setup()

        render(<CriteriaPage />)

        await screen.findByText('Teknik Yetkinlik')

        const deleteButtons =
            screen.getAllByTestId('delete-icon')

        await user.click(
            deleteButtons[0].closest('button') as HTMLButtonElement
        )

        expect(
            await screen.findByText('Kategoriyi Sil')
        ).toBeInTheDocument()

        await user.click(
            screen.getByRole('button', {
                name: 'Vazgeç',
            })
        )

        await waitFor(() => {
            expect(
                screen.queryByText('Kategoriyi Sil')
            ).not.toBeInTheDocument()
        })

        expect(
            mockedDeleteCategory
        ).not.toHaveBeenCalled()
    })

    it('kriter silme butonuna basıldığında kriter onay dialogunu göstermeli', async () => {
        const user = userEvent.setup()

        render(<CriteriaPage />)

        await screen.findByText('Teknik Yetkinlik')

        const deleteButtons =
            screen.getAllByTestId('delete-icon')

        expect(deleteButtons.length).toBeGreaterThan(1)

        await user.click(
            deleteButtons[1].closest('button') as HTMLButtonElement
        )

        expect(
            await screen.findByText('Kriteri Sil')
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                '"Kod Kalitesi" kriterini silmek istediğine emin misin?'
            )
        ).toBeInTheDocument()
    })

    it('kriter silme onaylandığında deleteCriterion çağrılmalı', async () => {
        const user = userEvent.setup()

        render(<CriteriaPage />)

        await screen.findByText('Teknik Yetkinlik')

        const deleteButtons =
            screen.getAllByTestId('delete-icon')

        await user.click(
            deleteButtons[1].closest('button') as HTMLButtonElement
        )

        await user.click(
            screen.getByRole('button', {
                name: /^sil$/i,
            })
        )

        await waitFor(() => {
            expect(
                mockedDeleteCriterion
            ).toHaveBeenCalledWith(1)
        })

        expect(
            await screen.findByText(
                'Kriter silindi.'
            )
        ).toBeInTheDocument()
    })

    it('kriter silme API hatasında hata mesajı göstermeli', async () => {
        const user = userEvent.setup()

        mockedDeleteCriterion.mockRejectedValueOnce({
            response: {
                data: {
                    message: 'Kriter kullanıldığı için silinemedi.',
                },
            },
        })

        render(<CriteriaPage />)

        await screen.findByText('Teknik Yetkinlik')

        const deleteButtons =
            screen.getAllByTestId('delete-icon')

        await user.click(
            deleteButtons[1].closest('button') as HTMLButtonElement
        )

        await user.click(
            screen.getByRole('button', {
                name: /^sil$/i,
            })
        )

        expect(
            await screen.findByText(
                'Kriter kullanıldığı için silinemedi.'
            )
        ).toBeInTheDocument()
    })
})