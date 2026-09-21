import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import type {
    PerformanceCategoryDto,
    PerformanceCriterionDto,
} from '../types'
import type { JobPositionDto } from '../../../shared/types/jobPosition'

vi.mock('@mui/icons-material', () => ({
    BadgeOutlined: () => <span data-testid="mock-badge-icon" />,
    SettingsOutlined: () => <span data-testid="mock-settings-icon" />,
    SettingsOverscan: () => <span data-testid="mock-settings-overscan-icon" />,
    SettingsOverscanRounded: () => (
        <span data-testid="mock-settings-overscan-rounded-icon" />
    ),
}))

import CriterionFormDialog, {
    type CriterionFormValues,
} from './CriterionFormDialog'

const categories: PerformanceCategoryDto[] = [
    { id: 1, name: 'Teknik Yetkinlik', weight: 40, isActive: true },
    { id: 2, name: 'İletişim', weight: 30, isActive: true },
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
        departmentId: 1,
    },
]

const existingCriterion: PerformanceCriterionDto = {
    id: 5,
    name: 'Kod Kalitesi',
    isActive: true,
    performanceCategoryId: 1,
    performanceCategoryName: 'Teknik Yetkinlik',
    jobPositionDescriptions: [
        {
            jobPositionId: 1,
            jobPositionName: 'Yazılım Geliştirici',
            description: 'Kodun okunabilirliği ve test kapsamı.',
        },
    ],
}

function renderDialog(
    overrides: Partial<ComponentProps<typeof CriterionFormDialog>> = {}
) {
    const onSubmit = vi.fn()
    const onClose = vi.fn()

    const utils = render(
        <CriterionFormDialog
            open
            mode="create"
            categories={categories}
            jobPositions={jobPositions}
            categoryId={1}
            submitting={false}
            onSubmit={onSubmit}
            onClose={onClose}
            {...overrides}
        />
    )

    return { ...utils, onSubmit, onClose }
}

async function selectJobPosition(
    user: ReturnType<typeof userEvent.setup>,
    positionName: string
) {
    const combobox = screen.getByRole('combobox', { name: /pozisyonlar/i })
    await user.click(combobox)

    const option = await screen.findByRole('option', { name: positionName })
    await user.click(option)
}

describe('CriterionFormDialog', () => {
    it('create modunda seçilen kategoriyi salt-okunur göstermeli', () => {
        renderDialog({ categoryId: 1 })

        expect(screen.getByText('Yeni Kriter')).toBeInTheDocument()
        expect(screen.getByLabelText(/kriter adı/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/ana kategori/i)).toHaveValue(
            'Teknik Yetkinlik'
        )
        expect(screen.getByLabelText(/ana kategori/i)).toBeDisabled()
        expect(
            screen.queryByText(/kriter durumu/i)
        ).not.toBeInTheDocument()
    })

    it('edit modunda mevcut kriter verisiyle doldurulmalı', () => {
        renderDialog({ mode: 'edit', initialData: existingCriterion })

        expect(screen.getByText('Kriteri Düzenle')).toBeInTheDocument()
        expect(screen.getByLabelText(/kriter adı/i)).toHaveValue(
            'Kod Kalitesi'
        )
        expect(screen.getByLabelText(/ana kategori/i)).toHaveValue(
            'Teknik Yetkinlik'
        )
        expect(screen.getByText(/kriter durumu/i)).toBeInTheDocument()
        expect(screen.getByText('Aktif')).toBeInTheDocument()

        expect(
            screen.getByLabelText(/yazılım geliştirici için açıklama/i)
        ).toHaveValue('Kodun okunabilirliği ve test kapsamı.')
    })

    it('bos form gonderilirse zorunlu alan hatalarini gostermeli', async () => {
        const user = userEvent.setup()
        const { onSubmit } = renderDialog({ categoryId: null })

        await user.click(screen.getByRole('button', { name: /oluştur/i }))

        expect(
            await screen.findByText('Kriter adı en az 2 karakter olmalı')
        ).toBeInTheDocument()
        expect(
            screen.getByText('Ana kategori belirtilmelidir')
        ).toBeInTheDocument()
        expect(
            screen.getByText('En az bir iş pozisyonu seçmelisin')
        ).toBeInTheDocument()

        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('pozisyon seçilip açıklama boş bırakılırsa hata göstermeli', async () => {
        const user = userEvent.setup()
        const { onSubmit } = renderDialog()

        await user.type(screen.getByLabelText(/kriter adı/i), 'Yeni Kriter Adı')
        await selectJobPosition(user, 'Yazılım Geliştirici')

        expect(
            screen.getByLabelText(/yazılım geliştirici için açıklama/i)
        ).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /oluştur/i }))

        expect(
            await screen.findByText('Açıklama boş bırakılamaz')
        ).toBeInTheDocument()

        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('geçerli verilerle gönderildiğinde onSubmit doğru değerlerle çağrılmalı', async () => {
        const user = userEvent.setup()
        const { onSubmit } = renderDialog({ categoryId: 1 })

        await user.type(screen.getByLabelText(/kriter adı/i), 'Kod Kalitesi')
        await selectJobPosition(user, 'Yazılım Geliştirici')

        await user.type(
            screen.getByLabelText(/yazılım geliştirici için açıklama/i),
            'Kodun okunabilirliği değerlendirilir.'
        )

        await user.click(screen.getByRole('button', { name: /oluştur/i }))

        expect(onSubmit).toHaveBeenCalledTimes(1)

        const submitted = onSubmit.mock.calls[0][0] as CriterionFormValues
        expect(submitted.name).toBe('Kod Kalitesi')
        expect(submitted.performanceCategoryId).toBe(1)
        expect(submitted.jobPositionDescriptions).toEqual([
            {
                jobPositionId: 1,
                description: 'Kodun okunabilirliği değerlendirilir.',
            },
        ])
    })

    it('vazgeç butonuna tıklanınca onClose çağrılmalı', async () => {
        const user = userEvent.setup()
        const { onClose } = renderDialog()

        await user.click(screen.getByRole('button', { name: /vazgeç/i }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('submitting=true iken buton devre dışı olmalı', () => {
        renderDialog({ submitting: true })

        expect(
            screen.getByRole('button', { name: /kaydediliyor/i })
        ).toBeDisabled()
    })
})