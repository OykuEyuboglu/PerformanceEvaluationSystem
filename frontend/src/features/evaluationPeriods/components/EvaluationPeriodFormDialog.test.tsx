import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import EvaluationPeriodFormDialog, {
    type EvaluationPeriodFormValues,
} from './EvaluationPeriodFormDialog'
import type { EvaluationPeriod } from '../types'

vi.mock('@mui/icons-material', () => ({
    CalendarMonthOutlined: () => (
        <span data-testid="calendar-icon" />
    ),
}))

const existingPeriod: EvaluationPeriod = {
    id: 1,
    name: '2026 Yıl Sonu Değerlendirmesi',
    startDate: '2026-01-01T00:00:00',
    endDate: '2026-03-31T00:00:00',
}

function renderDialog(
    overrides: Partial<ComponentProps<typeof EvaluationPeriodFormDialog>> = {}
) {
    const onSubmit = vi.fn()
    const onClose = vi.fn()

    const utils = render(
        <EvaluationPeriodFormDialog
            open
            mode="create"
            submitting={false}
            onSubmit={onSubmit}
            onClose={onClose}
            {...overrides}
        />
    )

    return { ...utils, onSubmit, onClose }
}

function setDateField(label: RegExp, value: string) {
    const input = screen.getByLabelText(label) as HTMLInputElement
    fireEvent.change(input, { target: { value } })
}

describe('EvaluationPeriodFormDialog', () => {
    it('create modunda doğru başlığı ve alanları render etmeli', () => {
        renderDialog()

        expect(
            screen.getByText('Yeni Değerlendirme Dönemi')
        ).toBeInTheDocument()
        expect(screen.getByLabelText(/dönem adı/i)).toHaveValue('')
        expect(
            screen.getByRole('button', { name: /oluştur/i })
        ).toBeInTheDocument()
    })

    it('edit modunda mevcut dönem verisiyle doldurulmalı', () => {
        renderDialog({ mode: 'edit', initialData: existingPeriod })

        expect(screen.getByText('Dönemi Düzenle')).toBeInTheDocument()
        expect(screen.getByLabelText(/dönem adı/i)).toHaveValue(
            '2026 Yıl Sonu Değerlendirmesi'
        )
        expect(screen.getByLabelText(/başlangıç tarihi/i)).toHaveValue(
            '2026-01-01'
        )
        expect(screen.getByLabelText(/bitiş tarihi/i)).toHaveValue(
            '2026-03-31'
        )
        expect(
            screen.getByRole('button', { name: /^kaydet$/i })
        ).toBeInTheDocument()
    })

    it('boş form gönderilirse doğrulama hatalarını göstermeli', async () => {
        const user = userEvent.setup()
        const { onSubmit } = renderDialog()

        await user.click(screen.getByRole('button', { name: /oluştur/i }))

        expect(
            await screen.findByText('Dönem adı en az 2 karakter olmalı')
        ).toBeInTheDocument()
        expect(
            screen.getByText('Başlangıç tarihi gerekli')
        ).toBeInTheDocument()
        expect(screen.getByText('Bitiş tarihi gerekli')).toBeInTheDocument()

        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('bitiş tarihi başlangıçtan önceyse hata göstermeli', async () => {
        const user = userEvent.setup()
        const { onSubmit } = renderDialog()

        await user.type(screen.getByLabelText(/dönem adı/i), '2026 Q2')
        setDateField(/başlangıç tarihi/i, '2026-06-01')
        setDateField(/bitiş tarihi/i, '2026-01-01')

        await user.click(screen.getByRole('button', { name: /oluştur/i }))

        expect(
            await screen.findByText('Bitiş tarihi başlangıçtan önce olamaz')
        ).toBeInTheDocument()

        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('başlangıç ve bitiş aynı gün olduğunda geçerli kabul edilmeli', async () => {
        const user = userEvent.setup()
        const { onSubmit } = renderDialog()

        await user.type(screen.getByLabelText(/dönem adı/i), 'Tek Günlük Dönem')
        setDateField(/başlangıç tarihi/i, '2026-05-01')
        setDateField(/bitiş tarihi/i, '2026-05-01')

        await user.click(screen.getByRole('button', { name: /oluştur/i }))

        expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('geçerli verilerle gönderildiğinde onSubmit doğru değerlerle çağrılmalı', async () => {
        const user = userEvent.setup()
        const { onSubmit } = renderDialog()

        await user.type(screen.getByLabelText(/dönem adı/i), '2026 Q3')
        setDateField(/başlangıç tarihi/i, '2026-07-01')
        setDateField(/bitiş tarihi/i, '2026-09-30')

        await user.click(screen.getByRole('button', { name: /oluştur/i }))

        expect(onSubmit).toHaveBeenCalledTimes(1)

        const submitted = onSubmit.mock.calls[0][0] as EvaluationPeriodFormValues
        expect(submitted).toEqual({
            name: '2026 Q3',
            startDate: '2026-07-01',
            endDate: '2026-09-30',
        })
    })

    it('vazgeç butonuna tıklanınca onClose çağrılmalı', async () => {
        const user = userEvent.setup()
        const { onClose } = renderDialog()

        await user.click(screen.getByRole('button', { name: /vazgeç/i }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('submitting=true iken buton devre dışı olmalı ve metin değişmeli', () => {
        renderDialog({ submitting: true })

        expect(
            screen.getByRole('button', { name: /kaydediliyor/i })
        ).toBeDisabled()
    })
})